import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

interface DateSelectorProps {
  label: string;
  date: Date;
  showPicker: boolean;
  onPress: () => void;
  onChange: (event: any, selectedDate?: Date) => void;
  minimumDate?: Date;
}

export default function DateSelector({
  label,
  date,
  showPicker,
  onPress,
  onChange,
  minimumDate,
}: DateSelectorProps) {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.inputLabel}>{label}</Text>

      <TouchableOpacity
        style={styles.dateInput}
        activeOpacity={0.6}
        onPress={onPress}
      >
        <Text style={styles.dateText}>{formatDate(date)}</Text>
        <Ionicons name="calendar-outline" size={18} color="#64748B" />
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={date}
          mode="date"
          minimumDate={minimumDate}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 6,
    letterSpacing: 0.8,
  },
  dateInput: {
    height: 48,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateText: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '500',
  },
});
