import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface Props {
  captureHistory: any;
  mapStyle: any;
}

export default function MapComponent({}: Props) {
  const { colors } = useTheme();
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Discovery Map</Text>
      <Text style={[styles.subtitle, { color: colors.textMuted }]}>
        The interactive map is optimized for mobile devices.{"\n\n"}
        To enjoy the full exploration experience, please open this app in **Expo Go** on your iOS or Android phone!
      </Text>
      <View style={[styles.webPlaceholder, { borderColor: colors.primary }]}>
        <Text style={{ fontSize: 40 }}>📍</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 16,
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
  },
  webPlaceholder: {
    marginTop: 40,
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.5,
  }
});
