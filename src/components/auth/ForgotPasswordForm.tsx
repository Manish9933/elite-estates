import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator,
  Platform,
  Alert
} from 'react-native';
import { Mail, ShieldQuestion, ChevronRight, ArrowLeft } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AUTH_MESSAGES, AUTH_VALIDATION } from '../../constants/auth';
import { authApi } from '../../api/auth';

const GOLD = '#D4AF37';
const isWeb = Platform.OS === 'web';

interface ForgotPasswordFormProps {
  onSuccess: () => void;
  onBackToLogin: () => void;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ 
  onSuccess, 
  onBackToLogin 
}) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const validate = () => {
    if (!email) return AUTH_VALIDATION.EMAIL_REQUIRED;
    if (!/\S+@\S+\.\S+/.test(email)) return AUTH_VALIDATION.EMAIL_INVALID;
    return null;
  };

  const handleReset = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const { error: resetError } = await authApi.resetPassword(email);
      if (resetError) throw resetError;
      
      setSent(true);
      if (isWeb) alert('Password reset link sent! Please check your email.');
      else Alert.alert('Success', 'Password reset link sent! Please check your email.');
      
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Reset failed');
      if (!isWeb) Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.iconOuter}>
             <ShieldQuestion color="white" size={32} />
          </View>
          <Text style={styles.title}>EMAIL SENT</Text>
          <Text style={styles.subtitle}>
            We've sent a password reset link to {email}.
          </Text>
        </View>
        <TouchableOpacity style={styles.backButton} onPress={onBackToLogin}>
          <ArrowLeft color={GOLD} size={18} />
          <Text style={styles.backButtonText}>Back to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backIcon} onPress={onBackToLogin}>
        <ArrowLeft color="white" size={20} />
      </TouchableOpacity>

      <View style={styles.header}>
        <View style={styles.iconOuter}>
          <View style={styles.iconInner}>
            <ShieldQuestion color="white" size={24} />
          </View>
        </View>
        <Text style={styles.title}>{AUTH_MESSAGES.FORGOT_PASSWORD_TITLE}</Text>
        <Text style={styles.subtitle}>{AUTH_MESSAGES.FORGOT_PASSWORD_SUBTITLE}</Text>
      </View>

      <View style={styles.form}>
        {error && <Text style={styles.errorText}>{error}</Text>}
        
        <View style={styles.inputGroup}>
          <Mail color={GOLD} size={18} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder={AUTH_MESSAGES.EMAIL_PLACEHOLDER}
            placeholderTextColor="rgba(255,255,255,0.25)"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (error) setError(null);
            }}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <TouchableOpacity 
          style={[styles.button, loading && { opacity: 0.7 }]} 
          onPress={handleReset}
          disabled={loading}
        >
          <LinearGradient
            colors={['rgba(212, 175, 55, 0.3)', 'rgba(20,20,20,0.95)']}
            style={styles.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Text style={styles.buttonText}>{AUTH_MESSAGES.RESET_BUTTON}</Text>
                <ChevronRight color="white" size={18} />
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 35,
    paddingTop: 50,
  },
  backIcon: {
    position: 'absolute',
    top: 20,
    left: 20,
    padding: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 35,
  },
  iconOuter: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: GOLD,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: 'white',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 4,
    marginBottom: 8,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  form: {
    width: '100%',
  },
  errorText: {
    color: '#ff4d4d',
    fontSize: 11,
    marginBottom: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 14,
    marginBottom: 20,
    height: 56,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  inputIcon: {
    marginRight: 14,
  },
  input: {
    flex: 1,
    color: 'white',
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 1,
    ...Platform.select({ web: { outlineStyle: 'none' } })
  } as any,
  button: {
    height: 52,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
  },
  gradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 4,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
  },
  backButtonText: {
    color: GOLD,
    fontSize: 14,
    fontWeight: 'bold',
  }
});
