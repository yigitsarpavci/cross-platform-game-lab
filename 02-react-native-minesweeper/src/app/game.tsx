import React, { useRef, useCallback, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, Text, Pressable, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMinesweeperGame } from '../features/minesweeper/hooks/useMinesweeperGame';
import { usePreferences } from '../theme/PreferencesContext';
import { Board } from '../components/Board';
import { GameHeader } from '../components/GameHeader';
import { ModeToggle } from '../components/ModeToggle';
import { StatusBanner } from '../components/StatusBanner';
import { useSoundEffects } from '../hooks/useSoundEffects';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withSequence, withTiming, Easing } from 'react-native-reanimated';
import { RotateCcw, Home } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { FloatingOrb } from '../components/FloatingOrb';
import { ParticleEmitter } from '../components/ParticleEmitter';



export default function GameScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const rows = parseInt(params.rows as string) || 9;
  const cols = parseInt(params.cols as string) || 9;
  const mineCount = parseInt(params.mineCount as string) || 10;

  const { isDarkMode } = usePreferences();
  const game = useMinesweeperGame({ rows, cols, mineCount });
  const gameRef = useRef(game);
  React.useLayoutEffect(() => {
    gameRef.current = game;
  });

  const { playDig, playFlag, playChord } = useSoundEffects(game.status, game.cellsRevealed, game.remainingFlags);
  const audioRefs = useRef({ playDig, playFlag, playChord });
  React.useLayoutEffect(() => {
    audioRefs.current = { playDig, playFlag, playChord };
  });

  // Animations for the board container
  const shakeTranslateX = useSharedValue(0);
  const boardScale = useSharedValue(1);

  useEffect(() => {
    if (game.status === 'lost') {
      // Haptic burst + Premium organic shake effect
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      shakeTranslateX.value = withSequence(
        withTiming(-8, { duration: 60, easing: Easing.inOut(Easing.quad) }),
        withTiming(6, { duration: 60, easing: Easing.inOut(Easing.quad) }),
        withTiming(-4, { duration: 60, easing: Easing.inOut(Easing.quad) }),
        withTiming(2, { duration: 60, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 60, easing: Easing.out(Easing.quad) })
      );
    } else if (game.status === 'won') {
      // Triumphant pulse effect
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      boardScale.value = withSequence(
        withTiming(1.05, { duration: 150, easing: Easing.out(Easing.quad) }),
        withTiming(1, { duration: 250, easing: Easing.out(Easing.cubic) })
      );
    } else if (game.status === 'idle') {
      shakeTranslateX.value = 0;
      boardScale.value = 1;
    }
  }, [game.status, shakeTranslateX, boardScale]);

  const animatedBoardStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: shakeTranslateX.value },
        { scale: boardScale.value }
      ]
    };
  });

  const handleCellPressWrapper = useCallback((r: number, c: number) => {
    const currentGame = gameRef.current;
    if (currentGame.status === 'won' || currentGame.status === 'lost') return; 
    
    const cell = currentGame.board[r][c];
    
    // Chording: tapping a revealed number auto-digs neighbors if flags match
    if (cell.state === 'revealed') {
      // Only trigger feedback if the cell has adjacent mines (chording target)
      if (cell.adjacentMines > 0) {
        if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        audioRefs.current.playChord();
      }
      currentGame.handleChordPress(r, c);
      return;
    }
    
    // Flagged cells: in dig mode, ignore completely (flag protects the cell)
    if (cell.state === 'flagged' && currentGame.mode === 'dig') {
      return;
    }

    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    audioRefs.current.playDig();
    currentGame.handleCellPress(r, c);
  }, []);

  const handleLongPressWrapper = useCallback((r: number, c: number) => {
    const currentGame = gameRef.current;
    if (currentGame.status === 'won' || currentGame.status === 'lost') return;
    
    const cell = currentGame.board[r][c];
    if (cell.state === 'revealed') {
      // Long press on revealed = chord (alternative to tap)
      if (cell.adjacentMines > 0) {
        if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }
      currentGame.handleChordPress(r, c);
    } else {
      // Long press on hidden/flagged = toggle flag (always, regardless of mode)
      if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      audioRefs.current.playFlag();
      currentGame.handleRightClick(r, c);
    }
  }, []);

  const handleRightClickWrapper = useCallback((r: number, c: number) => {
    const currentGame = gameRef.current;
    if (currentGame.status === 'won' || currentGame.status === 'lost') return;
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    audioRefs.current.playFlag();
    currentGame.handleRightClick(r, c);
  }, []);

  const darkGradient = ['#050A18', '#0C1230', '#14082E'] as const;
  const lightGradient = ['#F0F4FF', '#E8ECFF', '#FBF0FF'] as const;

  return (
    <LinearGradient 
      colors={isDarkMode ? darkGradient : lightGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      {/* Decorative Orbs */}
      <FloatingOrb size={200} color={isDarkMode ? '#3B82F6' : '#818CF8'} top="-10%" left="-20%" delay={0} />
      <FloatingOrb size={150} color={isDarkMode ? '#F43F5E' : '#FB7185'} top="80%" left="80%" delay={500} />

      <SafeAreaView style={styles.safeArea}>
        {/* Animated Mesh Gradient Background Orbs */}
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <FloatingOrb size={400} color={isDarkMode ? '#3B82F6' : '#60A5FA'} top="-10%" left="-20%" delay={0} opacityMultiplier={0.4} />
          <FloatingOrb size={350} color={isDarkMode ? '#8B5CF6' : '#A78BFA'} top="40%" left="60%" delay={400} opacityMultiplier={0.4} />
          <FloatingOrb size={500} color={isDarkMode ? '#EC4899' : '#F472B6'} top="70%" left="-30%" delay={800} opacityMultiplier={0.4} />
          <BlurView intensity={isDarkMode ? 80 : 100} tint={isDarkMode ? "dark" : "light"} style={StyleSheet.absoluteFill} />
        </View>

        {/* AAA Particle Effects */}
        {game.status === 'won' && (
          <ParticleEmitter x={0} y={0} count={100} colors={['#FCD34D', '#F87171', '#60A5FA', '#34D399']} type="confetti" />
        )}
        {game.status === 'lost' && (
          <ParticleEmitter x={0} y={0} count={80} colors={['#F87171', '#DC2626', '#991B1B', '#FCA5A5']} type="spark" />
        )}

        <View style={styles.headerArea}>
          <GameHeader status={game.status} remainingFlags={game.remainingFlags} />
          <View style={styles.bannerContainer}>
            <StatusBanner status={game.status} />
          </View>
        </View>
        
        <Animated.View style={[styles.boardContainer, animatedBoardStyle]}>
          <Board 
            board={game.board} 
            onCellPress={handleCellPressWrapper} 
            onCellLongPress={handleLongPressWrapper}
            onCellRightClick={handleRightClickWrapper}
            disabled={game.status === 'won' || game.status === 'lost'} 
            triggerMine={game.triggerMine}
          />
        </Animated.View>
        
        <Animated.View entering={FadeInDown.duration(600).easing(Easing.out(Easing.cubic))} style={styles.controls}>
          <ModeToggle mode={game.mode} onSelectMode={game.setMode} />
          
          <View style={styles.actionButtons}>
            <Pressable 
              style={({pressed}) => [
                { borderRadius: 100, overflow: 'hidden' },
                pressed && { transform: [{scale: 0.95}], opacity: 0.8 }
              ]} 
              onPress={() => {
                if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                game.resetGame();
              }}
            >
              <BlurView intensity={40} tint={isDarkMode ? 'dark' : 'light'} style={[styles.actionBtn, {
                borderColor: isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.4)',
                backgroundColor: isDarkMode ? 'rgba(30,41,59,0.3)' : 'rgba(255,255,255,0.4)',
              }]}>
                <RotateCcw size={16} color={isDarkMode ? '#93C5FD' : '#2563EB'} strokeWidth={2.5} />
                <Text style={[styles.actionBtnText, { color: isDarkMode ? '#93C5FD' : '#2563EB' }]}>Restart</Text>
              </BlurView>
            </Pressable>
            
            <Pressable 
              style={({pressed}) => [
                { borderRadius: 100, overflow: 'hidden' },
                pressed && { transform: [{scale: 0.95}], opacity: 0.8 }
              ]} 
              onPress={() => {
                if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.replace('/');
              }}
            >
              <BlurView intensity={40} tint={isDarkMode ? 'dark' : 'light'} style={[styles.actionBtn, {
                borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.3)',
                backgroundColor: isDarkMode ? 'rgba(15,23,42,0.3)' : 'rgba(255,255,255,0.3)',
              }]}>
                <Home size={16} color={isDarkMode ? '#CBD5E1' : '#475569'} strokeWidth={2.5} />
                <Text style={[styles.actionBtnText, { color: isDarkMode ? '#CBD5E1' : '#475569' }]}>Home</Text>
              </BlurView>
            </Pressable>
          </View>
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, overflow: 'hidden' },
  safeArea: { flex: 1 },
  headerArea: { paddingHorizontal: 16, paddingTop: 10, zIndex: 10 },
  bannerContainer: { minHeight: 60, justifyContent: 'center' }, // Reserve space so banner doesn't push board
  boardContainer: { flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12 },
  controls: { paddingHorizontal: 16, paddingBottom: 24, paddingTop: 10, alignItems: 'center' },
  actionButtons: { flexDirection: 'row', justifyContent: 'center', width: '100%', gap: 12 },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 12, paddingHorizontal: 24,
    borderRadius: 100, borderWidth: 1,
  },
  actionBtnText: { fontSize: 13, fontFamily: 'Outfit_700Bold', letterSpacing: 0.5 }
});
