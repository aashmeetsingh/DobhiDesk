import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ServiceSelectorProps {
  services: string[];
  selectedService: string;
  onSelect: (service: string) => void;
}

export default function ServiceSelector({
  services,
  selectedService,
  onSelect,
}: ServiceSelectorProps) {
  return (
    <View style={styles.serviceSection}>
      <Text style={styles.sectionLabel}>SERVICE TYPE</Text>
      <View style={styles.serviceSelector}>
        {services.map((service) => (
          <TouchableOpacity
            key={service}
            style={[
              styles.serviceButton,
              selectedService === service && styles.serviceButtonActive,
            ]}
            activeOpacity={0.8}
            onPress={() => onSelect(service)}
          >
            <Text
              style={[
                styles.serviceText,
                selectedService === service && styles.serviceTextActive,
              ]}
            >
              {service}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  serviceSection: {
    marginTop: 24,
    marginHorizontal: 14,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  serviceSelector: {
    height: 46,
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    padding: 4,
    flexDirection: 'row',
  },
  serviceButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  serviceButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  serviceText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  serviceTextActive: {
    color: '#0F172A',
    fontWeight: '700',
  },
});
