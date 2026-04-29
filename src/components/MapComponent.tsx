import React from 'react';
import { StyleSheet, View, Image, Platform } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { CaptureRecord } from '../context/BirdContext';

interface Props {
  captureHistory: CaptureRecord[];
  mapStyle: any[];
  onMarkerPress: (birdId: string, captureUid: string) => void;
  colors: any;
}

export default function MapComponent({ captureHistory, mapStyle, onMarkerPress, colors }: Props) {
  // Smart Centering: Initial region based on most recent sighting
  const latestSighting = captureHistory.length > 0 ? captureHistory[0] : null;
  
  const initialRegion = {
    latitude: latestSighting?.latitude || 37.78825,
    longitude: latestSighting?.longitude || -122.4324,
    latitudeDelta: 0.5,
    longitudeDelta: 0.5,
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Legendary': return colors.glowPurple || '#a855f7';
      case 'Rare': return colors.primary || '#10b981';
      case 'Uncommon': return '#0ea5e9';
      default: return '#94a3b8';
    }
  };

  return (
    <MapView
      provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
      style={styles.map}
      customMapStyle={mapStyle}
      initialRegion={initialRegion}
    >
      {captureHistory.map((capture) => (
        capture.latitude && capture.longitude ? (
          <Marker
            key={capture.uid}
            coordinate={{ latitude: capture.latitude, longitude: capture.longitude }}
            onPress={() => onMarkerPress(capture.bird.id, capture.uid)}
          >
            <View style={[styles.markerContainer, { shadowColor: getRarityColor(capture.bird.rarity) }]}>
              <View style={[styles.photoRing, { borderColor: getRarityColor(capture.bird.rarity) }]}>
                 <Image source={{ uri: capture.bird.imageUrl }} style={styles.markerImage} />
              </View>
              <View style={[styles.markerStem, { backgroundColor: getRarityColor(capture.bird.rarity) }]} />
            </View>
          </Marker>
        ) : null
      ))}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 10,
  },
  photoRing: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    backgroundColor: '#000',
    overflow: 'hidden',
    padding: 1,
  },
  markerImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  markerStem: {
    width: 3,
    height: 6,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
  }
});
