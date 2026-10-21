import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { GameStatus } from '../features/minesweeper/logic/minesweeper';
import { usePreferences } from '../theme/PreferencesContext';
import { Flag, Timer, Smile, PartyPopper, Skull } from 'lucide-react-native';

interface GameHeaderProps {
  remainingFlags: number;
  status: GameStatus;
}

/**
 * Premium LED-style game header with flag counter, face indicator, and timer.
 * Minimal, cinematic design with monospace digits.
 */
export const GameHeader: React.FC<GameHeaderProps> = ({ remainingFlags, status }) => {
  const { isDarkMode } = usePreferences();
  const [time, setTime] = useState(0);

  const startTimeRef = React.useRef<number | null>(null);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (status === 'playing') {
      if (!startTimeRef.current) {
        startTimeRef.current = Date.now() - time * 1000;
      }
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current!) / 1000);
        setTime(Math.min(elapsed, 999));
      }, 250);
    } else {
      if (status === 'idle') {
        startTimeRef.current = null;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setTime(0);
      }
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  let FaceIcon = Smile;
  let faceColor = isDarkMode ? '#94A3B8' : '#64748B';
  let faceBg = isDarkMode ? 'rgba(30,41,59,0.6)' : 'rgba(241,245,249,0.8)';
  if (status === 'won') {
    FaceIcon = PartyPopper;
    faceColor = '#10B981';
    faceBg = isDarkMode ? 'rgba(16,185,129,0.12)' : 'rgba(16,185,129,0.08)';
  }
  if (status === 'lost') {
    FaceIcon = Skull;
    faceColor = '#EF4444';
    faceBg = isDarkMode ? 'rgba(239,68,68,0.12)' : 'rgba(239,68,68,0.08)';
  }

  return (
    <View style={[styles.container, { 
      backgroundColor: isDarkMode ? 'rgba(8,12,28,0.6)' : 'rgba(255,255,255,0.6)', 
      borderColor: isDarkMode ? 'rgba(30,41,59,0.5)' : 'rgba(226,232,240,0.8)',
    }]}>
      {/* Flag Counter */}
      <View style={[styles.ledBox, { backgroundColor: isDarkMode ? '#020408' : '#0F172A' }]}>
        <Flag size={12} color="#F43F5E" strokeWidth={2.5} fill="#F43F5E" />
        <Text style={styles.ledDigit}>
          {Math.max(0, remainingFlags).toString().padStart(3, '0')}
        </Text>
      </View>
      
      {/* Face Indicator */}
      <View style={[styles.faceContainer, { backgroundColor: faceBg, borderColor: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }]}>
        <FaceIcon size={24} color={faceColor} strokeWidth={2} />
      </View>

      {/* Timer */}
      <View style={[styles.ledBox, { backgroundColor: isDarkMode ? '#020408' : '#0F172A' }]}>
        <Text style={styles.ledDigit}>
          {time.toString().padStart(3, '0')}
        </Text>
        <Timer size={12} color="#3B82F6" strokeWidth={2.5} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    width: '100%', maxWidth: 420, alignSelf: 'center', 
    paddingVertical: 8, paddingHorizontal: 12, 
    borderRadius: 16, marginTop: 8, marginBottom: 4,
    borderWidth: 1,
  },
  ledBox: { 
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 8, 
    borderRadius: 10, minWidth: 92, justifyContent: 'center',
  },
  ledDigit: { 
    fontSize: 20, fontWeight: '900', color: '#F43F5E',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', 
    letterSpacing: 3,
  },
  faceContainer: { 
    padding: 8, borderRadius: 14, borderWidth: 1,
  },
});
