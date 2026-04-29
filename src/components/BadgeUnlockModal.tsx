import React from 'react';
import { StyleSheet, View, Text, Modal, TouchableOpacity, Dimensions, Animated } from 'react-native';
import LottieView from 'lottie-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Badge } from '../data/badges';

interface Props {
  visible: boolean;
  badge: Badge | null;
  onClose: () => void;
  colors: any;
}

const { width, height } = Dimensions.get('window');

export default function BadgeUnlockModal({ visible, badge, onClose, colors }: Props) {
  if (!badge) return null;

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
        
        <View style={styles.contentContainer}>
          <LinearGradient
            colors={['#0f172a', '#1e293b']}
            style={styles.card}
          >
            <View style={styles.badgeOuterCircle}>
              <View style={styles.badgeInnerCircle}>
                <Text style={styles.badgeIcon}>{badge.icon}</Text>
              </View>
              {/* Spinning Glow Effect */}
              <LottieView
                source={{ uri: 'https://assets1.lottiefiles.com/packages/lf20_mYvpt9.json' }} // Light glow
                autoPlay
                loop
                style={styles.glowAnim}
              />
            </View>

            <Text style={styles.newLabel}>NEW MILESTONE REACHED</Text>
            <Text style={styles.title}>{badge.title}</Text>
            <Text style={styles.description}>{badge.description}</Text>

            <View style={styles.rewardRow}>
              <Ionicons name="trophy" size={20} color="#fbbf24" />
              <Text style={styles.rewardText}>Achievement Unlocked</Text>
            </View>

            <TouchableOpacity 
              activeOpacity={0.8}
              style={[styles.button, { backgroundColor: colors.primary }]}
              onPress={onClose}
            >
              <Text style={styles.buttonText}>Collect</Text>
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
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confetti: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  contentContainer: {
    width: width * 0.85,
    zIndex: 2,
  },
  card: {
    borderRadius: 35,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  badgeOuterCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
  },
  badgeInnerCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
    elevation: 10,
    shadowColor: '#fbbf24',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
  },
  badgeIcon: {
    fontSize: 50,
  },
  glowAnim: {
    position: 'absolute',
    width: 200,
    height: 200,
    opacity: 0.6,
  },
  newLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#fbbf24',
    letterSpacing: 2,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 25,
  },
  rewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 35,
  },
  rewardText: {
    color: '#fbbf24',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 8,
    textTransform: 'uppercase',
  },
  button: {
    width: '100%',
    height: 55,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
});
