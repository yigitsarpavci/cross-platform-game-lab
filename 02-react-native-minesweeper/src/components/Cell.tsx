import React, { useEffect, useRef } from 'react';
import { Pressable, Text, StyleSheet, View, Platform } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { Cell as CellType } from '../features/minesweeper/logic/minesweeper';
import { Flag, Bomb } from 'lucide-react-native';

interface CellProps {
  cell: CellType;
  isDark: boolean;
  onPress: () => void;
  onLongPress: () => void;
  onRightClick?: () => void;
  boardDisabled?: boolean;
  isTriggerMine?: boolean;
}

/**
 * Premium tactile cell with 3D beveled edges, spring animations,
 * and neon-glow number coloring.
 */
export const Cell = React.memo(({ cell, isDark, onPress, onLongPress, onRightClick, boardDisabled = false, isTriggerMine = false }: CellProps) => {
  const isRevealed = cell.state === 'revealed';
  const isFlagged = cell.state === 'flagged';
  
  const scaleAnim = useSharedValue(1);
  const opacityAnim = useSharedValue(1);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (isRevealed) {
      scaleAnim.value = 0.5;
      opacityAnim.value = 0.3;
      scaleAnim.value = withTiming(1, { duration: 250, easing: Easing.out(Easing.cubic) });
      opacityAnim.value = withTiming(1, { duration: 250, easing: Easing.out(Easing.quad) });
    } else if (cell.state === 'hidden') {
      scaleAnim.value = 1;
      opacityAnim.value = 1;
    }
  }, [isRevealed, cell.state, scaleAnim, opacityAnim]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleAnim.value }],
    opacity: opacityAnim.value,
  }));

  // ── Content rendering ──
  let content = null;
  if (isFlagged) {
    content = (
      <View style={styles.flagContainer}>
        <Flag size={16} color="#F43F5E" fill="#F43F5E" strokeWidth={1.5} />
      </View>
    );
  } else if (isRevealed) {
    if (cell.isMine) {
      content = (
        <View style={[styles.mineContainer, isTriggerMine && styles.triggerMineContainer]}>
          <Bomb size={18} color={isTriggerMine ? '#FFFFFF' : (isDark ? '#F87171' : '#DC2626')} strokeWidth={2.5} />
        </View>
      );
    } else if (cell.adjacentMines > 0) {
      content = (
        <Text style={[styles.text, getNumberStyle(cell.adjacentMines, isDark)]}>
          {cell.adjacentMines}
        </Text>
      );
    }
  }

  // ── Cell visual style based on state ──
  const cellStyles = isRevealed 
    ? [
        styles.bgLayer,
        styles.revealedCell,
        {
          backgroundColor: cell.isMine 
            ? (isTriggerMine ? '#DC2626' : (isDark ? 'rgba(127,29,29,0.6)' : 'rgba(254,202,202,0.7)'))
            : (isDark ? 'rgba(8,12,28,0.5)' : 'rgba(226,232,240,0.6)'),
          borderColor: isDark ? 'rgba(30,41,59,0.5)' : 'rgba(203,213,225,0.5)',
        }
      ]
    : [
        styles.bgLayer,
        styles.hiddenCell,
        {
          backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
          // 3D beveled borders
          borderTopColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.95)',
          borderLeftColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.7)',
          borderBottomColor: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.2)',
          borderRightColor: isDark ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.12)',
        },
        isFlagged && {
          backgroundColor: isDark ? '#1A2744' : '#FFF7ED',
          borderBottomColor: isDark ? 'rgba(244,63,94,0.3)' : 'rgba(244,63,94,0.15)',
        }
      ];

  const pressedStyle = !isRevealed ? {
    borderTopColor: isDark ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.12)',
    borderLeftColor: isDark ? 'rgba(0,0,0,0.25)' : 'rgba(0,0,0,0.06)',
    borderBottomColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.5)',
    borderRightColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.3)',
    borderTopWidth: 3,
    borderBottomWidth: 1.5,
  } : undefined;

  return (
    <Pressable
      style={styles.container}
      onPress={onPress}
      delayLongPress={400}
      onLongPress={onLongPress}
      accessibilityRole="button"
      accessibilityLabel={`${cell.state === 'hidden' ? 'Hidden cell' : cell.state === 'flagged' ? 'Flagged cell' : `Revealed cell, ${cell.adjacentMines} mines around`}`}
      // @ts-ignore - React Native Web specific event
      onContextMenu={(e: unknown) => {
        if (onRightClick) {
          const event = e as { preventDefault: () => void };
          if (typeof event.preventDefault === 'function') event.preventDefault();
          onRightClick();
        }
      }}
      accessibilityState={{ disabled: isRevealed || boardDisabled }}
    >
      {({ pressed }) => (
        <>
          <View style={[...cellStyles, pressed && pressedStyle]} />
          {!isRevealed && (
            <View style={[styles.reflectionLayer, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.35)' }]} pointerEvents="none" />
          )}
          {isRevealed && (
            <View style={[styles.innerShadow, { 
              borderTopColor: isDark ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.15)',
              borderLeftColor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.08)'
            }]} pointerEvents="none" />
          )}
          <Animated.View style={[styles.inner, animStyle, pressed && !isRevealed && { transform: [{ scale: 0.92 }] }]}>
            {content}
          </Animated.View>
        </>
      )}
    </Pressable>
  );
}, (prev, next) => {
  return prev.cell === next.cell && prev.isDark === next.isDark && prev.boardDisabled === next.boardDisabled && prev.isTriggerMine === next.isTriggerMine;
});

Cell.displayName = 'Cell';

/**
 * Premium number styling with neon glow effects per mine-adjacency count.
 * Each number has a unique vibrant color with a matching soft text shadow.
 */
const getNumberStyle = (mines: number, isDark: boolean) => {
  const colors = isDark 
    ? ['#60A5FA', '#34D399', '#F87171', '#A78BFA', '#FBBF24', '#38BDF8', '#F472B6', '#C084FC']
    : ['#2563EB', '#059669', '#DC2626', '#7C3AED', '#D97706', '#0284C7', '#DB2777', '#7C3AED'];
  
  const color = colors[mines - 1] || (isDark ? '#64748B' : '#94A3B8');
  return { 
    color,
    textShadowColor: isDark ? `${color}80` : `${color}40`,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: isDark ? 6 : 3,
  };
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, margin: 1.5, justifyContent: 'center', alignItems: 'center',
    // No borders or background here, strictly layout dimensions
  },
  bgLayer: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: 5,
  },
  hiddenCell: {
    borderTopWidth: 2, borderLeftWidth: 2,
    borderBottomWidth: 3.5, borderRightWidth: 2.5,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15, shadowRadius: 2, elevation: 2,
  },
  revealedCell: {
    borderWidth: 0.5,
  },
  reflectionLayer: {
    position: 'absolute', top: 1, left: 1, right: 1, height: '35%', borderRadius: 3,
  },
  innerShadow: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    borderTopWidth: 2, borderLeftWidth: 2, borderRadius: 5,
  },
  inner: { 
    flex: 1, justifyContent: 'center', alignItems: 'center', 
    width: '100%', height: '100%',
  },
  text: {
    fontSize: Platform.OS === 'web' ? 15 : 14,
    fontFamily: 'Outfit_900Black',
    textAlign: 'center',
    includeFontPadding: false,
  },
  flagContainer: {
    alignItems: 'center', justifyContent: 'center',
  },
  mineContainer: {
    alignItems: 'center', justifyContent: 'center',
  },
  triggerMineContainer: {
    // The trigger mine cell itself has a red bg, so just center the icon
  },
});
