import Footer from '@/components/Footer';
import { CustomerDetail, CustomerOrderRaw, customersApi, ordersApi } from '@/lib/api';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

function formatDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
}

type StatusType = 'progress' | 'delivered' | 'pending' | 'overdue';

function toStatusType(o: CustomerOrderRaw): StatusType {
  if (o.status === 'pending_pickup' && new Date(o.pickup_date) < new Date()) return 'overdue';
  if (o.status === 'delivered') return 'delivered';
  if (o.status === 'pending_pickup') return 'pending';
  return 'progress';
}

function statusLabel(o: CustomerOrderRaw, type: StatusType) {
  if (type === 'overdue') return 'OVERDUE';
  if (type === 'pending') return 'PENDING PICKUP';
  return o.stage.replace(/_/g, ' ').toUpperCase();
}

export default function CustomerDetails() {
  const { id, name: nameParam, phone: phoneParam } = useLocalSearchParams<{
    id: string;
    name?: string;
    phone?: string;
  }>();

  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [orders, setOrders] = useState<CustomerOrderRaw[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [advancingOrderId, setAdvancingOrderId] = useState<string | null>(null);

  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [line1, setLine1] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [landmark, setLandmark] = useState('');

  const load = async () => {
    if (!id) return;
    setError(null);
    try {
      const [customerData, orderData] = await Promise.all([
        customersApi.getById(id),
        customersApi.getOrders(id),
      ]);
      setCustomer(customerData);
      setOrders(orderData);
      setLine1(customerData.address?.line1 || '');
      setCity(customerData.address?.city || '');
      setPincode(customerData.address?.pincode || '');
      setLandmark(customerData.address?.landmark || '');
    } catch (err: any) {
      setError(err.message || 'Could not load customer.');
    }
  };

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      await load();
      setIsLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const advanceOrder = async (orderId: string) => {
    setAdvancingOrderId(orderId);
    try {
      const updated = await ordersApi.advanceStage(orderId);
      setOrders((prev) => prev.map((o) => (o._id === orderId ? updated : o)));
    } catch (err: any) {
      Alert.alert('Could not update status', err.message || 'Please try again.');
    } finally {
      setAdvancingOrderId(null);
    }
  };

  const saveAddress = async () => {
    if (!id) return;
    setIsSavingAddress(true);
    try {
      const updated = await customersApi.updateAddress(id, { line1, city, pincode, landmark });
      setCustomer(updated);
      setIsEditingAddress(false);
    } catch (err: any) {
      Alert.alert('Could not save address', err.message || 'Please try again.');
    } finally {
      setIsSavingAddress(false);
    }
  };

  const callCustomer = () => {
    const phone = customer?.phone || phoneParam;
    if (!phone) return;
    Linking.openURL(`tel:${phone}`);
  };

  const displayName = customer?.name || nameParam || 'Customer';
  const displayPhone = customer?.phone || phoneParam || '';

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Customer Details</Text>

        <View style={{ width: 40 }} />
      </View>

      {isLoading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="small" color="#111827" />
        </View>
      ) : error ? (
        <View style={styles.loadingBox}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={load}>
            <Text style={styles.retryText}>Tap to retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Customer Profile */}
          <View style={styles.profileSection}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={30} color="#6B7280" />
            </View>

            <View style={styles.customerInfo}>
              <Text style={styles.customerName}>{displayName}</Text>

              <View style={styles.phoneRow}>
                <Ionicons name="call-outline" size={13} color="#6B7280" />
                <Text style={styles.phone}>{displayPhone}</Text>
              </View>
            </View>
          </View>

          {/* New Order Button */}
          <TouchableOpacity
            style={styles.newOrderButton}
            activeOpacity={0.8}
            onPress={() =>
              router.push({
                pathname: '/neworder',
                params: {
                  customerName: displayName,
                  phone: displayPhone,
                  customerId: id,
                },
              })
            }
          >
            <Ionicons name="add" size={18} color="#FFFFFF" />
            <Text style={styles.newOrderText}>NEW ORDER</Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Statistics */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>TOTAL ORDERS</Text>
              <View style={styles.statValueRow}>
                <Text style={styles.statValue}>{customer?.total_orders ?? 0}</Text>
              </View>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statLabel}>TOTAL SPENT</Text>
              <Text style={styles.moneyValue}>₹{(customer?.total_spent ?? 0).toLocaleString('en-IN')}</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statLabel}>LAST VISIT</Text>
              <Text style={styles.lastVisit}>{formatDate(customer?.last_visit ?? null)}</Text>
            </View>
          </View>

          {/* Recent Orders */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Orders</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/orders')}>
                <Text style={styles.viewAll}>VIEW ALL →</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.ordersCard}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderText, styles.orderColumn]}>ORDER NO.</Text>
                <Text style={[styles.tableHeaderText, styles.dateColumn]}>DATE</Text>
                <Text style={[styles.tableHeaderText, styles.statusColumn]}>STATUS</Text>
              </View>

              {orders.slice(0, 5).map((o) => {
                const type = toStatusType(o);
                return (
                  <OrderRow
                    key={o._id}
                    order={o.tag}
                    date={formatDate(o.created_at)}
                    status={statusLabel(o, type)}
                    statusType={type}
                    stage={o.stage}
                    isAdvancing={advancingOrderId === o._id}
                    onAdvance={() => advanceOrder(o._id)}
                    paymentStatus={o.payment_status}
                    onPay={() =>
                      router.push({
                        pathname: '/payment',
                        params: {
                          orderId: o._id,
                          tag: o.tag,
                          customerName: displayName,
                        },
                      })
                    }
                  />
                );
              })}

              {orders.length === 0 && (
                <View style={{ padding: 20, alignItems: 'center' }}>
                  <Text style={{ color: '#94A3B8', fontSize: 13 }}>No orders yet</Text>
                </View>
              )}
            </View>
          </View>

          {/* Service Preferences */}
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Ionicons name="settings-outline" size={17} color="#4B5563" />
              <Text style={styles.infoTitle}>Service Preferences</Text>
            </View>

            {(customer?.preferences ?? []).length === 0 ? (
              <Text style={{ color: '#94A3B8', fontSize: 12 }}>No preferences noted</Text>
            ) : (
              customer!.preferences!.map((p, i) => <PreferenceItem key={i} text={p} />)
            )}
          </View>

          {/* Primary Address */}
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Ionicons name="location-outline" size={17} color="#4B5563" />
              <Text style={styles.infoTitle}>Primary Address</Text>
            </View>

            {isEditingAddress ? (
              <View>
                <TextInput
                  style={styles.addressInput}
                  placeholder="Address line"
                  value={line1}
                  onChangeText={setLine1}
                />
                <TextInput
                  style={styles.addressInput}
                  placeholder="City"
                  value={city}
                  onChangeText={setCity}
                />
                <TextInput
                  style={styles.addressInput}
                  placeholder="Pincode"
                  value={pincode}
                  onChangeText={setPincode}
                  keyboardType="number-pad"
                />
                <TextInput
                  style={styles.addressInput}
                  placeholder="Landmark (optional)"
                  value={landmark}
                  onChangeText={setLandmark}
                />
                <View style={{ flexDirection: 'row', gap: 16, marginTop: 8 }}>
                  <TouchableOpacity onPress={saveAddress} disabled={isSavingAddress}>
                    {isSavingAddress ? (
                      <ActivityIndicator size="small" color="#111827" />
                    ) : (
                      <Text style={styles.editText}>SAVE</Text>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setIsEditingAddress(false)} disabled={isSavingAddress}>
                    <Text style={[styles.editText, { color: '#94A3B8' }]}>CANCEL</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <>
                {customer?.address?.line1 ? (
                  <>
                    <Text style={styles.addressText}>{customer.address.line1}</Text>
                    <Text style={styles.addressText}>
                      {[customer.address.city, customer.address.pincode].filter(Boolean).join(' - ')}
                    </Text>
                  </>
                ) : (
                  <Text style={styles.addressText}>No address on file</Text>
                )}

                <TouchableOpacity style={styles.editButton} onPress={() => setIsEditingAddress(true)}>
                  <Text style={styles.editText}>EDIT ADDRESS</Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* Call customer */}
          <View style={{ alignItems: 'center', marginTop: 20 }}>
            <TouchableOpacity style={styles.callButton} onPress={callCustomer} activeOpacity={0.8}>
              <Ionicons name="call-outline" size={16} color="#111827" />
              <Text style={styles.callButtonText}>Call Customer</Text>
            </TouchableOpacity>
          </View>

          <Footer />
          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </View>
  );
}

/* ================= ORDER ROW ================= */

const STAGE_ORDER = ['picked_up', 'washing', 'ironing', 'ready', 'delivered'] as const;
const STAGE_LABELS: Record<string, string> = {
  picked_up: 'Picked Up',
  washing: 'Washing',
  ironing: 'Ironing',
  ready: 'Ready',
  delivered: 'Delivered',
};

function OrderRow({
  order,
  date,
  status,
  statusType,
  stage,
  isAdvancing,
  onAdvance,
  paymentStatus,
  onPay,
}: {
  order: string;
  date: string;
  status: string;
  statusType: StatusType;
  stage: string;
  isAdvancing: boolean;
  onAdvance: () => void;
  paymentStatus?: string;
  onPay: () => void;
}) {
  const badgeStyle = {
    progress: styles.progressBadge,
    delivered: styles.deliveredBadge,
    pending: styles.pendingBadge,
    overdue: styles.overdueBadge,
  }[statusType];

  const textStyle = {
    progress: styles.progressText,
    delivered: styles.deliveredText,
    pending: styles.pendingText,
    overdue: styles.overdueText,
  }[statusType];

  const isFinal = stage === 'delivered';

  return (
    <View style={styles.orderRow}>
      {/* Top row: tag | date | status badge */}
      <View style={styles.orderTopRow}>
        <Text style={[styles.orderText, styles.orderColumn]}>{order}</Text>
        <Text style={[styles.dateText, styles.dateColumn]}>{date}</Text>
        <View style={styles.statusColumn}>
          <View style={[styles.statusBadge, badgeStyle]}>
            <Text style={[styles.statusText, textStyle]}>{status}</Text>
          </View>
        </View>
      </View>

      {/* Stage row */}
      <View style={styles.stageRow}>
        <View style={styles.stageChip}>
          <Ionicons
            name={isFinal ? 'checkmark-circle' : 'time-outline'}
            size={11}
            color={isFinal ? '#16A34A' : '#6B7280'}
          />
          <Text style={[styles.stageText, isFinal && styles.stageTextDone]}>
            {STAGE_LABELS[stage] ?? stage}
          </Text>
        </View>

        {!isFinal && (
          <TouchableOpacity
            style={styles.advanceButton}
            onPress={onAdvance}
            disabled={isAdvancing}
            activeOpacity={0.75}
          >
            {isAdvancing ? (
              <ActivityIndicator size="small" color="#2563EB" />
            ) : (
              <>
                <Text style={styles.advanceText}>
                  → {STAGE_LABELS[STAGE_ORDER[STAGE_ORDER.indexOf(stage as any) + 1]] ?? 'Next'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Payment row */}
      <View style={styles.paymentRow}>
        <View style={styles.paymentStatusContainer}>
          <Text style={styles.paymentLabel}>Payment: </Text>
          <Text style={[
            styles.paymentStatusText,
            paymentStatus === 'paid' ? styles.paymentPaid : styles.paymentUnpaid
          ]}>
            {paymentStatus ? paymentStatus.toUpperCase() : 'UNPAID'}
          </Text>
        </View>

        {paymentStatus !== 'paid' ? (
          <TouchableOpacity
            style={styles.payButton}
            onPress={onPay}
            activeOpacity={0.75}
          >
            <Ionicons name="card-outline" size={11} color="#ffffff" />
            <Text style={styles.payButtonText}>Collect</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.paidBadge}>
            <Ionicons name="checkmark" size={11} color="#16A34A" />
            <Text style={styles.paidText}>Settled</Text>
          </View>
        )}
      </View>
    </View>
  );
}

/* ================= PREFERENCE ITEM ================= */

function PreferenceItem({ text }: { text: string }) {
  return (
    <View style={styles.preferenceRow}>
      <Ionicons name="checkmark-circle-outline" size={14} color="#6B7280" />
      <Text style={styles.preferenceText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },

  loadingBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  errorText: {
    color: '#B91C1C',
    fontSize: 13,
    fontWeight: '600',
  },

  retryText: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
    textDecorationLine: 'underline',
  },

  scrollContent: {
    paddingHorizontal: 14,
  },

  /* Header */

  header: {
    height: 60,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },

  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  },

  /* Profile */

  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 22,
  },

  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },

  customerInfo: {
    marginLeft: 12,
  },

  customerName: {
    fontSize: 19,
    fontWeight: '700',
    color: '#1F2937',
  },

  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },

  phone: {
    marginLeft: 5,
    fontSize: 13,
    color: '#6B7280',
  },

  /* New Order */

  newOrderButton: {
    marginTop: 16,
    width: 125,
    height: 40,
    borderRadius: 7,
    backgroundColor: '#1F2937',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  newOrderText: {
    marginLeft: 5,
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginTop: 18,
  },

  /* Stats */

  statsContainer: {
    marginTop: 12,
    gap: 8,
  },

  statCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDE1E6',
    borderRadius: 8,
    padding: 14,
  },

  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: 0.5,
  },

  statValueRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 6,
  },

  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
  },

  moneyValue: {
    marginTop: 6,
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
  },

  lastVisit: {
    marginTop: 6,
    fontSize: 20,
    fontWeight: '700',
    color: '#374151',
  },

  /* Sections */

  section: {
    marginTop: 20,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 2,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
  },

  viewAll: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6B7280',
  },

  /* Orders */

  ordersCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDE1E6',
    borderRadius: 8,
    overflow: 'hidden',
  },

  tableHeader: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    backgroundColor: '#F3F4F6',
  },

  tableHeaderText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6B7280',
  },

  orderRow: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },

  orderTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 36,
  },

  stageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },

  stageChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
    gap: 4,
  },

  stageText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6B7280',
  },

  stageTextDone: {
    color: '#16A34A',
  },

  advanceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 4,
    minWidth: 80,
    justifyContent: 'center',
  },

  advanceText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2563EB',
  },

  orderColumn: {
    width: '30%',
  },

  dateColumn: {
    width: '30%',
  },

  statusColumn: {
    width: '40%',
    alignItems: 'flex-end',
  },

  orderText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },

  dateText: {
    fontSize: 13,
    color: '#4B5563',
  },

  /* Status */

  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 5,
  },

  statusText: {
    fontSize: 9,
    fontWeight: '800',
  },

  progressBadge: { backgroundColor: '#E6F0FF' },
  progressText: { color: '#2563EB' },

  deliveredBadge: { backgroundColor: '#E7F7EC' },
  deliveredText: { color: '#16A34A' },

  pendingBadge: { backgroundColor: '#FEF3C7' },
  pendingText: { color: '#B45309' },

  overdueBadge: { backgroundColor: '#FEE2E2' },
  overdueText: { color: '#DC2626' },

  /* Info Cards */

  infoCard: {
    marginTop: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDE1E6',
    borderRadius: 8,
    padding: 14,
  },

  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  infoTitle: {
    marginLeft: 8,
    fontSize: 15,
    fontWeight: '700',
    color: '#374151',
  },

  preferenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 9,
  },

  preferenceText: {
    marginLeft: 7,
    fontSize: 12,
    color: '#6B7280',
  },

  /* Address */

  addressText: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 20,
  },

  addressInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    color: '#1F2937',
    marginTop: 8,
  },

  editButton: {
    marginTop: 14,
  },

  editText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#374151',
    letterSpacing: 0.5,
  },

  /* Call button */

  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#111827',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },

  callButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },

  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  paymentStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentLabel: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '500',
  },
  paymentStatusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  paymentPaid: {
    color: '#16A34A',
  },
  paymentUnpaid: {
    color: '#D97706',
  },
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 4,
    minWidth: 80,
    justifyContent: 'center',
  },
  payButtonText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
  },
  paidBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
  },
  paidText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#16A34A',
  },
});