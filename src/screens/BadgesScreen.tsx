import React from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, TouchableOpacity, Dimensions, Platform, ImageBackground, Image } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import { BADGES } from '../data/badges';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withRepeat, withTiming, interpolate, FadeIn } from 'react-native-reanimated';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Badges'>;
};

const { width, height } = Dimensions.get('window');

const LIGHT_BG = 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?q=80&w=1000&auto=format&fit=crop';
const DARK_BG = 'https://images.unsplash.com/photo-1501854140801-50d01698950b?q=80&w=1000&auto=format&fit=crop';

export default function BadgesScreen({ navigation }: Props) {
  const { theme, colors } = useTheme();
  const { unlockedBadges } = useUser();

  const blob1Pos = useSharedValue(0);
  const blob2Pos = useSharedValue(0);

  React.useEffect(() => {
    blob1Pos.value = withRepeat(withTiming(1, { duration: 15000 }), -1, true);
    blob2Pos.value = withRepeat(withTiming(1, { duration: 20000 }), -1, true);
  }, []);

  const blob1Style = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(blob1Pos.value, [0, 1], [-50, 50]) },
      { translateY: interpolate(blob1Pos.value, [0, 1], [-30, 30]) }
    ],
  }));

  const blob2Style = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(blob2Pos.value, [0, 1], [50, -50]) },
      { translateY: interpolate(blob2Pos.value, [0, 1], [30, -30]) }
    ],
  }));

  const renderBadge = ({ item, index }: { item: typeof BADGES[0], index: number }) => {
    const isUnlocked = unlockedBadges.includes(item.id);

    return (
      <Animated.View 
        entering={FadeInDown.delay(index * 100).springify()}
        style={[
          styles.badgeContainer, 
          { 
            backgroundColor: colors.surfaceGlass, 
            borderColor: isUnlocked ? colors.primary : colors.glassStroke,
            opacity: isUnlocked ? 1 : 0.8
          }
        ]}
      >
        {Platform.OS !== 'web' ? (
          <BlurView intensity={30} tint={theme} style={StyleSheet.absoluteFill} />
        ) : null}
        
        <View style={[styles.badgeIconWrapper, { 
          shadowColor: isUnlocked ? colors.primary : '#000',
          borderColor: isUnlocked ? colors.primary + '80' : 'rgba(255,255,255,0.1)'
        }]}>
          <LinearGradient
            colors={isUnlocked ? colors.primaryGradient : ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.1)']}
            style={styles.badgeGradient}
          >
            <Text style={[styles.badgeIcon, { opacity: isUnlocked ? 1 : 0.3 }]}>
              {item.icon}
            </Text>
            {!isUnlocked && (
               <View style={styles.lockOverlay}>
                  <Ionicons name="lock-closed" size={16} color="rgba(255,255,255,0.5)" />
               </View>
            )}
          </LinearGradient>
        </View>
        
        <Text style={[styles.badgeTitle, { color: isUnlocked ? colors.text : colors.textMuted }]}>
          {item.title.toUpperCase()}
        </Text>
        <Text style={[styles.badgeDescription, { color: colors.textMuted }]} numberOfLines={3}>
          {isUnlocked ? item.description : 'Requirement locked... discover more to reveal.'}
        </Text>

        {isUnlocked && (
           <View style={[styles.unlockedTag, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="checkmark-circle" size={12} color={colors.primary} />
              <Text style={[styles.unlockedText, { color: colors.primary }]}>EARNED</Text>
           </View>
        )}
      </Animated.View>
    );
  };

  const backgroundUrl = theme === 'dark' ? DARK_BG : LIGHT_BG;

  return (
    <View style={styles.container}>
      <ImageBackground source={{ uri: backgroundUrl }} style={styles.bgImage}>
        <LinearGradient
          colors={[
            theme === 'dark' ? 'rgba(2,6,23,0.92)' : 'rgba(248,250,252,0.8)', 
            theme === 'dark' ? 'rgba(2,6,23,0.98)' : 'rgba(248,250,252,0.98)'
          ]}
          style={StyleSheet.absoluteFillObject}
        />

        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <Animated.View style={[styles.blob, blob1Style, { backgroundColor: colors.primary, top: '20%', left: '-10%', opacity: 0.1 }]} />
          <Animated.View style={[styles.blob, blob2Style, { backgroundColor: colors.glowPurple, bottom: '20%', right: '-10%', opacity: 0.1 }]} />
        </View>

        <SafeAreaView style={{ flex: 1 }}>
          <Animated.View entering={FadeIn.delay(100)} style={styles.header}>
            <TouchableOpacity 
               activeOpacity={0.8}
               style={styles.backButton} 
               onPress={() => navigation.goBack()}
            >
              <View style={[styles.circleBtn, { backgroundColor: colors.surfaceGlass, borderColor: colors.glassStroke }]}>
                <Ionicons name="close" size={24} color={colors.text} />
              </View>
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: colors.text }]}>GLOBAL ACHIEVEMENTS</Text>
            <View style={{ width: 44 }} />
          </Animated.View>

        <View style={styles.content}>
          <Animated.Text entering={FadeIn.delay(200)} style={[styles.subtitle, { color: colors.textMuted }]}>
             COLLECT ALL 16 ELITE MILESTONES TO BECOME A MASTER BIRDER.
          </Animated.Text>

          <FlatList
            data={BADGES}
            keyExtractor={(item) => item.id}
            numColumns={2}
            contentContainerStyle={styles.listContainer}
            columnWrapperStyle={styles.row}
            renderItem={renderBadge}
            showsVerticalScrollIndicator={false}
          />
        </View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bgImage: {
    flex: 1,
  },
  blob: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    filter: Platform.OS === 'web' ? 'blur(60px)' : undefined,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? 40 : 20,
    paddingBottom: 24,
    justifyContent: 'space-between',
  },
  backButton: {
    width: 44,
    height: 44,
  },
  circleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 3,
  },
  content: {
    flex: 1,
  },
  subtitle: {
    textAlign: 'center',
    paddingHorizontal: 40,
    marginBottom: 40,
    fontSize: 10,
    lineHeight: 16,
    fontWeight: '800',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  listContainer: {
    paddingHorizontal: 12,
    paddingBottom: 60,
  },
  row: {
    paddingHorizontal: 4,
    paddingBottom: 16,
  },
  badgeContainer: {
    flex: 1,
    margin: 8,
    borderRadius: 32,
    padding: 24,
    minHeight: 240,
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
  },
  badgeIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    elevation: 10,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  badgeGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeIcon: {
    fontSize: 36,
  },
  lockOverlay: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeTitle: {
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 1,
  },
  badgeDescription: {
    fontSize: 9,
    textAlign: 'center',
    lineHeight: 14,
    fontWeight: '700',
    opacity: 0.7,
  },
  unlockedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  unlockedText: {
    fontSize: 8,
    fontWeight: '900',
    marginLeft: 4,
    letterSpacing: 1.5,
  },
});


