import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Platform, StyleSheet } from 'react-native';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import Ionicons from '@expo/vector-icons/Ionicons';
import { safeLocaleDate } from '@/utils/formatters';
import { COLORS, RADIUS, SPACING } from '@/utils/tokens';

interface DateFieldProps {
  /** ISO date string (YYYY-MM-DD), or null/empty for "not set". */
  value: string | null;
  onChange: (value: string) => void;
  onClear?: () => void;
  placeholder?: string;
  minimumDate?: Date;
  maximumDate?: Date;
  accessibilityLabel?: string;
}

function parseIsoDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y ?? 2000, (m ?? 1) - 1, d ?? 1);
}

function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * A tappable field that opens the platform's native calendar picker, rather
 * than a free-text "type a date" input. Android's picker is a one-shot
 * dialog (opens, fires one onChange or a dismiss, closes itself); iOS's is
 * an inline control that stays open until the caller dismisses it, hence
 * the separate "Done" button on iOS only.
 */
export default function DateField({
  value,
  onChange,
  onClear,
  placeholder = 'Select a date',
  minimumDate,
  maximumDate,
  accessibilityLabel = 'Select a date',
}: DateFieldProps) {
  const [show, setShow] = useState(false);
  const dateValue = value ? parseIsoDate(value) : new Date();

  const handleChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') setShow(false);
    if (event.type === 'dismissed' || !selected) return;
    onChange(toIsoDate(selected));
  };

  return (
    <View>
      <TouchableOpacity
        style={styles.field}
        onPress={() => setShow(true)}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
      >
        <Text style={[styles.text, !value && styles.placeholder]}>
          {value ? safeLocaleDate(dateValue, { day: 'numeric', month: 'short', year: 'numeric' }) : placeholder}
        </Text>
        <Ionicons name="calendar-outline" size={18} color={COLORS.textSecondary} />
      </TouchableOpacity>

      {value && onClear ? (
        <TouchableOpacity onPress={onClear} accessibilityRole="button" accessibilityLabel="Clear date">
          <Text style={styles.clearText}>Clear date</Text>
        </TouchableOpacity>
      ) : null}

      {show && (
        <DateTimePicker
          value={dateValue}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          onChange={handleChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          // British (day-first) format, matching the label above — has full
          // effect on iOS; Android's native dialog follows the device's own
          // system locale regardless, which this can't override.
          locale="en-GB"
        />
      )}

      {Platform.OS === 'ios' && show ? (
        <TouchableOpacity style={styles.doneBtn} onPress={() => setShow(false)} accessibilityRole="button">
          <Text style={styles.doneText}>Done</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 14,
  },
  text: {
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  placeholder: {
    color: COLORS.inputPlaceholder,
  },
  clearText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
    marginTop: SPACING.xs,
    alignSelf: 'flex-start',
  },
  doneBtn: {
    alignSelf: 'flex-end',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  doneText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
});
