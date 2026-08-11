import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';


// Activity data type
export interface Activity {
  id?: string | number;
  initials: string;
  name: string;
  order: string;
  time: string;
}


// Component props
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
            <Text style={styles.avatarText}>
              {activity.initials}
            </Text>
          </View>


          {/* Customer information */}
          <View style={styles.customerInfo}>

            <Text style={styles.name}>
              {activity.name}
            </Text>

            <Text style={styles.order}>
              {activity.order}
            </Text>

          </View>


          {/* Time */}
          <Text style={styles.time}>
            {activity.time}
          </Text>


          {/* Arrow */}
          <Ionicons
            name="chevron-forward"
            size={16}
            color="#777"
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
    borderWidth: 2,
    borderColor: '#dddddd',
    borderRadius: 12,
    overflow: 'hidden',
  },

  row: {
    minHeight: 55,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#eeeeee',
  },

  lastRow: {
    borderBottomWidth: 0,
  },


  // Avatar

  avatar: {
    width: 32,
    height: 32,
    borderRadius: 20,
    backgroundColor: '#e8f0f5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },


  avatarText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#657681',
  },


  customerInfo: {
    flex: 1,
    justifyContent: 'center',
  },


  name: {
    fontSize: 15,
    fontWeight: '600',
    color: '#444',
  },
order: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },

  time: {
    fontSize: 12,
    color: '#999',
    marginRight: 8,
  },

});