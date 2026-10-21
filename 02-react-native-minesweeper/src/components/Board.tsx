import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Cell as CellType } from '../features/minesweeper/logic/minesweeper';
import { Cell } from './Cell';
import { usePreferences } from '../theme/PreferencesContext';


/**
 * Props for the Minesweeper Board component.
 */
interface BoardProps {
  board: CellType[][];
  onCellPress: (row: number, col: number) => void;
  onCellLongPress?: (row: number, col: number) => void;
  onCellRightClick?: (row: number, col: number) => void;
  disabled?: boolean;
  triggerMine?: { row: number; col: number };
}

/**
 * Premium game board with frosted glass container and cinematic depth.
 */
export const Board: React.FC<BoardProps> = ({ board, onCellPress, onCellLongPress, onCellRightClick, disabled = false, triggerMine }) => {
  const { isDarkMode } = usePreferences();
  const rows = board.length;
  const cols = board[0].length;
  const ratio = cols / rows;

  const pressRef = React.useRef(onCellPress);
  const longPressRef = React.useRef(onCellLongPress);
  const rightClickRef = React.useRef(onCellRightClick);

  React.useLayoutEffect(() => {
    pressRef.current = onCellPress;
    longPressRef.current = onCellLongPress;
    rightClickRef.current = onCellRightClick;
  });

  const makePress = React.useCallback((r: number, c: number) => () => pressRef.current(r, c), []);
  const makeLongPress = React.useCallback((r: number, c: number) => () => longPressRef.current?.(r, c), []);
  const makeRightClick = React.useCallback((r: number, c: number) => () => rightClickRef.current?.(r, c), []);

  return (
    <View style={styles.outerContainer}>
      <View style={[
        styles.board, 
        { 
          backgroundColor: isDarkMode ? 'rgba(8,12,28,0.7)' : 'rgba(255,255,255,0.5)',
          borderColor: isDarkMode ? 'rgba(30,41,59,0.6)' : 'rgba(203,213,225,0.5)',
          aspectRatio: ratio,
          shadowColor: isDarkMode ? '#000' : '#64748B',
        }
      ]}>
        <View style={styles.paddingWrapper}>
          {board.map((row, rIndex) => (
            <View key={`row-${rIndex}`} style={styles.row}>
              {row.map((cell, cIndex) => (
                <Cell 
                  key={cell.id} 
                  cell={cell} 
                  isDark={isDarkMode} 
                  onPress={makePress(rIndex, cIndex)} 
                  onLongPress={makeLongPress(rIndex, cIndex)} 
                  onRightClick={onCellRightClick ? makeRightClick(rIndex, cIndex) : undefined}
                  boardDisabled={disabled}
                  isTriggerMine={triggerMine?.row === rIndex && triggerMine?.col === cIndex}
                />
              ))}
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  board: { 
    flex: 1,
    maxHeight: '100%',
    maxWidth: '100%',
    flexDirection: 'column', 
    borderRadius: 20,
    borderWidth: 2,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 10,
    overflow: 'hidden',
  },
  paddingWrapper: { flex: 1, padding: 6 },
  row: { flex: 1, flexDirection: 'row' },
});
