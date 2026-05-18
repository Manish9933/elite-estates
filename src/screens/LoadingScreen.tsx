import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Easing,
  StatusBar,
  Platform,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles, Building2, Compass, ShieldCheck } from 'lucide-react-native';
import Svg, { Path, Defs, LinearGradient as SvgLinearGradient, Stop, Text as SvgText } from 'react-native-svg';

const { width, height } = Dimensions.get('window');
const GOLD = '#D4AF37';

const LOADING_STEPS = [
  { text: 'Finding beautiful homes...', icon: Building2 },
  { text: 'Setting up secure access...', icon: ShieldCheck },
  { text: 'Mapping premium areas...', icon: Compass },
  { text: 'Unlocking prime listings...', icon: Sparkles },
];

export default function LoadingScreen() {
  const [currentStep, setCurrentStep] = useState(3); // Start with 'Unlocking prime listings...' for a fast, stunning first impression
  
  // Animation Values
  const cardScale = useRef(new Animated.Value(0.94)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0.4)).current;
  const textOpacity = useRef(new Animated.Value(1)).current;
  const textTranslateY = useRef(new Animated.Value(0)).current;
  
  // Premium background Ken Burns zoom
  const bgScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // 1. Central Card Entrance
    Animated.parallel([
      Animated.timing(cardScale, {
        toValue: 1,
        duration: 1000,
        easing: Easing.out(Easing.back(1.2)),
        useNativeDriver: true,
      }),
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      })
    ]).start();

    // 2. Pulse Dot Animation (Infinite Loop)
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.0,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.4,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        })
      ])
    ).start();

    // 3. Ken Burns Villa Background Zoom
    Animated.loop(
      Animated.sequence([
        Animated.timing(bgScale, {
          toValue: 1.08,
          duration: 16000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(bgScale, {
          toValue: 1.0,
          duration: 16000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        })
      ])
    ).start();

    // 4. Loading Text Rotator
    let stepTimer: any;
    const animateTextTransition = (nextIndex: number) => {
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 0,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(textTranslateY, {
          toValue: -6,
          duration: 350,
          useNativeDriver: true,
        })
      ]).start(() => {
        setCurrentStep(nextIndex);
        textTranslateY.setValue(6);

        Animated.parallel([
          Animated.timing(textOpacity, {
            toValue: 1,
            duration: 450,
            useNativeDriver: true,
          }),
          Animated.timing(textTranslateY, {
            toValue: 0,
            duration: 450,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          })
        ]).start();
      });
    };

    stepTimer = setInterval(() => {
      setCurrentStep((prev) => {
        const next = (prev + 1) % LOADING_STEPS.length;
        animateTextTransition(next);
        return prev;
      });
    }, 2800);

    return () => {
      clearInterval(stepTimer);
    };
  }, []);

  const ActiveIcon = LOADING_STEPS[currentStep].icon;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      {/* Cinematic Ken Burns Villa Background */}
      <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ scale: bgScale }] }]}>
        <ImageBackground
          source={{ uri: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1200' }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        >
          {/* Luxury Semi-Transparent Dark Overlay matching the shared mockup exactly */}
          <LinearGradient
            colors={['rgba(13, 17, 28, 0.45)', 'rgba(11, 14, 23, 0.70)', 'rgba(6, 8, 12, 0.94)']}
            style={StyleSheet.absoluteFill}
          />
        </ImageBackground>
      </Animated.View>

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.contentContainer}>
          
          {/* Glowing App Icon Container */}
          <Animated.View 
            style={[
              styles.iconCard, 
              { 
                transform: [{ scale: cardScale }],
                opacity: cardOpacity,
              }
            ]}
          >
            {/* Custom SVG Monogram Logo Mark matching the shared mockup */}
            <Svg width="108" height="108" viewBox="0 0 150 150">
              <Defs>
                <SvgLinearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <Stop offset="0%" stopColor="#FFF2A3" />
                  <Stop offset="40%" stopColor="#D4AF37" />
                  <Stop offset="80%" stopColor="#B88A44" />
                  <Stop offset="100%" stopColor="#D4AF37" />
                </SvgLinearGradient>
              </Defs>
              
              {/* Outer Golden Rounded Border */}
              <Path
                d="M 32 18 H 118 A 14 14 0 0 1 132 32 V 118 A 14 14 0 0 1 118 132 H 32 A 14 14 0 0 1 18 118 V 32 A 14 14 0 0 1 32 18 Z"
                stroke="url(#goldGradient)"
                strokeWidth="1.5"
                fill="none"
              />
              
              {/* Decorative Corner Brackets */}
              <Path
                d="M 36 28 H 28 V 36 M 114 28 H 122 V 36 M 36 122 H 28 V 114 M 114 122 H 122 V 114"
                stroke="url(#goldGradient)"
                strokeWidth="2.2"
                strokeLinecap="round"
                fill="none"
              />

              {/* Classic Luxury Serif "E" */}
              <SvgText
                x="75"
                y="102"
                fontSize="78"
                fontFamily={Platform.OS === 'ios' ? 'Georgia' : 'serif'}
                fontWeight="bold"
                textAnchor="middle"
                fill="url(#goldGradient)"
              >
                E
              </SvgText>

              {/* House Roof Accent overlapping top serif bar */}
              <Path
                d="M 42 42 L 75 19 L 108 42"
                stroke="url(#goldGradient)"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              
              {/* Chimney Accent */}
              <Path
                d="M 92 24 V 30"
                stroke="url(#goldGradient)"
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
              />
            </Svg>
          </Animated.View>

          {/* Brand Typography */}
          <Animated.View style={[styles.brandWrapper, { opacity: cardOpacity }]}>
            <Text style={styles.brandTitle}>
              ELITE <Text style={styles.brandTitleGold}>ESTATES</Text>
            </Text>
            <Text style={styles.brandSubtitle}>PRIME PORTFOLIO</Text>
          </Animated.View>

        </View>

        {/* Elegant Pill-Shaped Glassmorphic Loading Status Bar */}
        <Animated.View style={[styles.loadingPill, { opacity: cardOpacity }]}>
          {/* Glowing Pulse Dot */}
          <Animated.View style={[styles.pulseDot, { opacity: pulseAnim }]} />
          
          {/* Step Icon */}
          <View style={styles.stepIconBox}>
            {ActiveIcon && <ActiveIcon color={GOLD} size={13} strokeWidth={2.5} />}
          </View>
          
          {/* Animated Transition Message */}
          <Animated.View style={{ 
            opacity: textOpacity, 
            transform: [{ translateY: textTranslateY }], 
            flexDirection: 'row', 
            alignItems: 'center' 
          }}>
            <Text style={styles.loadingText}>
              {LOADING_STEPS[currentStep].text}
            </Text>
          </Animated.View>
        </Animated.View>

        {/* Footer Secured Notice */}
        <View style={styles.footer}>
          <Text style={styles.securedText}>SECURED PORTAL • SUPABASE INTEGRATED</Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#05060A',
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: height * 0.12,
  },
  
  // Custom Icon Box matching screenshot
  iconCard: {
    width: 140,
    height: 140,
    borderRadius: 36,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    backgroundColor: 'rgba(18, 22, 33, 0.82)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.38,
    shadowRadius: 18,
    elevation: 12,
  },

  // Brand Typography
  brandWrapper: {
    alignItems: 'center',
    marginTop: 26,
  },
  brandTitle: {
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: 7,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  brandTitleGold: {
    color: GOLD,
  },
  brandSubtitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 4.5,
    color: 'rgba(255, 255, 255, 0.40)',
    marginTop: 8,
  },

  // Pill-Shaped Glassmorphic Loading Status Bar
  loadingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 24,
    borderWidth: 0.8,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: height * 0.08,
    height: 46,
    justifyContent: 'center',
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: GOLD,
    marginRight: 12,
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 5,
    elevation: 4,
  },
  stepIconBox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  loadingText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.85)',
    letterSpacing: 0.5,
  },

  // Footer
  footer: {
    paddingBottom: height * 0.03,
  },
  securedText: {
    fontSize: 8.5,
    fontWeight: '800',
    letterSpacing: 2,
    color: 'rgba(255, 255, 255, 0.28)',
  },
});
