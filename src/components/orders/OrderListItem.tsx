import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Order, OrderStatus } from '@/types';

interface OrderListItemProps {
  order: Order;
  onPress: (order: Order) => void;
}

export default function OrderListItem({ order, onPress }: OrderListItemProps) {
  return (
    <TouchableOpacity
      style={styles.orderRow}
      activeOpacity={0.6}
      onPress={() => onPress(order)}
    >
      <View style={styles.tagColumn}>
        <View style={styles.tagBadge}>
          <Text style={styles.orderTag}>{order.tag}</Text>
        </View>
      </View>

      <Text
        style={[styles.customerName, styles.customerColumn]}
        numberOfLines={1}
      >
        {order.customer}
      </Text>

      <Text style={[styles.orderItems, styles.itemsColumn]}>
        {order.items} {order.items === 1 ? 'item' : 'items'}
      </Text>

      <View style={styles.statusColumn}>
        <StatusBadge status={order.status} />
      </View>
    </TouchableOpacity>
  );
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const statusStyle = {
    WASHING: styles.washingBadge,
    OVERDUE: styles.overdueBadge,
    READY: styles.readyBadge,
    DELIVERED: styles.deliveredBadge,
  };

  const textStyle = {
    WASHING: styles.washingText,
    OVERDUE: styles.overdueText,
    READY: styles.readyText,
    DELIVERED: styles.deliveredText,
  };

  return (
    <View style={[styles.statusBadge, statusStyle[status]]}>
      <Text style={[styles.statusText, textStyle[status]]}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  orderRow: {
    minHeight: 70,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  tagColumn: {
    width: '24%',
    justifyContent: 'center',
  },
  tagBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  customerColumn: {
    width: '32%',
  },
  itemsColumn: {
    width: '20%',
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  statusColumn: {
    width: '24%',
    alignItems: 'flex-end',
  },
  orderTag: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  customerName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
  },
  orderItems: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  washingBadge: {
    backgroundColor: '#EFF6FF',
  },
  washingText: {
    color: '#3B82F6',
  },
  overdueBadge: {
    backgroundColor: '#FEF2F2',
  },
  overdueText: {
    color: '#EF4444',
  },
  readyBadge: {
    backgroundColor: '#ECFDF5',
  },
  readyText: {
    color: '#10B981',
  },
  deliveredBadge: {
    backgroundColor: '#F8FAFC',
  },
  deliveredText: {
    color: '#94A3B8',
  },
});
