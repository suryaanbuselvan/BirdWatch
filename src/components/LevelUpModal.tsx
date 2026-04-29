import React from 'react';
import { StyleSheet, View, Text, Modal, TouchableOpacity, Dimensions } from 'react-native';
import LottieView from 'lottie-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  visible: boolean;
  level: number;
  rank: string;
  onClose: () => void;
  colors: any;
}

const { width, height } = Dimensions.get('window');

export default function LevelUpModal({ visible, level, rank, onClose, colors }: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <LottieView
          source={{ uri: 'https://lottie.host/809c95d9-43c2-482d-8b01-f1a28a1ea5f0/86R7z8G00z.json' }} // Confetti
          autoPlay
          loop={false}
          pointerEvents="none"
          style={styles.confetti}
        />
        
        <View style={styles.cardContainer}>
          <LinearGradient
            colors={['#1e293b', '#0f172a']}
            style={styles.modalCard}
          >
            <View style={styles.iconCircle}>
              <LottieView
                source={{ uri: 'https://assets5.lottiefiles.com/packages/lf20_touohxv0.json' }} // Star/Trophy
                autoPlay
                loop
                style={styles.starIcon}
              />
            </View>

            <Text style={styles.title}>LEVEL UP!</Text>
            
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>{level}</Text>
            </View>

            <Text style={styles.rankTitle}>{rank}</Text>
            
            <Text style={styles.message}>
              You've evolved! New missions and rarer birds are now more likely to appear in your area.
            </Text>

            <TouchableOpacity 
              activeOpacity={0.7}
              style={[styles.button, { backgroundColor: colors?.primary || '#3b82f6' }]}
              onPress={onClose}
            >
              <Text style={styles.buttonText}>Keep Exploring</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" style={{ marginLeft: 8 }} />
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confetti: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  cardContainer: {
    width: width * 0.85,
    zIndex: 2,
  },
  modalCard: {
    borderRadius: 30,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  starIcon: {
    width: 150,
    height: 150,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fbbf24',
    letterSpacing: 2,
    marginBottom: 10,
  },
  levelBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 4,
    borderColor: '#fff',
  },
  levelText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
  },
  rankTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 15,
  },
  message: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  button: {
    flexDirection: 'row',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
