import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

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
        <Text style={styles.title}>Dobhi Desk</Text>
        <Text style={styles.subtitle}>Smart Laundry Manager</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    width: '100%',
    minHeight: 100,
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    // Soft drop shadow
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 3,
    zIndex: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  logo: {
    width: 46,
    height: 46,
    borderRadius: 23,
    marginRight: 14,
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 19,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
    fontWeight: '500',
  },
});