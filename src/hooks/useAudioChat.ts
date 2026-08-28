import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
// expo-file-system v19 replaced readAsStringAsync/EncodingType with a new
// File-object API; the old functional API still ships under /legacy.
import * as FileSystem from 'expo-file-system/legacy';
import { WEBSOCKET_URL } from '@/utils/constants';
import { useAuthStore } from '@/store/authStore';

export type AudioChatStatus =
  | 'idle'
  | 'recording'
  | 'uploading'
  | 'awaiting_reply'
  | 'timeout'
  | 'error';

export interface AudioChatReply {
  /** What Gemini heard, best-effort — empty if it didn't follow the expected format. */
  transcript: string;
  /** The coaching reply text, spoken aloud on-device via expo-speech. */
  content: string;
}

// expo-av records a complete file rather than streaming raw PCM in real time,
// so "chunking" here means splitting the finished recording's base64 into
// pieces that match the audio:chunk wire contract — not true live streaming.
const CHUNK_SIZE = 32_000;
const REPLY_TIMEOUT_MS = 25_000;

// Forces both platforms to the same mono AAC-in-MP4 container so the server
// only ever has to handle one mimeType. Gemini's documented supported audio
// MIME types are audio/wav, audio/mp3, audio/aiff, audio/aac, audio/ogg,
// audio/flac — audio/mp4 is NOT on that list, so we label it audio/aac (the
// actual codec inside the .m4a container) rather than the container format.
const MIME_TYPE = Platform.OS === 'web' ? 'audio/webm' : 'audio/aac';
const RECORDING_OPTIONS: Audio.RecordingOptions = {
  isMeteringEnabled: false,
  android: {
    extension: '.m4a',
    outputFormat: Audio.AndroidOutputFormat.MPEG_4,
    audioEncoder: Audio.AndroidAudioEncoder.AAC,
    sampleRate: 16000,
    numberOfChannels: 1,
    bitRate: 64000,
  },
  ios: {
    extension: '.m4a',
    outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
    audioQuality: Audio.IOSAudioQuality.MEDIUM,
    sampleRate: 16000,
    numberOfChannels: 1,
    bitRate: 64000,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
  web: {
    mimeType: 'audio/webm',
    bitsPerSecond: 64000,
  },
};

interface WsMessage {
  type: string;
  payload?: Record<string, unknown>;
}

/**
 * Right after the iOS microphone permission dialog is dismissed, the app
 * can briefly report itself as "in the background" to AVAudioSession even
 * though the permission promise has already resolved — the system dialog's
 * dismissal animation and the app regaining full foreground audio focus
 * aren't perfectly synchronous. Audio.Recording.createAsync then throws
 * "This experience is currently in the background, so the audio session
 * could not be activated." even though the user is looking right at the
 * app. It's a timing gap, not a real backgrounding, and it reliably
 * clears within a few hundred ms — so retry once after a short delay
 * before giving up.
 */
async function createRecordingWithRetry(
  options: Audio.RecordingOptions,
  attempt = 0,
): Promise<{ recording: Audio.Recording }> {
  try {
    return await Audio.Recording.createAsync(options);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (attempt === 0 && Platform.OS === 'ios' && message.includes('currently in the background')) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      return createRecordingWithRetry(options, attempt + 1);
    }
    throw err;
  }
}

function sendChunks(socket: WebSocket, sessionId: string, base64: string): void {
  for (let i = 0; i < base64.length; i += CHUNK_SIZE) {
    const isFinal = i + CHUNK_SIZE >= base64.length;
    socket.send(JSON.stringify({
      type: 'audio:chunk',
      payload: { sessionId, data: base64.slice(i, i + CHUNK_SIZE), isFinal },
    }));
  }
}

export function useAudioChat() {
  const [status, setStatus] = useState<AudioChatStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const replyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const accessToken = useAuthStore((s) => s.accessToken);

  const closeSocket = useCallback(() => {
    if (replyTimeoutRef.current) {
      clearTimeout(replyTimeoutRef.current);
      replyTimeoutRef.current = null;
    }
    socketRef.current?.close();
    socketRef.current = null;
  }, []);

  const reset = useCallback(() => {
    setStatus('idle');
    setErrorMessage(null);
  }, []);

  // Belt-and-braces cleanup if the screen unmounts mid-recording or mid-session.
  useEffect(() => {
    return () => {
      recordingRef.current?.stopAndUnloadAsync().catch(() => undefined);
      socketRef.current?.close();
    };
  }, []);

  const startRecording = useCallback(async () => {
    setErrorMessage(null);
    try {
      const { status: permStatus } = await Audio.requestPermissionsAsync();
      if (permStatus !== 'granted') {
        setErrorMessage('Microphone access is required for voice coaching.');
        setStatus('error');
        return;
      }

      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await createRecordingWithRetry(RECORDING_OPTIONS);
      recordingRef.current = recording;
      setStatus('recording');
    } catch (err) {
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Could not start recording. Please try again.');
    }
  }, []);

  const cancelRecording = useCallback(async () => {
    await recordingRef.current?.stopAndUnloadAsync().catch(() => undefined);
    recordingRef.current = null;
    closeSocket();
    reset();
  }, [closeSocket, reset]);

  /**
   * Stops recording, uploads it to the audio WS pipeline, and waits for a
   * reply. The server transcribes and answers in one Gemini call, then
   * `onReply` fires with both; the caller is expected to render `content`
   * and this hook speaks it aloud via expo-speech.
   */
  const stopRecordingAndSend = useCallback(async (onReply: (reply: AudioChatReply) => void) => {
    const recording = recordingRef.current;
    if (!recording || !accessToken) return;

    setStatus('uploading');
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    recordingRef.current = null;

    if (!uri) {
      setStatus('error');
      setErrorMessage("Couldn't process the recording. Please try again.");
      return;
    }

    try {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const socket = new WebSocket(`${WEBSOCKET_URL}?token=${accessToken}`);
      socketRef.current = socket;

      socket.onerror = () => {
        setStatus('error');
        setErrorMessage('Could not connect for voice coaching.');
        closeSocket();
      };

      socket.onopen = () => {
        socket.send(JSON.stringify({
          type: 'audio:start_session',
          payload: { language: 'en-GB', mimeType: MIME_TYPE },
        }));
      };

      socket.onmessage = (event) => {
        const msg = JSON.parse(String(event.data)) as WsMessage;

        if (msg.type === 'audio:ready') {
          const sessionId = msg.payload?.sessionId as string | undefined;
          if (!sessionId) return;
          sendChunks(socket, sessionId, base64);
          socket.send(JSON.stringify({ type: 'audio:end_session', payload: { sessionId } }));
          setStatus('awaiting_reply');
          replyTimeoutRef.current = setTimeout(() => {
            setStatus('timeout');
            closeSocket();
          }, REPLY_TIMEOUT_MS);
          return;
        }

        if (msg.type === 'audio:reply_complete') {
          const transcript = (msg.payload?.transcript as string) ?? '';
          const content = (msg.payload?.content as string) ?? '';
          if (content) {
            onReply({ transcript, content });
            Speech.speak(content, { language: 'en-GB' });
          }
          setStatus('idle');
          closeSocket();
          return;
        }

        if (msg.type === 'audio:error') {
          setStatus('error');
          setErrorMessage((msg.payload?.message as string) ?? 'Voice coaching error.');
          closeSocket();
        }
        // audio:acknowledged / audio:session_ended are informational only.
      };
    } catch (err) {
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Voice coaching failed. Please try again.');
      closeSocket();
    }
  }, [accessToken, closeSocket]);

  return { status, errorMessage, startRecording, stopRecordingAndSend, cancelRecording, reset };
}
