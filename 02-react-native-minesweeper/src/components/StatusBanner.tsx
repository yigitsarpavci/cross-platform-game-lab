import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GameStatus } from '../features/minesweeper/logic/minesweeper';
import Animated, { ZoomIn, ZoomOut, Easing } from 'react-native-reanimated';
import { usePreferences } from '../theme/PreferencesContext';
import { Trophy, Bomb } from 'lucide-react-native';
import { BlurView } from 'expo-blur';

interface StatusBannerProps {
  status: GameStatus;
}

/**
 * Premium animated banner that scales in on game end.
 * Features a glowing glassmorphic design.
 */
export const StatusBanner: React.FC<StatusBannerProps> = ({ status }) => {
  const { isDarkMode } = usePreferences();
  
  if (status === 'playing' || status === 'idle') return null;

  const isWin = status === 'won';
  
  const bgColor = isWin 
    ? (isDarkMode ? 'rgba(6,78,59,0.7)' : 'rgba(209,250,229,0.85)') 
    : (isDarkMode ? 'rgba(127,29,29,0.7)' : 'rgba(254,226,226,0.85)');
    
  const borderColor = isWin 
    ? (isDarkMode ? 'rgba(16,185,129,0.4)' : 'rgba(16,185,129,0.5)') 
    : (isDarkMode ? 'rgba(239,68,68,0.4)' : 'rgba(239,68,68,0.5)');
    
  const textColor = isWin 
    ? (isDarkMode ? '#6EE7B7' : '#047857') 
    : (isDarkMode ? '#FCA5A5' : '#B91C1C');
    
  const Icon = isWin ? Trophy : Bomb;
  const message = isWin ? 'BOARD CLEARED' : 'MINE TRIGGERED';

  return (
    <Animated.View 
      entering={ZoomIn.duration(400).easing(Easing.out(Easing.cubic))} 
      exiting={ZoomOut.duration(300).easing(Easing.in(Easing.cubic))}
      style={[styles.banner, { borderColor }]}
    >
      <BlurView intensity={70} tint={isDarkMode ? 'dark' : 'light'} style={[StyleSheet.absoluteFill, { backgroundColor: bgColor }]} />
      <View style={styles.content}>
        <Icon size={18} color={textColor} strokeWidth={3} />
        <Text style={[styles.text, { color: textColor }]}>
          {message}
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  banner: { 
    width: '90%', maxWidth: 400, alignSelf: 'center', 
    paddingVertical: 12, borderRadius: 14, 
    borderWidth: 1.5, marginVertical: 8,
    alignItems: 'center', overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 4,
  },
  content: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
  },
  text: { 
    fontSize: 14, fontFamily: 'Outfit_900Black', 
    letterSpacing: 1.5,
  },
});
