import { useReducer, useCallback } from 'react';
import {
  GameState,
  GameConfig,
  createInitialState,
  digCell,
  toggleFlag,
  chordCell
} from '../logic/minesweeper';

export type InteractionMode = 'dig' | 'flag';

export interface MinesweeperHookState extends GameState {
  mode: InteractionMode;
}

type Action =
  | { type: 'START_GAME'; config: GameConfig }
  | { type: 'RESET_GAME' }
  | { type: 'PRESS_CELL'; row: number; col: number }
  | { type: 'TOGGLE_FLAG'; row: number; col: number }
  | { type: 'CHORD_CELL'; row: number; col: number }
  | { type: 'TOGGLE_MODE' }
  | { type: 'SET_MODE'; mode: InteractionMode };

const reducer = (state: MinesweeperHookState, action: Action): MinesweeperHookState => {
  switch (action.type) {
    case 'START_GAME':
      return {
        ...createInitialState(action.config),
        mode: 'dig',
      };
      
    case 'RESET_GAME':
      return {
        ...createInitialState(state.config),
        mode: state.mode,
      };
      
    case 'TOGGLE_MODE':
      return {
        ...state,
        mode: state.mode === 'dig' ? 'flag' : 'dig',
      };
      
    case 'SET_MODE':
      return {
        ...state,
        mode: action.mode,
      };
      
    case 'PRESS_CELL': {
      if (state.status === 'won' || state.status === 'lost') {
        return state;
      }
      
      const { row, col } = action;
      
      if (state.mode === 'dig') {
        const nextState = digCell(state, row, col);
        if (nextState === state) return state;
        return { ...nextState, mode: state.mode };
      } else {
        const nextState = toggleFlag(state, row, col);
        if (nextState === state) return state;
        return { ...nextState, mode: state.mode };
      }
    }
    
    case 'TOGGLE_FLAG': {
      if (state.status === 'won' || state.status === 'lost') {
        return state;
      }
      const nextState = toggleFlag(state, action.row, action.col);
      if (nextState === state) return state;
      return { ...nextState, mode: state.mode };
    }
    
    case 'CHORD_CELL': {
      if (state.status === 'won' || state.status === 'lost') {
        return state;
      }
      
      const nextState = chordCell(state, action.row, action.col);
      if (nextState === state) return state;
      return { ...nextState, mode: state.mode };
    }
      
    default:
      return state;
  }
};

/**
 * Custom React Hook managing the Minesweeper game state and interactions.
 * Encapsulates the reducer and exposes memoized callbacks for the UI.
 *
 * @param initialConfig The initial board configuration (rows, cols, mines).
 * @returns An object containing the current state and action handlers.
 */
export const useMinesweeperGame = (initialConfig: GameConfig) => {
  const [state, dispatch] = useReducer(reducer, {
    ...createInitialState(initialConfig),
    mode: 'dig',
  });

  const handleCellPress = useCallback((row: number, col: number) => {
    dispatch({ type: 'PRESS_CELL', row, col });
  }, []);

  const handleRightClick = useCallback((row: number, col: number) => {
    dispatch({ type: 'TOGGLE_FLAG', row, col });
  }, []);

  const handleChordPress = useCallback((row: number, col: number) => {
    dispatch({ type: 'CHORD_CELL', row, col });
  }, []);

  const toggleMode = useCallback(() => {
    dispatch({ type: 'TOGGLE_MODE' });
  }, []);

  const setMode = useCallback((mode: InteractionMode) => {
    dispatch({ type: 'SET_MODE', mode });
  }, []);

  const resetGame = useCallback(() => {
    dispatch({ type: 'RESET_GAME' });
  }, []);

  const startGame = useCallback((config: GameConfig) => {
    dispatch({ type: 'START_GAME', config });
  }, []);

  const getStatusMessage = useCallback((): string => {
    switch (state.status) {
      case 'idle':
      case 'playing':
        return `Mines: ${Math.max(0, state.config.mineCount - state.minesFlagged)}`;
      case 'won':
        return 'You Won! 🎉';
      case 'lost':
        return 'Game Over 💥';
      default:
        return '';
    }
  }, [state.status, state.config.mineCount, state.minesFlagged]);
  
  const remainingFlags = state.config.mineCount - state.minesFlagged;

  return {
    board: state.board,
    status: state.status,
    config: state.config,
    mode: state.mode,
    remainingFlags,
    cellsRevealed: state.cellsRevealed,
    triggerMine: state.triggerMine,
    handleCellPress,
    handleRightClick,
    handleChordPress,
    toggleMode,
    setMode,
    resetGame,
    startGame,
    getStatusMessage,
  };
};
