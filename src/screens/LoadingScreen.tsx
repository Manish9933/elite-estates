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
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles, Building2, Compass, ShieldCheck, Home } from 'lucide-react-native';
import Svg, { Path, Defs, LinearGradient as SvgLinearGradient, Stop, Text as SvgText } from 'react-native-svg';

const { width, height } = Dimensions.get('window');
const GOLD = '#D4AF37';
const GOLD_LIGHT = '#F4D03F';
const GOLD_DARK = '#B88A44';

// Breathtaking twilight architectural villa background
const BACKGROUND_VILLA_IMAGE = 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1200';

const LOADING_STEPS = [
  { text: 'Curating bespoke estates...', icon: Building2 },
  { text: 'Initializing secure concierge gateway...', icon: ShieldCheck },
  { text: 'Mapping premium locales...', icon: Compass },
  { text: 'Unveiling gold-tier listings...', icon: Sparkles },
];

export default function LoadingScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  
  // Animation Values
  const cardScale = useRef(new Animated.Value(0.92)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardGlow = useRef(new Animated.Value(0.3)).current;
  
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(8)).current;
  
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Central Card Entrance Animation
    Animated.parallel([
      Animated.timing(cardScale, {
        toValue: 1,
        duration: 1100,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      })
    ]).start();

    // 2. Loop Card Pulse and Glow
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(cardScale, {
            toValue: 1.02,
            duration: 2500,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(cardGlow, {
            toValue: 0.8,
            duration: 2500,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          })
        ]),
        Animated.parallel([
          Animated.timing(cardScale, {
            toValue: 1,
            duration: 2500,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(cardGlow, {
            toValue: 0.3,
            duration: 2500,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          })
        ])
      ])
    ).start();

    // 3. Loading Text Rotator (Fading slide-up exactly like GOSAI)
    let stepTimer: any;
    const animateTextTransition = (nextIndex: number) => {
      // Fade out
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(textTranslateY, {
          toValue: -8,
          duration: 400,
          useNativeDriver: true,
        })
      ]).start(() => {
        // Change text state
        setCurrentStep(nextIndex);
        textTranslateY.setValue(8);

        // Fade back in
        Animated.parallel([
          Animated.timing(textOpacity, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(textTranslateY, {
            toValue: 0,
            duration: 500,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          })
        ]).start();
      });
    };

    // Initial text entry
    animateTextTransition(0);

    const stepInterval = () => {
      stepTimer = setInterval(() => {
        setCurrentStep((prev) => {
          const next = (prev + 1) % LOADING_STEPS.length;
          animateTextTransition(next);
          return prev;
        });
      }, 3500);
    };
    stepInterval();

    // 4. Smooth spinner rotation
    Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 2200,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    return () => {
      clearInterval(stepTimer);
    };
  }, []);

  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const ActiveIcon = LOADING_STEPS[currentStep].icon;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      {/* 1. Breathtaking Villa Background Image */}
      <ImageBackground
        source={{ uri: BACKGROUND_VILLA_IMAGE }}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      >
        {/* 2. Premium Semi-Transparent Dark Vignette Overlay */}
        <LinearGradient
          colors={['rgba(5, 5, 5, 0.4)', 'rgba(5, 5, 5, 0.65)', 'rgba(5, 5, 5, 0.85)']}
          style={StyleSheet.absoluteFill}
        />
      </ImageBackground>

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.contentContainer}>
          
          {/* 3. Glassmorphic Card Container (Matching GOSAI shape) */}
          <Animated.View 
            style={[
              styles.cardShadowWrapper, 
              { 
                transform: [{ scale: cardScale }],
                opacity: cardOpacity,
              }
            ]}
          >
            {/* 100% crash-proof luxury glassmorphic card clipped inside outer shadow */}
            <View style={styles.cardClippingWrapper}>
              <View style={styles.blurCard}>
                <LinearGradient
                  colors={['rgba(255, 255, 255, 0.12)', 'rgba(255, 255, 255, 0.03)']}
                  style={styles.cardGradientBorder}
                >
                  
                  {/* Custom Luxury Monogram "E" Logo Mark */}
                  <View style={styles.houseIconWrapper}>
                    <Svg width="160" height="160" viewBox="0 0 150 150">
                      <Defs>
                        <SvgLinearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <Stop offset="0%" stopColor="#FFF2A3" />
                          <Stop offset="30%" stopColor="#D4AF37" />
                          <Stop offset="70%" stopColor="#B88A44" />
                          <Stop offset="100%" stopColor="#D4AF37" />
                        </SvgLinearGradient>
                      </Defs>
                      
                      {/* Decorative Monogram Outer Frame */}
                      <Path
                        d="M 32 18 H 118 A 14 14 0 0 1 132 32 V 118 A 14 14 0 0 1 118 132 H 32 A 14 14 0 0 1 18 118 V 32 A 14 14 0 0 1 32 18 Z"
                        stroke="url(#goldGradient)"
                        strokeWidth="1.2"
                        fill="none"
                      />
                      {/* Inner Corner Accent Brackets */}
                      <Path
                        d="M 36 28 H 28 V 36 M 114 28 H 122 V 36 M 36 122 H 28 V 114 M 114 122 H 122 V 114"
                        stroke="url(#goldGradient)"
                        strokeWidth="2"
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

                      {/* Elegant House Roof Contour overlapping the upper serif bar of the E */}
                      <Path
                        d="M 42 42 L 75 19 L 108 42"
                        stroke="url(#goldGradient)"
                        strokeWidth="3.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                      />
                      {/* Chimney Accent */}
                      <Path
                        d="M 92 24 V 30"
                        stroke="url(#goldGradient)"
                        strokeWidth="3.2"
                        strokeLinecap="round"
                        fill="none"
                      />
                    </Svg>
                  </View>

                </LinearGradient>
              </View>
            </View>
          </Animated.View>

          {/* 5. Brand Typography - Letter-spaced Serif look */}
          <Animated.View style={[styles.brandWrapper, { opacity: cardOpacity }]}>
            <Text style={styles.brandTitle}>
              ELITE <Text style={styles.brandTitleGold}>ESTATES</Text>
            </Text>
            <Text style={styles.brandSubtitle}>CONCIERGE PORTFOLIO</Text>
          </Animated.View>

        </View>

        {/* 6. Gold Spinner & Dynamic Fading Status Text (Positioned Lower) */}
        <View style={styles.loadingWrapper}>
          <Animated.View style={[styles.spinnerWrapper, { transform: [{ rotate: spin }] }]}>
            <LinearGradient
              colors={[GOLD_LIGHT, GOLD, GOLD_DARK]}
              style={styles.spinnerRing}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <View style={styles.spinnerInnerGap} />
          </Animated.View>

          {/* Fading text transition next to spinner */}
          <Animated.View style={[
            styles.stepMessageWrapper, 
            { 
              opacity: textOpacity, 
              transform: [{ translateY: textTranslateY }],
              flexDirection: 'row',
              alignItems: 'center',
            }
          ]}>
            <View style={styles.stepIconBox}>
              {ActiveIcon && <ActiveIcon color={GOLD} size={14} strokeWidth={2.5} />}
            </View>
            <Text style={styles.stepText}>
              {LOADING_STEPS[currentStep].text}
            </Text>
          </Animated.View>
        </View>

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
    backgroundColor: '#050505',
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
  
  // Custom Glassmorphic Card Container matching GOSAI
  cardShadowWrapper: {
    width: 200,
    height: 200,
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 15,
    elevation: 12,
  },
  cardClippingWrapper: {
    flex: 1,
    width: '100%',
    height: '100%',
    borderRadius: 50,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  blurCard: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 20, 30, 0.65)',
  },
  cardGradientBorder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },

  // Luxury Double Ring Monogram Box
  innerLogoRing: {
    width: 156,
    height: 156,
    borderRadius: 38,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 3,
  },
  monogramBorderBox: {
    width: '100%',
    height: '100%',
    borderRadius: 35,
    borderWidth: 1.5,
    borderColor: GOLD,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(5, 13, 26, 0.35)', // Dark translucent layer behind logo
  },

  // High-fidelity gold house drawing matching screenshot
  houseIconWrapper: {
    width: 160,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    width: 140,
    height: 140,
    borderRadius: 32,
  },
  roofLeft: {
    position: 'absolute',
    top: 18,
    left: 10,
    width: 38,
    height: 4,
    backgroundColor: GOLD,
    borderRadius: 2,
    transform: [{ rotate: '-35deg' }],
  },
  roofRight: {
    position: 'absolute',
    top: 18,
    right: 10,
    width: 38,
    height: 4,
    backgroundColor: GOLD,
    borderRadius: 2,
    transform: [{ rotate: '35deg' }],
  },
  chimney: {
    position: 'absolute',
    top: 12,
    left: 22,
    width: 7,
    height: 15,
    backgroundColor: GOLD,
  },
  houseBody: {
    position: 'absolute',
    bottom: 22,
    width: 52,
    height: 32,
    borderWidth: 3.5,
    borderColor: GOLD,
    borderTopWidth: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    paddingBottom: 2,
  },
  houseWindowLeft: {
    width: 9,
    height: 13,
    borderWidth: 2,
    borderColor: GOLD,
    marginBottom: 4,
  },
  houseWindowRight: {
    width: 9,
    height: 13,
    borderWidth: 2,
    borderColor: GOLD,
    marginBottom: 4,
  },
  houseDoor: {
    width: 11,
    height: 17,
    backgroundColor: GOLD,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  houseBase: {
    position: 'absolute',
    bottom: 19,
    width: 66,
    height: 3,
    backgroundColor: GOLD,
    borderRadius: 1.5,
  },

  // Elegant brand typography below card
  brandWrapper: {
    alignItems: 'center',
    marginTop: 32,
  },
  brandTitle: {
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: 8,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  brandTitleGold: {
    color: GOLD,
  },
  brandSubtitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 5,
    color: 'rgba(255, 255, 255, 0.45)',
    marginTop: 8,
  },

  // Gold Arc Spinner & Loading Text matching GOSAI layout
  loadingWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(5, 5, 5, 0.45)',
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: height * 0.05,
    minWidth: width * 0.7,
  },
  spinnerWrapper: {
    width: 20,
    height: 20,
    borderRadius: 10,
    padding: 2.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  spinnerRing: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  spinnerInnerGap: {
    position: 'absolute',
    width: 15,
    height: 15,
    borderRadius: 7.5,
    backgroundColor: '#0F1318', // Matches loading background tint
  },

  // Steps message text next to spinner
  stepMessageWrapper: {
    flex: 1,
  },
  stepText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.5,
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

  // Footer styling
  footer: {
    paddingBottom: height * 0.03,
  },
  securedText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 2,
    color: 'rgba(255, 255, 255, 0.35)',
  },
});
