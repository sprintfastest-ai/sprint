import { useCallback, useEffect, useRef, useState } from 'react';
import { Audio } from 'expo-av';
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
  | 'beta_limited'
  | 'error';

// expo-av records a complete file rather than streaming raw PCM in real time,
// so "chunking" here means splitting the finished recording's base64 into
// pieces that match the audio:chunk wire contract — not true live streaming.
const CHUNK_SIZE = 8000;
const REPLY_TIMEOUT_MS = 8000;

interface WsMessage {
  type: string;
  payload?: Record<string, unknown>;
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
    const { status: permStatus } = await Audio.requestPermissionsAsync();
    if (permStatus !== 'granted') {
      setErrorMessage('Microphone access is required for voice coaching.');
      setStatus('error');
      return;
    }

    await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
    const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.LOW_QUALITY);
    recordingRef.current = recording;
    setStatus('recording');
  }, []);

  const cancelRecording = useCallback(async () => {
    await recordingRef.current?.stopAndUnloadAsync().catch(() => undefined);
    recordingRef.current = null;
    closeSocket();
    reset();
  }, [closeSocket, reset]);

  /**
   * Stops recording, uploads it to the audio WS pipeline, and waits briefly
   * for a reply. The backend's audio handlers are a Phase-3 stub today — they
   * acknowledge chunks but never send audio:reply_chunk — so this reliably
   * times out into `beta_limited`. `onReply` is wired for forward
   * compatibility once the real STT/AI/TTS pipeline lands.
   */
  const stopRecordingAndSend = useCallback(async (onReply: (content: string) => void) => {
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
        socket.send(JSON.stringify({ type: 'audio:start_session', payload: { language: 'en-GB' } }));
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
            setStatus('beta_limited');
            closeSocket();
          }, REPLY_TIMEOUT_MS);
          return;
        }

        if (msg.type === 'audio:reply_chunk' || msg.type === 'audio:reply_complete') {
          const content = (msg.payload?.transcript ?? msg.payload?.content) as string | undefined;
          if (content) onReply(content);
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
