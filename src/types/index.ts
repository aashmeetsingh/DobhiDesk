export type OrderStatus = 'WASHING' | 'OVERDUE' | 'READY' | 'DELIVERED';

export type Order = {
  id: string;
  tag: string;
  customer: string;
  phone: string;
  items: number;
  status: OrderStatus;
  pickupDate?: Date;
  deliveryDate?: Date;
  serviceType?: string;
  preferences?: string[];
};
