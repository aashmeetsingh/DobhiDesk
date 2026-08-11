import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';

import { router } from 'expo-router';

export default function OTPScreen() {
  const [otp, setOtp] = useState('');

  const verifyOTP = () => {
    if (otp.length === 6) {
      router.replace('/(tabs)');
    }
  };

  return (
    <SafeAreaView style={styles.container}>

      <View style={styles.card}>

        <Text style={styles.title}>
          Verify OTP
        </Text>

        <Text style={styles.subtitle}>
          Enter the 6-digit OTP sent to your phone
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Enter OTP"
          placeholderTextColor="#999"
          keyboardType="number-pad"
          maxLength={6}
          value={otp}
          onChangeText={setOtp}
          textAlign="center"
        />

        <TouchableOpacity
          style={styles.button}
          onPress={verifyOTP}
        >
          <Text style={styles.buttonText}>
            Verify OTP
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.back()}
        >
          <Text style={styles.backText}>
            Change phone number
          </Text>
        </TouchableOpacity>

      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#202020',
    justifyContent: 'center',
    alignItems: 'center',
  },

  card: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 25,
  },

  title: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    color: '#222',
  },

  subtitle: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 25,
  },

  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    fontSize: 20,
    letterSpacing: 8,
    marginBottom: 20,
  },

  button: {
    height: 48,
    backgroundColor: '#292929',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },

  backText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
    textDecorationLine: 'underline',
  },
});