import { Stack } from 'expo-router';
import { OrderProvider } from '@/store/OrderContext';

export default function RootLayout() {
  return (
    <OrderProvider>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="login" />
        <Stack.Screen name="otp" />

        <Stack.Screen name="(tabs)" />
      </Stack>
    </OrderProvider>
  );
}