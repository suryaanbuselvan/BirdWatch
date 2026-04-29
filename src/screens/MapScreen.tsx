import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useBirds } from '../context/BirdContext';
import { useTheme } from '../context/ThemeContext';
import MapComponent from '../components/MapComponent';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

export default function MapScreen() {
  const { captureHistory } = useBirds();
  const { colors, theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleMarkerPress = (birdId: string, captureUid: string) => {
    navigation.navigate('Details', { birdId, captureUid });
  };

  // Custom Map Style for Dark Theme
  const mapStyle = theme === 'dark' ? [
    {
      "elementType": "geometry",
      "stylers": [{ "color": "#212121" }]
    },
    {
      "elementType": "labels.icon",
      "stylers": [{ "visibility": "off" }]
    },
    {
      "elementType": "labels.text.fill",
      "stylers": [{ "color": "#757575" }]
    },
    {
      "elementType": "labels.text.stroke",
      "stylers": [{ "color": "#212121" }]
    },
    {
      "featureType": "water",
      "elementType": "geometry",
      "stylers": [{ "color": "#000000" }]
    }
  ] : [];

  return (
    <View style={styles.container}>
      <MapComponent 
        captureHistory={captureHistory} 
        mapStyle={mapStyle} 
        colors={colors}
        onMarkerPress={handleMarkerPress} 
      />

      <View style={[styles.headerOverlay, { backgroundColor: theme === 'dark' ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.8)' }]}>
        <Text style={[styles.title, { color: colors.text }]}>Discovery Map</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerOverlay: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    padding: 15,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
});
