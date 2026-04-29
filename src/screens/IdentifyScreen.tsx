import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ActivityIndicator, Image, Platform, Dimensions } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { RootStackParamList } from '../navigation/types';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useBirds } from '../context/BirdContext';
import { Bird } from '../data/birds';
import { useTheme } from '../context/ThemeContext';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence, FadeIn, SlideInUp } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

type IdentificationResult = {
  bird: Bird;
  confidence: number;
  probabilityMatrix: { name: string; probability: number }[];
};

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Identify'>;
};

export default function IdentifyScreen({ navigation }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = React.useRef<CameraView>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scanMode, setScanMode] = useState<'camera' | 'audio'>('camera');
  const [result, setResult] = useState<IdentificationResult | null>(null);
  const [lastCaptureUid, setLastCaptureUid] = useState<string | null>(null);
  const [zoom, setZoom] = useState(0);
  const { addBirdToCollection, analyzeImage } = useBirds();
  const { colors, theme } = useTheme();

  // Scanning progress for visual feedback
  const scanProgress = useSharedValue(0);
  const loadingStyle = useAnimatedStyle(() => ({
    width: `${scanProgress.value * 100}%`
  }));

  // Waveform animation
  const heights = [
    useSharedValue(10), useSharedValue(20), useSharedValue(15), 
    useSharedValue(30), useSharedValue(10), useSharedValue(25)
  ];

  useEffect(() => {
    if (scanMode === 'audio' && isAnalyzing) {
      heights.forEach((h, i) => {
        h.value = withRepeat(
          withSequence(
            withTiming(Math.random() * 40 + 20, { duration: 300 }),
            withTiming(10, { duration: 300 })
          ),
          -1,
          true
        );
      });
    } else {
      heights.forEach(h => h.value = withTiming(10));
    }
  }, [scanMode, isAnalyzing]);

  const animatedMockZoom = useAnimatedStyle(() => ({
    transform: [{ scale: withTiming(1 + zoom * 2, { duration: 300 }) }]
  }));

  const animatedZoomGauge = useAnimatedStyle(() => ({
    height: withTiming(`${zoom * 100}%`, { duration: 300 })
  }));

  const handleCapture = async () => {
    if (isAnalyzing) return;
    
    setIsAnalyzing(true);
    scanProgress.value = withTiming(1, { duration: 5000 });
    
    try {
      // Small delay on web to ensure video element has data
      if (Platform.OS === 'web') {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      // 1. Capture real photo
      let photoUri = 'mock-uri';
      if (cameraRef.current) {
        try {
          const photo = await cameraRef.current.takePictureAsync({
            quality: 0.8,
          });
          if (photo) photoUri = photo.uri;
        } catch (captureError) {
          console.warn('Camera capture failed:', captureError);
          throw new Error('Camera capture failed. Please make sure camera permissions are granted and try again.');
        }
      }

      // 2. Get real location in parallel with analysis (native only)
      let locationPromise = Promise.resolve(null as Location.LocationObject | null);
      if (Platform.OS !== 'web') {
        locationPromise = Location.requestForegroundPermissionsAsync()
          .then(res => res.granted ? Location.getCurrentPositionAsync({}) : null);
      }

      // 3. Perform Real AI Analysis (Gemini)
      const analysisResult = await analyzeImage(photoUri);
      const location = await locationPromise;

      setResult(analysisResult);
      setIsAnalyzing(false);
      scanProgress.value = 0;

      // 4. Auto-save to collection with real coordinates
      const savedRecord = await addBirdToCollection(analysisResult.bird, location ? {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      } : undefined);

      setLastCaptureUid(savedRecord.uid);

    } catch (e: any) {
      console.error('Capture/ID Failed:', e);
      setIsAnalyzing(false);
      scanProgress.value = 0;
      navigation.navigate('IdentificationFailure', { error: e.message }); 
    }
  };

  const handleConfirm = () => {
    if (result) {
      navigation.navigate('Details', { 
        birdId: result.bird.id, 
        captureUid: lastCaptureUid || undefined 
      });
    }
  };

  if (!permission) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!permission.granted && Platform.OS !== 'web') {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.permissionText, { color: colors.text }]}>We need your permission to access the camera to identify birds.</Text>
        <TouchableOpacity onPress={requestPermission}>
          <LinearGradient colors={colors.primaryGradient} style={styles.permissionButton}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </LinearGradient>
        </TouchableOpacity>
        
        <TouchableOpacity style={{ marginTop: 24 }} onPress={() => navigation.goBack()}>
          <Text style={{ color: colors.textMuted }}>Cancel</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderAnalysisOverlay = () => (
    <BlurView intensity={70} tint={theme === 'dark' ? 'dark' : 'light'} style={styles.analyzingOverlay}>
      <Animated.View entering={FadeIn} style={[styles.analyzingBox, { backgroundColor: colors.surface, shadowColor: colors.cardShadow }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.analyzingText, { color: colors.text }]}>
          {scanMode === 'camera' ? 'Analyzing Visual Patterns...' : 'Processing Audio Spectrum...'}
        </Text>
        <View style={[styles.progressBarContainer, { backgroundColor: colors.surfaceGlass }]}>
          <Animated.View style={[styles.progressBar, { backgroundColor: colors.primary }, loadingStyle]} />
        </View>
        <Text style={[styles.analyzingSubtext, { color: colors.textMuted }]}>Running Neural Network ID v2.4</Text>
      </Animated.View>
    </BlurView>
  );

  const renderResults = () => {
    if (!result) return null;
    return (
      <View style={styles.resultsWrapper} key="results">
        <BlurView intensity={100} tint={theme} style={StyleSheet.absoluteFill} />
        <LinearGradient
          colors={theme === 'dark' ? ['rgba(2,6,23,0.4)', 'rgba(2,6,23,0.95)'] : ['rgba(255,255,255,0.4)', 'rgba(255,255,255,0.95)']}
          style={StyleSheet.absoluteFillObject}
        />
        
        <SafeAreaView style={{ flex: 1 }}>
          <Animated.View entering={SlideInUp.springify()} style={styles.resultsContent}>
            <View style={styles.resultHeader}>
              <View style={[styles.confidenceBadge, { backgroundColor: colors.primary + '20', borderColor: colors.primary }]}>
                <Text style={[styles.confidenceText, { color: colors.primary }]}>
                  {Math.round(result.confidence * 100)}% CONFIDENCE
                </Text>
              </View>
              <Text style={[styles.matchLabel, { color: colors.textMuted }]}>OPTIMAL MATCH DETECTED</Text>
              <Text style={[styles.matchName, { color: colors.text }]}>{result.bird.name}</Text>
              <Text style={[styles.matchScientific, { color: colors.primary }]}>{result.bird.scientificName}</Text>
            </View>
            
            <View style={styles.probabilitySection}>
              <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>PROBABILITY MATRIX</Text>
              {result.probabilityMatrix.map((item, index) => (
                <View key={index} style={styles.matrixRow}>
                  <View style={styles.matrixInfo}>
                    <Text style={[styles.matrixName, { color: colors.text }]}>{item.name}</Text>
                    <Text style={[styles.matrixProb, { color: index === 0 ? colors.primary : colors.textMuted }]}>
                      {item.probability}%
                    </Text>
                  </View>
                  <View style={[styles.matrixBarBg, { backgroundColor: colors.surfaceGlass }]}>
                    <Animated.View 
                      entering={FadeIn.delay(index * 200)}
                      style={[styles.matrixBarFill, { backgroundColor: index === 0 ? colors.primary : colors.textMuted, width: `${item.probability}%` }]} 
                    />
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.resultsActions}>
              <TouchableOpacity style={[styles.discardBtn, { backgroundColor: colors.surfaceGlass, borderColor: colors.glassStroke }]} onPress={() => setResult(null)}>
                <Text style={[styles.discardText, { color: colors.text }]}>Retake</Text>
              </TouchableOpacity>
              
              <TouchableOpacity onPress={handleConfirm} style={styles.confirmBtnWrapper}>
                <LinearGradient colors={colors.primaryGradient} style={styles.confirmBtn}>
                  <Text style={styles.confirmBtnText}>View Details</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </SafeAreaView>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {(!permission?.granted) ? (
        <View style={styles.camera}>
           <Animated.Image 
            source={{ uri: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?q=80&w=2000' }} 
            style={[
              StyleSheet.absoluteFill,
              animatedMockZoom
            ]} 
            resizeMode="cover" 
           />
           <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
           
           {!permission?.granted && (
             <View style={[StyleSheet.absoluteFillObject, { justifyContent: 'center', alignItems: 'center', padding: 40 }]}>
               <Text style={{ color: '#FFF', fontSize: 18, textAlign: 'center', marginBottom: 24, fontWeight: '600' }}>
                 Camera access is required for real bird identification.
               </Text>
               <TouchableOpacity onPress={requestPermission}>
                 <LinearGradient colors={['#10b981', '#059669']} style={{ paddingVertical: 12, paddingHorizontal: 24, borderRadius: 25 }}>
                   <Text style={{ color: '#FFF', fontWeight: '800' }}>Enable Camera</Text>
                 </LinearGradient>
               </TouchableOpacity>
             </View>
           )}
        </View>
      ) : (
        <CameraView style={styles.camera} facing="back" ref={cameraRef} zoom={zoom} pictureSize="640x480" />
      )}

      <View style={StyleSheet.absoluteFill}>
        {/* HUD Elements */}
        {scanMode === 'camera' && !isAnalyzing && !result && (
          <View style={styles.viewfinderContainer}>
            <View style={styles.viewfinderBox}>
               <View style={[styles.corner, styles.tl]} />
               <View style={[styles.corner, styles.tr]} />
               <View style={[styles.corner, styles.bl]} />
               <View style={[styles.corner, styles.br]} />
            </View>
            <Text style={styles.instructionText}>Position bird within the frame</Text>
          </View>
        )}

        {scanMode === 'camera' && !isAnalyzing && !result && (
          <View style={styles.zoomControlsContainer}>
            <View style={[styles.zoomSliderTrack, { backgroundColor: colors.surfaceGlass, borderColor: colors.glassStroke }]}>
              <TouchableOpacity 
                style={styles.zoomStep} 
                onPress={() => setZoom(Math.min(1, zoom + 0.1))}
              >
                <Text style={{ color: '#FFF', fontSize: 20 }}>+</Text>
              </TouchableOpacity>
              
              <View style={styles.zoomGauge}>
                <Animated.View style={[styles.zoomGaugeFill, { backgroundColor: colors.primary }, animatedZoomGauge]} />
              </View>

              <TouchableOpacity 
                style={styles.zoomStep} 
                onPress={() => setZoom(Math.max(0, zoom - 0.1))}
              >
                <Text style={{ color: '#FFF', fontSize: 20 }}>−</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.presetsContainer}>
              {[1, 2, 5].map((level) => (
                <TouchableOpacity 
                  key={level}
                  onPress={() => setZoom(level === 1 ? 0 : (level === 2 ? 0.2 : 0.5))}
                  style={[
                    styles.presetBtn, 
                    { 
                      backgroundColor: (level === 1 && zoom === 0) || (level === 2 && zoom === 0.2) || (level === 5 && zoom === 0.5) 
                        ? colors.primary 
                        : colors.surfaceGlass,
                      borderColor: colors.glassStroke
                    }
                  ]}
                >
                  <Text style={[styles.presetText, { color: '#FFF' }]}>{level}x</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {scanMode === 'audio' && !isAnalyzing && !result && (
          <View style={styles.audioContainer}>
            <View style={styles.waveform}>
              {heights.map((h, i) => (
                <Animated.View key={i} style={[styles.bar, { backgroundColor: colors.primary, height: h }]} />
              ))}
            </View>
            <Text style={styles.instructionText}>Listening for avian signatures...</Text>
          </View>
        )}

        {!isAnalyzing && !result && (
          <BlurView intensity={80} tint={theme === 'dark' ? 'dark' : 'light'} style={styles.controls}>
             <TouchableOpacity style={styles.navBtn} onPress={() => navigation.goBack()}>
                <Text style={[styles.navBtnText, { color: colors.text }]}>Cancel</Text>
             </TouchableOpacity>

             <TouchableOpacity style={styles.captureBtn} onPress={handleCapture}>
                <View style={[styles.captureRing, { borderColor: colors.primary }]}>
                   <View style={[styles.captureFill, { backgroundColor: colors.primary }]} />
                </View>
             </TouchableOpacity>

             <TouchableOpacity 
                style={[styles.navBtn, { backgroundColor: colors.surfaceGlass, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 }]} 
                onPress={() => setScanMode(scanMode === 'camera' ? 'audio' : 'camera')}
             >
                <Text style={{ fontSize: 20 }}>{scanMode === 'camera' ? '🎙️' : '📸'}</Text>
             </TouchableOpacity>
          </BlurView>
        )}

        {isAnalyzing && renderAnalysisOverlay()}
        {result && renderResults()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  permissionText: { fontSize: 18, textAlign: 'center', marginBottom: 32, lineHeight: 28 },
  permissionButton: { paddingVertical: 16, paddingHorizontal: 32, borderRadius: 30 },
  permissionButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  viewfinderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  viewfinderBox: { width: 280, height: 280, position: 'relative' },
  corner: { position: 'absolute', width: 40, height: 40, borderColor: '#FFF', borderWidth: 2 },
  tl: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 20 },
  tr: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 20 },
  bl: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 20 },
  br: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 20 },
  instructionText: { color: '#FFF', fontSize: 16, fontWeight: '700', marginTop: 40, textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 10 },
  audioContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  waveform: { flexDirection: 'row', alignItems: 'center', height: 100, gap: 8 },
  bar: { width: 10, borderRadius: 5 },
  controls: { position: 'absolute', bottom: 0, width: '100%', height: 150, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 40, paddingBottom: 40 },
  navBtn: { padding: 10 },
  navBtnText: { fontSize: 16, fontWeight: '700' },
  captureBtn: { width: 84, height: 84, justifyContent: 'center', alignItems: 'center' },
  captureRing: { width: 84, height: 84, borderRadius: 42, borderWidth: 4, padding: 6, justifyContent: 'center', alignItems: 'center' },
  captureFill: { width: '100%', height: '100%', borderRadius: 36 },
  analyzingOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  analyzingBox: { padding: 40, borderRadius: 32, alignItems: 'center', width: '85%', elevation: 20 },
  analyzingText: { marginTop: 24, fontSize: 20, fontWeight: '800', textAlign: 'center' },
  analyzingSubtext: { marginTop: 8, fontSize: 13, opacity: 0.6 },
  progressBarContainer: { width: '100%', height: 6, borderRadius: 3, marginTop: 24, overflow: 'hidden' },
  progressBar: { height: '100%' },
  resultsWrapper: { ...StyleSheet.absoluteFillObject, zIndex: 100 },
  resultsContent: { flex: 1, padding: 32, justifyContent: 'center' },
  resultHeader: { alignItems: 'center', marginBottom: 48 },
  confidenceBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1, marginBottom: 16 },
  confidenceText: { fontSize: 12, fontWeight: '900', letterSpacing: 1 },
  matchLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 2, marginBottom: 8 },
  matchName: { fontSize: 44, fontWeight: '900', textAlign: 'center', letterSpacing: -1.5 },
  matchScientific: { fontSize: 18, fontStyle: 'italic', marginTop: 4 },
  probabilitySection: { marginBottom: 48 },
  sectionLabel: { fontSize: 10, fontWeight: '900', letterSpacing: 2, marginBottom: 20 },
  matrixRow: { marginBottom: 16 },
  matrixInfo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  matrixName: { fontSize: 15, fontWeight: '700' },
  matrixProb: { fontSize: 14, fontWeight: '800' },
  matrixBarBg: { height: 4, borderRadius: 2, overflow: 'hidden' },
  matrixBarFill: { height: '100%', borderRadius: 2 },
  resultsActions: { flexDirection: 'row', gap: 16 },
  discardBtn: { flex: 1, height: 64, borderRadius: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  discardText: { fontSize: 16, fontWeight: '800' },
  confirmBtnWrapper: { flex: 2, height: 64 },
  confirmBtn: { flex: 1, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  confirmBtnText: { color: '#FFF', fontSize: 18, fontWeight: '900' },
  zoomControlsContainer: {
    position: 'absolute',
    right: 20,
    top: '25%',
    bottom: '35%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  zoomSliderTrack: {
    width: 44,
    flex: 1,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    paddingVertical: 10,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  zoomStep: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomGauge: {
    flex: 1,
    width: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    marginVertical: 10,
    justifyContent: 'flex-end',
  },
  zoomGaugeFill: {
    width: '100%',
    borderRadius: 2,
  },
  presetsContainer: {
    gap: 12,
  },
  presetBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  presetText: {
    fontSize: 13,
    fontWeight: '900',
  },
});
