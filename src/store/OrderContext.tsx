import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Order } from '@/types';

interface OrderContextData {
  orders: Order[];
  addOrder: (order: Order) => void;
}

const initialOrders: Order[] = [
  {
    id: '1',
    tag: 'A-1001',
    customer: 'Sunil K.',
    phone: '+91 98765 43210',
    items: 13,
    status: 'WASHING',
    preferences: ['No starch for shirts', 'Eco-friendly detergent preferred', 'Hanger delivery for suits'],
  },
  {
    id: '2',
    tag: 'A-1003',
    customer: 'Priya S.',
    phone: '+91 98765 43211',
    items: 4,
    status: 'OVERDUE',
    preferences: ['Folded delivery only'],
  },
  {
    id: '3',
    tag: 'A-1014',
    customer: 'Ramesh K.',
    phone: '+91 98765 43212',
    items: 15,
    status: 'READY',
    preferences: ['Mild detergent'],
  },
  {
    id: '4',
    tag: 'A-0025',
    customer: 'Marc J.',
    phone: '+91 98765 43213',
    items: 8,
    status: 'DELIVERED',
    preferences: ['Hanger delivery'],
  },
];

const OrderContext = createContext<OrderContextData | undefined>(undefined);

export const OrderProvider = ({ children }: { children: ReactNode }) => {
  const [orders, setOrders] = useState<Order[]>(initialOrders);

  const addOrder = (order: Order) => {
    setOrders((prev) => [order, ...prev]);
  };

  return (
    <OrderContext.Provider value={{ orders, addOrder }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};
