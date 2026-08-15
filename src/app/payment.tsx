import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Footer from '@/components/Footer';
import { paymentsApi, InvoiceDetails } from '@/lib/api';

export default function PaymentScreen() {
  const { orderId, tag, customerName } = useLocalSearchParams<{
    orderId: string;
    tag?: string;
    customerName?: string;
  }>();

  const [invoice, setInvoice] = useState<InvoiceDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'upi' | 'card'>('cash');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadInvoice = async () => {
    if (!orderId) return;
    setError(null);
    setIsLoading(true);
    try {
      const details = await paymentsApi.getInvoice(orderId);
      setInvoice(details);
      setPaymentAmount(String(details.balance));
    } catch (err: any) {
      setError(err.message || 'Could not load invoice details.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInvoice();
  }, [orderId]);

  const handleRecordPayment = async () => {
    const amountNum = Number(paymentAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid payment amount greater than 0.');
      return;
    }
    if (invoice && amountNum > invoice.balance) {
      Alert.alert(
        'Excess Amount',
        `Payment amount (₹${amountNum}) exceeds the remaining balance (₹${invoice.balance}).`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await paymentsApi.recordPayment(orderId, {
        amount: amountNum,
        method: paymentMethod,
      });
      Alert.alert('Payment Recorded', `Successfully recorded payment of ₹${amountNum} via ${paymentMethod.toUpperCase()}.`);
      router.back();
    } catch (err: any) {
      Alert.alert('Payment Failed', err.message || 'Could not record payment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkAsPaid = async () => {
    setIsSubmitting(true);
    try {
      await paymentsApi.markAsPaid(orderId, {
        method: paymentMethod,
      });
      Alert.alert('Success', `Order marked as fully paid via ${paymentMethod.toUpperCase()}.`);
      router.back();
    } catch (err: any) {
      Alert.alert('Payment Failed', err.message || 'Could not update payment status. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Collect Payment</Text>
        <View style={{ width: 40 }} />
      </View>

      {isLoading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="small" color="#0F172A" />
        </View>
      ) : error ? (
        <View style={styles.loadingBox}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={loadInvoice} style={styles.retryButton}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Order Details Header Card */}
          <View style={styles.orderSummaryCard}>
            <View>
              <Text style={styles.orderLabel}>ORDER NO.</Text>
              <Text style={styles.orderValue}>#{tag || '—'}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.orderLabel}>CUSTOMER</Text>
              <Text style={styles.customerName}>{customerName || 'Unknown Customer'}</Text>
            </View>
          </View>

          {/* Invoice Bill Items */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bill Details</Text>
            <View style={styles.card}>
              {invoice?.items.map((item, idx) => (
                <View key={idx} style={styles.billRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    {item.notes ? <Text style={styles.itemNotes}>{item.notes}</Text> : null}
                  </View>
                  <Text style={styles.itemQty}>x{item.qty}</Text>
                  <Text style={styles.itemPrice}>₹{(item.unit_price * item.qty).toLocaleString('en-IN')}</Text>
                </View>
              ))}

              <View style={styles.divider} />

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Amount</Text>
                <Text style={styles.summaryValue}>₹{invoice?.total.toLocaleString('en-IN')}</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Advance Paid</Text>
                <Text style={[styles.summaryValue, { color: '#16A34A' }]}>
                  - ₹{invoice?.advance.toLocaleString('en-IN')}
                </Text>
              </View>

              <View style={[styles.summaryRow, styles.balanceRow]}>
                <Text style={styles.balanceLabel}>Remaining Balance</Text>
                <Text style={styles.balanceValue}>₹{invoice?.balance.toLocaleString('en-IN')}</Text>
              </View>
            </View>
          </View>

          {invoice && invoice.balance > 0 ? (
            <>
              {/* Payment Methods */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Payment Method</Text>
                <View style={styles.methodGrid}>
                  {(['cash', 'upi', 'card'] as const).map((method) => {
                    const isSelected = paymentMethod === method;
                    const iconName = {
                      cash: 'cash-outline',
                      upi: 'qr-code-outline',
                      card: 'card-outline',
                    }[method];

                    return (
                      <TouchableOpacity
                        key={method}
                        style={[styles.methodCard, isSelected && styles.methodCardActive]}
                        onPress={() => setPaymentMethod(method)}
                        activeOpacity={0.7}
                      >
                        <Ionicons
                          name={iconName as any}
                          size={24}
                          color={isSelected ? '#ffffff' : '#475569'}
                        />
                        <Text style={[styles.methodText, isSelected && styles.methodTextActive]}>
                          {method.toUpperCase()}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Amount Input */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Amount to Collect</Text>
                <View style={styles.inputContainer}>
                  <Text style={styles.currencySymbol}>₹</Text>
                  <TextInput
                    style={styles.amountInput}
                    keyboardType="numeric"
                    value={paymentAmount}
                    onChangeText={setPaymentAmount}
                    placeholder="Enter amount"
                    placeholderTextColor="#94A3B8"
                    editable={!isSubmitting}
                  />
                  <TouchableOpacity
                    style={styles.fullAmountBtn}
                    onPress={() => setPaymentAmount(String(invoice.balance))}
                  >
                    <Text style={styles.fullAmountText}>Full Amount</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.primaryButton, isSubmitting && styles.disabledButton]}
                  onPress={handleRecordPayment}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text style={styles.primaryButtonText}>Collect ₹{paymentAmount || '0'}</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.secondaryButton, isSubmitting && styles.disabledButton]}
                  onPress={handleMarkAsPaid}
                  disabled={isSubmitting}
                >
                  <Text style={styles.secondaryButtonText}>Mark as Fully Paid</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <View style={styles.fullyPaidCard}>
              <Ionicons name="checkmark-circle" size={48} color="#16A34A" />
              <Text style={styles.fullyPaidTitle}>Order Fully Paid</Text>
              <Text style={styles.fullyPaidSubtitle}>No outstanding balance for this order.</Text>
            </View>
          )}

          <Footer />
          <View style={{ height: 60 }} />
        </ScrollView>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  loadingBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginHorizontal: 20,
  },
  retryButton: {
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#0F172A',
    borderRadius: 8,
  },
  retryText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13,
  },
  scrollContent: {
    padding: 16,
  },
  orderSummaryCard: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 20,
  },
  orderLabel: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  orderValue: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
    marginTop: 4,
  },
  customerName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 4,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#475569',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  itemNotes: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  itemQty: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    marginHorizontal: 16,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  balanceRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    marginBottom: 0,
  },
  balanceLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  balanceValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  methodGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  methodCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  methodCardActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  methodText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  methodTextActive: {
    color: '#ffffff',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  fullAmountBtn: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  fullAmountText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },
  buttonContainer: {
    marginTop: 8,
    gap: 12,
  },
  primaryButton: {
    height: 50,
    backgroundColor: '#0F172A',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryButton: {
    height: 50,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  secondaryButtonText: {
    color: '#475569',
    fontSize: 15,
    fontWeight: '700',
  },
  disabledButton: {
    opacity: 0.7,
  },
  fullyPaidCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EFF6FF',
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.01,
    shadowRadius: 8,
    elevation: 1,
  },
  fullyPaidTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#16A34A',
    marginTop: 12,
  },
  fullyPaidSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '500',
  },
});
