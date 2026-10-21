import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';
import { lightTheme, darkTheme, ThemeColors } from './colors';

interface Preferences {
  soundEnabled: boolean;
  theme: 'light' | 'dark' | 'system';
}

interface PreferencesContextType extends Preferences {
  setSoundEnabled: (val: boolean) => void;
  setTheme: (val: 'light' | 'dark' | 'system') => void;
  activeTheme: 'light' | 'dark';
  isDarkMode: boolean;
  colors: ThemeColors;
}

const defaultPrefs: Preferences = {
  soundEnabled: true,
  theme: 'system',
};

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export const PreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemTheme = useColorScheme() || 'light';
  const [prefs, setPrefs] = useState<Preferences>(defaultPrefs);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('@minesweeper_prefs').then(data => {
      if (data) {
        try {
          setPrefs(JSON.parse(data));
        } catch {
          // ignore
        }
      }
      setLoaded(true);
    });
  }, []);

  const savePrefs = (newPrefs: Preferences) => {
    setPrefs(newPrefs);
    AsyncStorage.setItem('@minesweeper_prefs', JSON.stringify(newPrefs));
  };

  const setSoundEnabled = React.useCallback((val: boolean) => savePrefs({ ...prefs, soundEnabled: val }), [prefs]);
  const setTheme = React.useCallback((val: 'light' | 'dark' | 'system') => savePrefs({ ...prefs, theme: val }), [prefs]);

  const activeTheme = (prefs.theme === 'system' ? systemTheme : prefs.theme) as 'light' | 'dark';
  const isDarkMode = activeTheme === 'dark';
  const colors = isDarkMode ? darkTheme : lightTheme;

  const value = useMemo(() => ({
    ...prefs,
    setSoundEnabled,
    setTheme,
    activeTheme,
    isDarkMode,
    colors
  }), [prefs, setSoundEnabled, setTheme, activeTheme, isDarkMode, colors]);

  if (!loaded) return null;

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
};

export const usePreferences = () => {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error('usePreferences must be used within PreferencesProvider');
  return ctx;
};
