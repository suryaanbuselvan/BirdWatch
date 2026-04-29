import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image, Dimensions, StatusBar, ImageBackground } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList } from '../navigation/types';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';

type Props = NativeStackScreenProps<RootStackParamList, 'SignIn'>;

export default function SignInScreen({ navigation }: Props) {
  const { signIn, isLoading } = useUser();
  const { colors, theme } = useTheme();

  return (
    <ImageBackground 
      source={require('../../assets/bg_signin.jpg')} 
      style={styles.container}
    >
      <LinearGradient
        colors={[
          theme === 'dark' ? 'rgba(2,6,23,0.3)' : 'rgba(255,255,255,0.2)', 
          theme === 'dark' ? 'rgba(2,6,23,0.95)' : 'rgba(255,255,255,0.95)'
        ]}
        style={StyleSheet.absoluteFill}
      />
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />

      <SafeAreaView style={styles.content}>
        <View style={styles.header}>
          <View style={[styles.logoContainer, { borderColor: colors.primary + '40' }]}>
            <Image 
              source={require('../../assets/icon.jpg')} 
              style={styles.logo}
            />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>BirdWatch</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Identify and collect birds using AI
          </Text>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity 
            onPress={signIn} 
            disabled={isLoading}
            style={styles.signInButtonContainer}
          >
            <LinearGradient
              colors={colors.primaryGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.signInButton}
            >
              {isLoading ? (
                <Text style={styles.signInButtonText}>Signing in...</Text>
              ) : (
                <View style={styles.googleContainer}>
                  <View style={styles.googleIconCircle}>
                    <Text style={styles.googleLetter}>G</Text>
                  </View>
                  <Text style={styles.signInButtonText}>Sign in with Google</Text>
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <Text style={[styles.terms, { color: colors.textMuted }]}>
            By signing in, you agree to discover the wildlife around you.
          </Text>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 32,
    zIndex: 1,
  },
  header: {
    alignItems: 'center',
    marginTop: 100,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 30,
    borderWidth: 1,
    padding: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  logo: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 40,
    fontWeight: '900',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 12,
    fontWeight: '500',
    opacity: 0.8,
  },
  footer: {
    marginBottom: 60,
  },
  signInButtonContainer: {
    width: '100%',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  signInButton: {
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  googleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  googleIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  googleLetter: {
    color: '#059669',
    fontWeight: '900',
    fontSize: 18,
  },
  signInButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  terms: {
    textAlign: 'center',
    marginTop: 24,
    fontSize: 12,
    opacity: 0.6,
    paddingHorizontal: 20,
  },
});
