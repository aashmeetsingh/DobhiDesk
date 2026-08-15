import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { OrderListItemRaw, ordersApi } from '@/lib/api';
import { Ionicons } from '@expo/vector-icons';
import { router, useNavigation } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function PaymentsTabScreen() {
  const [orders, setOrders] = useState<OrderListItemRaw[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  // We want to fetch the orders when the screen gains focus
  const navigation = useNavigation();

  const fetchPendingOrders = async (searchTerm: string) => {
    setError(null);
    try {
      const result = await ordersApi.listOrders({ search: searchTerm || undefined });
      // Filter out fully paid orders, showing only unpaid or partially paid orders
      const pending = result.data.filter((o) => o.payment_status !== 'paid');
      setOrders(pending);
    } catch (err: any) {
      setError(err.message || 'Could not load orders.');
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    await fetchPendingOrders(search);
    setIsLoading(false);
  };

  // Reload data on search text change (debounced)
  useEffect(() => {
    if (searchDebounce.current) clearTimeout(searchDebounce.current);
    searchDebounce.current = setTimeout(() => {
      fetchPendingOrders(search);
    }, 400);
    return () => {
      if (searchDebounce.current) clearTimeout(searchDebounce.current);
    };
  }, [search]);

  // Reload when the tab screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadData();
    });
    loadData();
    return unsubscribe;
  }, [navigation]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await fetchPendingOrders(search);
    setIsRefreshing(false);
  };

  const renderItem = ({ item }: { item: OrderListItemRaw }) => {
    const customerName = item.customer_id?.name || 'Unknown Customer';
    const isPartial = item.payment_status === 'partial';

    return (
      <TouchableOpacity
        style={styles.orderCard}
        activeOpacity={0.7}
        onPress={() =>
          router.push({
            pathname: '/payment',
            params: {
              orderId: item._id,
              tag: item.tag,
              customerName,
            },
          })
        }
      >
        <View style={styles.cardHeader}>
          <View style={styles.tagBadge}>
            <Text style={styles.tagText}>#{item.tag}</Text>
          </View>
          <View style={[styles.statusBadge, isPartial ? styles.partialBadge : styles.unpaidBadge]}>
            <Text style={[styles.statusText, isPartial ? styles.partialText : styles.unpaidText]}>
              {item.payment_status?.toUpperCase() || 'UNPAID'}
            </Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.customerInfo}>
            <Text style={styles.customerLabel}>CUSTOMER</Text>
            <Text style={styles.customerName}>{customerName}</Text>
          </View>
          <View style={styles.amountInfo}>
            <Text style={styles.amountLabel}>TOTAL AMOUNT</Text>
            <Text style={styles.amountValue}>₹{item.total_amount.toLocaleString('en-IN')}</Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.actionText}>Collect Payment</Text>
          <Ionicons name="arrow-forward" size={14} color="#2563EB" />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Header />

      <View style={styles.innerContainer}>
        {/* Title */}
        <Text style={styles.title}>Pending Payments</Text>
        <Text style={styles.subtitle}>
          Collect pending balances and manage invoices for active laundry orders.
        </Text>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#64748B" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by customer name or tag..."
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {isLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="small" color="#0F172A" />
          </View>
        ) : error ? (
          <View style={styles.centerContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={loadData} style={styles.retryButton}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={orders}
            renderItem={renderItem}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
            }
            ListFooterComponent={<Footer />}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="card-outline" size={48} color="#94A3B8" />
                <Text style={styles.emptyText}>No pending payments found</Text>
              </View>
            }
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  innerContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  title: {
    marginTop: 24,
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
    lineHeight: 20,
    fontWeight: '500',
  },
  searchContainer: {
    height: 50,
    marginTop: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    marginLeft: 10,
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '500',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 14,
    fontWeight: '600',
  },
  retryButton: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#0F172A',
    borderRadius: 8,
  },
  retryText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 12,
  },
  listContent: {
    paddingBottom: 100,
  },
  orderCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tagBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  unpaidBadge: {
    backgroundColor: '#FEF3C7',
  },
  unpaidText: {
    color: '#D97706',
  },
  partialBadge: {
    backgroundColor: '#EFF6FF',
  },
  partialText: {
    color: '#2563EB',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  cardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  customerInfo: {
    flex: 1,
  },
  customerLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  customerName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 4,
  },
  amountInfo: {
    alignItems: 'flex-end',
  },
  amountLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  amountValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E293B',
    marginTop: 4,
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
  emptyState: {
    paddingTop: 80,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '600',
  },
});
