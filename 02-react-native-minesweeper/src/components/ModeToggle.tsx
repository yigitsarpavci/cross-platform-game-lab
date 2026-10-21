import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { InteractionMode } from '../features/minesweeper/hooks/useMinesweeperGame';
import { usePreferences } from '../theme/PreferencesContext';
import Animated, { useAnimatedStyle, withTiming, Easing, useSharedValue, withRepeat, withSequence } from 'react-native-reanimated';
import { Pickaxe, Flag } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

interface ModeToggleProps {
  mode: InteractionMode;
  onSelectMode: (mode: InteractionMode) => void;
}

const SLIDE_WIDTH = 112;

/**
 * Premium pill-shaped segmented control with a smooth sliding indicator
 * and neon accent colors for Dig/Flag modes.
 */
export const ModeToggle: React.FC<ModeToggleProps> = ({ mode, onSelectMode }) => {
  const { isDarkMode } = usePreferences();
  const isDig = mode === 'dig';

  const pulse = useSharedValue(0);

  React.useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, [pulse]);

  // Smooth indicator animation without bounce/overshoot
  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: withTiming(isDig ? 0 : SLIDE_WIDTH, { duration: 250, easing: Easing.out(Easing.cubic) }) }
    ],
    shadowRadius: 4 + pulse.value * 4,
    shadowOpacity: 0.15 + pulse.value * 0.15,
  }));

  const handleSelect = (newMode: InteractionMode) => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelectMode(newMode);
  };

  const digColor = isDig ? (isDarkMode ? '#60A5FA' : '#2563EB') : (isDarkMode ? '#334155' : '#CBD5E1');
  const flagColor = !isDig ? (isDarkMode ? '#FB7185' : '#E11D48') : (isDarkMode ? '#334155' : '#CBD5E1');

  return (
    <View style={styles.container}>
      <View style={[styles.track, { 
        backgroundColor: isDarkMode ? 'rgba(8,12,28,0.8)' : 'rgba(226,232,240,0.8)', 
      }]}>
        {/* Sliding indicator */}
        <Animated.View style={[
          styles.indicator, 
          { 
            backgroundColor: isDarkMode ? 'rgba(30,41,59,0.8)' : '#FFFFFF',
            shadowColor: isDig ? '#3B82F6' : '#F43F5E',
          },
          indicatorStyle,
        ]} />

        <Pressable onPress={() => handleSelect('dig')} style={styles.option}>
          <View style={styles.optionContent}>
            <Pickaxe size={15} color={digColor} strokeWidth={2.5} />
            <Text style={[styles.optionText, { 
              color: digColor,
              fontFamily: isDig ? 'Outfit_800ExtraBold' : 'Outfit_500Medium',
            }]}>Dig</Text>
          </View>
        </Pressable>

        <Pressable onPress={() => handleSelect('flag')} style={styles.option}>
          <View style={styles.optionContent}>
            <Flag size={15} color={flagColor} strokeWidth={2.5} />
            <Text style={[styles.optionText, { 
              color: flagColor,
              fontFamily: !isDig ? 'Outfit_800ExtraBold' : 'Outfit_500Medium',
            }]}>Flag</Text>
          </View>
        </Pressable>
      </View>

      <Text style={[styles.hint, { color: isDarkMode ? '#334155' : '#CBD5E1' }]}>
        Long-Press to flag  ·  Tap a number to chord
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginVertical: 14, alignSelf: 'center', alignItems: 'center' },
  track: {
    flexDirection: 'row',
    width: 232,
    height: 44,
    borderRadius: 14,
    padding: 4,
    position: 'relative',
  },
  indicator: {
    position: 'absolute',
    top: 4, left: 4,
    width: SLIDE_WIDTH, height: 34,
    borderRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2, shadowRadius: 6, elevation: 4,
  },
  option: {
    flex: 1, justifyContent: 'center', alignItems: 'center', zIndex: 1,
  },
  optionContent: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
  },
  optionText: {
    fontSize: 13, letterSpacing: 0.3,
  },
  hint: {
    marginTop: 8, fontSize: 10,
    fontFamily: 'Outfit_500Medium', letterSpacing: 0.5,
  },
});
