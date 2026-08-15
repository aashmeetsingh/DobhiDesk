import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface Activity {
  id?: string | number;
  initials: string;
  name: string;
  order: string;
  time: string;
}

interface ActivityCardProps {
  activities: Activity[];
  onPress?: (activity: Activity) => void;
}

export default function ActivityCard({
  activities,
  onPress,
}: ActivityCardProps) {
  return (
    <View style={styles.card}>
      {activities.map((activity, index) => (
        <TouchableOpacity
          key={activity.id ?? index}
          style={[
            styles.row,
            index === activities.length - 1 && styles.lastRow,
          ]}
          activeOpacity={0.7}
          onPress={() => onPress?.(activity)}
        >
          {/* Avatar */}
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{activity.initials}</Text>
          </View>

          {/* Customer information */}
          <View style={styles.customerInfo}>
            <Text style={styles.name}>{activity.name}</Text>
            <Text style={styles.order}>{activity.order}</Text>
          </View>

          {/* Time */}
          <Text style={styles.time}>{activity.time}</Text>

          {/* Arrow */}
          <Ionicons
            name="chevron-forward"
            size={16}
            color="#94A3B8"
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  row: {
    minHeight: 64,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
  customerInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  order: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  time: {
    fontSize: 12,
    color: '#64748B',
    marginRight: 6,
    fontWeight: '500',
  },
});