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
import { Mail, Lock, User, Eye, EyeOff, UserPlus, ChevronRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AUTH_MESSAGES, AUTH_VALIDATION } from '../../constants/auth';
import { authApi } from '../../api/auth';

const GOLD = '#D4AF37';
const isWeb = Platform.OS === 'web';

interface SignupFormProps {
  onSuccess: () => void;
  onSwitchToLogin: () => void;
}

export const SignupForm: React.FC<SignupFormProps> = ({ 
  onSuccess, 
  onSwitchToLogin 
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validate = () => {
    if (!name) return AUTH_VALIDATION.NAME_REQUIRED;
    if (!email) return AUTH_VALIDATION.EMAIL_REQUIRED;
    if (!/\S+@\S+\.\S+/.test(email)) return AUTH_VALIDATION.EMAIL_INVALID;
    if (!password) return AUTH_VALIDATION.PASSWORD_REQUIRED;
    if (password.length < 6) return AUTH_VALIDATION.PASSWORD_MIN_LENGTH;
    if (password !== confirmPassword) return AUTH_VALIDATION.PASSWORDS_MUST_MATCH;
    return null;
  };

  const handleSignup = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const { error: signupError } = await authApi.signUp({ 
        email, 
        password,
        options: {
          data: {
            full_name: name,
          }
        }
      });
      
      if (signupError) throw signupError;
      
      if (isWeb) alert('Verification email sent! Please check your inbox.');
      else Alert.alert('Success', 'Verification email sent! Please check your inbox.');
      
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Signup failed');
      if (!isWeb) Alert.alert('Signup Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconOuter}>
          <View style={styles.iconInner}>
            <UserPlus color="white" size={24} />
          </View>
        </View>
        <Text style={styles.title}>{AUTH_MESSAGES.SIGNUP_TITLE}</Text>
        <Text style={styles.subtitle}>{AUTH_MESSAGES.SIGNUP_SUBTITLE}</Text>
      </View>

      <View style={styles.form}>
        {error && <Text style={styles.errorText}>{error}</Text>}
        
        <View style={styles.inputGroup}>
          <User color={GOLD} size={18} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder={AUTH_MESSAGES.FULL_NAME_PLACEHOLDER}
            placeholderTextColor="rgba(255,255,255,0.25)"
            value={name}
            onChangeText={(text) => {
              setName(text);
              if (error) setError(null);
            }}
          />
        </View>

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

        <View style={styles.inputGroup}>
          <Lock color={GOLD} size={18} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder={AUTH_MESSAGES.CONFIRM_PASSWORD_PLACEHOLDER}
            placeholderTextColor="rgba(255,255,255,0.25)"
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              if (error) setError(null);
            }}
            secureTextEntry={!showPassword}
          />
        </View>

        <TouchableOpacity 
          style={[styles.button, loading && { opacity: 0.7 }]} 
          onPress={handleSignup}
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
                <Text style={styles.buttonText}>{AUTH_MESSAGES.SIGNUP_BUTTON}</Text>
                <ChevronRight color="white" size={18} />
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>{AUTH_MESSAGES.ALREADY_HAVE_ACCOUNT} </Text>
        <TouchableOpacity onPress={onSwitchToLogin}>
          <Text style={styles.linkText}>{AUTH_MESSAGES.LOGIN_LINK}</Text>
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
    marginBottom: 25,
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
    marginBottom: 12,
    height: 52,
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
  button: {
    height: 52,
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 10,
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
