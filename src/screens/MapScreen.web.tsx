import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Theme } from '../styles/theme';
import { ChevronLeft, Map } from 'lucide-react-native';

// Web placeholder — react-native-maps is native-only.
// Metro automatically picks this file for web builds via .web.tsx extension.
export default function MapScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ChevronLeft color={Theme.colors.text} size={24} />
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        <Map color={Theme.colors.primary} size={64} />
        <Text style={styles.title}>Map View</Text>
        <Text style={styles.subtitle}>
          Interactive maps are available on the mobile app.{'\n'}
          Download Expo Go and scan the QR code to explore on Android or iOS.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  header: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 10,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    gap: 16,
  },
  title: {
    color: Theme.colors.text,
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  subtitle: {
    color: Theme.colors.textMuted,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
});
