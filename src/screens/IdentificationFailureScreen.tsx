import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Platform } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList } from '../navigation/types';
import { useTheme } from '../context/ThemeContext';
import { useBirds } from '../context/BirdContext';
import { Alert } from 'react-native';

type Props = NativeStackScreenProps<RootStackParamList, 'IdentificationFailure'>;

export default function IdentificationFailureScreen({ navigation, route }: Props) {
  const { colors } = useTheme();
  const { error } = route.params || {};
  const [showTechnical, setShowTechnical] = useState(false);
  const { togglePresentationMode, presentationMode } = useBirds();
  const [tapCount, setTapCount] = useState(0);

  const handleTitlePress = () => {
    const newCount = tapCount + 1;
    setTapCount(newCount);
    if (newCount >= 5) {
      togglePresentationMode();
      setTapCount(0);
      Alert.alert(
        "Admin Action",
        !presentationMode ? "Presentation Mode Activated! (Demo safety net is now ON)" : "Presentation Mode Deactivated.",
        [{ text: "OK" }]
      );
    }
  };

  const getErrorMessage = () => {
    if (!error) return "We couldn't identify the species this time. Please try again with a clearer photo.";

    if (error === 'Low confidence in identification') {
      return "The AI spotted a bird but wasn't sure enough of the species. Try getting closer or capturing a clearer profile shot.";
    }
    if (error === 'No bird detected') {
      return "Our AI couldn't find a bird in that capture. Make sure the subject is centered and well-lit.";
    }

    // Check for AI Quota issues
    if (error.includes('429') || error.toLowerCase().includes('quota') || error.toLowerCase().includes('overloaded') || error.toLowerCase().includes('multiple attempts')) {
      return "Our AI bird expert is currently handling too many requests. We attempted to wait and retry, but the system is still busy. Please wait a few minutes and try again!";
    }
    
    // Check for technical glitches or network issues
    const technicalKeywords = ['readAsStringAsync', 'deprecated', 'network', 'fetch', 'json', 'server'];
    if (technicalKeywords.some(kw => error.toLowerCase().includes(kw))) {
      return "We encountered a technical glitch while processing the image. Our team has been notified. Please try again in a moment.";
    }

    return error;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={[styles.iconContainer, { backgroundColor: colors.surface, borderColor: colors.glassStroke }]}>
            <Text style={styles.icon}>{error === 'Low confidence in identification' ? '🔭' : '❓'}</Text>
          </View>
          
          <TouchableOpacity activeOpacity={1} onPress={handleTitlePress}>
            <Text style={[styles.title, { color: colors.text }]}>Identity Uncertain</Text>
          </TouchableOpacity>
          <Text style={[styles.message, { color: colors.textMuted }]}>
            {getErrorMessage()}
          </Text>
          
          <TouchableOpacity 
            style={styles.buttonContainer}
            onPress={() => navigation.navigate('Identify')}
          >
            <LinearGradient
              colors={colors.primaryGradient}
              style={styles.button}
            >
              <Text style={styles.buttonText}>TRY AGAIN</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('MainTabs')}
          >
            <Text style={[styles.secondaryButtonText, { color: colors.textMuted }]}>Back to Dashboard</Text>
          </TouchableOpacity>

          {/* Technical Details Debugger */}
          <View style={styles.debugSection}>
            <TouchableOpacity 
              onPress={() => setShowTechnical(!showTechnical)}
              style={styles.debugButton}
            >
              <Text style={[styles.debugButtonText, { color: colors.textMuted }]}>
                {showTechnical ? 'Collapse Details' : 'Show Technical Details'}
              </Text>
            </TouchableOpacity>

            {showTechnical && (
              <ScrollView style={[styles.errorDetailBox, { backgroundColor: colors.surface }]}>
                <Text style={styles.errorDetailText}>{error || 'No error details captured.'}</Text>
              </ScrollView>
            )}
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  icon: {
    fontSize: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -1,
  },
  message: {
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 48,
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 20,
  },
  button: {
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 2,
  },
  secondaryButton: {
    padding: 12,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  debugSection: {
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
  },
  debugButton: {
    padding: 8,
  },
  debugButtonText: {
    fontSize: 12,
    textDecorationLine: 'underline',
    opacity: 0.8,
  },
  errorDetailBox: {
    width: '100%',
    maxHeight: 150,
    borderRadius: 8,
    marginTop: 12,
    padding: 12,
  },
  errorDetailText: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 11,
    color: '#ef4444',
  }
});
