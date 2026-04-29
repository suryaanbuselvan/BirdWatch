import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { useBirds } from '../context/BirdContext';
import { useTheme } from '../context/ThemeContext';
import { MISSIONS, Mission } from '../data/missions';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

export default function MissionsScreen() {
  const { missions, colors, theme } = useBirds();
  const { colors: themeColors } = useTheme();

  const renderMissionCard = ({ item }: { item: Mission }) => {
    const progress = missions.find(m => m.missionId === item.id);
    const completedCount = progress?.completedBirdIds.length || 0;
    const totalCount = item.requiredBirdIds.length;
    const isCompleted = progress?.isCompleted || false;
    const percent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

    return (
      <View style={[styles.card, { backgroundColor: themeColors.surface }]}>
        <LinearGradient
          colors={isCompleted ? ['#4ade80', '#22c55e'] : [themeColors.surface, themeColors.surface]}
          style={styles.cardGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View style={styles.cardHeader}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>{item.icon}</Text>
            </View>
            <View style={styles.headerText}>
              <Text style={[styles.missionTitle, { color: isCompleted ? '#fff' : themeColors.text }]}>
                {item.title}
              </Text>
              <Text style={[styles.rewardText, { color: isCompleted ? '#f0fdf4' : themeColors.textSecondary }]}>
                Reward: {item.xpReward} XP
              </Text>
            </View>
            {isCompleted && (
              <Ionicons name="checkmark-circle" size={28} color="#fff" />
            )}
          </View>

          <Text style={[styles.description, { color: isCompleted ? '#f0fdf4' : themeColors.textSecondary }]}>
            {item.description}
          </Text>

          {!isCompleted && (
            <View style={styles.progressSection}>
              <View style={styles.progressInfo}>
                <Text style={[styles.progressText, { color: themeColors.textSecondary }]}>
                  {completedCount} / {totalCount} Birds Found
                </Text>
                <Text style={[styles.progressPercent, { color: themeColors.primary }]}>
                  {Math.round(percent)}%
                </Text>
              </View>
              <View style={[styles.progressBarBg, { backgroundColor: themeColors.border }]}>
                <View 
                  style={[
                    styles.progressBarFill, 
                    { width: `${percent}%`, backgroundColor: themeColors.primary }
                  ]} 
                />
              </View>
            </View>
          )}
        </LinearGradient>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <FlatList
        data={MISSIONS}
        renderItem={renderMissionCard}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={() => (
          <View style={styles.header}>
            <Text style={[styles.title, { color: themeColors.text }]}>Active Quests</Text>
            <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
              Complete sightings to earn massive XP and evolve your rank.
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 25,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
  },
  card: {
    borderRadius: 24,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
  },
  cardGradient: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  icon: {
    fontSize: 30,
  },
  headerText: {
    flex: 1,
  },
  missionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  rewardText: {
    fontSize: 14,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  progressSection: {
    marginTop: 5,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressPercent: {
    fontSize: 12,
    fontWeight: '700',
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
});
