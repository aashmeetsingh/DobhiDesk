import Footer from '@/components/Footer';
import Header from '@/components/Header';
import OrderListItem from '@/components/orders/OrderListItem';
import { exportOrdersPdf, OrderListItemRaw, ordersApi } from '@/lib/api';
import { Order, OrderStatus } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { File, Paths } from 'expo-file-system';
import { router } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

function capitalize(s: string) {
  return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function isOverdue(raw: OrderListItemRaw) {
  return raw.status === 'pending_pickup' && new Date(raw.pickup_date) < new Date();
}

function displayStatus(raw: OrderListItemRaw) {
  if (isOverdue(raw)) return 'OVERDUE';
  return raw.stage.replace(/_/g, ' ').toUpperCase();
}

function toDisplayOrder(raw: OrderListItemRaw): Order {
  const totalItems = raw.items.reduce((sum, i) => sum + i.qty, 0);
  return {
    id: raw._id,
    tag: raw.tag,
    customer: raw.customer_id?.name || 'Unknown customer',
    phone: raw.customer_id?.phone || '',
    items: totalItems,
    status: displayStatus(raw) as OrderStatus,
    pickupDate: new Date(raw.pickup_date),
    deliveryDate: new Date(raw.delivery_date),
    serviceType: capitalize(raw.service_type),
  };
}

export default function Orders() {
  const [rawOrders, setRawOrders] = useState<OrderListItemRaw[]>([]);
  const [selectedFilter, setSelectedFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchOrders = async (searchTerm: string) => {
    setError(null);
    try {
      const result = await ordersApi.listOrders({ search: searchTerm || undefined });
      setRawOrders(result.data);
    } catch (err: any) {
      setError(err.message || 'Could not load orders.');
    }
  };

  // Initial load
  useEffect(() => {
    (async () => {
      setIsLoading(true);
      await fetchOrders('');
      setIsLoading(false);
    })();
  }, []);

  // Debounced re-fetch whenever the search text changes
  useEffect(() => {
    if (searchDebounce.current) clearTimeout(searchDebounce.current);
    searchDebounce.current = setTimeout(() => {
      fetchOrders(search);
    }, 400);
    return () => {
      if (searchDebounce.current) clearTimeout(searchDebounce.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await fetchOrders(search);
    setIsRefreshing(false);
  };

  // Search already happens server-side; filter tabs (ALL / IN PROGRESS / OVERDUE)
  // are applied client-side against whatever the server returned.
  const filteredOrders = useMemo(() => {
    return rawOrders
      .filter((raw) => {
        if (selectedFilter === 'ALL') return true;
        if (selectedFilter === 'OVERDUE') return isOverdue(raw);
        if (selectedFilter === 'IN PROGRESS') return raw.status === 'in_progress' || raw.status === 'ready';
        return true;
      })
      .map(toDisplayOrder);
  }, [rawOrders, selectedFilter]);

  // Order id -> real customer id, since OrderListItem/Order only carries the order's own id
  const customerIdByOrderId = useMemo(() => {
    const map: Record<string, string> = {};
    rawOrders.forEach((raw) => {
      if (raw.customer_id?._id) map[raw._id] = raw.customer_id._id;
    });
    return map;
  }, [rawOrders]);

  const handleOrderPress = (order: Order) => {
    router.push({
      pathname: '/customers/[id]',
      params: {
        id: customerIdByOrderId[order.id] || order.id,
        name: order.customer,
        phone: order.phone,
        tag: order.tag,
      },
    });
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const pdfBytes = await exportOrdersPdf();
      const file = new File(Paths.cache, `orders-${Date.now()}.pdf`);
      file.write(pdfBytes);

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(file.uri, { mimeType: 'application/pdf', dialogTitle: 'Export orders' });
      } else {
        Alert.alert('Export ready', `Saved to ${file.uri}`);
      }
    } catch (err: any) {
      Alert.alert('Export failed', err.message || 'Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
      >
        {/* Title */}
        <Text style={styles.title}>All Orders</Text>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#64748B" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or tag number..."
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Filters */}
        <View style={styles.filterContainer}>
          {['ALL', 'IN PROGRESS', 'OVERDUE'].map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterButton,
                selectedFilter === filter && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedFilter(filter)}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedFilter === filter && styles.filterTextActive,
                ]}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Orders Table */}
        <View style={styles.ordersCard}>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerText, styles.tagColumn]}>TAG</Text>
            <Text style={[styles.headerText, styles.customerColumn]}>CUSTOMER</Text>
            <Text style={[styles.headerText, styles.itemsColumn]}>ITEMS</Text>
            <Text style={[styles.headerText, styles.statusColumn]}>STATUS</Text>
          </View>

          {isLoading ? (
            <View style={styles.emptyState}>
              <ActivityIndicator size="small" color="#0F172A" />
            </View>
          ) : error ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>{error}</Text>
              <TouchableOpacity onPress={() => fetchOrders(search)}>
                <Text style={styles.retryText}>Tap to retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {filteredOrders.map((order) => (
                <OrderListItem
                  key={order.id}
                  order={order}
                  onPress={handleOrderPress}
                />
              ))}

              {filteredOrders.length === 0 && (
                <View style={styles.emptyState}>
                  <Ionicons name="search-outline" size={32} color="#94A3B8" />
                  <Text style={styles.emptyText}>No orders found</Text>
                </View>
              )}
            </>
          )}
        </View>

        {/* Export Button */}
        <TouchableOpacity
          style={styles.exportButton}
          activeOpacity={0.8}
          onPress={handleExport}
          disabled={isExporting}
        >
          {isExporting ? (
            <ActivityIndicator size="small" color="#1E293B" />
          ) : (
            <>
              <Ionicons name="download-outline" size={20} color="#1E293B" />
              <Text style={styles.exportText}>Export Daily Report</Text>
            </>
          )}
        </TouchableOpacity>

        <Footer />
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingBottom: 30,
  },
  title: {
    marginTop: 24,
    marginHorizontal: 20,
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  searchContainer: {
    height: 50,
    marginTop: 16,
    marginHorizontal: 20,
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
  },
  searchInput: {
    flex: 1,
    height: '100%',
    marginLeft: 10,
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '500',
  },
  filterContainer: {
    height: 40,
    marginTop: 18,
    paddingHorizontal: 20,
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
  },
  filterButtonActive: {
    backgroundColor: '#0F172A',
  },
  filterText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  ordersCard: {
    marginTop: 20,
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  tableHeader: {
    height: 48,
    backgroundColor: '#F8FAFC',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  tagColumn: {
    width: '24%',
  },
  customerColumn: {
    width: '32%',
  },
  itemsColumn: {
    width: '20%',
  },
  statusColumn: {
    width: '24%',
    alignItems: 'flex-end',
  },
  emptyState: {
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 8,
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  retryText: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    textDecorationLine: 'underline',
  },
  exportButton: {
    height: 48,
    marginTop: 24,
    marginHorizontal: 40,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  exportText: {
    marginLeft: 8,
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
});