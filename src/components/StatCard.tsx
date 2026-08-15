import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface StatCardProps {
  title: string;
  value: string;
  description: string;
  icon?: any;
  alert?: boolean;
}

export default function StatCard({
  title,
  value,
  description,
  icon,
  alert = false,
}: StatCardProps) {
  return (
    <View style={[styles.card, alert && styles.alertCard]}>
      {/* Title */}
      <Text style={[styles.title, alert && styles.alertTitle]}>{title}</Text>

      {/* Value */}
      <Text style={[styles.value, alert && styles.alertValue]}>{value}</Text>

      {/* Description */}
      <View style={styles.descriptionRow}>
        {icon && (
          <Ionicons
            name={icon}
            size={13}
            color={alert ? '#EF4444' : '#64748B'}
          />
        )}
        <Text style={[styles.description, alert && styles.alertDescription]}>
          {description}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '48%', // perfectly formats 2-column layout in standard flexbox grid
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 2,
  },
  alertCard: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FEE2E2',
  },
  title: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  alertTitle: {
    color: '#EF4444',
  },
  value: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 4,
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  alertValue: {
    color: '#EF4444',
  },
  descriptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  description: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  alertDescription: {
    color: '#F87171',
  },
});