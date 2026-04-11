import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList } from '../navigation/types';
import { useTheme } from '../context/ThemeContext';

type Props = NativeStackScreenProps<RootStackParamList, 'IdentificationFailure'>;

export default function IdentificationFailureScreen({ navigation, route }: Props) {
  const { colors } = useTheme();
  const { error } = route.params || {};

  const getErrorMessage = () => {
    if (error === 'Low confidence in identification') {
      return "The AI spotted a bird but wasn't sure enough of the species. Try getting closer or capturing a clearer profile shot.";
    }
    if (error === 'No bird detected') {
      return "Our AI couldn't find a bird in that capture. Make sure the subject is centered and well-lit.";
    }
    return error || "We couldn't identify the species this time. Please try again with a clearer photo.";
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={[styles.iconContainer, { backgroundColor: colors.surface, borderColor: colors.glassStroke }]}>
            <Text style={styles.icon}>{error === 'Low confidence in identification' ? '🔭' : '❓'}</Text>
          </View>
          
          <Text style={[styles.title, { color: colors.text }]}>Identity Uncertain</Text>
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
});
