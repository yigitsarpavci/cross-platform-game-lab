import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Platform, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { usePreferences } from '../theme/PreferencesContext';
import Animated, { 
  FadeInUp, FadeInDown, useAnimatedStyle, useSharedValue, 
  withTiming, withRepeat, withSequence, Easing,
  interpolate, 
} from 'react-native-reanimated';
import { Sprout, Flame, Skull, LucideIcon, Settings as SettingsIcon, Bomb, X, ChevronRight, Volume2, VolumeX, Moon, Sun } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { FloatingOrb } from '../components/FloatingOrb';


// ── Difficulty Card ──
interface DifficultyCardProps {
  title: string;
  desc: string;
  Icon: LucideIcon;
  color: string;
  glowColor: string;
  onPress: () => void;
  delay: number;
  isDark: boolean;
}

const DifficultyCard: React.FC<DifficultyCardProps> = ({ title, desc, Icon, color, glowColor, onPress, delay, isDark }) => {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  
  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(300).easing(Easing.out(Easing.cubic))} style={[{ width: '100%', marginVertical: 6 }, animatedStyle]}>
      <Pressable 
        style={({pressed}) => [
          styles.diffCard, 
          { 
            borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.7)',
            backgroundColor: isDark ? 'rgba(15,23,42,0.65)' : 'rgba(255,255,255,0.75)',
          }, 
          pressed && { 
            backgroundColor: isDark ? 'rgba(15,23,42,0.9)' : 'rgba(255,255,255,0.95)',
          }
        ]}
        // eslint-disable-next-line react-hooks/immutability
        onPressIn={() => { scale.value = withTiming(0.97, { duration: 120, easing: Easing.out(Easing.quad) }); }}
        // eslint-disable-next-line react-hooks/immutability
        onPressOut={() => { scale.value = withTiming(1, { duration: 250, easing: Easing.out(Easing.cubic) }); }}
        onPress={onPress}
      >
        {/* Glowing icon container */}
        <View style={[styles.diffIconOuter, { shadowColor: glowColor }]}>
          <LinearGradient
            colors={isDark ? [`${color}30`, `${color}10`] as const : [`${color}20`, `${color}08`] as const}
            style={styles.diffIconGradient}
          >
            <View style={[styles.diffIconRing, { borderColor: `${color}40` }]}>
              <Icon size={22} color={color} strokeWidth={2.5} />
            </View>
          </LinearGradient>
        </View>

        <View style={styles.diffTextContainer}>
          <Text style={[styles.diffTitle, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>{title}</Text>
          <Text style={[styles.diffDesc, { color: isDark ? '#64748B' : '#94A3B8' }]}>{desc}</Text>
        </View>
        
        <View style={[styles.diffArrow, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)' }]}>
          <ChevronRight size={18} color={isDark ? '#475569' : '#CBD5E1'} strokeWidth={2.5} />
        </View>
      </Pressable>
    </Animated.View>
  );
};

// ── Home Screen ──
export default function HomeScreen() {
  const router = useRouter();
  const { isDarkMode, soundEnabled, setSoundEnabled, setTheme } = usePreferences();
  const [showSettings, setShowSettings] = useState(false);

  // Pulsating logo glow
  const logoGlow = useSharedValue(0.4);
  useEffect(() => {
    logoGlow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.4, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      ),
      -1, true
    );
  }, [logoGlow]);

  const logoGlowStyle = useAnimatedStyle(() => ({
    shadowOpacity: interpolate(logoGlow.value, [0, 1], [0.15, 0.5]),
    transform: [{ scale: interpolate(logoGlow.value, [0, 1], [1, 1.03]) }],
  }));

  const startGame = (rows: number, cols: number, mineCount: number) => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({ pathname: '/game', params: { rows, cols, mineCount } });
  };

  const openSettings = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowSettings(true);
  };

  const toggleSound = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSoundEnabled(!soundEnabled);
  };

  const toggleTheme = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTheme(isDarkMode ? 'light' : 'dark');
  };

  const darkGradient = ['#050A18', '#0C1230', '#14082E'] as const;
  const lightGradient = ['#F0F4FF', '#E8ECFF', '#FBF0FF'] as const;

  // Settings overlay animation
  const settingsOpacity = useSharedValue(0);
  const settingsScale = useSharedValue(0.92);
  const settingsTranslateY = useSharedValue(20);

  useEffect(() => {
    if (showSettings) {
      settingsOpacity.value = withTiming(1, { duration: 280 });
      settingsScale.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.cubic) });
      settingsTranslateY.value = withTiming(0, { duration: 300, easing: Easing.out(Easing.cubic) });
    } else {
      settingsOpacity.value = withTiming(0, { duration: 220 });
      settingsScale.value = withTiming(0.92, { duration: 220 });
      settingsTranslateY.value = withTiming(20, { duration: 220 });
    }
  }, [showSettings, settingsOpacity, settingsScale, settingsTranslateY]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: settingsOpacity.value,
    zIndex: 50,
    elevation: 50,
  }));

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: settingsScale.value },
      { translateY: settingsTranslateY.value },
    ],
  }));

  return (
    <LinearGradient 
      colors={isDarkMode ? darkGradient : lightGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      {/* Decorative floating orbs */}
      <FloatingOrb size={180} color={isDarkMode ? '#3B82F6' : '#818CF8'} top="5%" left="-15%" delay={0} />
      <FloatingOrb size={120} color={isDarkMode ? '#A855F7' : '#C084FC'} top="70%" left="75%" delay={400} />
      <FloatingOrb size={90} color={isDarkMode ? '#F43F5E' : '#FB7185'} top="25%" left="80%" delay={800} />

      {/* Logo + Title */}
      <Animated.View entering={FadeInUp.duration(350).easing(Easing.out(Easing.cubic))} style={styles.titleContainer}>
        <Animated.View style={[styles.logoContainer, { 
          backgroundColor: isDarkMode ? '#0F172A' : '#FFFFFF',
          borderColor: isDarkMode ? 'rgba(244,63,94,0.3)' : 'rgba(244,63,94,0.15)',
          shadowColor: '#F43F5E',
        }, logoGlowStyle]}>
          <Bomb size={34} color={isDarkMode ? '#FB7185' : '#E11D48'} strokeWidth={2} />
        </Animated.View>
        <Text style={[styles.title, { color: isDarkMode ? '#F8FAFC' : '#0F172A' }]}>
          {'SMASH\nMINESWEEPER'}
        </Text>
        <Text style={[styles.subtitle, { color: isDarkMode ? '#475569' : '#94A3B8' }]}>
          Tap carefully. Clear the board.
        </Text>
      </Animated.View>
      
      {/* Difficulty cards with section label */}
      <View style={styles.menu}>
        <Animated.View entering={FadeInDown.delay(50).duration(300)} style={styles.sectionLabelContainer}>
          <View style={[styles.sectionLine, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }]} />
          <Text style={[styles.sectionLabel, { color: isDarkMode ? '#334155' : '#CBD5E1' }]}>SELECT DIFFICULTY</Text>
          <View style={[styles.sectionLine, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }]} />
        </Animated.View>

        <DifficultyCard 
          title="Beginner" desc="9 × 9  ·  10 Mines" Icon={Sprout} 
          color="#10B981" glowColor="#10B981"
          delay={150} onPress={() => startGame(9, 9, 10)} isDark={isDarkMode} 
        />
        <DifficultyCard 
          title="Intermediate" desc="12 × 12  ·  20 Mines" Icon={Flame} 
          color="#3B82F6" glowColor="#3B82F6"
          delay={250} onPress={() => startGame(12, 12, 20)} isDark={isDarkMode} 
        />
        <DifficultyCard 
          title="Expert" desc="16 × 16  ·  40 Mines" Icon={Skull} 
          color="#A855F7" glowColor="#A855F7"
          delay={350} onPress={() => startGame(16, 16, 40)} isDark={isDarkMode} 
        />
      </View>

      {/* Settings Button */}
      <Animated.View entering={FadeInDown.delay(150).duration(350).easing(Easing.out(Easing.cubic))} style={styles.footer}>
        <Pressable 
          style={({pressed}) => [
            styles.settingsBtn, 
            { 
              borderColor: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
              backgroundColor: isDarkMode ? 'rgba(15,23,42,0.5)' : 'rgba(255,255,255,0.6)',
            }, 
            pressed && { transform: [{scale: 0.95}], opacity: 0.7 }
          ]}
          onPress={openSettings}
        >
          <SettingsIcon size={18} color={isDarkMode ? '#64748B' : '#94A3B8'} strokeWidth={2} />
          <Text style={[styles.settingsBtnText, { color: isDarkMode ? '#64748B' : '#94A3B8' }]}>Settings</Text>
        </Pressable>
      </Animated.View>

      {/* ── Settings Modal Overlay ── */}
      <Animated.View 
        pointerEvents={showSettings ? 'auto' : 'none'}
        style={[StyleSheet.absoluteFill, overlayStyle]}
      >
        <BlurView 
          intensity={isDarkMode ? 50 : 90} 
          tint={isDarkMode ? 'dark' : 'light'}
          style={styles.modalOverlay}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setShowSettings(false)} />
          <Animated.View 
            style={[styles.modalCard, cardStyle, { 
              backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.85)' : 'rgba(255, 255, 255, 0.92)',
              borderColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
            }]}
          >
            {/* Modal header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <View style={[styles.modalTitleIcon, { backgroundColor: isDarkMode ? 'rgba(59,130,246,0.15)' : 'rgba(59,130,246,0.08)' }]}>
                  <SettingsIcon size={18} color="#3B82F6" strokeWidth={2.5} />
                </View>
                <Text style={[styles.modalTitle, { color: isDarkMode ? '#F8FAFC' : '#0F172A' }]}>Settings</Text>
              </View>
              <Pressable 
                onPress={() => setShowSettings(false)} 
                style={({pressed}) => [
                  styles.closeBtn, 
                  { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' },
                  pressed && { opacity: 0.5, transform: [{scale: 0.9}] }
                ]}
              >
                <X size={18} color={isDarkMode ? '#475569' : '#94A3B8'} strokeWidth={2.5} />
              </Pressable>
            </View>

            {/* Sound toggle */}
            <Pressable 
              onPress={toggleSound}
              style={({pressed}) => [
                styles.modalRow,
                { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' },
                pressed && { opacity: 0.7 }
              ]}
            >
              <View style={[styles.modalRowIcon, { backgroundColor: isDarkMode ? 'rgba(16,185,129,0.12)' : 'rgba(16,185,129,0.08)' }]}>
                {soundEnabled 
                  ? <Volume2 size={18} color="#10B981" strokeWidth={2} />
                  : <VolumeX size={18} color="#64748B" strokeWidth={2} />
                }
              </View>
              <View style={styles.modalRowText}>
                <Text style={[styles.modalRowTitle, { color: isDarkMode ? '#F1F5F9' : '#0F172A' }]}>Sound Effects</Text>
                <Text style={[styles.modalRowDesc, { color: isDarkMode ? '#475569' : '#94A3B8' }]}>Game audio feedback</Text>
              </View>
              <Switch
                value={soundEnabled}
                onValueChange={toggleSound}
                trackColor={{ false: isDarkMode ? '#1E293B' : '#E2E8F0', true: '#10B981' }}
                thumbColor={'#FFFFFF'}
              />
            </Pressable>

            <View style={[styles.modalDivider, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }]} />

            {/* Theme toggle */}
            <Pressable 
              onPress={toggleTheme}
              style={({pressed}) => [
                styles.modalRow,
                { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' },
                pressed && { opacity: 0.7 }
              ]}
            >
              <View style={[styles.modalRowIcon, { backgroundColor: isDarkMode ? 'rgba(168,85,247,0.12)' : 'rgba(168,85,247,0.08)' }]}>
                {isDarkMode 
                  ? <Moon size={18} color="#A855F7" strokeWidth={2} />
                  : <Sun size={18} color="#F59E0B" strokeWidth={2} />
                }
              </View>
              <View style={styles.modalRowText}>
                <Text style={[styles.modalRowTitle, { color: isDarkMode ? '#F1F5F9' : '#0F172A' }]}>Dark Mode</Text>
                <Text style={[styles.modalRowDesc, { color: isDarkMode ? '#475569' : '#94A3B8' }]}>
                  {isDarkMode ? 'Currently dark' : 'Currently light'}
                </Text>
              </View>
              <Switch
                value={isDarkMode}
                onValueChange={toggleTheme}
                trackColor={{ false: isDarkMode ? '#1E293B' : '#E2E8F0', true: '#A855F7' }}
                thumbColor={'#FFFFFF'}
              />
            </Pressable>

          </Animated.View>
        </BlurView>
      </Animated.View>

    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, overflow: 'hidden' },
  titleContainer: { alignItems: 'center', marginBottom: 40 },
  logoContainer: {
    width: 80, height: 80, borderRadius: 24, borderWidth: 2,
    alignItems: 'center', justifyContent: 'center', marginBottom: 24,
    shadowOffset: { width: 0, height: 0 }, shadowRadius: 24, elevation: 8,
  },
  title: { 
    fontSize: 32, fontFamily: 'Outfit_900Black', textAlign: 'center', 
    letterSpacing: 4, lineHeight: 40,
  },
  subtitle: { 
    fontSize: 14, fontFamily: 'Outfit_500Medium', marginTop: 12, 
    textAlign: 'center', letterSpacing: 1.5, textTransform: 'uppercase',
  },
  sectionLabelContainer: {
    flexDirection: 'row', alignItems: 'center', marginBottom: 8, width: '100%', paddingHorizontal: 4,
  },
  sectionLine: { flex: 1, height: 1 },
  sectionLabel: { 
    fontSize: 10, fontFamily: 'Outfit_700Bold', letterSpacing: 2.5,
    marginHorizontal: 12, textTransform: 'uppercase',
  },
  menu: { width: '100%', maxWidth: 380, alignItems: 'center' },
  footer: { 
    marginTop: 32, width: '100%', maxWidth: 380, 
    flexDirection: 'row', justifyContent: 'center',
  },
  settingsBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 10, paddingHorizontal: 20,
    borderRadius: 100, borderWidth: 1,
  },
  settingsBtnText: { fontFamily: 'Outfit_600SemiBold', fontSize: 13, letterSpacing: 0.5 },
  
  // Difficulty cards
  diffCard: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 16, paddingHorizontal: 16,
    borderRadius: 16, borderWidth: 1, width: '100%',
    overflow: 'hidden',
  },
  diffIconOuter: {
    marginRight: 14,
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 4,
  },
  diffIconGradient: {
    width: 48, height: 48, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  diffIconRing: {
    width: 40, height: 40, borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center',
  },
  diffTextContainer: { flex: 1 },
  diffTitle: {
    fontSize: 17, fontFamily: 'Outfit_800ExtraBold', marginBottom: 2, letterSpacing: 0.2,
  },
  diffDesc: { fontSize: 12, fontFamily: 'Outfit_500Medium', letterSpacing: 0.3 },
  diffArrow: {
    width: 32, height: 32, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center', marginLeft: 8,
  },

  // Modal
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalCard: {
    width: '100%', maxWidth: 380, borderRadius: 28, borderWidth: 1,
    padding: 20, paddingTop: 20, paddingBottom: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.25, shadowRadius: 32, elevation: 12,
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20,
  },
  modalTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  modalTitleIcon: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  modalTitle: { fontSize: 20, fontFamily: 'Outfit_800ExtraBold', letterSpacing: 0.3 },
  closeBtn: {
    width: 32, height: 32, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  modalRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 14, paddingHorizontal: 12, borderRadius: 14, marginBottom: 6,
  },
  modalRowIcon: {
    width: 38, height: 38, borderRadius: 11,
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  modalRowText: { flex: 1 },
  modalRowTitle: { fontSize: 15, fontFamily: 'Outfit_700Bold', marginBottom: 1 },
  modalRowDesc: { fontSize: 12, fontFamily: 'Outfit_500Medium' },
  modalDivider: { height: 1, width: '100%', marginVertical: 2 },
});
