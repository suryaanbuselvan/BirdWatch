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
import LevelUpModal from '../components/LevelUpModal';
import BadgeUnlockModal from '../components/BadgeUnlockModal';
import { MISSIONS } from '../data/missions';
import { BADGES, Badge } from '../data/badges';
import { BIRD_DATABASE } from '../data/birds';
import { Ionicons } from '@expo/vector-icons';
import { BIRD_FACTS } from '../data/facts';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'MainTabs'>;
};

const { width, height } = Dimensions.get('window');

export default function HomeScreen({ navigation }: Props) {
  const { captureHistory, getDailyStreak, getConsecutiveStreak, userLevel, rankTitle, nextLevelProgress, totalXp, missions, isLoading, dailyBountyId } = useBirds();
  const { theme, colors, toggleTheme } = useTheme();
  const { userName, userAvatar, unlockedBadges, recentlyUnlockedBadge, clearRecentlyUnlockedBadge } = useUser();
  const [triggerFire, setTriggerFire] = useState(false);
  
  const currentStreak = getConsecutiveStreak();
  const [prevStreak, setPrevStreak] = useState(currentStreak);
  const [prevLevel, setPrevLevel] = useState(0);
  const [showLevelUp, setShowLevelUp] = useState(false);
  
  const cardScale = useSharedValue(1);
  const blob1Pos = useSharedValue(0);
  const blob2Pos = useSharedValue(0);
  const blob3Pos = useSharedValue(0);

  const factIndex = new Date().getDate() % BIRD_FACTS.length;
  const factOfTheDay = BIRD_FACTS[factIndex];
  
  const switchToggleStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: withSpring(theme === 'dark' ? 24 : 0, { damping: 15, stiffness: 120 }) }]
  }));

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
    
    if (!isLoading) {
      if (prevLevel === 0) {
        setPrevLevel(userLevel);
      } else if (userLevel > prevLevel) {
        setShowLevelUp(true);
        setPrevLevel(userLevel);
      }
    }
  }, [currentStreak, userLevel, isLoading]);

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

  const uniqueSpecies = new Set(captureHistory.map(c => c.bird.id)).size;
  const dailyBountyBird = BIRD_DATABASE.find(b => b.id === dailyBountyId) || BIRD_DATABASE[0];

  const recentlyUnlockedBadgeData = recentlyUnlockedBadge 
    ? BADGES.find(b => b.id === recentlyUnlockedBadge) || null
    : null;

  return (
    <View style={styles.container}>
      <ImageBackground source={require('../../assets/bg_sunrise_opt4.jpg')} style={styles.bgImage}>
        <LinearGradient
          colors={[
            theme === 'dark' ? 'rgba(2,6,23,0.85)' : 'rgba(248,250,252,0.7)', 
            theme === 'dark' ? 'rgba(2,6,23,0.5)' : 'rgba(248,250,252,0.5)',
            theme === 'dark' ? 'rgba(2,6,23,0.98)' : 'rgba(248,250,252,0.98)'
          ]}
          style={StyleSheet.absoluteFillObject}
        />
        
        <View style={StyleSheet.absoluteFill}>
          <Animated.View style={[styles.blob, blob1Style, { backgroundColor: colors.primary, top: '10%', left: '-20%', opacity: theme === 'dark' ? 0.2 : 0.1 }]} />
          <Animated.View style={[styles.blob, blob2Style, { backgroundColor: colors.accentTeal, bottom: '20%', right: '-20%', opacity: theme === 'dark' ? 0.15 : 0.08 }]} />
          <Animated.View style={[styles.blob, blob3Style, { backgroundColor: colors.glowPurple, top: '40%', right: '10%', opacity: theme === 'dark' ? 0.12 : 0.06, width: 300, height: 300 }]} />
        </View>
        
        <SafeAreaView style={styles.safeArea}>
          <Animated.View entering={FadeIn.delay(200)} style={styles.header}>
            <View style={styles.greetingWrapper}>
              <Text style={[styles.greetingLabel, { color: colors.textMuted }]}>{getGreeting()}</Text>
              <Text style={[styles.userNameText, { color: colors.text }]}>{userName}</Text>
              <Text style={[styles.subGreeting, { color: colors.textMuted }]}>Ready for birdwatching?</Text>
              
              <TouchableOpacity 
                activeOpacity={0.8}
                onPress={() => navigation.navigate('Badges')}
                style={[styles.achievementShortcut, { backgroundColor: colors.primary }]}
              >
                <Ionicons name="trophy" size={20} color="#fff" />
                <Text style={styles.achievementShortcutText}>ACHIEVEMENTS</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.headerActions}>
              <TouchableOpacity 
                activeOpacity={0.8}
                onPress={toggleTheme} 
                style={[styles.switchTrack, { backgroundColor: colors.surfaceGlass, borderColor: colors.glassStroke }]}
              >
                {Platform.OS !== 'web' ? <BlurView intensity={20} tint={theme} style={StyleSheet.absoluteFill} /> : null}
                <Animated.View style={[styles.switchKnob, { backgroundColor: colors.text }, switchToggleStyle]} />
              </TouchableOpacity>

              <TouchableOpacity onPress={() => navigation.navigate('EditProfile')}>
                <LinearGradient colors={colors.primaryGradient} style={styles.avatarGlow}>
                  <Image source={{ uri: userAvatar }} style={styles.avatar} />
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setTriggerFire(true)}
                style={[styles.miniStreakBtn, { borderColor: currentStreak > 0 ? '#fbbf24' : colors.glassStroke }]}
              >
                <View style={styles.miniFireScale}>
                   <StreakFire trigger={currentStreak > 0} loop={true} streakLength={currentStreak} />
                </View>
                <Text style={[styles.miniStreakText, { color: currentStreak > 0 ? '#fbbf24' : colors.textMuted }]}>
                  {currentStreak}
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            <View style={styles.content}>
              <Animated.View entering={FadeIn.delay(300).springify()} style={styles.xpContainer}>
                <View style={styles.xpHeader}>
                  <View>
                    <Text style={[styles.rankLabel, { color: colors.primary }]}>{rankTitle}</Text>
                    <Text style={[styles.levelText, { color: colors.text }]}>LEVEL {userLevel}</Text>
                  </View>
                  <Text style={[styles.xpValue, { color: colors.textMuted }]}>{totalXp} XP</Text>
                </View>
                <View style={[styles.xpBarOuter, { borderColor: colors.glassStroke }]}>
                  <View style={[styles.xpBarBackground, { backgroundColor: colors.surfaceGlass }]}>
                    <Animated.View 
                      entering={FadeIn.delay(500)}
                      style={[styles.xpBarFill, { backgroundColor: colors.primary, width: `${nextLevelProgress * 100}%` }]} 
                    />
                  </View>
                </View>
              </Animated.View>

              <Animated.View entering={FadeIn.delay(400).springify()} style={styles.summaryContainer}>
                 <TouchableOpacity activeOpacity={0.9} onPress={() => setTriggerFire(true)} style={{ flex: 1 }}>
                   <Animated.View style={[styles.glassCard, animatedCardStyle, { shadowColor: currentStreak > 0 ? '#f59e0b' : colors.cardShadow, borderColor: currentStreak > 0 ? '#fbbf24' : colors.glassStroke }]}>
                      {Platform.OS !== 'web' ? <BlurView intensity={90} tint={theme} style={StyleSheet.absoluteFill} /> : <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.surfaceGlass }]} />}
                      {currentStreak > 0 && <LinearGradient colors={['rgba(245, 158, 11, 0.15)', 'transparent']} style={StyleSheet.absoluteFill} />}
                      <View style={styles.cardContent}>
                        <View style={styles.fireWrapper}>
                          <StreakFire trigger={triggerFire || currentStreak > 0} loop={currentStreak > 0} streakLength={currentStreak} onAnimationFinish={() => setTriggerFire(false)} />
                        </View>
                        <Text style={[styles.cardLabel, { color: currentStreak > 0 ? '#fbbf24' : colors.textMuted }]}>{currentStreak > 0 ? '🔥 ACTIVE STREAK' : 'DAILY MOMENTUM'}</Text>
                        <Text style={[styles.cardValue, { color: currentStreak > 0 ? '#fbbf24' : colors.primary }]}>{currentStreak} <Text style={{ fontSize: 16, fontWeight: '700' }}>DAYS</Text></Text>
                      </View>
                   </Animated.View>
                 </TouchableOpacity>
              </Animated.View>

              <View style={styles.statsRow}>
                 <Animated.View entering={FadeIn.delay(600).springify()} style={[styles.secondaryCard, { borderColor: colors.glassStroke, shadowColor: colors.cardShadow }]}>
                    {Platform.OS !== 'web' ? <BlurView intensity={90} tint={theme} style={StyleSheet.absoluteFill} /> : <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.surfaceGlass }]} />}
                    <Text style={[styles.secLabel, { color: colors.textMuted }]}>DISCOVERED</Text>
                    <Text style={[styles.secValue, { color: colors.text }]}>{uniqueSpecies}</Text>
                    <Text style={[styles.secSub, { color: colors.textMuted }]}>SPECIES</Text>
                 </Animated.View>

                 <Animated.View entering={FadeIn.delay(800).springify()} style={[styles.secondaryCard, { borderColor: colors.glassStroke, shadowColor: colors.cardShadow }]}>
                   <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.navigate('Badges')} style={StyleSheet.absoluteFill}>
                      {Platform.OS !== 'web' ? <BlurView intensity={90} tint={theme} style={StyleSheet.absoluteFill} /> : <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.surfaceGlass }]} />}
                      <View style={{ padding: 16 }}>
                        <Text style={[styles.secLabel, { color: colors.textMuted }]}>ACHIEVEMENTS</Text>
                        <View style={styles.badgeRow}>
                          <Text style={[styles.secValue, { color: colors.text }]}>{unlockedBadges.length}</Text>
                          <Text style={[styles.secMax, { color: colors.textMuted }]}>/{BADGES.length}</Text>
                        </View>
                        <Text style={[styles.secSub, { color: colors.textMuted }]}>TROPHIES</Text>
                      </View>
                   </TouchableOpacity>
                 </Animated.View>
              </View>

              <Animated.View entering={FadeIn.delay(810).springify()} style={styles.inlineScanSection}>
                <TouchableOpacity activeOpacity={0.9} style={styles.scanBtnContainer} onPress={() => navigation.navigate('Identify')}>
                  <LinearGradient colors={colors.primaryGradient} style={styles.scanBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                    <View style={styles.scanIconWrapper}><Ionicons name="camera" size={24} color="#fff" /></View>
                    <Text style={styles.scanBtnText}>IDENTIFY BIRD</Text>
                    <View style={{ width: 48 }} />
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
              
               <Animated.View entering={FadeIn.delay(820).springify()} style={styles.factSection}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>BIRD FACT OF THE DAY</Text>
                <View style={[styles.factCard, { backgroundColor: colors.surfaceGlass, borderColor: colors.glassStroke }]}>
                   <View style={[styles.factIconWrapper, { backgroundColor: colors.primary + '20' }]}>
                      <Ionicons name="bulb" size={22} color={colors.primary} />
                   </View>
                   <Text style={[styles.factText, { color: colors.text }]}>{factOfTheDay}</Text>
                </View>
              </Animated.View>

              {captureHistory.length > 0 && (
                <Animated.View entering={FadeIn.delay(850).springify()} style={styles.recentSection}>
                  <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>RECENT DISCOVERIES</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Collection' as any)}><Text style={[styles.viewAllText, { color: colors.primary }]}>View All</Text></TouchableOpacity>
                  </View>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recentList}>
                    {captureHistory.slice(0, 5).map((record, index) => (
                      <TouchableOpacity key={record.uid} activeOpacity={0.8} onPress={() => navigation.navigate('Details', { birdId: record.bird.id, captureUid: record.uid })} style={[styles.recentCard, { backgroundColor: colors.surfaceGlass, borderColor: colors.glassStroke }]}>
                        <Image source={{ uri: record.bird.imageUrl }} style={styles.recentImage} />
                        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={styles.recentGradient} />
                        <View style={styles.recentInfo}>
                          <Text style={styles.recentName} numberOfLines={1}>{record.bird.name}</Text>
                          <Text style={styles.recentRarity}>{record.bird.rarity}</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </Animated.View>
              )}

              <Animated.View entering={FadeIn.delay(900).springify()} style={styles.missionsSection}>
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>ACTIVE MISSIONS</Text>
                  <TouchableOpacity onPress={() => navigation.navigate('Missions')}><Text style={[styles.viewAllText, { color: colors.primary }]}>View Quest Log</Text></TouchableOpacity>
                </View>
                {missions.slice(0, 2).map((mp, index) => {
                  const m = MISSIONS.find(mission => mission.id === mp.missionId);
                  if (!m) return null;
                  return (
                    <View key={m.id} style={[styles.missionCard, { backgroundColor: colors.surfaceGlass, borderColor: mp.isCompleted ? colors.primary : colors.glassStroke, marginBottom: 12 }]}>
                      <Text style={styles.missionIcon}>{mp.isCompleted ? '✅' : m.icon}</Text>
                      <View style={styles.missionInfo}>
                        <Text style={[styles.missionTitle, { color: colors.text }]}>{m.title}</Text>
                        <Text style={[styles.missionDesc, { color: colors.textMuted }]}>{mp.isCompleted ? 'Mission Accomplished!' : m.description}</Text>
                        {!mp.isCompleted && <Text style={[styles.missionProgressText, { color: colors.primary }]}>Progress: {mp.completedBirdIds.length}/{m.requiredBirdIds.length}</Text>}
                      </View>
                      <View style={[styles.missionTag, { backgroundColor: colors.primary + (mp.isCompleted ? '40' : '20') }]}><Text style={[styles.missionXp, { color: colors.primary }]}>+{m.xpReward} XP</Text></View>
                    </View>
                  );
                })}
              </Animated.View>

               <Animated.View entering={FadeIn.delay(1100).springify()} style={styles.bountySection}>
                  <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>DAILY BOUNTY</Text>
                    <View style={styles.rewardTag}><Text style={styles.rewardTagText}>DOUBLE XP</Text></View>
                  </View>
                  <TouchableOpacity activeOpacity={0.9} style={[styles.bountyCard, { backgroundColor: colors.surfaceGlass, borderColor: '#fbbf24' }]} onPress={() => navigation.navigate('Details', { birdId: dailyBountyBird.id })}>
                    <Image source={{ uri: dailyBountyBird.imageUrl }} style={styles.bountyImage} />
                    <LinearGradient colors={['transparent', 'rgba(0,0,0,0.85)']} style={StyleSheet.absoluteFill} />
                    <View style={styles.bountyInfo}>
                      <Text style={styles.bountySub}>Find this bird today!</Text>
                      <Text style={styles.bountyName}>{dailyBountyBird.name}</Text>
                      <View style={styles.bountyLabel}>
                         <Ionicons name="flash" size={12} color="#fbbf24" /><Text style={styles.bountyLabelText}>BOUNTY TARGET</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
               </Animated.View>

            </View>
          </ScrollView>
        </SafeAreaView>



        <LevelUpModal visible={showLevelUp} level={userLevel} rank={rankTitle} colors={colors} onClose={() => setShowLevelUp(false)} />
        <BadgeUnlockModal visible={!!recentlyUnlockedBadgeData} badge={recentlyUnlockedBadgeData} colors={colors} onClose={clearRecentlyUnlockedBadge} />
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  bgImage: { flex: 1 },
  safeArea: { flex: 1 },
  blob: { position: 'absolute', width: 450, height: 450, borderRadius: 225, filter: Platform.OS === 'web' ? 'blur(80px)' : undefined },
  header: { padding: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 10, paddingTop: Platform.OS === 'android' ? 40 : 24 },
  greetingWrapper: { flex: 1 },
  greetingLabel: { fontSize: 11, fontWeight: '900', letterSpacing: 2, marginBottom: 4, textShadowColor: 'rgba(255,255,255,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 },
  userNameText: { fontSize: 34, fontWeight: '900', letterSpacing: -1.5, lineHeight: 38, textShadowColor: 'rgba(255,255,255,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 },
  subGreeting: { fontSize: 14, fontWeight: '800', marginTop: 4, opacity: 0.9, textShadowColor: 'rgba(255,255,255,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  switchTrack: { width: 60, height: 32, borderRadius: 16, justifyContent: 'center', paddingHorizontal: 4, overflow: 'hidden', borderWidth: 1, marginRight: 16 },
  switchKnob: { width: 24, height: 24, borderRadius: 12, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 },
  avatarGlow: { width: 52, height: 52, borderRadius: 26, padding: 2, shadowColor: 'rgba(16, 185, 129, 0.4)', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.8, shadowRadius: 10 },
  avatar: { width: '100%', height: '100%', borderRadius: 24, borderWidth: 2, borderColor: '#020617' },
  content: { paddingHorizontal: 24, paddingTop: height * 0.05, paddingBottom: 40 },
  scrollContent: { flexGrow: 1 },
  summaryContainer: { width: '100%', marginBottom: 24 },
  glassCard: { width: '100%', borderRadius: 36, overflow: 'hidden', borderWidth: 1, elevation: 20, shadowOffset: { width: 0, height: 25 }, shadowOpacity: 0.3, shadowRadius: 40 },
  cardContent: { padding: 24, alignItems: 'center', overflow: 'visible' },
  fireWrapper: { height: 40, width: 40, marginBottom: 8, justifyContent: 'center', alignItems: 'center' },
  cardLabel: { fontSize: 11, fontWeight: '900', letterSpacing: 2, marginBottom: 8 },
  cardValue: { fontSize: 40, fontWeight: '900', letterSpacing: -1 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32 },
  secondaryCard: { width: '47%', borderRadius: 24, padding: 16, overflow: 'hidden', borderWidth: 1, elevation: 10, shadowOffset: { width: 0, height: 15 }, shadowOpacity: 0.2, shadowRadius: 25 },
  secLabel: { fontSize: 9, fontWeight: '900', letterSpacing: 1.5, marginBottom: 8 },
  badgeRow: { flexDirection: 'row', alignItems: 'baseline' },
  secValue: { fontSize: 24, fontWeight: '900', letterSpacing: -0.5 },
  secMax: { fontSize: 12, fontWeight: '700', marginLeft: 2 },
  secSub: { fontSize: 10, fontWeight: '800', marginTop: 2, letterSpacing: 0.5 },
  xpContainer: { marginBottom: 32 },
  xpHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 12 },
  rankLabel: { fontSize: 10, fontWeight: '900', letterSpacing: 2, textTransform: 'uppercase' },
  levelText: { fontSize: 24, fontWeight: '900', letterSpacing: -0.5 },
  xpValue: { fontSize: 14, fontWeight: '700' },
  xpBarOuter: { borderWidth: 1, padding: 2, borderRadius: 6 },
  xpBarBackground: { height: 8, borderRadius: 3, width: '100%', overflow: 'hidden' },
  xpBarFill: { height: '100%', borderRadius: 3 },
  missionsSection: { marginBottom: 32 },
  sectionTitle: { fontSize: 12, fontWeight: '900', letterSpacing: 2, marginBottom: 16, opacity: 0.8 },
  missionCard: { flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: 24, borderWidth: 1 },
  missionIcon: { fontSize: 24, marginRight: 16 },
  missionInfo: { flex: 1 },
  missionTitle: { fontSize: 16, fontWeight: '800' },
  missionDesc: { fontSize: 12, marginTop: 2 },
  missionTag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  missionXp: { fontSize: 11, fontWeight: '900' },
  missionProgressText: { fontSize: 10, fontWeight: '700', marginTop: 4, textTransform: 'uppercase' },
  recentSection: { marginBottom: 40 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 },
  viewAllText: { fontSize: 12, fontWeight: '800', letterSpacing: 0.5 },
  recentList: { paddingRight: 24 },
  recentCard: { width: 140, height: 180, borderRadius: 24, marginRight: 16, overflow: 'hidden', borderWidth: 1 },
  recentImage: { width: '100%', height: '100%' },
  recentGradient: { ...StyleSheet.absoluteFillObject },
  recentInfo: { position: 'absolute', bottom: 12, left: 12, right: 12 },
  recentName: { color: '#FFF', fontSize: 13, fontWeight: '900', letterSpacing: -0.2 },
  recentRarity: { color: 'rgba(255,255,255,0.7)', fontSize: 9, fontWeight: '700', marginTop: 2, textTransform: 'uppercase', padding: 2, borderRadius: 4 },
  bountySection: { marginBottom: 32 },
  rewardTag: { backgroundColor: '#fbbf24', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  rewardTagText: { fontSize: 9, fontWeight: '900', color: '#000' },
  bountyCard: { width: '100%', height: 180, borderRadius: 28, overflow: 'hidden', borderWidth: 1.5 },
  bountyImage: { width: '100%', height: '100%' },
  bountyInfo: { position: 'absolute', bottom: 20, left: 20 },
  bountySub: { color: 'rgba(255,255,255,0.7)', fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  bountyName: { color: '#fff', fontSize: 28, fontWeight: '900', marginTop: 4 },
  bountyLabel: { flexDirection: 'row', alignItems: 'center', marginTop: 8, backgroundColor: 'rgba(251, 191, 36, 0.2)', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  bountyLabelText: { color: '#fbbf24', fontSize: 10, fontWeight: '800', marginLeft: 4 },

  achievementShortcut: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, marginTop: 16, alignSelf: 'flex-start', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 8 },
  achievementShortcutText: { color: '#fff', fontSize: 11, fontWeight: '900', marginLeft: 8, letterSpacing: 1.0 },
  factSection: { marginBottom: 40 },
  factCard: { borderRadius: 28, borderWidth: 1, padding: 20, flexDirection: 'row', alignItems: 'center', overflow: 'hidden' },
  factIconWrapper: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  factText: { flex: 1, fontSize: 14, fontWeight: '800', lineHeight: 20, opacity: 0.9 },
  inlineScanSection: { marginBottom: 32, width: '100%' },
  scanBtnContainer: { width: '100%', shadowColor: '#10B981', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 15, elevation: 8 },
  scanBtn: { height: 72, borderRadius: 28, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12 },
  scanBtnText: { color: '#fff', fontSize: 18, fontWeight: '900', letterSpacing: 2, marginLeft: -20 },
  scanIconWrapper: { width: 52, height: 52, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.25)', justifyContent: 'center', alignItems: 'center' },
  miniStreakBtn: { paddingHorizontal: 12, height: 44, borderRadius: 22, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, marginLeft: 12 },
  miniFireScale: { width: 30, height: 30, marginLeft: -10, marginRight: -4, transform: [{ scale: 0.5 }] },
  miniStreakText: { fontSize: 16, fontWeight: '900', marginLeft: 2 },
});
