import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function StatCard({
  title,
  value,
  description,
  icon,
  alert = false,
}) {
  return (
    <View style={[styles.card, alert && styles.alertCard]}>

      {/* Title */}
      <Text style={[styles.title, alert && styles.alertText]}>
        {title}
      </Text>

      {/* Value */}
      <Text style={[styles.value, alert && styles.alertValue]}>
        {value}
      </Text>

      {/* Description */}
      <View style={styles.descriptionRow}>

        {icon && (
          <Ionicons
            name={icon}
            size={11}
            color={alert ? '#d94b4b' : '#888'}
          />
        )}

        <Text
          style={[
            styles.description,
            alert && styles.alertText,
          ]}
        >
          {description}
        </Text>

      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '40%',
    minHeight: 82,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dddddd',
    borderRadius: 7,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginBottom: 8,
  },

  alertCard: {
    backgroundColor: '#fff4f4',
    borderColor: '#e87979',
  },

  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#777',
    lineHeight: 10,
  },
  alertText: {
    fontSize: 13,
    color: '#d94b4b',
  },
  value: {
    fontSize: 23,
    fontWeight: '700',
    color: '#222',
    marginTop: 1,
    marginBottom: 2,
  },

  alertValue: {
    color: '#d94b4b',
  },

  descriptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },

  description: {
    fontSize: 15,
    color: '#888',
  },
});