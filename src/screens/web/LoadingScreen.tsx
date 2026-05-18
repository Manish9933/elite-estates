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

const { width, height } = Dimensions.get('window');
const GOLD = '#D4AF37';
const GOLD_LIGHT = '#F4D03F';
const GOLD_DARK = '#B88A44';

const BACKGROUND_VILLA_IMAGE = 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1200';

const LOADING_STEPS = [
  { text: 'Finding beautiful homes...', icon: Building2 },
  { text: 'Setting up secure access...', icon: ShieldCheck },
  { text: 'Mapping premium areas...', icon: Compass },
  { text: 'Unlocking prime listings...', icon: Sparkles },
];

export default function LoadingScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  
  // Animation Values
  const cardScale = useRef(new Animated.Value(0.95)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(8)).current;
  
  const rotation = useRef(new Animated.Value(0)).current;
  const bgScale = useRef(new Animated.Value(1)).current;
  const glossTranslate = useRef(new Animated.Value(-240)).current;

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

    // 2. Continuous Fading Loading Steps Rotator
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

    animateTextTransition(0);

    stepTimer = setInterval(() => {
      setCurrentStep((prev) => {
        const next = (prev + 1) % LOADING_STEPS.length;
        animateTextTransition(next);
        return prev;
      });
    }, 2800);

    // 3. Smooth spinner rotation
    Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // 4. Ken Burns background breathing
    Animated.loop(
      Animated.sequence([
        Animated.timing(bgScale, {
          toValue: 1.06,
          duration: 12000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(bgScale, {
          toValue: 1.0,
          duration: 12000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        })
      ])
    ).start();

    // 5. Diagonal Luxury Gloss Shine loop
    const runGlossShine = () => {
      glossTranslate.setValue(-240);
      Animated.sequence([
        Animated.delay(800),
        Animated.timing(glossTranslate, {
          toValue: 240,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.delay(4000),
      ]).start(() => runGlossShine());
    };
    runGlossShine();

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
      <StatusBar barStyle="light-content" />
      
      {/* Background with smooth Ken Burns breathing */}
      <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ scale: bgScale }] }]}>
        <ImageBackground
          source={{ uri: BACKGROUND_VILLA_IMAGE }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        >
          <LinearGradient
            colors={['rgba(5, 5, 5, 0.4)', 'rgba(5, 5, 5, 0.7)', 'rgba(5, 5, 5, 0.92)']}
            style={StyleSheet.absoluteFill}
          />
        </ImageBackground>
      </Animated.View>
 
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.contentContainer}>
          
          {/* Glassmorphic Central Logo Box */}
          <Animated.View 
            style={[
              styles.cardShadowWrapper, 
              { 
                transform: [{ scale: cardScale }],
                opacity: cardOpacity,
              }
            ]}
          >
            <View style={styles.cardClippingWrapper}>
              <View style={styles.blurCard}>
                
                {/* Diagonal Luxury Gloss Shine effect */}
                <Animated.View style={[
                  styles.glossShine,
                  {
                    transform: [
                      { translateX: glossTranslate },
                      { skewX: '-30deg' }
                    ]
                  }
                ]}>
                  <LinearGradient
                    colors={['transparent', 'rgba(255, 242, 163, 0.05)', 'rgba(255, 242, 163, 0.25)', 'rgba(255, 242, 163, 0.05)', 'transparent']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={StyleSheet.absoluteFill}
                  />
                </Animated.View>

                <LinearGradient
                  colors={['rgba(255, 255, 255, 0.12)', 'rgba(255, 255, 255, 0.02)']}
                  style={styles.cardGradientBorder}
                >
                  {/* Web-safe standard HTML5 inline SVG for perfect 100% crash-proof rendering */}
                  <View style={styles.houseIconWrapper}>
                    <svg width="150" height="150" viewBox="0 0 150 150" style={{ display: 'block' }}>
                      <defs>
                        <linearGradient id="webGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#FFF2A3" />
                          <stop offset="30%" stopColor="#D4AF37" />
                          <stop offset="70%" stopColor="#B88A44" />
                          <stop offset="100%" stopColor="#D4AF37" />
                        </linearGradient>
                      </defs>
                      
                      {/* Monogram Outer Frame */}
                      <path
                        d="M 32 18 H 118 A 14 14 0 0 1 132 32 V 118 A 14 14 0 0 1 118 132 H 32 A 14 14 0 0 1 18 118 V 32 A 14 14 0 0 1 32 18 Z"
                        stroke="url(#webGoldGrad)"
                        strokeWidth="1.5"
                        fill="none"
                      />
                      
                      {/* Corner Accents */}
                      <path
                        d="M 36 28 H 28 V 36 M 114 28 H 122 V 36 M 36 122 H 28 V 114 M 114 122 H 122 V 114"
                        stroke="url(#webGoldGrad)"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        fill="none"
                      />

                      {/* Serif E Monogram */}
                      <text
                        x="75"
                        y="102"
                        fontSize="76"
                        fontFamily="Georgia, serif"
                        fontWeight="bold"
                        textAnchor="middle"
                        fill="url(#webGoldGrad)"
                      >
                        E
                      </text>

                      {/* House Roof overlap contour */}
                      <path
                        d="M 42 42 L 75 19 L 108 42"
                        stroke="url(#webGoldGrad)"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                      />
                      
                      {/* Chimney */}
                      <path
                        d="M 92 24 V 30"
                        stroke="url(#webGoldGrad)"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        fill="none"
                      />
                    </svg>
                  </View>
                </LinearGradient>
              </View>
            </View>
          </Animated.View>

          {/* Brand Typography */}
          <Animated.View style={[styles.brandWrapper, { opacity: cardOpacity }]}>
            <Text style={styles.brandTitle}>
              ELITE <Text style={styles.brandTitleGold}>ESTATES</Text>
            </Text>
            <Text style={styles.brandSubtitle}>PRIME PORTFOLIO</Text>
          </Animated.View>

        </View>

        {/* Web-Optimized Spinner & Steps Message Box */}
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
              {ActiveIcon && <ActiveIcon color={GOLD} size={13} strokeWidth={2.5} />}
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
  glossShine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: 100,
    zIndex: 10,
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
  cardShadowWrapper: {
    width: 200,
    height: 200,
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
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
    backgroundColor: 'rgba(15, 20, 30, 0.72)',
  },
  cardGradientBorder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },
  houseIconWrapper: {
    width: 150,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandWrapper: {
    alignItems: 'center',
    marginTop: 32,
  },
  brandTitle: {
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: 8,
    color: '#FFFFFF',
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
  loadingWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(5, 5, 5, 0.65)',
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: height * 0.06,
    minWidth: width * 0.68 || 320,
    backdropFilter: 'blur(10px)',
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
    backgroundColor: '#0F1318',
  },
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
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
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
