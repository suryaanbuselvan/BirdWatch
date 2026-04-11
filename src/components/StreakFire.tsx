import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated } from 'react-native';
import LottieView from 'lottie-react-native';

interface Props {
  trigger: boolean;
  onAnimationFinish?: () => void;
}

export default function StreakFire({ trigger, onAnimationFinish }: Props) {
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

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
      <LottieView
        ref={animationRef}
        source={{ uri: 'https://assets8.lottiefiles.com/packages/lf20_mYvpt9.json' }} // Fire animation
        style={styles.lottie}
        autoPlay={false}
        loop={false}
        onAnimationFinish={onAnimationFinish}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: -40, // Position above the streak number
    zIndex: 10,
  },
  lottie: {
    width: '100%',
    height: '100%',
  },
});
