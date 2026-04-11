import React from 'react';
import { StyleSheet } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { CaptureRecord } from '../context/BirdContext';

interface Props {
  captureHistory: CaptureRecord[];
  mapStyle: any[];
}

export default function MapComponent({ captureHistory, mapStyle }: Props) {
  return (
    <MapView
      provider={PROVIDER_GOOGLE}
      style={styles.map}
      customMapStyle={mapStyle}
      initialRegion={{
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }}
    >
      {captureHistory.map((capture) => (
        capture.latitude && capture.longitude ? (
          <Marker
            key={capture.uid}
            coordinate={{ latitude: capture.latitude, longitude: capture.longitude }}
            title={capture.bird.name}
            description={`Spotted on ${new Date(capture.timestamp).toLocaleDateString()}`}
          />
        ) : null
      ))}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});
