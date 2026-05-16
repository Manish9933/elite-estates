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
import { Mail, Lock, Eye, EyeOff, ShieldCheck, ChevronRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AUTH_MESSAGES, AUTH_VALIDATION } from '../../constants/auth';
import { authApi } from '../../api/auth';

const GOLD = '#D4AF37';
const isWeb = Platform.OS === 'web';

interface LoginFormProps {
  onSuccess: () => void;
  onSwitchToSignUp: () => void;
  onForgotPassword: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ 
  onSuccess, 
  onSwitchToSignUp,
  onForgotPassword 
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validate = () => {
    if (!email) return AUTH_VALIDATION.EMAIL_REQUIRED;
    if (!/\S+@\S+\.\S+/.test(email)) return AUTH_VALIDATION.EMAIL_INVALID;
    if (!password) return AUTH_VALIDATION.PASSWORD_REQUIRED;
    return null;
  };

  const handleLogin = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const { error: loginError } = await authApi.signIn({ email, password });
      if (loginError) throw loginError;
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Login failed');
      if (!isWeb) Alert.alert('Login Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.shieldOuter}>
          <View style={styles.shieldInner}>
            <ShieldCheck color="white" size={24} />
          </View>
        </View>
        <Text style={styles.title}>{AUTH_MESSAGES.LOGIN_TITLE}</Text>
        <Text style={styles.subtitle}>{AUTH_MESSAGES.LOGIN_SUBTITLE}</Text>
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

        <View style={styles.inputGroup}>
          <Lock color={GOLD} size={18} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder={AUTH_MESSAGES.PASSWORD_PLACEHOLDER}
            placeholderTextColor="rgba(255,255,255,0.25)"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (error) setError(null);
            }}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity 
            style={styles.eyeIcon} 
            onPress={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff color={GOLD} size={18} />
            ) : (
              <Eye color={GOLD} size={18} />
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.forgotPassword} onPress={onForgotPassword}>
          <Text style={styles.forgotPasswordText}>{AUTH_MESSAGES.FORGOT_PASSWORD_LINK}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, loading && { opacity: 0.7 }]} 
          onPress={handleLogin}
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
                <Text style={styles.buttonText}>{AUTH_MESSAGES.LOGIN_BUTTON}</Text>
                <ChevronRight color="white" size={18} />
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>{AUTH_MESSAGES.NO_ACCOUNT} </Text>
        <TouchableOpacity onPress={onSwitchToSignUp}>
          <Text style={styles.linkText}>{AUTH_MESSAGES.SIGNUP_LINK}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 35,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  shieldOuter: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  shieldInner: {
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
    marginBottom: 14,
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
  eyeIcon: {
    padding: 8,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
    fontWeight: '500',
  },
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  footerText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
  },
  linkText: {
    color: GOLD,
    fontSize: 12,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});
