import React from 'react';
import { Image } from 'expo-image';
import { View, Text, StyleSheet } from 'react-native';
export default function Header() {
  const Logo = require('@/assets/images/Logo.png');

  return (
    <View style={styles.header}>

      {/* Logo */}
      <Image
        source={Logo}
        style={styles.logo}
        contentFit="contain"
      />

      {/* App Name */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>
          Dobhi Desk
        </Text>

        <Text style={styles.subtitle}>
           Dashboard
        </Text>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    width: '100%',
    minHeight: 90,

    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 8,

    flexDirection: 'row',
    alignItems: 'center',

    backgroundColor: '#ffffff',

    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
  },

  logo: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginRight: 12,
  },

  titleContainer: {
    flex: 1,
    justifyContent: 'center',
  },

  title: {
    fontSize: 21,
    fontWeight: '700',
    color: '#222',
  },

  subtitle: {
    fontSize: 12,
    color: '#888',
    marginTop: 3,
  },

});