import React from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import { BADGES } from '../data/badges';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Badges'>;
};

const { width } = Dimensions.get('window');

export default function BadgesScreen({ navigation }: Props) {
  const { theme, colors } = useTheme();
  const { unlockedBadges } = useUser();

  const renderBadge = ({ item, index }: { item: typeof BADGES[0], index: number }) => {
    const isUnlocked = unlockedBadges.includes(item.id);

    return (
      <Animated.View 
        entering={FadeInDown.delay(index * 100).springify()}
        style={[styles.badgeContainer, { opacity: isUnlocked ? 1 : 0.6, borderColor: colors.glassStroke }]}
      >
        {Platform.OS !== 'web' ? (
          <BlurView intensity={60} tint={theme} style={StyleSheet.absoluteFill} />
        ) : <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.surfaceGlass }]} />}
        
        <View style={[styles.badgeIconWrapper, { shadowColor: isUnlocked ? colors.primary : '#000' }]}>
          <LinearGradient
            colors={isUnlocked ? colors.primaryGradient : ['#475569', '#1E293B']}
            style={styles.badgeGradient}
          >
            <Text style={styles.badgeIcon}>{isUnlocked ? item.icon : '🔒'}</Text>
          </LinearGradient>
        </View>
        
        <Text style={[styles.badgeTitle, { color: colors.text }]}>{item.title.toUpperCase()}</Text>
        <Text style={[styles.badgeDescription, { color: colors.textMuted }]} numberOfLines={2}>
          {isUnlocked ? item.description : 'Explore more to unlock this milestone'}
        </Text>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <View style={[styles.circleBtn, { backgroundColor: colors.surfaceGlass, borderColor: colors.glassStroke }]}>
            <Text style={{ color: colors.text, fontSize: 18 }}>✕</Text>
          </View>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>THE TROPHY ROOM</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.content}>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          CELEBRATING YOUR JOURNEY THROUGH THE AVIAN WORLD.
        </Text>

        <FlatList
          data={BADGES}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.listContainer}
          columnWrapperStyle={styles.row}
          renderItem={({ item, index }) => renderBadge({ item, index })}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
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
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 2,
  },
  content: {
    flex: 1,
  },
  subtitle: {
    textAlign: 'center',
    paddingHorizontal: 40,
    marginBottom: 40,
    fontSize: 11,
    lineHeight: 18,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  row: {
    justifyContent: 'space-between',
    paddingBottom: 24,
  },
  badgeContainer: {
    width: (width - 48) / 2,
    borderRadius: 36,
    padding: 24,
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
  },
  badgeIconWrapper: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 8,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  badgeGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeIcon: {
    fontSize: 34,
  },
  badgeTitle: {
    fontSize: 13,
    fontWeight: '900',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 1,
  },
  badgeDescription: {
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 14,
    fontWeight: '600',
    opacity: 0.8,
  },
});


