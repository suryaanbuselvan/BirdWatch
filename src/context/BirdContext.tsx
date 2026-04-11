import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Bird, BURD_DATABASE } from '../data/birds';
import { MISSIONS } from '../data/missions';
import { useUser } from './UserContext';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as FileSystem from 'expo-file-system';
import { GEMINI_CONFIG } from '../config/ai';

export interface CaptureRecord {
  uid: string;
  bird: Bird;
  timestamp: string;
  latitude?: number;
  longitude?: number;
}

export interface MissionProgress {
  missionId: string;
  completedBirdIds: string[];
  isCompleted: boolean;
}

interface BirdContextType {
  captureHistory: CaptureRecord[];
  addBirdToCollection: (bird: Bird, coords?: { latitude: number; longitude: number }) => Promise<void>;
  getDailyStreak: () => number;
  getConsecutiveStreak: () => number;
  getSightingCount: (birdId: string) => number;
  isLoading: boolean;
  totalXp: number;
  userLevel: number;
  rankTitle: string;
  nextLevelProgress: number; // 0 to 1
  missions: MissionProgress[];
  analyzeImage: (uri: string) => Promise<{ bird: Bird; confidence: number; probabilityMatrix: { name: string; probability: number }[] }>;
}

const BirdContext = createContext<BirdContextType | undefined>(undefined);

const STORAGE_KEY = '@birdwatch_v4_history';
const MISSIONS_KEY = '@birdwatch_missions';

export function BirdProvider({ children }: { children: ReactNode }) {
  const [captureHistory, setCaptureHistory] = useState<CaptureRecord[]>([]);
  const [missions, setMissions] = useState<MissionProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { unlockBadge } = useUser();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [historyData, missionData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEY),
        AsyncStorage.getItem(MISSIONS_KEY)
      ]);
      
      if (historyData) setCaptureHistory(JSON.parse(historyData));
      
      if (missionData) {
        setMissions(JSON.parse(missionData));
      } else {
        // Initialize missions
        const initialMissions = MISSIONS.map(m => ({
          missionId: m.id,
          completedBirdIds: [],
          isCompleted: false
        }));
        setMissions(initialMissions);
        await AsyncStorage.setItem(MISSIONS_KEY, JSON.stringify(initialMissions));
      }
    } catch (e) {
      console.error('Failed to load data', e);
    } finally {
      setIsLoading(false);
    }
  };

  const { totalXp, userLevel, rankTitle, nextLevelProgress } = React.useMemo(() => {
    let xp = 0;
    captureHistory.forEach(record => {
      switch (record.bird.rarity) {
        case 'Legendary': xp += 1000; break;
        case 'Rare': xp += 500; break;
        case 'Uncommon': xp += 150; break;
        default: xp += 50; break;
      }
    });

    // Add XP from completed missions
    missions.forEach(mp => {
      if (mp.isCompleted) {
        const missionInfo = MISSIONS.find(m => m.id === mp.missionId);
        if (missionInfo) xp += missionInfo.xpReward;
      }
    });

    const level = Math.floor(xp / 1000) + 1;
    const progress = (xp % 1000) / 1000;
    
    let title = 'Fledgling';
    if (level >= 31) title = 'Master Ornithologist';
    else if (level >= 16) title = 'Avian Expert';
    else if (level >= 6) title = 'Bird Observer';

    return { totalXp: xp, userLevel: level, rankTitle: title, nextLevelProgress: progress };
  }, [captureHistory, missions]);

  const getConsecutiveStreak = (): number => {
    if (captureHistory.length === 0) return 0;

    const dates = captureHistory
      .map(h => new Date(h.timestamp).setHours(0, 0, 0, 0))
      .sort((a, b) => b - a);
    
    // Remove duplicates
    const uniqueDates = [...new Set(dates)];
    
    const today = new Date().setHours(0, 0, 0, 0);
    const yesterday = today - 86400000;

    // If the last capture wasn't today or yesterday, streak is 0
    if (uniqueDates[0] < yesterday) return 0;
    
    let streak = 0;
    let currentDate = uniqueDates[0] === today ? today : uniqueDates[0];

    for (let i = 0; i < uniqueDates.length; i++) {
        if (uniqueDates[i] === currentDate) {
            streak++;
            currentDate -= 86400000;
        } else {
            break;
        }
    }
    return streak;
  };

  const checkAchievements = (bird: Bird) => {
    // 🐣 First Discovery
    if (captureHistory.length === 0) {
      unlockBadge('first_scan');
    }

    // 🔥 3-Day Streak
    if (getConsecutiveStreak() >= 3) {
      unlockBadge('three_streak');
    }

    // 🏆 Collector 10
    const uniqueCount = new Set([...captureHistory.map(h => h.bird.id), bird.id]).size;
    if (uniqueCount >= 10) {
      unlockBadge('collector_10');
    }

    // ✨ Rare Find
    if (bird.rarity === 'Rare' || bird.rarity === 'Legendary') {
      unlockBadge('rare_find');
    }

    // 🦉 Night Owl (10 PM - 4 AM)
    const hours = new Date().getHours();
    if (hours >= 22 || hours <= 4) {
      unlockBadge('night_owl');
    }
  };

  const updateMissionProgress = async (bird: Bird) => {
    const updatedMissions = missions.map(mp => {
      const missionInfo = MISSIONS.find(m => m.id === mp.missionId);
      if (!missionInfo || mp.isCompleted) return mp;

      if (missionInfo.requiredBirdIds.includes(bird.id)) {
        const newCompletedIds = [...new Set([...mp.completedBirdIds, bird.id])];
        const isNowCompleted = newCompletedIds.length === missionInfo.requiredBirdIds.length;
        return {
          ...mp,
          completedBirdIds: newCompletedIds,
          isCompleted: isNowCompleted
        };
      }
      return mp;
    });

    setMissions(updatedMissions);
    await AsyncStorage.setItem(MISSIONS_KEY, JSON.stringify(updatedMissions));
  };

  const addBirdToCollection = async (bird: Bird, coords?: { latitude: number; longitude: number }) => {
    try {
      checkAchievements(bird);
      await updateMissionProgress(bird);

      const newRecord: CaptureRecord = {
        uid: Math.random().toString(36).substring(7),
        bird: bird,
        timestamp: new Date().toISOString(),
        latitude: coords?.latitude || 37.78825 + (Math.random() - 0.5) * 0.1,
        longitude: coords?.longitude || -122.4324 + (Math.random() - 0.5) * 0.1,
      };
      
      const newHistory = [newRecord, ...captureHistory];
      setCaptureHistory(newHistory);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
    } catch (e) {
      console.error('Failed to save record', e);
    }
  };

  const analyzeImage = async (uri: string) => {
    try {
      const genAI = new GoogleGenerativeAI(GEMINI_CONFIG.API_KEY);
      const model = genAI.getGenerativeModel({ model: GEMINI_CONFIG.MODEL_NAME });

      // 1. Prepare Image Data (Base64)
      let base64Data = '';
      let mimeType = 'image/jpeg';

      if (Platform.OS === 'web') {
        const response = await fetch(uri);
        const blob = await response.blob();
        base64Data = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
          reader.readAsDataURL(blob);
        });
      } else {
        base64Data = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
      }

      // 2. Call Gemini Vision
      const prompt = GEMINI_CONFIG.INSTRUCTIONS;
      const imagePart = {
        inlineData: {
          data: base64Data,
          mimeType
        }
      };

      const result = await model.generateContent([prompt, imagePart]);
      const response = await result.response;
      const text = response.text();
      console.log('[Gemini ID Raw Response]:', text);
      
      // Clean up JSON response if AI wrapped it in markdown blocks
      const jsonStr = text.replace(/```json|```/g, '').trim();
      let aiResponse;
      try {
        aiResponse = JSON.parse(jsonStr);
      } catch (parseError) {
        console.error('Failed to parse AI response:', text);
        throw new Error('Our AI provided an unreadable response. Please try again.');
      }

      if (aiResponse.error) {
        throw new Error(aiResponse.error);
      }

      // 3. Robust Mapping to Bird Object
      // AI sometimes returns 'commonName' or 'species' instead of 'name'
      const name = aiResponse.name || aiResponse.commonName || aiResponse.species || 'Unknown Bird';
      const scientificName = aiResponse.scientificName || aiResponse.scientific_name || 'Aves unknown';
      const rarity = aiResponse.rarity || 'Common';
      const description = aiResponse.description || 'A fascinating bird species.';
      const length = aiResponse.length || 'Unknown';
      const weight = aiResponse.weight || 'Unknown';

      // Check if we have this bird in our database already
      let identifiedBird = BURD_DATABASE.find(b => 
        (name && b.name.toLowerCase() === name.toLowerCase()) || 
        (scientificName && b.scientificName.toLowerCase() === scientificName.toLowerCase())
      );

      if (!identifiedBird) {
        // Create a dynamic bird profile
        identifiedBird = {
          id: name.toLowerCase().replace(/\s+/g, '-'),
          name: name,
          scientificName: scientificName,
          rarity: rarity as any,
          description: description,
          imageUrl: uri,
          length: length,
          weight: weight
        };
      }

      // Generate organic probability matrix from AI confidence
      const confidence = aiResponse.confidence || 0.95;
      const matrix = [
        { name: identifiedBird.name, probability: Math.round(confidence * 100) },
        { name: 'Unknown Aves', probability: Math.round((1 - confidence) * 100) }
      ];

      return {
        bird: identifiedBird,
        confidence,
        probabilityMatrix: matrix
      };

    } catch (e: any) {
      console.error('Gemini ID Failed:', e);
      // Re-throw specific error to be handled by the UI
      throw new Error(e.message || 'Identification failed');
    }
  };

  const getDailyStreak = (): number => {
    const today = new Date().setHours(0, 0, 0, 0);
    return captureHistory.filter(h => new Date(h.timestamp).setHours(0, 0, 0, 0) === today).length;
  };

  const getSightingCount = (birdId: string): number => {
    return captureHistory.filter(record => record.bird.id === birdId).length;
  };

  return (
    <BirdContext.Provider value={{ 
      captureHistory, 
      addBirdToCollection, 
      getDailyStreak, 
      getConsecutiveStreak,
      getSightingCount, 
      isLoading,
      totalXp,
      userLevel,
      rankTitle,
      nextLevelProgress,
      missions,
      analyzeImage
    }}>
      {children}
    </BirdContext.Provider>
  );
}

export function useBirds() {
  const context = useContext(BirdContext);
  if (context === undefined) {
    throw new Error('useBirds must be used within a BirdProvider');
  }
  return context;
}

