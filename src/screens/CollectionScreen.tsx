import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { LinearGradient } from 'expo-linear-gradient';
import { useBirds, CaptureRecord } from '../context/BirdContext';
import { useTheme } from '../context/ThemeContext';

export default function CollectionScreen() {
  const { captureHistory } = useBirds();
  const { colors } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const renderItem = ({ item }: { item: CaptureRecord }) => {
    const { bird, timestamp, uid } = item;
    const captureDate = new Date(timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' });

    const getRarityConfig = () => {
      switch (bird.rarity) {
        case 'Legendary': return { shadow: '#a855f7', aura: ['rgba(168, 85, 247, 0.15)', 'transparent'] };
        case 'Rare': return { shadow: '#eab308', aura: ['rgba(234, 179, 8, 0.1)', 'transparent'] };
        case 'Uncommon': return { shadow: '#2dd4bf', aura: ['rgba(45, 212, 191, 0.05)', 'transparent'] };
        default: return { shadow: colors.cardShadow, aura: [colors.surface, colors.surface] };
      }
    };

    const rarityConfig = getRarityConfig();

    return (
      <TouchableOpacity 
        activeOpacity={0.7}
        onPress={() => navigation.navigate('Details', { birdId: bird.id, captureUid: uid })}
        style={[
          styles.card, 
          { 
            backgroundColor: colors.surface, 
            shadowColor: rarityConfig.shadow,
            borderColor: bird.rarity === 'Legendary' ? '#a855f7' : bird.rarity === 'Rare' ? '#eab308' : 'transparent',
            borderWidth: bird.rarity === 'Legendary' || bird.rarity === 'Rare' ? 1.5 : 0
          }
        ]}
      >
        <LinearGradient
          colors={rarityConfig.aura}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
        />
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
      </TouchableOpacity>
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
    borderRadius: 24,
    marginBottom: 20,
    padding: 14,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 10 },
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
