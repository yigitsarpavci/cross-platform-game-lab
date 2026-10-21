import React, { useEffect, useState } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';

interface Particle {
  id: number;
  x: number;
  y: number;
  angle: number;
  speed: number;
  size: number;
  color: string;
}

interface ParticleEmitterProps {
  x: number;
  y: number;
  count: number;
  colors: string[];
  type: 'confetti' | 'spark';
  onComplete?: () => void;
}

const ParticleView = ({ particle, type, onComplete }: { particle: Particle; type: 'confetti' | 'spark'; onComplete?: () => void }) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(
      1,
      { duration: type === 'confetti' ? 1500 + Math.random() * 500 : 600 + Math.random() * 200, easing: Easing.out(Easing.cubic) },
      (finished) => {
        if (finished && onComplete) {
          runOnJS(onComplete)();
        }
      }
    );
  }, [onComplete, progress, type]);

  const animatedStyle = useAnimatedStyle(() => {
    const p = progress.value;
    const distance = particle.speed * p;
    const translateX = Math.cos(particle.angle) * distance;
    const translateY = Math.sin(particle.angle) * distance + (type === 'confetti' ? p * 200 : p * 50); // Gravity
    const rotation = type === 'confetti' ? p * 720 : 0;
    const opacity = type === 'confetti' ? 1 - Math.pow(p, 3) : 1 - p;

    return {
      transform: [
        { translateX: particle.x + translateX },
        { translateY: particle.y + translateY },
        { rotate: `${rotation}deg` },
        { scale: 1 - p * 0.5 }
      ],
      opacity,
    };
  });

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          backgroundColor: particle.color,
          width: particle.size,
          height: type === 'confetti' ? particle.size * 1.5 : particle.size,
          borderRadius: type === 'confetti' ? 2 : particle.size / 2,
        },
        animatedStyle,
      ]}
    />
  );
};

export const ParticleEmitter: React.FC<ParticleEmitterProps> = ({ x, y, count, colors, type, onComplete }) => {
  const { width, height } = useWindowDimensions();
  const [particles] = useState(() => {
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * width,
      y: (Math.random() - 0.5) * height,
      angle: Math.random() * Math.PI * 2,
      speed: type === 'confetti' ? 100 + Math.random() * 300 : 50 + Math.random() * 150,
      size: type === 'confetti' ? 6 + Math.random() * 6 : 3 + Math.random() * 4,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));
  });

  return (
    <View style={[StyleSheet.absoluteFill, { pointerEvents: 'none', zIndex: 100, justifyContent: 'center', alignItems: 'center' }]}>
      <View style={{ position: 'absolute' }}>
        {particles.map((p, i) => (
          <ParticleView key={p.id} particle={p} type={type} onComplete={i === 0 ? onComplete : undefined} />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  particle: {
    position: 'absolute',
  },
});
