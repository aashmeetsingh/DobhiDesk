import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Button,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import Header from '@/components/Header';
import StatCard from '@/components/StatCard';
import ActivityCard from '@/components/ActivityCard';
export default function HomeScreen() {
  const Logo = require('@/assets/images/Logo.png');
  return (

    <View style={styles.container}>
      <Header />
      <ScrollView>
      <Text style={styles.title}>
        Operations Dashboard
      </Text>
      <Text style={styles.subtitle}>
        Monitor your facility's performance and track key metrics in real-time.
      </Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.newOrderButton}
          activeOpacity={0.8}
          onPress={() => router.push('/(tabs)/NewOrder')}
        >
          <Text style={styles.newOrderText}>
            + NEW ORDER
          </Text>
        </TouchableOpacity>


        {/* View Orders */}
        <TouchableOpacity
          style={styles.viewOrdersButton}
          activeOpacity={0.8}
          onPress={() => router.push('/(tabs)/Orders')}
        >
          <Text style={styles.viewOrdersText}>
            VIEW ALL ORDERS
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.StatCardContainer}>
        <StatCard
          title="Total Orders"
          value="120"
          description="This week"
          icon="clipboard"
        />
        <StatCard
          title="Revenue"
          value="$2,500"
          description="This month"
          icon="cash"
        />
        <StatCard
          title="Pending Orders"
          value="15"
          description="Awaiting processing"
          icon="time"
          alert={true}
        />
           <StatCard
          title="Pending Orders"
          value="15"
          description="Awaiting processing"
          icon="time"
          alert={false}
        />
      </View>
      <View style={styles.ActivityCardContainer}>
        <Text style={styles.title}>
          Recent Activities
        </Text>
        <ActivityCard
          activities={[
            {
              id: '1',
              initials: 'JS',
              name: 'John Smith',
              order: 'Order #1234',
              time: '10:30 AM',
            },
            {
              id: '2',
              initials: 'EM',
              name: 'Emily Miller',
              order: 'Order #5678',
              time: '11:15 AM',
            },
            {
              id: '3',
              initials: 'MW',
              name: 'Michael Williams',
              order: 'Order #9101',
              time: '12:45 PM',
            },
          ]}
          onPress={(activity) => {
            console.log('Activity pressed:', activity);
          }}
        />
      </View>
      <TouchableOpacity style={[styles.viewOrdersButton, {marginTop: 20, marginLeft: 10, marginRight: 10, marginBottom: 20, borderRadius: 16, paddingHorizontal: 15, height: 38}]}
        activeOpacity={0.8}
        onPress={() => router.push('/(tabs)/Orders')}
      >
        <Text style={styles.viewOrdersText}>
          Download Full Report
        </Text>
      </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    backgroundColor: '#f0f0f0',
    borderBottomWidth: 0.3,
    borderBottomColor: '#b4a0a0',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
  },

  title: {
    marginTop: 20,
    marginLeft: 10,
    fontSize: 30,
    fontWeight: '700',
  },

  subtitle: {
    fontSize: 16,
    color: '#777',
    marginTop: 8,
    marginLeft: 10,
  },
  logo: {
    width: 50,
    height: 50,
    marginTop: 10,
    marginBottom: 10,
    borderRadius: 50,
    padding: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
    marginLeft: 10,
  },
  actionRow: {
  flexDirection: 'row',
  alignItems: 'center',

  gap: 8,

  marginTop: 10,
},

newOrderButton: {
  height: 38,
  paddingHorizontal: 15,
  backgroundColor: '#292929',
  borderRadius: 6,
  alignItems: 'center',
  justifyContent: 'center',
},

newOrderText: {
  color: '#ffffff',
  fontSize: 11,
  fontWeight: '700',
  marginLeft: 5,
},

viewOrdersButton: {
  height: 38,
  paddingHorizontal: 15,
  backgroundColor: '#ffffff',
  borderWidth: 1,
  borderColor: '#bdbdbd',
  borderRadius: 6,
  alignItems: 'center',
  justifyContent: 'center',
},

viewOrdersText: {
  color: '#444',
  fontSize: 11,
  fontWeight: '600',
},
StatCardContainer: {

  flexDirection: 'row',
  flexWrap: 'wrap',
  gap : '10',
  marginTop: 20,
  marginLeft: 10,
},
ActivityCardContainer: {
  flexDirection: 'column',
  gap : '10',
  marginTop: 20,
  marginLeft: 10,
},
});