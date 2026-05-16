import React, { useState } from 'react';
import { StyleSheet, View, Animated, Platform } from 'react-native';
import { AuthLayout } from '../components/auth/AuthLayout';
import { LoginForm } from '../components/auth/LoginForm';
import { SignupForm } from '../components/auth/SignupForm';
import { SocialButtons } from '../components/auth/SocialButtons';
import { ForgotPasswordForm } from '../components/auth/ForgotPasswordForm';

export default function AuthScreen({ navigation }: any) {
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'forgot_password'>('login');
  const [fadeAnim] = useState(new Animated.Value(1));

  const toggleAuthMode = (mode: 'login' | 'signup' | 'forgot_password') => {
    // Smooth transition between modes
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setAuthMode(mode);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleAuthSuccess = () => {
    // Navigation is handled automatically by AuthProvider in App.tsx
  };

  const handleSocialLogin = (platform: string) => {
    console.log(`Social login with ${platform}`);
    // Future implementation for social login
  };

  return (
    <AuthLayout>
      <Animated.View style={{ opacity: fadeAnim, flex: 1 }}>
        {authMode === 'login' && (
          <>
            <LoginForm 
              onSuccess={handleAuthSuccess}
              onSwitchToSignUp={() => toggleAuthMode('signup')}
              onForgotPassword={() => toggleAuthMode('forgot_password')}
            />
            <View style={styles.socialWrapper}>
              <SocialButtons 
                onGooglePress={() => handleSocialLogin('Google')}
                onApplePress={() => handleSocialLogin('Apple')}
              />
            </View>
          </>
        )}
        
        {authMode === 'signup' && (
          <SignupForm 
            onSuccess={() => toggleAuthMode('login')}
            onSwitchToLogin={() => toggleAuthMode('login')}
          />
        )}

        {authMode === 'forgot_password' && (
          <ForgotPasswordForm 
            onSuccess={() => {}} 
            onBackToLogin={() => toggleAuthMode('login')}
          />
        )}
      </Animated.View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  socialWrapper: {
    paddingHorizontal: 35,
    paddingBottom: 35,
    marginTop: -10,
  },
});
