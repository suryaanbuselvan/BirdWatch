import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Image, TouchableOpacity, Dimensions } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList } from '../navigation/types';
import { getBirdById } from '../data/birds';
import { useTheme } from '../context/ThemeContext';
import { useBirds } from '../context/BirdContext';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSequence, withDelay, FadeInUp, FadeOut } from 'react-native-reanimated';

type Props = NativeStackScreenProps<RootStackParamList, 'Details'>;

const { height } = Dimensions.get('window');

export default function DetailsScreen({ navigation, route }: Props) {
  const { birdId, captureUid } = route.params;
  const { colors, theme } = useTheme();
  const { getSightingCount, captureHistory, userLevel, rankTitle, nextLevelProgress } = useBirds();
  
  // 1. Try to find the specific record if UID provided
  let specificRecord = captureUid ? captureHistory.find(h => h.uid === captureUid) : null;
  
  // 2. Try to find bird in static database
  let bird = getBirdById(birdId);
  
  // 3. Fallback to capture history (for dynamic Gemini-identified birds)
  if (!bird && !specificRecord) {
    specificRecord = captureHistory.find(h => h.bird.id === birdId) || null;
  }

  if (specificRecord) {
    if (!bird) bird = specificRecord.bird;
    // VERY IMPORTANT: Use the actual photo taken if this is a capture view
    bird = { ...bird, imageUrl: specificRecord.bird.imageUrl || bird.imageUrl };
  }

  const lastSighting = specificRecord || captureHistory.find(h => h.bird.id === birdId);
  
  const xpOpacity = useSharedValue(0);
  const xpTranslateY = useSharedValue(0);

  React.useEffect(() => {
    xpOpacity.value = withSequence(
      withDelay(500, withTiming(1, { duration: 500 })),
      withDelay(1500, withTiming(0, { duration: 500 }))
    );
    xpTranslateY.value = withSequence(
      withDelay(500, withTiming(-50, { duration: 2000 }))
    );
  }, []);

  const animatedXpStyle = useAnimatedStyle(() => ({
    opacity: xpOpacity.value,
    transform: [{ translateY: xpTranslateY.value }],
  }));

  if (!bird) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>Bird not found!</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: colors.primary, marginTop: 16 }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const xpReward = bird.rarity === 'Rare' ? 500 : bird.rarity === 'Uncommon' ? 150 : 50;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
        <View style={styles.imageWrapper}>
          <Image source={{ uri: bird.imageUrl }} style={styles.image} />
          
          <LinearGradient
            colors={['rgba(0,0,0,0.5)', 'transparent', colors.background]}
            style={StyleSheet.absoluteFillObject}
          />

          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => navigation.goBack()}
          >
            <BlurView intensity={50} tint="dark" style={styles.closeBlur}>
              <Text style={styles.closeButtonText}>✕</Text>
            </BlurView>
          </TouchableOpacity>
        </View>

        <View style={[styles.contentContainer, { backgroundColor: colors.background }]}>
          <View style={styles.header}>
            <Text style={[styles.birdName, { color: colors.text }]}>{bird.name}</Text>
            <LinearGradient
              colors={colors.primaryGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.rarityBadge}
            >
              <Text style={styles.rarityText}>{bird.rarity}</Text>
            </LinearGradient>
            
            <Animated.View style={[styles.xpFloating, animatedXpStyle]}>
              <Text style={[styles.xpFloatingText, { color: colors.primary }]}>+{xpReward} XP</Text>
            </Animated.View>
          </View>
          
          <Text style={[styles.scientificName, { color: colors.textMuted }]}>{bird.scientificName}</Text>
          
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          
          <Text style={[styles.sectionTitle, { color: colors.text }]}>About</Text>
          <Text style={[styles.description, { color: colors.text }]}>{bird.description}</Text>
          
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Statistics</Text>
          
          <View style={[styles.statsGrid]}>
            <View style={[styles.statBox, { backgroundColor: colors.surface, shadowColor: colors.cardShadow }]}>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Length</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>{bird.length}</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: colors.surface, shadowColor: colors.cardShadow }]}>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Weight</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>{bird.weight}</Text>
            </View>
          </View>

          <View style={[styles.statsGrid, { marginTop: 12 }]}>
            <View style={[styles.statBox, { backgroundColor: colors.surface, shadowColor: colors.cardShadow, flex: 2 }]}>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Your Discoveries</Text>
              <View style={styles.countRow}>
                <Text style={[styles.statValue, { color: colors.primary, fontSize: 32 }]}>
                  {getSightingCount(bird.id)}
                </Text>
                <Text style={[styles.countSub, { color: colors.textMuted }]}> sightings</Text>
              </View>
            </View>
            {lastSighting && (
              <View style={[styles.statBox, { backgroundColor: colors.surface, shadowColor: colors.cardShadow, flex: 3, marginLeft: 12 }]}>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>Last Sighted</Text>
                <Text style={[styles.statValue, { color: colors.text, fontSize: 16 }]}>
                  {new Date(lastSighting.timestamp).toLocaleDateString()} at {new Date(lastSighting.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
                {lastSighting.latitude && (
                   <Text style={[styles.locationText, { color: colors.primary }]}>
                     📍 {lastSighting.latitude.toFixed(4)}, {lastSighting.longitude?.toFixed(4)}
                   </Text>
                )}
              </View>
            )}
          </View>

          <View style={[styles.xpProgressContainer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
            <View style={styles.xpProgressHeader}>
              <Text style={[styles.levelLabel, { color: colors.text }]}>{rankTitle}</Text>
              <Text style={[styles.xpNeeded, { color: colors.textMuted }]}>Level {userLevel}</Text>
            </View>
            <View style={[styles.progressBarBg, { backgroundColor: colors.surfaceGlass }]}>
              <View style={[styles.progressBarFill, { backgroundColor: colors.primary, width: `${nextLevelProgress * 100}%` }]} />
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
  },
  imageWrapper: {
    height: height * 0.45,
    width: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 24,
    borderRadius: 20,
    overflow: 'hidden',
  },
  closeBlur: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 10,
    paddingBottom: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: -20,
  },
  birdName: {
    fontSize: 36,
    fontWeight: '900',
    flex: 1,
    letterSpacing: -0.5,
  },
  rarityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 16,
    marginTop: 8,
  },
  rarityText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  scientificName: {
    fontSize: 18,
    fontStyle: 'italic',
    marginTop: 8,
  },
  divider: {
    height: 1,
    marginVertical: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 16,
  },
  description: {
    fontSize: 17,
    lineHeight: 28,
    marginBottom: 36,
    fontWeight: '400',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBox: {
    flex: 1,
    padding: 20,
    borderRadius: 20,
    marginHorizontal: 6,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 5,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  countRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 8,
  },
  countSub: {
    fontSize: 16,
    fontWeight: '600',
  },
  xpFloating: {
    position: 'absolute',
    right: 0,
    top: -40,
  },
  xpFloatingText: {
    fontSize: 24,
    fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  xpProgressContainer: {
    marginTop: 40,
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  xpProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  levelLabel: {
    fontSize: 16,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  xpNeeded: {
    fontSize: 14,
    fontWeight: '700',
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    width: '100%',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  locationText: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
});
