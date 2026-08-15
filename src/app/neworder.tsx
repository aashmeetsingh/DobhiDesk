import DateSelector from '@/components/forms/DateSelector';
import ServiceSelector from '@/components/forms/ServiceSelector';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { ordersApi } from '@/lib/api';
import { useOrders } from '@/store/OrderContext';
import { Order } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

type ItemRow = {
  key: string;
  name: string;
  qty: string;
  unit_price: string;
  notes: string;
};

const SERVICE_TYPE_MAP: Record<string, 'wash' | 'iron' | 'dry_clean'> = {
  Wash: 'wash',
  Iron: 'iron',
  'Dry Clean': 'dry_clean',
};

let rowKeyCounter = 0;
function newRowKey() {
  rowKeyCounter += 1;
  return `row-${rowKeyCounter}`;
}

export default function NewOrder() {
  const { addOrder } = useOrders();
  const { customerName: paramCustomerName, phone: paramPhone, customerId: paramCustomerId } = useLocalSearchParams<{
    customerName?: string;
    phone?: string;
    customerId?: string;
  }>();

  // Customer
  const [customerName, setCustomerName] = useState(paramCustomerName || '');
  const [phoneNumber, setPhoneNumber] = useState(paramPhone || '');

  // Dates
  const [pickupDate, setPickupDate] = useState(new Date());
  const [deliveryDate, setDeliveryDate] = useState(new Date());

  const [showPickup, setShowPickup] = useState(false);
  const [showDelivery, setShowDelivery] = useState(false);

  // Service
  const [serviceType, setServiceType] = useState('Wash');

  // Items — starts with the same two rows the wireframe hardcoded, now editable
  const [items, setItems] = useState<ItemRow[]>([
    { key: newRowKey(), name: 'Shirt', qty: '5', unit_price: '', notes: 'Cotton' },
    { key: newRowKey(), name: 'Trousers', qty: '2', unit_price: '', notes: 'Denim' },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateItem = (key: string, field: keyof ItemRow, value: string) => {
    setItems((prev) => prev.map((item) => (item.key === key ? { ...item, [field]: value } : item)));
  };

  const addItemRow = () => {
    setItems((prev) => [...prev, { key: newRowKey(), name: '', qty: '1', unit_price: '', notes: '' }]);
  };

  const removeItemRow = (key: string) => {
    setItems((prev) => (prev.length > 1 ? prev.filter((item) => item.key !== key) : prev));
  };

  const handleSubmit = async () => {
    if (!customerName.trim() || !phoneNumber.trim()) {
      Alert.alert('Missing info', 'Please fill in customer name and phone number');
      return;
    }
    if (phoneNumber.trim().length < 10) {
      Alert.alert('Missing info', 'Please enter a valid 10-digit phone number');
      return;
    }

    const cleanedItems = items
      .filter((item) => item.name.trim())
      .map((item) => ({
        name: item.name.trim(),
        qty: Number(item.qty) || 1,
        unit_price: Number(item.unit_price) || 0,
        notes: item.notes.trim(),
      }));

    if (cleanedItems.length === 0) {
      Alert.alert('Missing items', 'Add at least one item to the order');
      return;
    }

    setIsSubmitting(true);
    try {
      const { order, tag } = await ordersApi.createOrder({
        customer_name: customerName.trim(),
        phone: phoneNumber.trim(),
        pickup_date: pickupDate.toISOString(),
        delivery_date: deliveryDate.toISOString(),
        service_type: SERVICE_TYPE_MAP[serviceType] ?? 'wash',
        items: cleanedItems,
        customer_id: paramCustomerId,
      });
      const totalQty = cleanedItems.reduce((sum, i) => sum + i.qty, 0);
      const localOrder: Order = {
        id: order._id,
        tag,
        customer: customerName.trim(),
        phone: phoneNumber.trim(),
        items: totalQty,
        status: 'WASHING',
        pickupDate,
        deliveryDate,
        serviceType,
      };
      addOrder(localOrder);

      Alert.alert('Order created', `Tag #${tag} assigned.`);
      router.push('/(tabs)/orders');
    } catch (err: any) {
      Alert.alert('Could not create order', err.message || 'Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ================= TITLE ================= */}

        <View style={styles.titleRow}>
          <View>
            <Text style={styles.smallLabel}>NEW ENTRY</Text>
            <Text style={styles.title}>Create Order</Text>
          </View>

          <View style={styles.tagCard}>
            <Text style={styles.tagLabel}>Tag Number</Text>
            <Text style={styles.tagNumber}>Auto</Text>
          </View>
        </View>

        {/* ================= CUSTOMER INFO ================= */}

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="person-outline" size={18} color="#0F172A" />
            <Text style={styles.cardTitle}>Customer Info</Text>
          </View>

          <Text style={styles.inputLabel}>CUSTOMER NAME</Text>

          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={16} color="#64748B" />
            <TextInput
              style={styles.input}
              placeholder="Enter Name"
              placeholderTextColor="#94A3B8"
              value={customerName}
              onChangeText={setCustomerName}
              editable={!paramCustomerName && !isSubmitting}
            />
          </View>

          <Text style={styles.inputLabel}>PHONE NUMBER</Text>

          <View style={styles.inputContainer}>
            <Ionicons name="call-outline" size={16} color="#64748B" />
            <TextInput
              style={styles.input}
              placeholder="Enter 10-digit phone number"
              placeholderTextColor="#94A3B8"
              keyboardType="phone-pad"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              maxLength={10}
              editable={!paramPhone && !isSubmitting}
            />
          </View>
        </View>

        {/* ================= SCHEDULING ================= */}

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="calendar-outline" size={18} color="#0F172A" />
            <Text style={styles.cardTitle}>Scheduling</Text>
          </View>

          <DateSelector
            label="PICKUP DATE"
            date={pickupDate}
            showPicker={showPickup}
            onPress={() => setShowPickup(true)}
            onChange={(event, selectedDate) => {
              setShowPickup(false);
              if (selectedDate) {
                setPickupDate(selectedDate);
                if (selectedDate > deliveryDate) {
                  setDeliveryDate(selectedDate);
                }
              }
            }}
          />

          <DateSelector
            label="EXPECTED DELIVERY"
            date={deliveryDate}
            showPicker={showDelivery}
            minimumDate={pickupDate}
            onPress={() => setShowDelivery(true)}
            onChange={(event, selectedDate) => {
              setShowDelivery(false);
              if (selectedDate) {
                setDeliveryDate(selectedDate);
              }
            }}
          />
        </View>

        {/* ================= SERVICE TYPE ================= */}

        <ServiceSelector
          services={['Wash', 'Iron', 'Dry Clean']}
          selectedService={serviceType}
          onSelect={setServiceType}
        />

        {/* ================= ORDER ITEMS ================= */}

        <View style={styles.itemsCard}>
          <View style={styles.itemsHeader}>
            <Text style={styles.orderItemsTitle}>Order Items</Text>
            <TouchableOpacity activeOpacity={0.7} onPress={addItemRow} disabled={isSubmitting}>
              <Text style={styles.addItem}>+ Add another item</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.itemColumn]}>ITEM</Text>
            <Text style={[styles.tableHeaderText, styles.qtyColumn]}>QTY</Text>
            <Text style={[styles.tableHeaderText, styles.priceColumn]}>PRICE</Text>
            <Text style={[styles.tableHeaderText, styles.serviceColumn]}>NOTES</Text>
            <View style={styles.removeColumn} />
          </View>

          {items.map((item) => (
            <View key={item.key} style={styles.tableRow}>
              <TextInput
                style={[styles.rowInput, styles.itemColumn]}
                value={item.name}
                onChangeText={(v) => updateItem(item.key, 'name', v)}
                placeholder="Item"
                placeholderTextColor="#94A3B8"
                editable={!isSubmitting}
              />
              <TextInput
                style={[styles.rowInput, styles.qtyColumn]}
                value={item.qty}
                onChangeText={(v) => updateItem(item.key, 'qty', v.replace(/[^0-9]/g, ''))}
                keyboardType="number-pad"
                textAlign="center"
                editable={!isSubmitting}
              />
              <TextInput
                style={[styles.rowInput, styles.priceColumn]}
                value={item.unit_price}
                onChangeText={(v) => updateItem(item.key, 'unit_price', v.replace(/[^0-9.]/g, ''))}
                keyboardType="decimal-pad"
                placeholder="₹0"
                placeholderTextColor="#94A3B8"
                textAlign="center"
                editable={!isSubmitting}
              />
              <TextInput
                style={[styles.rowInput, styles.serviceColumn]}
                value={item.notes}
                onChangeText={(v) => updateItem(item.key, 'notes', v)}
                placeholder="e.g. Cotton"
                placeholderTextColor="#94A3B8"
                textAlign="center"
                editable={!isSubmitting}
              />
              <TouchableOpacity
                style={styles.removeColumn}
                onPress={() => removeItemRow(item.key)}
                disabled={isSubmitting}
              >
                <Ionicons name="close-circle-outline" size={18} color="#94A3B8" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View style={{ height: 40 }} />

        <View style={styles.submitButtonContainer}>
          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            activeOpacity={0.8}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.submitButtonText}>Submit Order</Text>
            )}
          </TouchableOpacity>
        </View>
        <Footer />
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
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  smallLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 1.2,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 4,
    letterSpacing: -0.5,
  },
  tagCard: {
    width: 78,
    height: 50,
    backgroundColor: '#0F172A',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tagLabel: {
    fontSize: 9,
    color: '#94A3B8',
    fontWeight: '700',
  },
  tagNumber: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '800',
    marginTop: 2,
  },
  card: {
    marginTop: 18,
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginLeft: 8,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 16,
    marginBottom: 6,
    letterSpacing: 0.8,
  },
  inputContainer: {
    height: 48,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#1E293B',
    marginLeft: 8,
    fontWeight: '500',
  },
  itemsCard: {
    marginTop: 24,
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 3,
  },
  itemsHeader: {
    height: 52,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  orderItemsTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  addItem: {
    fontSize: 12,
    fontWeight: '800',
    color: '#475569',
  },
  tableHeader: {
    height: 40,
    backgroundColor: '#F8FAFC',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  tableHeaderText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  tableRow: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  rowInput: {
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '600',
    paddingVertical: 4,
  },
  itemColumn: {
    flex: 1.6,
  },
  qtyColumn: {
    flex: 0.6,
  },
  priceColumn: {
    flex: 0.8,
  },
  serviceColumn: {
    flex: 1.2,
  },
  removeColumn: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonContainer: {
    marginTop: 10,
    marginHorizontal: 16,
  },
  submitButton: {
    backgroundColor: '#0F172A',
    borderRadius: 10,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});