import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Chrome, Apple } from 'lucide-react-native';
import { AUTH_MESSAGES } from '../../constants/auth';

interface SocialButtonsProps {
  onGooglePress: () => void;
  onApplePress: () => void;
}

export const SocialButtons: React.FC<SocialButtonsProps> = ({ onGooglePress, onApplePress }) => {
  return (
    <View style={styles.container}>
      <View style={styles.orContainer}>
        <View style={styles.orLine} />
        <Text style={styles.orText}>{AUTH_MESSAGES.OR_SOCIAL}</Text>
        <View style={styles.orLine} />
      </View>

      <View style={styles.socialContainer}>
        <TouchableOpacity style={styles.socialButton} onPress={onGooglePress}>
          <Chrome color="white" size={16} />
          <Text style={styles.socialButtonText}>Google</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialButton} onPress={onApplePress}>
          <Apple color="white" size={16} />
          <Text style={styles.socialButtonText}>Apple ID</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginTop: 10,
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  orText: {
    color: 'rgba(255,255,255,0.25)',
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 2,
    paddingHorizontal: 12,
  },
  socialContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  socialButton: {
    flex: 1,
    height: 44,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  socialButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
