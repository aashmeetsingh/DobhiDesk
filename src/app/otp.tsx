import Footer from '@/components/Footer';
import { authApi } from '@/lib/api';
import { router, useLocalSearchParams } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function OTPScreen() {
  const { phone, shopName } = useLocalSearchParams<{ phone?: string; shopName?: string }>();
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const textInputRef = useRef<TextInput>(null);

  const verifyOTP = async () => {
    if (otp.length !== 6) {
      Alert.alert('Validation Error', 'Please enter a valid 6-digit OTP code.');
      return;
    }
    if (!phone) {
      Alert.alert('Something went wrong', 'Missing phone number — please go back and try again.');
      return;
    }

    setIsVerifying(true);
    try {
      // Step 1: verify OTP — this is what creates the shop document in MongoDB
      // (the backend does Shop.findOne / Shop.create inside otp/verify)
      const { token } = await authApi.verifyOtp(phone, otp);

      // Step 2: save the shop name captured on the login screen
      if (shopName) {
        await authApi.shopSetup(token, shopName);
      }

      // Step 3: store the JWT securely for future authenticated requests
      await SecureStore.setItemAsync('authToken', token);

      router.replace('/(tabs)');
    } catch (err: any) {
      Alert.alert('Verification failed', err.message || 'Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const renderDigitBoxes = () => {
    const boxes = [];
    for (let i = 0; i < 6; i++) {
      const digit = otp[i] || '';
      const isFocused = i === otp.length;
      boxes.push(
        <View
          key={i}
          style={[
            styles.digitBox,
            digit ? styles.digitBoxActive : null,
            isFocused ? styles.digitBoxFocused : null,
          ]}
        >
          <Text style={styles.digitText}>{digit}</Text>
        </View>
      );
    }
    return boxes;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Verify OTP</Text>

        <Text style={styles.subtitle}>
          Enter the 6-digit code sent to{'\n'}
          <Text style={styles.phoneHighlight}>{phone ? `+91 ${phone}` : 'your phone number'}</Text>
        </Text>

        {/* Custom Segmented Digits Input */}
        <Pressable onPress={() => textInputRef.current?.focus()} disabled={isVerifying}>
          <View style={styles.otpInputRow}>
            {renderDigitBoxes()}
          </View>
        </Pressable>

        {/* Hidden TextInput to capture actual entry */}
        <TextInput
          ref={textInputRef}
          style={styles.hiddenInput}
          keyboardType="number-pad"
          maxLength={6}
          value={otp}
          onChangeText={(val) => setOtp(val.replace(/[^0-9]/g, ''))}
          editable={!isVerifying}
        />

        <TouchableOpacity
          style={[styles.button, isVerifying && styles.buttonDisabled]}
          activeOpacity={0.8}
          onPress={verifyOTP}
          disabled={isVerifying}
        >
          {isVerifying ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={styles.buttonText}>Verify & Proceed</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.6}
          onPress={() => router.back()}
          disabled={isVerifying}
        >
          <Text style={styles.backText}>Change phone number</Text>
        </TouchableOpacity>
        <Footer dark />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
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
  title: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 28,
    lineHeight: 18,
    fontWeight: '500',
  },
  phoneHighlight: {
    color: '#0F172A',
    fontWeight: '700',
  },
  otpInputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  digitBox: {
    width: 44,
    height: 48,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  digitBoxActive: {
    borderColor: '#94A3B8',
  },
  digitBoxFocused: {
    borderColor: '#0F172A',
    borderWidth: 2,
  },
  digitText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 0,
    height: 0,
  },
  button: {
    height: 48,
    backgroundColor: '#0F172A',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  backText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#64748B',
    fontWeight: '700',
    fontSize: 13,
    textDecorationLine: 'underline',
  },
});