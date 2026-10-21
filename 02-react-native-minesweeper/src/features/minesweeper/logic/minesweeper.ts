/**
 * Pure Minesweeper game engine.
 * Independent of React/React Native UI.
 */

export type CellState = 'hidden' | 'revealed' | 'flagged';

export interface Cell {
  id: string;
  row: number;
  col: number;
  isMine: boolean;
  state: CellState;
  adjacentMines: number;
}

export interface GameConfig {
  rows: number;
  cols: number;
  mineCount: number;
}

export type GameStatus = 'idle' | 'playing' | 'won' | 'lost';

export interface GameState {
  board: Cell[][];
  status: GameStatus;
  config: GameConfig;
  minesFlagged: number;
  cellsRevealed: number;
  triggerMine?: { row: number; col: number };
}

const DIRECTIONS = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1], [0, 1],
  [1, -1], [1, 0], [1, 1],
];

/**
 * Validates if coordinates are within the board boundaries.
 */
const isValidCoordinate = (r: number, c: number, rows: number, cols: number): boolean => {
  return r >= 0 && r < rows && c >= 0 && c < cols;
};

/**
 * Gets all valid neighboring coordinates (up to 8).
 */
const getNeighbors = (r: number, c: number, rows: number, cols: number): [number, number][] => {
  const neighbors: [number, number][] = [];
  for (const [dr, dc] of DIRECTIONS) {
    const nr = r + dr;
    const nc = c + dc;
    if (isValidCoordinate(nr, nc, rows, cols)) {
      neighbors.push([nr, nc]);
    }
  }
  return neighbors;
};

/**
 * Creates the initial empty board.
 */
export const createInitialState = (config: GameConfig): GameState => {
  const board: Cell[][] = [];
  for (let r = 0; r < config.rows; r++) {
    const row: Cell[] = [];
    for (let c = 0; c < config.cols; c++) {
      row.push({
        id: `${r}-${c}`,
        row: r,
        col: c,
        isMine: false,
        state: 'hidden',
        adjacentMines: 0,
      });
    }
    board.push(row);
  }

  return {
    board,
    status: 'idle',
    config,
    minesFlagged: 0,
    cellsRevealed: 0,
  };
};

/**
 * Places mines randomly on the board.
 * Ensures the very first clicked cell and its immediate 8 neighbors are protected
 * to guarantee the player gets a fair, expansive start on their first move.
 * 
 * @param board The current un-mined board
 * @param config Game configuration (rows, cols, mine count)
 * @param safeRow The row index of the first clicked cell
 * @param safeCol The col index of the first clicked cell
 * @returns An updated board with mines, and the actual number of mines successfully placed
 */
const placeMines = (
  board: Cell[][],
  config: GameConfig,
  safeRow: number,
  safeCol: number
): { board: Cell[][]; actualMineCount: number } => {
  const { rows, cols, mineCount } = config;
  // Deep clone the board structurally to avoid mutating the original
  const newBoard = board.map(row => row.map(cell => ({ ...cell })));

  // Track protected cells for first-dig safety (a 3x3 grid around the first click)
  const safeZone = new Set<string>();
  safeZone.add(`${safeRow}-${safeCol}`);
  const neighbors = getNeighbors(safeRow, safeCol, rows, cols);
  for (const [nr, nc] of neighbors) {
    safeZone.add(`${nr}-${nc}`);
  }

  let minesPlaced = 0;
  // Fallback to avoid infinite loops if the board is too small for the requested mine count
  const maxAvailableCells = (rows * cols) - safeZone.size;
  const actualMineCount = Math.min(mineCount, maxAvailableCells);

  // Randomly distribute mines until we hit the target actualMineCount
  while (minesPlaced < actualMineCount) {
    const r = Math.floor(Math.random() * rows);
    const c = Math.floor(Math.random() * cols);
    const key = `${r}-${c}`;

    // Place a mine if it doesn't already have one, and isn't in the protected safe zone
    if (!newBoard[r][c].isMine && !safeZone.has(key)) {
      newBoard[r][c].isMine = true;
      minesPlaced++;
    }
  }

  // Pre-calculate adjacent mines (numbers) for all non-mined cells
  // This drastically improves render performance during gameplay
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!newBoard[r][c].isMine) {
        let count = 0;
        const cellNeighbors = getNeighbors(r, c, rows, cols);
        for (const [nr, nc] of cellNeighbors) {
          if (newBoard[nr][nc].isMine) count++;
        }
        newBoard[r][c].adjacentMines = count;
      }
    }
  }

  return { board: newBoard, actualMineCount };
};

/**
 * Core dig action. Handles first-dig initialization, iterative flood-fill for safe areas, and win/loss state resolution.
 * 
 * @param state The current game state
 * @param r The row index to dig
 * @param c The col index to dig
 * @returns A strictly new game state object containing the updated board and status
 */
export const digCell = (state: GameState, r: number, c: number): GameState => {
  if (state.status === 'lost' || state.status === 'won') return state;
  if (state.board[r][c].state === 'flagged') return state;

  let currentBoard = state.board;
  let currentStatus = state.status;
  let currentState = state;

  if (currentStatus === 'idle') {
    const result = placeMines(currentState.board, currentState.config, r, c);
    currentBoard = result.board;
    currentState = { ...currentState, config: { ...currentState.config, mineCount: result.actualMineCount } };
    currentStatus = 'playing';
  }

  if (currentBoard[r][c].state !== 'hidden') return { ...currentState, board: currentBoard, status: currentStatus };

  // Hit a mine
  if (currentBoard[r][c].isMine) {
    const newBoard = currentBoard.map(row => [...row]);
    for (let i = 0; i < newBoard.length; i++) {
      for (let j = 0; j < newBoard[i].length; j++) {
        const cell = newBoard[i][j];
        if (cell.isMine && cell.state === 'hidden') {
          newBoard[i][j] = { ...cell, state: 'revealed' };
        }
      }
    }
    return { ...currentState, board: newBoard, status: 'lost', triggerMine: { row: r, col: c } };
  }

  // Iterative BFS for flood-fill (avoids max call stack errors on large boards)
  const newBoard = currentBoard.map(row => [...row]); // Structural sharing: only copy rows
  const queue: [number, number][] = [[r, c]];
  let queueIndex = 0; // O(1) dequeue without shift()
  let newlyRevealed = 0;

  // Reveal the initial cell
  if (newBoard[r][c].state === 'hidden') {
    newBoard[r][c] = { ...newBoard[r][c], state: 'revealed' };
    newlyRevealed++;
  }

  while (queueIndex < queue.length) {
    const [currR, currC] = queue[queueIndex++];
    const cell = newBoard[currR][currC];

    // Only continue expanding if the cell has no adjacent mines
    if (cell.adjacentMines === 0) {
      const neighbors = getNeighbors(currR, currC, currentState.config.rows, currentState.config.cols);
      for (const [nr, nc] of neighbors) {
        if (newBoard[nr][nc].state === 'hidden') {
          // Reveal immediately to prevent duplicate queuing
          newBoard[nr][nc] = { ...newBoard[nr][nc], state: 'revealed' };
          newlyRevealed++;
          queue.push([nr, nc]);
        }
      }
    }
  }

  const totalRevealed = currentState.cellsRevealed + newlyRevealed;
  const totalSafeCells = (currentState.config.rows * currentState.config.cols) - currentState.config.mineCount;
  const isWon = totalRevealed === totalSafeCells;

  let finalBoard = newBoard;
  let finalMinesFlagged = currentState.minesFlagged;

  if (isWon) {
    finalBoard = newBoard.map(row => row.map(cell => {
      if (cell.isMine && cell.state !== 'flagged') {
        finalMinesFlagged++;
        return { ...cell, state: 'flagged' as CellState };
      }
      return cell;
    }));
  }

  return {
    ...currentState,
    board: finalBoard,
    status: isWon ? 'won' : currentStatus,
    cellsRevealed: totalRevealed,
    minesFlagged: isWon ? finalMinesFlagged : currentState.minesFlagged,
  };
};

/**
 * Flag or unflag a hidden cell.
 */
export const toggleFlag = (state: GameState, r: number, c: number): GameState => {
  if (state.status === 'lost' || state.status === 'won') return state;

  const cell = state.board[r][c];
  if (cell.state === 'revealed') return state;

  const newBoard = state.board.map(row => [...row]);
  const newCell = { ...cell };

  let flagDelta = 0;
  if (newCell.state === 'hidden') {
    if (state.minesFlagged >= state.config.mineCount) {
      // Cannot place more flags than there are mines
      return state;
    }
    newCell.state = 'flagged';
    flagDelta = 1;
  } else if (newCell.state === 'flagged') {
    newCell.state = 'hidden';
    flagDelta = -1;
  }

  newBoard[r][c] = newCell;

  return {
    ...state,
    board: newBoard,
    minesFlagged: state.minesFlagged + flagDelta,
  };
};

/**
 * Chording (Quick Reveal). Reveals all adjacent hidden cells if the flag count matches the cell's mine count.
 */
export const chordCell = (state: GameState, r: number, c: number): GameState => {
  if (state.status !== 'playing') return state;
  const cell = state.board[r][c];

  if (cell.state !== 'revealed' || cell.adjacentMines === 0) return state;

  let flagCount = 0;
  const neighbors = getNeighbors(r, c, state.config.rows, state.config.cols);
  for (const [nr, nc] of neighbors) {
    if (state.board[nr][nc].state === 'flagged') flagCount++;
  }

  if (flagCount === cell.adjacentMines) {
    let currentState = state;
    for (const [nr, nc] of neighbors) {
      if (currentState.board[nr][nc].state === 'hidden') {
        currentState = digCell(currentState, nr, nc);
        if (currentState.status === 'lost' || currentState.status === 'won') break;
      }
    }
    return currentState;
  }

  return state;
};
