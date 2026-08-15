// lib/api.ts
//
// Small fetch wrapper for talking to the LaundryTrack backend.
// Import authApi / ordersApi wherever you need to call the API.

import * as SecureStore from 'expo-secure-store';

// IMPORTANT: 'localhost' will NOT work from a physical device or most emulators —
// it refers to the device itself, not your dev machine. Use your machine's LAN IP
// instead (run `ipconfig` / `ifconfig` to find it, e.g. 192.168.1.42).
// Android emulator specifically can use 10.0.2.2 to reach your host machine.
export const API_BASE_URL = 'http://192.168.1.39:5000/api/v1'; // <-- your machine's IP

type ApiErrorBody = { error: { code: string; message: string } };

async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });
  } catch (networkErr) {
    // fetch throws on network failure (backend down, wrong IP, no wifi, etc.)
    throw new Error('Could not reach the server. Check your connection and try again.');
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const err = data as ApiErrorBody;
    throw new Error(err.error?.message || 'Something went wrong. Please try again.');
  }

  return data as T;
}

// Same as apiRequest, but reads the stored JWT and attaches it as a Bearer token.
// Use this for every route that requires login (everything except /auth/otp/*).
async function authRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await SecureStore.getItemAsync('authToken');
  if (!token) {
    throw new Error('You are not logged in. Please log in again.');
  }
  return apiRequest<T>(path, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  });
}

export const authApi = {
  sendOtp: (phone: string) =>
    apiRequest<{ success: boolean }>('/auth/otp/send', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    }),

  verifyOtp: (phone: string, otp: string) =>
    apiRequest<{ token: string; shop: { _id: string; name: string; phone: string } }>('/auth/otp/verify', {
      method: 'POST',
      body: JSON.stringify({ phone, otp }),
    }),

  shopSetup: (token: string, shopName: string) =>
    apiRequest<{ shop: { _id: string; name: string } }>('/auth/shop-setup', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ shop_name: shopName }),
    }),
};

export type DashboardSummary = {
  total_orders_this_week: number;
  revenue_this_month: number;
  overdue_orders: number;
  completed_this_week: number;
};

export type RecentOrder = {
  _id: string;
  tag: string;
  status: string;
  updated_at: string;
  created_at: string;
  customer_id: { _id: string; name: string; phone: string } | null;
};

export type OrderItemPayload = {
  name: string;
  qty: number;
  unit_price: number;
  notes?: string;
};

export type CreateOrderPayload = {
  customer_name: string;
  phone: string;
  pickup_date: string;
  delivery_date: string;
  service_type: 'wash' | 'iron' | 'dry_clean';
  items: OrderItemPayload[];
  customer_id?: string;
};

export type OrderListItemRaw = {
  _id: string;
  tag: string;
  status: string; // pending_pickup | in_progress | ready | delivered
  stage: string; // picked_up | washing | ironing | ready | delivered
  service_type: string; // wash | iron | dry_clean
  pickup_date: string;
  delivery_date: string;
  items: { name: string; qty: number; unit_price: number; notes?: string }[];
  total_amount: number;
  payment_status: string;
  created_at: string;
  customer_id: { _id: string; name: string; phone: string } | null;
};

export type OrderListResult = {
  data: OrderListItemRaw[];
  page: number;
  page_size: number;
  total: number;
};

export type CustomerListItem = {
  _id: string;
  name: string;
  phone: string;
  address?: { line1?: string; city?: string; pincode?: string; landmark?: string };
  preferences?: string[];
  created_at: string;
};

export type CustomerDetail = {
  _id: string;
  name: string;
  phone: string;
  address?: { line1?: string; city?: string; pincode?: string; landmark?: string };
  preferences?: string[];
  total_orders: number;
  total_spent: number;
  last_visit: string | null;
};

export type CustomerOrderRaw = {
  _id: string;
  tag: string;
  status: string;
  stage: string;
  service_type: string;
  pickup_date: string;
  delivery_date: string;
  total_amount: number;
  payment_status: string;
  created_at: string;
};

export const customersApi = {
  // GET /customers/search?q=<query> — pass empty string to list all
  search: (q: string) => {
    const qs = q.trim() ? `?q=${encodeURIComponent(q.trim())}` : '?q=';
    return authRequest<CustomerListItem[]>(`/customers/search${qs}`);
  },

  getById: (id: string) => authRequest<CustomerDetail>(`/customers/${id}`),

  getOrders: (id: string) => authRequest<CustomerOrderRaw[]>(`/customers/${id}/orders`),

  updateAddress: (id: string, address: { line1: string; city: string; pincode: string; landmark?: string }) =>
    authRequest<CustomerDetail>(`/customers/${id}/address`, {
      method: 'PATCH',
      body: JSON.stringify(address),
    }),

  updatePreferences: (id: string, preferences: string[]) =>
    authRequest<CustomerDetail>(`/customers/${id}/preferences`, {
      method: 'PATCH',
      body: JSON.stringify({ preferences }),
    }),
};

export const ordersApi = {
  getDashboardSummary: () => authRequest<DashboardSummary>('/orders/dashboard/summary'),

  getRecentActivity: () => authRequest<RecentOrder[]>('/orders/recent-activity'),

  advanceStage: (orderId: string) =>
    authRequest<CustomerOrderRaw>(`/orders/${orderId}/stage`, { method: 'PATCH' }),

  createOrder: (payload: CreateOrderPayload) =>
    authRequest<{ order: any; tag: string }>('/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  listOrders: (params: { search?: string; page?: number } = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.page) query.set('page', String(params.page));
    const qs = query.toString();
    return authRequest<OrderListResult>(`/orders${qs ? `?${qs}` : ''}`);
  },
};

export type InvoiceDetails = {
  total: number;
  advance: number;
  balance: number;
  items: { name: string; qty: number; unit_price: number; notes?: string }[];
};

export const paymentsApi = {
  getInvoice: (orderId: string) => authRequest<InvoiceDetails>(`/orders/${orderId}/invoice`),
  recordPayment: (orderId: string, payload: { amount: number; method: string }) =>
    authRequest<any>(`/orders/${orderId}/payments`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  markAsPaid: (orderId: string, payload: { method: string }) =>
    authRequest<any>(`/orders/${orderId}/mark-paid`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
};

// CSV export doesn't return JSON, so it can't go through apiRequest/authRequest —
// this fetches the raw text directly with the auth header attached by hand.
export async function exportOrdersCsv(): Promise<string> {
  const token = await SecureStore.getItemAsync('authToken');
  if (!token) throw new Error('You are not logged in. Please log in again.');

  const response = await fetch(`${API_BASE_URL}/shop/settings/export/orders.csv`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error('Could not export orders. Please try again.');
  }

  return response.text();
}

// PDF is binary, so this reads the response as raw bytes rather than text/JSON.
export async function exportOrdersPdf(): Promise<Uint8Array> {
  const token = await SecureStore.getItemAsync('authToken');
  if (!token) throw new Error('You are not logged in. Please log in again.');

  const response = await fetch(`${API_BASE_URL}/shop/settings/export/orders.pdf`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error('Could not export orders. Please try again.');
  }

  const buffer = await response.arrayBuffer();
  return new Uint8Array(buffer);
}