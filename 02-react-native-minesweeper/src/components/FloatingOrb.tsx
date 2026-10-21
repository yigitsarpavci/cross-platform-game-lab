import React, { useEffect } from 'react';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withRepeat, withSequence, Easing } from 'react-native-reanimated';

interface FloatingOrbProps {
  size: number;
  color: string;
  top: string;
  left: string;
  delay: number;
  opacityMultiplier?: number;
}

export const FloatingOrb: React.FC<FloatingOrbProps> = ({ 
  size, 
  color, 
  top, 
  left, 
  delay, 
  opacityMultiplier = 0.2 
}) => {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 1200 });
    translateY.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 3000 + delay, easing: Easing.inOut(Easing.ease) }),
        withTiming(8, { duration: 3000 + delay, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true
    );
  }, [delay, opacity, translateY]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value * opacityMultiplier,
  }));

  return (
    <Animated.View style={[{
      position: 'absolute', 
      top: top as any, 
      left: left as any,
      width: size, 
      height: size, 
      borderRadius: size / 2,
      backgroundColor: color,
    }, animStyle]} />
  );
};
