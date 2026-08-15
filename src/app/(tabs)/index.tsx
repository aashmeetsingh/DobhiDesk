import ActivityCard from '@/components/ActivityCard';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import StatCard from '@/components/StatCard';
import { DashboardSummary, exportOrdersPdf, ordersApi, RecentOrder } from '@/lib/api';
import { Ionicons } from '@expo/vector-icons';
import { File, Paths } from 'expo-file-system';
import { router } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

function getInitials(name?: string) {
  if (!name) return '?';
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function HomeScreen() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [activities, setActivities] = useState<RecentOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const loadDashboard = useCallback(async () => {
    setError(null);
    try {
      const [summaryData, activityData] = await Promise.all([
        ordersApi.getDashboardSummary(),
        ordersApi.getRecentActivity(),
      ]);
      setSummary(summaryData);
      setActivities(activityData);
    } catch (err: any) {
      setError(err.message || 'Could not load dashboard data.');
    }
  }, []);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      await loadDashboard();
      setIsLoading(false);
    })();
  }, [loadDashboard]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadDashboard();
    setIsRefreshing(false);
  }, [loadDashboard]);

  const handleDownloadReport = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      const bytes = await exportOrdersPdf();
      // Write raw bytes directly using the new File API (expo-file-system v57)
      const file = new File(Paths.cache, 'orders_report.pdf');
      file.write(bytes);
      const canShare = await Sharing.isAvailableAsync();
      if (!canShare) {
        Alert.alert('Sharing not available', 'Your device does not support file sharing.');
        return;
      }
      await Sharing.shareAsync(file.uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Orders Report',
        UTI: 'com.adobe.pdf',
      });
    } catch (err: any) {
      Alert.alert('Download failed', err.message || 'Could not download the report. Please try again.');
    } finally {
      setIsDownloading(false);
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
        <Text style={styles.title}>Operations Dashboard</Text>
        <Text style={styles.subtitle}>
          Monitor your facility's performance and track key metrics in real-time.
        </Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.newOrderButton}
            activeOpacity={0.8}
            onPress={() => router.push('/neworder')}
          >
            <Ionicons name="add" size={16} color="#ffffff" />
            <Text style={styles.newOrderText}>NEW ORDER</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.viewOrdersButton}
            activeOpacity={0.8}
            onPress={() => router.push('/(tabs)/orders')}
          >
            <Ionicons name="list" size={16} color="#475569" />
            <Text style={styles.viewOrdersText}>VIEW ALL ORDERS</Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color="#0F172A" />
          </View>
        ) : error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={loadDashboard}>
              <Text style={styles.retryText}>Tap to retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.statGrid}>
              <StatCard
                title="Total Orders"
                value={String(summary?.total_orders_this_week ?? 0)}
                description="This week"
                icon="clipboard-outline"
              />
              <StatCard
                title="Revenue"
                value={`₹${(summary?.revenue_this_month ?? 0).toLocaleString('en-IN')}`}
                description="This month"
                icon="cash-outline"
              />
              <StatCard
                title="Overdue Orders"
                value={String(summary?.overdue_orders ?? 0)}
                description="Awaiting processing"
                icon="alert-circle-outline"
                alert={(summary?.overdue_orders ?? 0) > 0}
              />
              <StatCard
                title="Completed"
                value={String(summary?.completed_this_week ?? 0)}
                description="Delivered this week"
                icon="checkmark-circle-outline"
              />
            </View>

            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Recent Activities</Text>
              {activities.length === 0 ? (
                <Text style={styles.emptyText}>No recent orders yet.</Text>
              ) : (
                <ActivityCard
                  activities={activities.map((order) => ({
                    id: order._id,
                    initials: getInitials(order.customer_id?.name),
                    name: order.customer_id?.name || 'Unknown customer',
                    order: `Order #${order.tag}`,
                    time: formatTime(order.updated_at),
                  }))}
                  onPress={(activity) => {
                    const originalOrder = activities.find((o) => o._id === activity.id);
                    if (originalOrder) {
                      router.push({
                        pathname: '/customers/[id]',
                        params: {
                          id: originalOrder.customer_id?._id || originalOrder._id,
                          name: originalOrder.customer_id?.name || 'Unknown customer',
                          phone: originalOrder.customer_id?.phone || '',
                          tag: originalOrder.tag,
                        },
                      });
                    }
                  }}
                />
              )}
            </View>
          </>
        )}

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Reports</Text>
          <View style={styles.reportCard}>
            <Text style={styles.reportTitle}>Efficiency Reports</Text>
            <Text style={styles.reportSubtitle}>
              Download the full report to analyze your facility's performance and make data-driven decisions.
            </Text>
            <TouchableOpacity
              style={[styles.downloadButton, isDownloading && styles.downloadButtonDisabled]}
              activeOpacity={0.8}
              onPress={handleDownloadReport}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <ActivityIndicator size="small" color="#0F172A" />
              ) : (
                <Ionicons name="download-outline" size={16} color="#0F172A" />
              )}
              <Text style={styles.downloadButtonText}>
                {isDownloading ? 'Generating...' : 'Download Full Report'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

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
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
    marginHorizontal: 20,
    lineHeight: 20,
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    marginHorizontal: 20,
  },
  newOrderButton: {
    height: 42,
    paddingHorizontal: 16,
    backgroundColor: '#0F172A',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  newOrderText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  viewOrdersButton: {
    height: 42,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  viewOrdersText: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '700',
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 24,
    marginHorizontal: 16,
  },
  sectionContainer: {
    marginTop: 28,
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
    marginLeft: 4,
  },
  reportCard: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  reportTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
  },
  reportSubtitle: {
    color: '#94A3B8',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 8,
    marginBottom: 20,
    fontWeight: '500',
  },
  downloadButton: {
    height: 40,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  downloadButtonDisabled: {
    opacity: 0.7,
  },
  downloadButtonText: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '700',
  },
  loadingBox: {
    marginTop: 40,
    alignItems: 'center',
  },
  errorBox: {
    marginTop: 24,
    marginHorizontal: 20,
    padding: 16,
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 13,
    fontWeight: '600',
  },
  retryText: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 8,
    textDecorationLine: 'underline',
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '500',
  },
});