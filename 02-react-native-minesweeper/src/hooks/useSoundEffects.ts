import { useEffect, useRef, useCallback } from 'react';
import { Platform } from 'react-native';
import { useAudioPlayer, AudioPlayer } from 'expo-audio';
import { usePreferences } from '../theme/PreferencesContext';
import { GameStatus } from '../features/minesweeper/logic/minesweeper';

const isWeb = Platform.OS === 'web';
const webAudioCtx = isWeb && typeof window !== 'undefined' ? new (window.AudioContext || (window as any).webkitAudioContext)() : null;
const audioBuffers: Record<number, AudioBuffer> = {};

const playWebAudio = async (sourceModule: number) => {
  if (!webAudioCtx) return;
  try {
    if (webAudioCtx.state === 'suspended') {
      await webAudioCtx.resume();
    }
    let buffer = audioBuffers[sourceModule];
    if (!buffer) {
      const response = await fetch(sourceModule as any);
      const arrayBuffer = await response.arrayBuffer();
      buffer = await webAudioCtx.decodeAudioData(arrayBuffer);
      audioBuffers[sourceModule] = buffer;
    }
    const source = webAudioCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(webAudioCtx.destination);
    source.start(0);
  } catch (e) {
    console.warn('Web Audio error:', e);
  }
};

const DIG_ASSET = require('../../assets/sounds/dig.wav');
const FLAG_ASSET = require('../../assets/sounds/flag.wav');
const CHORD_ASSET = require('../../assets/sounds/chord.wav');
const BOMB_ASSET = require('../../assets/sounds/bomb.wav');
const WIN_ASSET = require('../../assets/sounds/win.wav');

/**
 * Hook to manage sound effects for the game.
 * Uses Web Audio API directly on Web to avoid Media Keys interference,
 * and falls back to expo-audio (if needed) on Native platforms.
 * 
 * @param status The current status of the game (playing, won, lost)
 * @returns Object containing sound playback functions
 */
export const useSoundEffects = (status: GameStatus, cellsRevealed: number, minesFlagged: number) => {
  const { soundEnabled } = usePreferences();
  
  const prevStatusRef = useRef<GameStatus>(status);

  const digPlayer = useAudioPlayer(isWeb ? null : DIG_ASSET);
  const flagPlayer = useAudioPlayer(isWeb ? null : FLAG_ASSET);
  const chordPlayer = useAudioPlayer(isWeb ? null : CHORD_ASSET);
  const bombPlayer = useAudioPlayer(isWeb ? null : BOMB_ASSET);
  const winPlayer = useAudioPlayer(isWeb ? null : WIN_ASSET);

  const safePlay = useCallback((player: AudioPlayer | null, assetModule: number) => {
    if (!soundEnabled) return;
    
    if (isWeb) {
      playWebAudio(assetModule);
      return;
    }

    if (!player) return;
    try {
      if (typeof (player as any).seekTo === 'function') {
        (player as any).seekTo(0);
      } else if (player.currentTime !== undefined) {
        player.currentTime = 0;
      }
      player.play();
    } catch (e) {
      console.warn('Audio error:', e);
    }
  }, [soundEnabled]);

  // Handle Win / Loss sounds
  useEffect(() => {
    if (!soundEnabled) return;

    if (prevStatusRef.current !== status) {
      if (status === 'won') {
        safePlay(winPlayer, WIN_ASSET);
      } else if (status === 'lost') {
        safePlay(bombPlayer, BOMB_ASSET);
      }
      prevStatusRef.current = status;
    }
  }, [status, soundEnabled, winPlayer, bombPlayer, safePlay]);

  // Export imperative play functions so the UI can trigger exactly what it needs
  const playDig = useCallback(() => safePlay(digPlayer, DIG_ASSET), [digPlayer, safePlay]);
  const playFlag = useCallback(() => safePlay(flagPlayer, FLAG_ASSET), [flagPlayer, safePlay]);
  const playChord = useCallback(() => safePlay(chordPlayer, CHORD_ASSET), [chordPlayer, safePlay]);

  return { playDig, playFlag, playChord };
};
