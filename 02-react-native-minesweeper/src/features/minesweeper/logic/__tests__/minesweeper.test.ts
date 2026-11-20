import { describe, expect, it } from 'vitest';
import {
  Cell,
  GameConfig,
  GameState,
  chordCell,
  createInitialState,
  digCell,
  toggleFlag,
} from '../minesweeper';

const DIRS = [-1, 0, 1].flatMap((dr) => [-1, 0, 1].map((dc) => [dr, dc])).filter(([a, b]) => a || b);

/** Builds a deterministic, already-started board with mines at the given [row, col] positions. */
function boardWithMines(rows: number, cols: number, mines: [number, number][]): GameState {
  const config: GameConfig = { rows, cols, mineCount: mines.length };
  const state = createInitialState(config);
  const isMine = new Set(mines.map(([r, c]) => `${r}-${c}`));
  const board: Cell[][] = state.board.map((row) =>
    row.map((cell) => ({
      ...cell,
      isMine: isMine.has(cell.id),
      adjacentMines: DIRS.filter(([dr, dc]) => isMine.has(`${cell.row + dr}-${cell.col + dc}`)).length,
    }))
  );
  return { ...state, board, status: 'playing' };
}

const count = (s: GameState, pred: (c: Cell) => boolean) => s.board.flat().filter(pred).length;

describe('createInitialState', () => {
  it('creates a hidden idle board of the requested size', () => {
    const s = createInitialState({ rows: 9, cols: 7, mineCount: 10 });
    expect(s.board).toHaveLength(9);
    expect(s.board[0]).toHaveLength(7);
    expect(s.status).toBe('idle');
    expect(count(s, (c) => c.state !== 'hidden' || c.isMine)).toBe(0);
  });
});

describe('first dig', () => {
  it('never hits a mine and protects the 3x3 area around the first click', () => {
    for (let trial = 0; trial < 200; trial++) {
      const s = digCell(createInitialState({ rows: 9, cols: 9, mineCount: 30 }), 4, 4);
      expect(s.status).not.toBe('lost');
      for (let r = 3; r <= 5; r++) for (let c = 3; c <= 5; c++) expect(s.board[r][c].isMine).toBe(false);
    }
  });

  it('places exactly the configured number of mines on a normal board', () => {
    const s = digCell(createInitialState({ rows: 16, cols: 16, mineCount: 40 }), 0, 0);
    expect(count(s, (c) => c.isMine)).toBe(40);
    expect(s.config.mineCount).toBe(40);
  });

  it('precomputes adjacent mine counts for every safe cell', () => {
    const s = digCell(createInitialState({ rows: 10, cols: 10, mineCount: 20 }), 5, 5);
    for (const cell of s.board.flat().filter((c) => !c.isMine)) {
      const expected = DIRS.filter(([dr, dc]) => s.board[cell.row + dr]?.[cell.col + dc]?.isMine).length;
      expect(cell.adjacentMines).toBe(expected);
    }
  });
});

describe('iterative flood-fill (BFS)', () => {
  it('reveals the whole connected empty region plus its numbered border', () => {
    const s = digCell(boardWithMines(5, 5, [[0, 0]]), 4, 4);
    expect(count(s, (c) => c.state === 'revealed')).toBe(24); // every safe cell
    expect(s.status).toBe('won');
  });

  it('handles a 300x300 empty board without a call-stack overflow', () => {
    const s = digCell(boardWithMines(300, 300, [[0, 0]]), 299, 299);
    expect(s.cellsRevealed).toBe(300 * 300 - 1);
    expect(s.status).toBe('won');
  });

  it('stops expanding at numbered cells', () => {
    const s = digCell(boardWithMines(1, 5, [[0, 2]]), 0, 0);
    expect(s.board[0].map((c) => c.state)).toEqual(['revealed', 'revealed', 'hidden', 'hidden', 'hidden']);
    expect(s.status).toBe('playing');
  });
});

describe('losing and winning', () => {
  it('digging a mine loses, reveals all mines and records the trigger cell', () => {
    const s = digCell(boardWithMines(4, 4, [[1, 1], [3, 3]]), 1, 1);
    expect(s.status).toBe('lost');
    expect(s.triggerMine).toEqual({ row: 1, col: 1 });
    expect(count(s, (c) => c.isMine && c.state === 'revealed')).toBe(2);
  });

  it('ignores input once the game is over', () => {
    const lost = digCell(boardWithMines(4, 4, [[1, 1]]), 1, 1);
    expect(digCell(lost, 0, 0)).toBe(lost);
    expect(toggleFlag(lost, 0, 0)).toBe(lost);
  });

  it('wins when every safe cell is revealed and auto-flags the mines', () => {
    let s = boardWithMines(2, 2, [[0, 0]]);
    s = digCell(s, 0, 1);
    s = digCell(s, 1, 0);
    expect(s.status).toBe('playing');
    s = digCell(s, 1, 1);
    expect(s.status).toBe('won');
    expect(s.board[0][0].state).toBe('flagged');
  });
});

describe('flags', () => {
  it('toggles flags, never exceeds the mine count and never flags revealed cells', () => {
    let s = boardWithMines(3, 3, [[0, 0]]);
    s = toggleFlag(s, 2, 2);
    expect(s.board[2][2].state).toBe('flagged');
    expect(s.minesFlagged).toBe(1);
    expect(toggleFlag(s, 2, 1)).toBe(s); // only 1 mine, so only 1 flag allowed
    s = toggleFlag(s, 2, 2);
    expect(s.board[2][2].state).toBe('hidden');
    expect(s.minesFlagged).toBe(0);

    s = digCell(boardWithMines(3, 3, [[0, 0]]), 1, 1);
    expect(toggleFlag(s, 1, 1)).toBe(s);
  });

  it('does not dig flagged cells', () => {
    let s = boardWithMines(3, 3, [[0, 0]]);
    s = toggleFlag(s, 0, 0);
    expect(digCell(s, 0, 0)).toBe(s);
  });
});

describe('chording', () => {
  it('reveals neighbours when the flag count matches the number', () => {
    let s = boardWithMines(3, 3, [[0, 0]]);
    s = digCell(s, 1, 1); // shows "1"
    s = toggleFlag(s, 0, 0);
    s = chordCell(s, 1, 1);
    expect(s.status).toBe('won');
  });

  it('does nothing when the flag count does not match, and loses on a wrong flag', () => {
    let s = boardWithMines(3, 3, [[0, 0]]);
    s = digCell(s, 1, 1);
    expect(chordCell(s, 1, 1)).toBe(s);
    s = toggleFlag(s, 0, 1); // wrong cell
    const after = chordCell(s, 1, 1);
    expect(after.status).toBe('lost');
  });
});
