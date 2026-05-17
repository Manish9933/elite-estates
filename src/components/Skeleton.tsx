import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle, DimensionValue, Dimensions, Platform } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  useSharedValue,
  interpolate,
  withSequence,
  Easing
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SkeletonProps {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  style?: ViewStyle;
}

export const Skeleton = ({ width, height, borderRadius = 12, style }: SkeletonProps) => {
  const opacity = useSharedValue(0.35);
  const scale = useSharedValue(0.99);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.65, { duration: 900, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.35, { duration: 900, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    scale.value = withRepeat(
      withSequence(
        withTiming(1.0, { duration: 900, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.99, { duration: 900, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const isCard = typeof height === 'number' && height >= 30;

  return (
    <Animated.View 
      style={[
        styles.skeleton, 
        isCard && styles.skeletonCard,
        { width, height, borderRadius }, 
        style,
        animatedStyle
      ]} 
    />
  );
};

export const ShimmerSkeleton = ({ width, height, borderRadius = 12, style }: SkeletonProps) => {
  const shimmerValue = useSharedValue(-1);

  useEffect(() => {
    shimmerValue.value = withRepeat(
      withTiming(1, { duration: 1600, easing: Easing.bezier(0.25, 0.1, 0.25, 1) }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    // Shimmer sweeps the entire screen width for dynamic, continuous flow
    const translateX = interpolate(shimmerValue.value, [-1, 1], [-SCREEN_WIDTH, SCREEN_WIDTH]);
    return {
      transform: [{ translateX }],
    };
  });

  const isCard = typeof height === 'number' && height >= 30;

  return (
    <View style={[
      styles.skeletonContainer, 
      isCard && styles.skeletonCard,
      { width, height, borderRadius }, 
      style
    ]}>
      <Animated.View style={[StyleSheet.absoluteFill, animatedStyle]}>
        <LinearGradient
          colors={[
            'transparent', 
            'rgba(212, 175, 55, 0.03)', 
            'rgba(212, 175, 55, 0.12)', 
            'rgba(212, 175, 55, 0.03)', 
            'transparent'
          ]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#0D0D0D',
  },
  skeletonContainer: {
    backgroundColor: '#0D0D0D',
    overflow: 'hidden',
  },
  skeletonCard: {
    backgroundColor: '#0A0A0A',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.06)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
      }
    } as any),
  },
});
