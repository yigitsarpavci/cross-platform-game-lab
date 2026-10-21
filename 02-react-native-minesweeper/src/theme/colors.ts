/**
 * Studio-grade color palette for Smash Minesweeper.
 * Designed with cinematic depth, neon accents, and rich contrast.
 */

export const lightTheme = {
  // Canvas
  background: '#F0F4F8',
  backgroundSecondary: '#E2E8F0',
  text: '#0F172A',
  textSecondary: '#475569',

  // Board
  boardBackground: '#CBD5E1',
  boardBorder: '#94A3B8',

  // Cells — soft clay feel in light mode
  cellHidden: '#E8EDF2',
  cellRevealed: '#D5DCE5',
  cellMine: '#FECDD3',
  cellBorder: '#B0BEC5',

  // Header — dark LED panel even in light mode
  headerBackground: '#FFFFFF',
  headerBorder: '#E2E8F0',
  boxBackground: '#0C0F1A',
  boxText: '#F43F5E',

  // Buttons
  primaryButton: '#3B82F6',
  secondaryButton: '#94A3B8',
  dangerButton: '#EF4444',
  buttonText: '#FFFFFF',

  // Toggle & Status
  toggleBackground: '#E2E8F0',
  toggleActive: '#FFFFFF',
  bannerWon: '#059669',
  bannerLost: '#DC2626',
  bannerText: '#FFFFFF',

  // 3D Bevel
  bevelLight: '#FFFFFF',
  bevelMid: '#CBD5E1',
  bevelDark: '#8897AE',
};

export const darkTheme = {
  // Canvas — cinematic deep blue-black
  background: '#080D1A',
  backgroundSecondary: '#0E1525',
  text: '#F1F5F9',
  textSecondary: '#8899AA',

  // Board
  boardBackground: '#0F1729',
  boardBorder: '#1E293B',

  // Cells — metallic gunmetal feel
  cellHidden: '#1A2540',
  cellRevealed: '#0D1424',
  cellMine: '#7F1D1D',
  cellBorder: '#0A0F1C',

  // Header — ultra-dark LED panel
  headerBackground: '#111827',
  headerBorder: '#1E293B',
  boxBackground: '#020408',
  boxText: '#FF3B5C',

  // Buttons
  primaryButton: '#3B82F6',
  secondaryButton: '#334155',
  dangerButton: '#E11D48',
  buttonText: '#FFFFFF',

  // Toggle & Status
  toggleBackground: '#111827',
  toggleActive: '#1E3A5F',
  bannerWon: '#10B981',
  bannerLost: '#F43F5E',
  bannerText: '#F8FAFC',

  // 3D Bevel — deeper for stronger relief
  bevelLight: '#2A3F5F',
  bevelMid: '#162032',
  bevelDark: '#040810',
};

export type ThemeColors = typeof lightTheme;

