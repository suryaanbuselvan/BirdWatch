import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions, ImageBackground, Image, Platform, ScrollView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withSequence, withTiming, withRepeat, interpolate, Extrapolate, FadeIn } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { RootStackParamList } from '../navigation/types';
import { useBirds } from '../context/BirdContext';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import StreakFire from '../components/StreakFire';
import { MISSIONS } from '../data/missions';
import { BADGES } from '../data/badges';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'MainTabs'>;
};

const { width, height } = Dimensions.get('window');

// Premium Background Assets
const LIGHT_BG = 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?q=80&w=1000&auto=format&fit=crop';
const DARK_BG = 'https://images.unsplash.com/photo-1501854140801-50d01698950b?q=80&w=1000&auto=format&fit=crop';

export default function HomeScreen({ navigation }: Props) {
  const { captureHistory, getDailyStreak, getConsecutiveStreak, userLevel, rankTitle, nextLevelProgress, totalXp, missions } = useBirds();
  const { theme, colors, toggleTheme } = useTheme();
  const { userName, userAvatar, unlockedBadges } = useUser();
  const [triggerFire, setTriggerFire] = useState(false);
  
  const currentStreak = getConsecutiveStreak();
  const [prevStreak, setPrevStreak] = useState(currentStreak);
  
  const cardScale = useSharedValue(1);
  const blob1Pos = useSharedValue(0);
  const blob2Pos = useSharedValue(0);
  const blob3Pos = useSharedValue(0);

  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return 'GOOD MORNING';
    if (hours < 18) return 'GOOD AFTERNOON';
    return 'GOOD EVENING';
  };

  useEffect(() => {
    blob1Pos.value = withRepeat(withTiming(1, { duration: 15000 }), -1, true);
    blob2Pos.value = withRepeat(withTiming(1, { duration: 20000 }), -1, true);
    blob3Pos.value = withRepeat(withTiming(1, { duration: 25000 }), -1, true);
    
    if (currentStreak > prevStreak) {
      setTriggerFire(true);
      cardScale.value = withSequence(withSpring(1.05), withSpring(1));
      setPrevStreak(currentStreak);
    }
  }, [currentStreak]);

  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
  }));

  const blob1Style = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(blob1Pos.value, [0, 1], [-100, 100]) },
      { translateY: interpolate(blob1Pos.value, [0, 1], [-50, 50]) },
      { scale: interpolate(blob1Pos.value, [0, 1], [1, 1.2]) }
    ],
  }));

  const blob2Style = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(blob2Pos.value, [0, 1], [100, -100]) },
      { translateY: interpolate(blob2Pos.value, [0, 1], [50, -50]) },
      { scale: interpolate(blob2Pos.value, [0, 1], [1.2, 1]) }
    ],
  }));

  const blob3Style = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(blob3Pos.value, [0, 1], [0, 150]) },
      { translateY: interpolate(blob3Pos.value, [0, 1], [100, -100]) },
      { scale: interpolate(blob3Pos.value, [0, 1], [0.8, 1.2]) }
    ],
  }));

  const backgroundUrl = theme === 'dark' ? DARK_BG : LIGHT_BG;
  const uniqueSpecies = new Set(captureHistory.map(c => c.bird.id)).size;

  return (
    <View style={styles.container}>
      <ImageBackground source={{ uri: backgroundUrl }} style={styles.bgImage}>
        <LinearGradient
          colors={[
            theme === 'dark' ? 'rgba(2,6,23,0.85)' : 'rgba(248,250,252,0.4)', 
            theme === 'dark' ? 'rgba(2,6,23,0.5)' : 'rgba(248,250,252,0.2)',
            theme === 'dark' ? 'rgba(2,6,23,0.98)' : 'rgba(248,250,252,0.98)'
          ]}
          style={StyleSheet.absoluteFillObject}
        />
        
        {/* Animated Aurora Blobs */}
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <Animated.View style={[styles.blob, blob1Style, { backgroundColor: colors.primary, top: '10%', left: '-20%', opacity: theme === 'dark' ? 0.2 : 0.1 }]} />
          <Animated.View style={[styles.blob, blob2Style, { backgroundColor: colors.accentTeal, bottom: '20%', right: '-20%', opacity: theme === 'dark' ? 0.15 : 0.08 }]} />
          <Animated.View style={[styles.blob, blob3Style, { backgroundColor: colors.glowPurple, top: '40%', right: '10%', opacity: theme === 'dark' ? 0.12 : 0.06, width: 300, height: 300 }]} />
        </View>
        
        <SafeAreaView style={styles.safeArea}>
          {/* Refined Header: Luxury Asymmetrical Style */}
          <Animated.View entering={FadeIn.delay(200)} style={styles.header}>
            <View style={styles.greetingWrapper}>
              <Text style={[styles.greetingLabel, { color: colors.textMuted }]}>{getGreeting()}</Text>
              <Text style={[styles.userNameText, { color: colors.text }]}>{userName}</Text>
              <Text style={[styles.subGreeting, { color: colors.textMuted }]}>Ready for birdwatching?</Text>
            </View>
            
            <View style={styles.headerActions}>
              <TouchableOpacity 
                activeOpacity={0.8}
                onPress={toggleTheme} 
                style={[styles.switchTrack, { backgroundColor: colors.surfaceGlass, borderColor: colors.glassStroke }]}
              >
                {Platform.OS !== 'web' ? (
                  <BlurView intensity={20} tint={theme} style={StyleSheet.absoluteFill} />
                ) : null}
                <Animated.View style={[
                  styles.switchKnob, 
                  { backgroundColor: colors.text },
                  useAnimatedStyle(() => ({
                    transform: [{ translateX: withSpring(theme === 'dark' ? 24 : 0, { damping: 15, stiffness: 120 }) }]
                  }))
                ]} />
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => navigation.navigate('EditProfile')}
              >
                <LinearGradient
                  colors={colors.primaryGradient}
                  style={styles.avatarGlow}
                >
                  <Image source={{ uri: userAvatar }} style={styles.avatar} />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </Animated.View>

          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.content}>
              {/* Experience & Rank Section */}
              <Animated.View entering={FadeIn.delay(300).springify()} style={styles.xpContainer}>
                <View style={styles.xpHeader}>
                  <View>
                    <Text style={[styles.rankLabel, { color: colors.primary }]}>{rankTitle}</Text>
                    <Text style={[styles.levelText, { color: colors.text }]}>LEVEL {userLevel}</Text>
                  </View>
                  <Text style={[styles.xpValue, { color: colors.textMuted }]}>{totalXp} XP</Text>
                </View>
                <View style={[styles.xpBarBackground, { backgroundColor: colors.surfaceGlass }]}>
                  <Animated.View 
                    entering={FadeIn.delay(500)}
                    style={[
                      styles.xpBarFill, 
                      { backgroundColor: colors.primary, width: `${nextLevelProgress * 100}%` }
                    ]} 
                  />
                </View>
              </Animated.View>

              {/* Main Stats Summary */}
              <Animated.View 
                entering={FadeIn.delay(400).springify()}
                style={styles.summaryContainer}
              >
                 <Animated.View style={[styles.glassCard, animatedCardStyle, { shadowColor: colors.cardShadow, borderColor: colors.glassStroke }]}>
                    {Platform.OS !== 'web' ? (
                      <BlurView intensity={90} tint={theme} style={StyleSheet.absoluteFill} />
                    ) : (
                      <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.surfaceGlass }]} />
                    )}
                    <View style={styles.cardContent}>
                      <StreakFire trigger={triggerFire} onAnimationFinish={() => setTriggerFire(false)} />
                      <Text style={[styles.cardLabel, { color: colors.textMuted }]}>DAILY MOMENTUM</Text>
                      <Text style={[styles.cardValue, { color: colors.primary }]}>{currentStreak} <Text style={{ fontSize: 24, fontWeight: '700' }}>DAYS</Text></Text>
                    </View>
                 </Animated.View>
              </Animated.View>

              {/* Secondary Stats Row */}
              <View style={styles.statsRow}>
                 <Animated.View 
                  entering={FadeIn.delay(600).springify()}
                  style={[styles.secondaryCard, { borderColor: colors.glassStroke, shadowColor: colors.cardShadow }]}
                 >
                    {Platform.OS !== 'web' ? (
                      <BlurView intensity={90} tint={theme} style={StyleSheet.absoluteFill} />
                    ) : <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.surfaceGlass }]} />}
                    <Text style={[styles.secLabel, { color: colors.textMuted }]}>DISCOVERED</Text>
                    <Text style={[styles.secValue, { color: colors.text }]}>{uniqueSpecies}</Text>
                    <Text style={[styles.secSub, { color: colors.textMuted }]}>SPECIES</Text>
                 </Animated.View>

                 <Animated.View 
                  entering={FadeIn.delay(800).springify()}
                  style={[styles.secondaryCard, { borderColor: colors.glassStroke, shadowColor: colors.cardShadow }]}
                 >
                   <TouchableOpacity 
                    activeOpacity={0.7}
                    onPress={() => navigation.navigate('Badges')}
                    style={StyleSheet.absoluteFill}
                   >
                      {Platform.OS !== 'web' ? (
                        <BlurView intensity={90} tint={theme} style={StyleSheet.absoluteFill} />
                      ) : <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.surfaceGlass }]} />}
                      <View style={{ padding: 24 }}>
                        <Text style={[styles.secLabel, { color: colors.textMuted }]}>MILESTONES</Text>
                        <View style={styles.badgeRow}>
                          <Text style={[styles.secValue, { color: colors.text }]}>{unlockedBadges.length}</Text>
                          <Text style={[styles.secMax, { color: colors.textMuted }]}>/{BADGES.length}</Text>
                        </View>
                        <Text style={[styles.secSub, { color: colors.textMuted }]}>TROPHIES</Text>
                      </View>
                   </TouchableOpacity>
                 </Animated.View>
              </View>

              {/* Mission Board */}
              <Animated.View entering={FadeIn.delay(900).springify()} style={styles.missionsSection}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>ACTIVE MISSIONS</Text>
                {missions.map((mp, index) => {
                  const m = MISSIONS.find(mission => mission.id === mp.missionId);
                  if (!m) return null;
                  
                  return (
                    <View key={m.id} style={[styles.missionCard, { backgroundColor: colors.surfaceGlass, borderColor: mp.isCompleted ? colors.primary : colors.glassStroke, marginBottom: 12 }]}>
                      <Text style={styles.missionIcon}>{mp.isCompleted ? '✅' : m.icon}</Text>
                      <View style={styles.missionInfo}>
                        <Text style={[styles.missionTitle, { color: colors.text }]}>{m.title}</Text>
                        <Text style={[styles.missionDesc, { color: colors.textMuted }]}>{mp.isCompleted ? 'Mission Accomplished!' : m.description}</Text>
                        {!mp.isCompleted && (
                           <Text style={[styles.missionProgressText, { color: colors.primary }]}>
                             Progress: {mp.completedBirdIds.length}/{m.requiredBirdIds.length}
                           </Text>
                        )}
                      </View>
                      <View style={[styles.missionTag, { backgroundColor: colors.primary + (mp.isCompleted ? '40' : '20') }]}>
                        <Text style={[styles.missionXp, { color: colors.primary }]}>+{m.xpReward} XP</Text>
                      </View>
                    </View>
                  );
                })}
              </Animated.View>

              {/* Premium Scan Button */}
              <Animated.View entering={FadeIn.delay(1000).springify()} style={styles.scanBtnWrapper}>
                <TouchableOpacity 
                  activeOpacity={0.9}
                  onPress={() => navigation.navigate('Identify')}
                  style={styles.scanBtnContainer}
                >
                  <LinearGradient
                    colors={colors.primaryGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.scanBtn}
                  >
                    <Text style={styles.scanBtnText}>IDENTIFY BIRD</Text>
                    <View style={styles.scanIconWrapper}>
                       <Text style={{ fontSize: 26 }}>📸</Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  bgImage: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  blob: {
    position: 'absolute',
    width: 450,
    height: 450,
    borderRadius: 225,
    filter: Platform.OS === 'web' ? 'blur(80px)' : undefined,
  },
  header: {
    padding: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    zIndex: 10,
    paddingTop: Platform.OS === 'android' ? 40 : 24,
  },
  greetingWrapper: {
    flex: 1,
  },
  greetingLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 4,
  },
  userNameText: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -1.5,
    lineHeight: 36,
  },
  subGreeting: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
    opacity: 0.7,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchTrack: {
    width: 60,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    paddingHorizontal: 4,
    overflow: 'hidden',
    borderWidth: 1,
    marginRight: 16,
  },
  switchKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  avatarGlow: {
    width: 52,
    height: 52,
    borderRadius: 26,
    padding: 2,
    shadowColor: 'rgba(16, 185, 129, 0.4)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#020617',
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: height * 0.05,
    paddingBottom: 40,
  },
  scrollContent: {
    flexGrow: 1,
  },
  summaryContainer: {
    width: '100%',
    marginBottom: 24,
  },
  glassCard: {
    width: '100%',
    borderRadius: 36,
    overflow: 'hidden',
    borderWidth: 1,
    elevation: 20,
    shadowOffset: { width: 0, height: 25 },
    shadowOpacity: 0.3,
    shadowRadius: 40,
  },
  cardContent: {
    padding: 40,
    alignItems: 'center',
  },
  cardLabel: {
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 3,
    marginBottom: 12,
  },
  cardValue: {
    fontSize: 56,
    fontWeight: '900',
    letterSpacing: -2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 48,
  },
  secondaryCard: {
    width: '47%',
    borderRadius: 32,
    padding: 24,
    overflow: 'hidden',
    borderWidth: 1,
    elevation: 10,
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.2,
    shadowRadius: 25,
  },
  secLabel: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  secValue: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -1,
  },
  secMax: {
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 2,
  },
  secSub: {
    fontSize: 12,
    fontWeight: '800',
    marginTop: 4,
    letterSpacing: 0.5,
  },
  scanBtnWrapper: {
    width: '100%',
  },
  scanBtnContainer: {
    width: '100%',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.4,
    shadowRadius: 30,
    elevation: 20,
  },
  scanBtn: {
    height: 80,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 36,
  },
  scanBtnText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 1,
  },
  scanIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  xpContainer: {
    marginBottom: 32,
  },
  xpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  rankLabel: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  levelText: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  xpValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  xpBarBackground: {
    height: 8,
    borderRadius: 4,
    width: '100%',
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  missionsSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 16,
    opacity: 0.8,
  },
  missionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
  },
  missionIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  missionInfo: {
    flex: 1,
  },
  missionTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  missionDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  missionTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  missionXp: {
    fontSize: 11,
    fontWeight: '900',
  },
  missionProgressText: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 4,
    textTransform: 'uppercase',
  },
});

