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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles, Building2, Compass, ShieldCheck } from 'lucide-react-native';
import { Theme } from '../styles/theme';

const { width, height } = Dimensions.get('window');
const GOLD = '#D4AF37';
const GOLD_LIGHT = '#F4D03F';
const GOLD_DARK = '#B88A44';

const LOADING_STEPS = [
  { text: 'Curating bespoke estates...', icon: Building2 },
  { text: 'Initializing secure concierge gateway...', icon: ShieldCheck },
  { text: 'Mapping premium locales...', icon: Compass },
  { text: 'Unveiling gold-tier listings...', icon: Sparkles },
];

export default function LoadingScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  
  // Animation Values
  const logoScale = useRef(new Animated.Value(0.9)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoGlow = useRef(new Animated.Value(0.3)).current;
  
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(10)).current;
  
  const progressWidth = useRef(new Animated.Value(0)).current;
  const shimmerTranslateX = useRef(new Animated.Value(-150)).current;
  
  const rotation = useRef(new Animated.Value(0)).current;

  // Background architectural grid line animations
  const gridLine1 = useRef(new Animated.Value(0)).current;
  const gridLine2 = useRef(new Animated.Value(0)).current;
  const gridLine3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Logo Entrance Animation
    Animated.parallel([
      Animated.timing(logoScale, {
        toValue: 1,
        duration: 1000,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ]).start();

    // 2. Loop Logo Pulse and Glow
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(logoScale, {
            toValue: 1.03,
            duration: 2000,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(logoGlow, {
            toValue: 0.8,
            duration: 2000,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          })
        ]),
        Animated.parallel([
          Animated.timing(logoScale, {
            toValue: 1,
            duration: 2000,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(logoGlow, {
            toValue: 0.3,
            duration: 2000,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          })
        ])
      ])
    ).start();

    // 3. Grid line draw-in animations
    Animated.stagger(300, [
      Animated.timing(gridLine1, {
        toValue: 1,
        duration: 2000,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }),
      Animated.timing(gridLine2, {
        toValue: 1,
        duration: 2500,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }),
      Animated.timing(gridLine3, {
        toValue: 1,
        duration: 3000,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      })
    ]).start();

    // 4. Loading Text Rotator & Shimmer progress
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
          return prev; // Handled by callback for smooth transitions
        });
      }, 3500);
    };
    stepInterval();

    // 5. Progress & Shimmer Bar Animations
    Animated.timing(progressWidth, {
      toValue: 1,
      duration: 10000,
      easing: Easing.inOut(Easing.quad),
      useNativeDriver: false,
    }).start();

    Animated.loop(
      Animated.timing(shimmerTranslateX, {
        toValue: 150,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // 6. Smooth spinner rotation
    Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 3000,
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
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FCFBF9" />
      
      {/* Luxury Off-White & Soft Gold Background Gradient */}
      <LinearGradient
        colors={['#FCFBF9', '#FAF7F0', '#F2ECE0']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Modern Architectural Drafting Lines (Floorplan style background) */}
      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        <Animated.View 
          style={[
            styles.architecturalLine, 
            styles.hLine1, 
            { width: gridLine1.interpolate({ inputRange: [0, 1], outputRange: ['0%', '80%'] }) }
          ]} 
        />
        <Animated.View 
          style={[
            styles.architecturalLine, 
            styles.hLine2, 
            { width: gridLine2.interpolate({ inputRange: [0, 1], outputRange: ['0%', '65%'] }) }
          ]} 
        />
        <Animated.View 
          style={[
            styles.architecturalLine, 
            styles.vLine1, 
            { height: gridLine3.interpolate({ inputRange: [0, 1], outputRange: ['0%', '40%'] }) }
          ]} 
        />
        
        {/* Soft Golden Background Glow Spheres */}
        <View style={styles.glowSphere1} />
        <View style={styles.glowSphere2} />
      </View>

      <View style={styles.contentContainer}>
        {/* Logo Card Section */}
        <Animated.View 
          style={[
            styles.logoContainer, 
            { 
              transform: [{ scale: logoScale }],
              opacity: logoOpacity,
              shadowOpacity: logoGlow.interpolate({ inputRange: [0.3, 0.8], outputRange: [0.15, 0.3] }),
              shadowRadius: logoGlow.interpolate({ inputRange: [0.3, 0.8], outputRange: [15, 25] }),
            }
          ]}
        >
          {/* Replica of the Premium Blue/Gold App Icon from screenshot */}
          <LinearGradient
            colors={['#0F1E36', '#050D1A']}
            style={styles.logoGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {/* Elegant Golden House Icon Structure */}
            <View style={styles.houseIconWrapper}>
              <View style={styles.roofLeft} />
              <View style={styles.roofRight} />
              <View style={styles.chimney} />
              <View style={styles.houseBody}>
                <View style={styles.houseWindowLeft} />
                <View style={styles.houseWindowRight} />
                <View style={styles.houseDoor} />
              </View>
              <View style={styles.houseBase} />
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Brand Typography */}
        <Animated.View style={[styles.brandWrapper, { opacity: logoOpacity }]}>
          <Text style={styles.brandTitle}>
            ELITE <Text style={styles.brandTitleGold}>ESTATES</Text>
          </Text>
          <Text style={styles.brandSubtitle}>CONCIERGE PORTFOLIO</Text>
        </Animated.View>

        {/* Loading Spinner & Status Steps */}
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

          {/* Dynamic Loading Message Transition */}
          <Animated.View style={[
            styles.stepMessageWrapper, 
            { opacity: textOpacity, transform: [{ translateY: textTranslateY }] }
          ]}>
            <View style={styles.stepIconBox}>
              {ActiveIcon && <ActiveIcon color={GOLD} size={15} strokeWidth={2.5} />}
            </View>
            <Text style={styles.stepText}>
              {LOADING_STEPS[currentStep].text}
            </Text>
          </Animated.View>
        </View>
      </View>

      {/* Premium Luxury Progress Bar */}
      <View style={styles.progressSection}>
        <View style={styles.progressBarTrack}>
          <Animated.View 
            style={[
              styles.progressBarFill, 
              { 
                width: progressWidth.interpolate({ 
                  inputRange: [0, 1], 
                  outputRange: ['0%', '100%'] 
                }) 
              }
            ]}
          >
            <LinearGradient
              colors={[GOLD_LIGHT, GOLD, GOLD_DARK]}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
            {/* Shimmer Effect */}
            <Animated.View 
              style={[
                styles.shimmerLine, 
                { transform: [{ translateX: shimmerTranslateX }] }
              ]} 
            >
              <LinearGradient
                colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.6)', 'rgba(255,255,255,0)']}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
            </Animated.View>
          </Animated.View>
        </View>
        <Text style={styles.securedText}>SECURED PORTAL • SUPABASE INTEGRATED</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FCFBF9',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: height * 0.08,
  },
  
  // Architectural drafting line decoration (luxury/architecture theme)
  architecturalLine: {
    position: 'absolute',
    backgroundColor: 'rgba(212, 175, 55, 0.06)',
  },
  hLine1: {
    top: height * 0.35,
    left: 0,
    height: 1,
  },
  hLine2: {
    top: height * 0.65,
    right: 0,
    height: 1.5,
  },
  vLine1: {
    left: width * 0.2,
    top: height * 0.25,
    width: 1,
  },
  
  // Luxury background glows
  glowSphere1: {
    position: 'absolute',
    top: height * 0.15,
    left: width * 0.15,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(214, 175, 55, 0.04)',
    filter: Platform.OS === 'ios' ? 'blur(45px)' : undefined,
  },
  glowSphere2: {
    position: 'absolute',
    bottom: height * 0.2,
    right: -50,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(184, 138, 68, 0.03)',
    filter: Platform.OS === 'ios' ? 'blur(50px)' : undefined,
  },

  // Premium Logo Card replica
  logoContainer: {
    width: 150,
    height: 150,
    borderRadius: 36,
    backgroundColor: '#050D1A',
    padding: 3, // Ring outline spacing
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  logoGradient: {
    flex: 1,
    borderRadius: 33,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
  },

  // High-fidelity gold house drawing matching screenshot
  houseIconWrapper: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roofLeft: {
    position: 'absolute',
    top: 14,
    left: 8,
    width: 36,
    height: 4,
    backgroundColor: GOLD,
    borderRadius: 2,
    transform: [{ rotate: '-35deg' }],
  },
  roofRight: {
    position: 'absolute',
    top: 14,
    right: 8,
    width: 36,
    height: 4,
    backgroundColor: GOLD,
    borderRadius: 2,
    transform: [{ rotate: '35deg' }],
  },
  chimney: {
    position: 'absolute',
    top: 10,
    left: 20,
    width: 6,
    height: 14,
    backgroundColor: GOLD,
  },
  houseBody: {
    position: 'absolute',
    bottom: 22,
    width: 50,
    height: 30,
    borderWidth: 3,
    borderColor: GOLD,
    borderTopWidth: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    paddingBottom: 2,
  },
  houseWindowLeft: {
    width: 8,
    height: 12,
    borderWidth: 2,
    borderColor: GOLD,
    marginBottom: 4,
  },
  houseWindowRight: {
    width: 8,
    height: 12,
    borderWidth: 2,
    borderColor: GOLD,
    marginBottom: 4,
  },
  houseDoor: {
    width: 10,
    height: 16,
    backgroundColor: GOLD,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  houseBase: {
    position: 'absolute',
    bottom: 19,
    width: 62,
    height: 3,
    backgroundColor: GOLD,
    borderRadius: 1.5,
  },

  // Typography Styles
  brandWrapper: {
    alignItems: 'center',
    marginTop: 24,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 6,
    color: '#1C1B17',
    textShadowColor: 'rgba(0,0,0,0.05)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  brandTitleGold: {
    color: GOLD,
  },
  brandSubtitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 5,
    color: '#8A8578',
    marginTop: 6,
  },

  // Spinner ring styling
  loadingWrapper: {
    alignItems: 'center',
    marginTop: 48,
    height: 90,
  },
  spinnerWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    padding: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinnerRing: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  spinnerInnerGap: {
    position: 'absolute',
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FAF7F0', // Seamlessly matches mid-gradient bg
  },

  // Steps indicator
  stepMessageWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.12)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  stepIconBox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(214, 175, 55, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  stepText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4A463B',
    letterSpacing: 0.3,
  },

  // Progress Section Styles
  progressSection: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: height * 0.05,
    paddingHorizontal: 40,
  },
  progressBarTrack: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
    overflow: 'hidden',
  },
  shimmerLine: {
    width: 150,
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  securedText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 2,
    color: '#A09B8E',
  },
});
