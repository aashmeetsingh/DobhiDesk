import Footer from '@/components/Footer';
import { authApi } from '@/lib/api';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function Login() {
  const Logo = require('@/assets/images/Logo.png');
  const [shopName, setShopName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSendOTP = async () => {
    if (!shopName.trim()) {
      Alert.alert('Validation Error', 'Please enter your laundry shop name');
      return;
    }
    if (!phone.trim() || phone.length < 10) {
      Alert.alert('Validation Error', 'Please enter a valid 10-digit phone number');
      return;
    }

    setIsSending(true);
    try {
      await authApi.sendOtp(phone);
      router.push({
        pathname: '/otp',
        params: { phone, shopName }, // shopName carried forward for the shop-setup call after OTP verify
      });
    } catch (err: any) {
      Alert.alert('Could not send OTP', err.message || 'Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Login Card */}
        <View style={styles.card}>
          {/* LOGO */}
          <Image
            source={Logo}
            style={styles.logo}
            resizeMode="contain"
          />

          {/* App Name */}
          <Text style={styles.title}>Dobhi Desk</Text>

          {/* Subtitle */}
          <Text style={styles.subtitle}>Track every order, every time.</Text>

          {/* Form */}
          <View style={styles.form}>
            {/* Shop Name */}
            <Text style={styles.label}>SHOP NAME</Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="storefront-outline"
                size={18}
                color="#64748B"
              />
              <TextInput
                style={styles.input}
                placeholder="Enter laundry shop name"
                placeholderTextColor="#94A3B8"
                autoCapitalize="words"
                value={shopName}
                onChangeText={setShopName}
                editable={!isSending}
              />
            </View>

            {/* Phone Number */}
            <Text style={styles.label}>PHONE NUMBER</Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="call-outline"
                size={18}
                color="#64748B"
              />
              <TextInput
                style={styles.input}
                placeholder="Enter 10-digit phone number"
                placeholderTextColor="#94A3B8"
                keyboardType="phone-pad"
                maxLength={10}
                value={phone}
                onChangeText={setPhone}
                editable={!isSending}
              />
            </View>

            {/* Send OTP */}
            <TouchableOpacity
              style={[styles.otpButton, isSending && styles.otpButtonDisabled]}
              activeOpacity={0.8}
              onPress={handleSendOTP}
              disabled={isSending}
            >
              {isSending ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Text style={styles.otpText}>Send OTP</Text>
                  <Ionicons
                    name="arrow-forward"
                    size={18}
                    color="#ffffff"
                  />
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Terms */}
          <Text style={styles.terms}>
            By continuing, you agree to our{' '}
            <Text style={styles.termsLink}>Terms of Service</Text>
          </Text>
        </View>
        <Footer dark />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 30,
  },
  card: {
    width: '90%',
    maxWidth: 450,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  logo: {
    width: 60,
    height: 60,
    alignSelf: 'center',
    marginBottom: 12,
  },
  title: {
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    marginBottom: 28,
    fontWeight: '500',
  },
  form: {
    width: '100%',
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 6,
    letterSpacing: 0.8,
  },
  inputContainer: {
    height: 48,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    marginBottom: 18,
  },
  input: {
    flex: 1,
    height: '100%',
    marginLeft: 8,
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '500',
    paddingVertical: 0,
  },
  otpButton: {
    height: 48,
    width: '100%',
    borderRadius: 10,
    backgroundColor: '#0F172A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  otpButtonDisabled: {
    opacity: 0.7,
  },
  otpText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    width: '100%',
    marginTop: 24,
    marginBottom: 16,
  },
  terms: {
    textAlign: 'center',
    fontSize: 11,
    color: '#94A3B8',
    lineHeight: 16,
  },
  termsLink: {
    color: '#475569',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});