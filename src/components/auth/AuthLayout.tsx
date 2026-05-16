import React from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ImageBackground, 
  Dimensions, 
  Platform,
  KeyboardAvoidingView,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Theme } from '../../styles/theme';

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';
const GOLD = '#D4AF37';

interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <ImageBackground 
      source={{ uri: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2000&q=80' }} 
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <LinearGradient
        colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.85)']}
        locations={[0, 0.4, 1]}
        style={styles.overlay}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <SafeAreaView style={styles.container}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
          >
            <ScrollView 
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              <View style={styles.contentWrapper}>
                {/* Left Side: Branding (Visible on large screens) */}
                {(isWeb && width > 850) && (
                  <View style={styles.leftBranding}>
                    <View style={styles.collectionBadge}>
                      <Text style={styles.collectionStar}>✦  </Text>
                      <Text style={styles.collectionText}>THE 2026 PRIVATE COLLECTION</Text>
                    </View>
                    
                    <View style={styles.titleContainer}>
                      <Text style={styles.titleElite}>ELITE</Text>
                      <Text style={styles.titleEstates}>ESTATES</Text>
                    </View>
                    
                    <Text style={styles.subtitle}>
                      Exclusive architectural management for the world's{'\n'}
                      most distinguished portfolios.
                    </Text>
                  </View>
                )}

                {/* Right Side: Auth Panel */}
                <View style={styles.rightPanelWrapper}>
                  {isWeb ? (
                    <View style={styles.rightPanel}>
                       {children}
                    </View>
                  ) : (
                    <BlurView intensity={40} tint="dark" style={styles.rightPanel}>
                       {children}
                    </BlurView>
                  )}
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </LinearGradient>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  contentWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: '5%',
    maxWidth: 1400,
    alignSelf: 'center',
    width: '100%',
    paddingVertical: 40,
  },
  leftBranding: {
    flex: 1.2,
    justifyContent: 'center',
    paddingRight: 60,
  },
  collectionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  collectionStar: {
    color: GOLD,
    fontSize: 14,
  },
  collectionText: {
    color: GOLD,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 4,
    textTransform: 'uppercase',
  },
  titleContainer: {
    marginBottom: 32,
  },
  titleElite: {
    color: 'white',
    fontSize: 84,
    fontWeight: '900',
    lineHeight: 84,
    letterSpacing: -2,
  },
  titleEstates: {
    fontSize: 96,
    fontWeight: '900',
    lineHeight: 96,
    color: 'transparent',
    marginTop: -16,
    marginLeft: -4,
    letterSpacing: -2,
    ...Platform.select({
      web: {
        WebkitTextStrokeWidth: '2px',
        WebkitTextStrokeColor: 'rgba(255,255,255,0.4)',
      },
      default: {
        color: 'rgba(255,255,255,0.4)',
      }
    })
  } as any,
  subtitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 16,
    lineHeight: 26,
    fontWeight: '400',
  },
  rightPanelWrapper: {
    width: '100%',
    maxWidth: 420,
    minWidth: width > 500 ? 400 : '90%',
    alignItems: 'center',
  },
  rightPanel: {
    width: '100%',
    backgroundColor: isWeb ? 'rgba(15, 15, 15, 0.75)' : 'rgba(20, 20, 20, 0.4)',
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    overflow: 'hidden',
    ...Platform.select({
      web: {
        backdropFilter: 'blur(50px) saturate(180%)',
        boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.7)',
      }
    }),
  } as any,
});
