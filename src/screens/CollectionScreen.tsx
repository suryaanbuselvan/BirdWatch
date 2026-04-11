import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useBirds, CaptureRecord } from '../context/BirdContext';
import { useTheme } from '../context/ThemeContext';

export default function CollectionScreen() {
  const { captureHistory } = useBirds();
  const { colors } = useTheme();

  const renderItem = ({ item }: { item: CaptureRecord }) => {
    const { bird, timestamp } = item;
    const captureDate = new Date(timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' });

    return (
      <View style={[styles.card, { backgroundColor: colors.surface, shadowColor: colors.cardShadow }]}>
        <Image source={{ uri: bird.imageUrl }} style={styles.thumbnail} />
        <View style={styles.cardContent}>
          <Text style={[styles.birdName, { color: colors.text }]}>{bird.name}</Text>
          <Text style={[styles.scientificName, { color: colors.textMuted }]}>{bird.scientificName}</Text>
          
          <View style={styles.badgesRow}>
            <LinearGradient
              colors={colors.primaryGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.rarityBadge}
            >
              <Text style={styles.rarityText}>{bird.rarity}</Text>
            </LinearGradient>
            
            <View style={[styles.dateBadge, { backgroundColor: colors.background }]}>
              <Text style={[styles.dateText, { color: colors.textMuted }]}>Captured {captureDate}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>Your Collection</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>Birds you've identified so far.</Text>
      </View>
      
      {captureHistory.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyText, { color: colors.text }]}>You haven't identified any birds yet.</Text>
          <Text style={[styles.emptySubtext, { color: colors.textMuted }]}>Go to the Home tab and scan a bird!</Text>
        </View>
      ) : (
        <FlatList
          data={captureHistory}
          keyExtractor={(item) => item.uid}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingTop: 40,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    marginTop: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 15,
    textAlign: 'center',
    marginTop: 12,
  },
  listContainer: {
    padding: 24,
    paddingBottom: 100,
  },
  card: {
    flexDirection: 'row',
    borderRadius: 20,
    marginBottom: 20,
    padding: 14,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 8,
  },
  thumbnail: {
    width: 90,
    height: 90,
    borderRadius: 16,
  },
  cardContent: {
    flex: 1,
    marginLeft: 18,
    justifyContent: 'center',
  },
  birdName: {
    fontSize: 19,
    fontWeight: '800',
  },
  scientificName: {
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 4,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  rarityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  rarityText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dateBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
  },
  dateText: {
    fontSize: 10,
    fontWeight: '600',
  },
});
