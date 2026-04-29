import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated, Platform } from 'react-native';
import LottieView from 'lottie-react-native';

interface Props {
  trigger: boolean;
  loop?: boolean;
  streakLength?: number;
  onAnimationFinish?: () => void;
}

export default function StreakFire({ trigger, loop = false, streakLength = 0, onAnimationFinish }: Props) {
  const animationRef = useRef<LottieView>(null);
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (trigger) {
      // Pulse and play
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 3,
          useNativeDriver: true,
        }),
      ]).start();

      animationRef.current?.play();
    }
  }, [trigger]);

  const getFireConfig = () => {
    if (streakLength >= 7) {
      return { color: '#3b82f6', filter: 'hue-rotate(180deg) brightness(1.5)', label: 'LEGENDARY' };
    }
    if (streakLength >= 3) {
      return { color: '#f43f5e', filter: 'hue-rotate(320deg) brightness(1.2)', label: 'INTENSE' };
    }
    return { color: '#fbbf24', filter: 'none', label: 'ACTIVE' };
  };

  const fireConfig = getFireConfig();

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
      <LottieView
        ref={animationRef}
        source={{ uri: 'https://assets8.lottiefiles.com/packages/lf20_mYvpt9.json' }} // Fire animation
        style={[styles.lottie, Platform.OS === 'web' && { filter: fireConfig.filter }]}
        autoPlay={trigger}
        loop={loop}
        colorFilters={[
          { keypath: '*', color: fireConfig.color },
          { keypath: 'Layer 1', color: fireConfig.color }
        ]}
        onAnimationFinish={onAnimationFinish}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  lottie: {
    width: '100%',
    height: '100%',
  },
});
