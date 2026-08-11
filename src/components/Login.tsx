import React from 'react';
import { router } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

export default function Login() {
  const Logo = require('@/assets/images/Logo.png');

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

          {/* YOUR LOGO */}
          <Image
            source={Logo}
            style={styles.logo}
            resizeMode="contain"
          />

          {/* App Name */}
          <Text style={styles.title}>
            LaundryTrack
          </Text>

          {/* Subtitle */}
          <Text style={styles.subtitle}>
            Track every order, every time.
          </Text>


          {/* Form */}
          <View style={styles.form}>

            {/* Shop Name */}
            <Text style={styles.label}>
              SHOP NAME
            </Text>

            <View style={styles.inputContainer}>
              <Ionicons
                name="storefront-outline"
                size={19}
                color="#777"
              />

              <TextInput
                style={styles.input}
                placeholder="Enter laundry shop name"
                placeholderTextColor="#999"
                autoCapitalize="words"
              />
            </View>


            {/* Phone Number */}
            <Text style={styles.label}>
              PHONE NUMBER
            </Text>

            <View style={styles.inputContainer}>
              <Ionicons
                name="call-outline"
                size={19}
                color="#777"
              />

              <TextInput
                style={styles.input}
                placeholder="+91 1234567890"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
                maxLength={15}
              />
            </View>


            {/* Send OTP */}
            <TouchableOpacity
              style={styles.otpButton}
              activeOpacity={0.8}
              onPress={() => router.push('/otp')}
            >
              <Text style={styles.otpText}>
                Send OTP
              </Text>

              <Ionicons
                name="arrow-forward"
                size={20}
                color="#fff"
              />
            </TouchableOpacity>

          </View>


          {/* Divider */}
          <View style={styles.divider} />


          {/* Terms */}
          <Text style={styles.terms}>
            By continuing, you agree to our{' '}
            <Text style={styles.termsLink}>
              Terms of Service
            </Text>
          </Text>

        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}


const styles = StyleSheet.create({

  // ==========================================
  // FULL SCREEN
  // ==========================================

  screen: {
    flex: 1,
    backgroundColor: '#202020',
  },

  scrollContainer: {
    flexGrow: 1,

    justifyContent: 'center',
    alignItems: 'center',

    paddingVertical: 30,
  },


  // ==========================================
  // LOGIN CARD
  // ==========================================

  card: {
    width: '92%',
    maxWidth: 500,

    backgroundColor: '#ffffff',

    borderRadius: 12,

    paddingHorizontal: 20,
    paddingTop: 25,
    paddingBottom: 20,

    elevation: 5,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },


  // ==========================================
  // LOGO
  // ==========================================

  logo: {
    width: 65,
    height: 65,

    alignSelf: 'center',

    marginBottom: 10,
  },


  // ==========================================
  // TITLE
  // ==========================================

  title: {
    textAlign: 'center',

    fontSize: 26,
    fontWeight: '700',

    color: '#222',
  },

  subtitle: {
    textAlign: 'center',

    fontSize: 13,

    color: '#999',

    marginTop: 5,
    marginBottom: 28,
  },


  // ==========================================
  // FORM
  // ==========================================

  form: {
    width: '100%',
  },


  label: {
    fontSize: 12,

    fontWeight: '700',

    color: '#555',

    marginBottom: 6,

    letterSpacing: 0.5,
  },


  // ==========================================
  // INPUT
  // ==========================================

  inputContainer: {
    height: 47,

    width: '100%',

    flexDirection: 'row',
    alignItems: 'center',

    borderWidth: 1,
    borderColor: '#d8d8d8',

    borderRadius: 7,

    backgroundColor: '#fafafa',

    paddingHorizontal: 12,

    marginBottom: 17,
  },


  input: {
    flex: 1,

    height: '100%',

    marginLeft: 8,

    fontSize: 14,

    color: '#333',

    paddingVertical: 0,
  },


  // ==========================================
  // OTP BUTTON
  // ==========================================

  otpButton: {
    height: 46,

    width: '100%',

    borderRadius: 7,

    backgroundColor: '#292929',

    flexDirection: 'row',

    alignItems: 'center',
    justifyContent: 'center',

    gap: 10,

    marginTop: 2,
  },


  otpText: {
    color: '#fff',

    fontSize: 15,

    fontWeight: '600',
  },


  // ==========================================
  // DIVIDER
  // ==========================================

  divider: {
    height: 1,

    backgroundColor: '#eeeeee',

    width: '100%',

    marginTop: 20,
    marginBottom: 15,
  },


  // ==========================================
  // TERMS
  // ==========================================

  terms: {
    textAlign: 'center',

    fontSize: 11,

    color: '#999',

    lineHeight: 17,
  },


  termsLink: {
    color: '#777',

    fontWeight: '600',

    textDecorationLine: 'underline',
  },

});