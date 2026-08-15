import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { CustomerListItem, customersApi } from '@/lib/api';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

export default function Customers() {
  const [search, setSearch] = useState('');
  const [customers, setCustomers] = useState<CustomerListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Debounce timer ref
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchCustomers = useCallback(async (query: string) => {
    setError(null);
    setIsLoading(true);
    try {
      const data = await customersApi.search(query);
      setCustomers(data);
    } catch (err: any) {
      setError(err.message || 'Could not load customers.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchCustomers('');
  }, [fetchCustomers]);

  // Debounced search — fires 400ms after the user stops typing
  const handleSearch = (text: string) => {
    setSearch(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchCustomers(text);
    }, 400);
  };

  return (
    <View style={styles.container}>
      <Header />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Page Header */}
        <View style={styles.titleRow}>
          <View>
            <Text style={styles.title}>Customers</Text>
            <Text style={styles.subtitle}>
              Manage customer details &amp; laundry history
            </Text>
          </View>

          <TouchableOpacity
            style={styles.addButton}
            activeOpacity={0.8}
            onPress={() => {
              router.push('/neworder');
            }}
          >
            <Ionicons name="add" size={20} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#64748B" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search customers by name or phone..."
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={handleSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>

        {/* Customer Count row */}
        {!isLoading && !error && (
          <View style={styles.customerCountRow}>
            <Text style={styles.customerCount}>
              {customers.length} {customers.length === 1 ? 'Customer' : 'Customers'}
            </Text>
          </View>
        )}

        {/* States */}
        {isLoading ? (
          <View style={styles.centeredBox}>
            <ActivityIndicator size="small" color="#0F172A" />
          </View>
        ) : error ? (
          <View style={styles.centeredBox}>
            <Ionicons name="cloud-offline-outline" size={36} color="#94A3B8" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => fetchCustomers(search)}
              activeOpacity={0.7}
            >
              <Text style={styles.retryText}>Tap to retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* Customer List */
          <View style={styles.customerList}>
            {customers.map((customer) => (
              <TouchableOpacity
                key={customer._id}
                style={styles.customerCard}
                activeOpacity={0.7}
                onPress={() =>
                  router.push({
                    pathname: '/customers/[id]',
                    params: {
                      id: customer._id,
                      name: customer.name,
                      phone: customer.phone,
                    },
                  })
                }
              >
                {/* Avatar */}
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{getInitials(customer.name)}</Text>
                </View>

                {/* Customer Info */}
                <View style={styles.customerInfo}>
                  <Text style={styles.customerName}>{customer.name}</Text>

                  <View style={styles.phoneRow}>
                    <Ionicons name="call-outline" size={12} color="#64748B" />
                    <Text style={styles.phone}>{customer.phone}</Text>
                  </View>
                </View>

                {/* Arrow */}
                <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
              </TouchableOpacity>
            ))}

            {/* Empty State */}
            {customers.length === 0 && (
              <View style={styles.emptyState}>
                <Ionicons name="people-outline" size={44} color="#94A3B8" />
                <Text style={styles.emptyTitle}>No customers found</Text>
                <Text style={styles.emptyText}>
                  {search.length > 0
                    ? 'Try searching with another name or phone number.'
                    : 'Customers will appear here once orders are placed.'}
                </Text>
              </View>
            )}
          </View>
        )}

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
  titleRow: {
    marginTop: 24,
    marginHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  subtitle: {
    marginTop: 3,
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  addButton: {
    height: 40,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: '#0F172A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    marginLeft: 4,
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  searchContainer: {
    height: 50,
    marginTop: 18,
    marginHorizontal: 20,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
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
  customerCountRow: {
    marginTop: 20,
    marginHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  customerCount: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  centeredBox: {
    minHeight: 200,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 14,
    marginHorizontal: 16,
  },
  errorText: {
    marginTop: 10,
    fontSize: 13,
    fontWeight: '600',
    color: '#B91C1C',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 12,
  },
  retryText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    textDecorationLine: 'underline',
  },
  customerList: {
    marginTop: 14,
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
  customerCard: {
    minHeight: 72,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2563EB',
  },
  customerInfo: {
    flex: 1,
    marginLeft: 14,
  },
  customerName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  phoneRow: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  phone: {
    marginLeft: 4,
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  emptyState: {
    minHeight: 200,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyTitle: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
  },
  emptyText: {
    marginTop: 4,
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 18,
    color: '#64748B',
  },
});