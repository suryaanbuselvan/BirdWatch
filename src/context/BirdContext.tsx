import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Bird, BIRD_DATABASE } from '../data/birds';
import { MISSIONS } from '../data/missions';
import { useUser } from './UserContext';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as FileSystem from 'expo-file-system';
import { GEMINI_CONFIG } from '../config/ai';
import { supabase } from '../config/supabase';

export interface CaptureRecord {
  uid: string;
  bird: Bird;
  timestamp: string;
  latitude?: number;
  longitude?: number;
  isBounty?: boolean;
}

export interface MissionProgress {
  missionId: string;
  completedBirdIds: string[];
  isCompleted: boolean;
}

interface BirdContextType {
  captureHistory: CaptureRecord[];
  addBirdToCollection: (bird: Bird, coords?: { latitude: number; longitude: number }) => Promise<CaptureRecord>;
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
  dailyBountyId: string;
  presentationMode: boolean;
  togglePresentationMode: () => Promise<void>;
}

const BirdContext = createContext<BirdContextType | undefined>(undefined);

const STORAGE_KEY = '@birdwatch_v4_history';
const MISSIONS_KEY = '@birdwatch_missions';

export function BirdProvider({ children }: { children: ReactNode }) {
  const [captureHistory, setCaptureHistory] = useState<CaptureRecord[]>([]);
  const [missions, setMissions] = useState<MissionProgress[]>([]);
  const [dailyBountyId, setDailyBountyId] = useState<string>('b1');
  const [isLoading, setIsLoading] = useState(true);
  const [presentationMode, setPresentationMode] = useState(false);
  const { user, supabaseUserId, unlockBadge } = useUser();

  useEffect(() => {
    loadData();
  }, [supabaseUserId]);

  const loadData = async () => {
    try {
      const [historyData, missionData, bountyData, presentationData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEY),
        AsyncStorage.getItem(MISSIONS_KEY),
        AsyncStorage.getItem('@birdwatch_daily_bounty'),
        AsyncStorage.getItem('@birdwatch_presentation_mode')
      ]);

      if (historyData) setCaptureHistory(JSON.parse(historyData));
      if (presentationData) setPresentationMode(JSON.parse(presentationData));

      // Handle Daily Bounty
      const today = new Date().toDateString();
      if (bountyData) {
        const { id, date } = JSON.parse(bountyData);
        if (date === today) {
          setDailyBountyId(id);
        } else {
          const newBountyId = BIRD_DATABASE[Math.floor(Math.random() * BIRD_DATABASE.length)].id;
          setDailyBountyId(newBountyId);
          await AsyncStorage.setItem('@birdwatch_daily_bounty', JSON.stringify({ id: newBountyId, date: today }));
        }
      } else {
        const newBountyId = BIRD_DATABASE[Math.floor(Math.random() * BIRD_DATABASE.length)].id;
        setDailyBountyId(newBountyId);
        await AsyncStorage.setItem('@birdwatch_daily_bounty', JSON.stringify({ id: newBountyId, date: today }));
      }
      
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

      // Sync from Supabase if logged in
      if (supabaseUserId) {
        const { data, error } = await supabase
           .from('captures')
           .select('*')
           .order('created_at', { ascending: false });
           
        if (!error && data && data.length > 0) {
           const serverHistory: CaptureRecord[] = data.map((row: any) => {
              const baseBird = BIRD_DATABASE.find(b => b.id === row.bird_id) || BIRD_DATABASE[0];
              return {
                 uid: row.id,
                 bird: { ...baseBird, name: row.bird_name, rarity: row.rarity, imageUrl: row.image_url || baseBird.imageUrl },
                 timestamp: row.created_at,
                 latitude: row.latitude,
                 longitude: row.longitude,
                 isBounty: row.is_bounty
              };
           });
           setCaptureHistory(serverHistory);
           await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(serverHistory));
        }
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
      let cardXp = 0;
      switch (record.bird.rarity) {
        case 'Legendary': cardXp = 1000; break;
        case 'Rare': cardXp = 500; break;
        case 'Uncommon': cardXp = 150; break;
        default: cardXp = 50; break;
      }
      
      // Add XP from the bird capture
      xp += cardXp;
      if (record.isBounty) {
        xp += cardXp; // Add double XP for bounties
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
    // Achievements Logic
    if (captureHistory.length === 0) unlockBadge('first_scan');
    if (getConsecutiveStreak() >= 3) unlockBadge('three_streak');

    const currentUniqueCount = new Set([...captureHistory.map(h => h.bird.id), bird.id]).size;
    if (currentUniqueCount >= 10) unlockBadge('collector_10');

    if (bird.rarity === 'Rare' || bird.rarity === 'Legendary') unlockBadge('rare_find');

    const hours = new Date().getHours();
    if (hours >= 22 || hours <= 4) unlockBadge('night_owl');
    if (hours >= 5 && hours <= 8) unlockBadge('early_bird');

    const raptorIds = ['b4', 'b5', 'b6', 'b7', 'b14'];
    if (raptorIds.includes(bird.id)) unlockBadge('apex_predator');

    const songbirdIds = ['b1', 'b2', 'b3', 'b9', 'b15'];
    const capturedSongbirds = new Set(
      captureHistory.filter(h => songbirdIds.includes(h.bird.id)).map(h => h.bird.id)
    );
    if (songbirdIds.includes(bird.id)) capturedSongbirds.add(bird.id);
    if (capturedSongbirds.size >= 5) unlockBadge('songbird_serenade');

    if (bird.rarity === 'Legendary') unlockBadge('legendary_hunter');
    if (getConsecutiveStreak() >= 7) unlockBadge('seven_streak');

    const uniqueCount = new Set([...captureHistory.map(h => h.bird.id), bird.id]).size;
    if (uniqueCount >= 15) unlockBadge('collector_20');

    const day = new Date().getDay();
    const isWeekend = day === 0 || day === 6; 
    if (isWeekend) {
      const hasOtherWeekendDay = captureHistory.some(h => {
        const hDay = new Date(h.timestamp).getDay();
        return (hDay === 0 || hDay === 6) && hDay !== day;
      });
      if (hasOtherWeekendDay) unlockBadge('weekend_warrior');
    }

    const waterBirdIds = ['b11', 'b12', 'b14'];
    const capturedWaterBirds = new Set(
      captureHistory.filter(h => waterBirdIds.includes(h.bird.id)).map(h => h.bird.id)
    );
    if (waterBirdIds.includes(bird.id)) capturedWaterBirds.add(bird.id);
    if (capturedWaterBirds.size >= 3) unlockBadge('water_watcher');

    if (userLevel >= 10) unlockBadge('expert_observer');
    if (userLevel >= 25) unlockBadge('master_birder');
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

  const addBirdToCollection = async (bird: Bird, coords?: { latitude: number; longitude: number }): Promise<CaptureRecord> => {
    try {
      checkAchievements(bird);
      await updateMissionProgress(bird);

      const newRecord: CaptureRecord = {
        uid: Math.random().toString(36).substring(7),
        bird: bird,
        timestamp: new Date().toISOString(),
        latitude: coords?.latitude || 37.78825 + (Math.random() - 0.5) * 0.1,
        longitude: coords?.longitude || -122.4324 + (Math.random() - 0.5) * 0.1,
        isBounty: bird.id === dailyBountyId,
      };
      
      const newHistory = [newRecord, ...captureHistory];
      setCaptureHistory(newHistory);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));

      // Network: Supabase Sync
      console.log('Attempting Supabase sync for bird:', bird.name, 'with SupabaseID:', supabaseUserId);
      if (supabaseUserId) {
        const { error } = await supabase.from('captures').insert({
          user_id: supabaseUserId, // use internal Supabase UUID
          bird_id: bird.id,
          bird_name: bird.name,
          rarity: bird.rarity,
          latitude: newRecord.latitude,
          longitude: newRecord.longitude,
          image_url: bird.imageUrl,
          is_bounty: newRecord.isBounty,
        });
        if (error) {
           console.error('Supabase capture insert error:', error);
        } else {
           console.log('Supabase capture saved successfully!');
        }
      } else {
        console.warn('Supabase sync skipped: No supabaseUserId available');
      }

      return newRecord;
    } catch (e) {
      console.error('Failed to save record', e);
      throw e;
    }
  };

  const analyzeImage = async (uri: string) => {
    if (presentationMode) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const randomBird = BIRD_DATABASE[Math.floor(Math.random() * BIRD_DATABASE.length)];
      return {
        bird: randomBird,
        confidence: 0.98,
        probabilityMatrix: [
          { name: randomBird.name, probability: 98 },
          { name: 'Other Species', probability: 2 }
        ]
      };
    }

    let base64Data = '';
    try {
      if (Platform.OS === 'web') {
        const response = await fetch(uri);
        const blob = await response.blob();
        base64Data = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
          reader.readAsDataURL(blob);
        });
      } else {
        base64Data = await FileSystem.readAsStringAsync(uri, { 
          encoding: FileSystem.EncodingType.Base64 
        });
      }
    } catch (fsError) {
      console.error('File Read Failed:', fsError);
      throw new Error('Could not read the captured image. Please try again.');
    }

    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_CONFIG.MODEL_NAME}:generateContent?key=${GEMINI_CONFIG.API_KEY}`;
    
    const payload = {
      contents: [{
        parts: [
          { text: GEMINI_CONFIG.INSTRUCTIONS },
          { inline_data: { mime_type: "image/jpeg", data: base64Data } }
        ]
      }],
      generationConfig: { temperature: 0.1, topK: 1, topP: 1, maxOutputTokens: 1000 }
    };

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const rawResponseText = await response.text();
      let data;
      try {
        data = JSON.parse(rawResponseText);
      } catch (e) {
        throw new Error('Received an invalid response from the server. Please try again.');
      }

      if (!response.ok) {
        const errorMsg = data.error?.message || 'Gemini Cloud is currently unavailable.';
        if (response.status === 429 || response.status === 503) {
          throw new Error('AI API Limit reached. Please check your quota or try again later.');
        }
        throw new Error(errorMsg);
      }

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error('AI returned an empty response. Please try again.');

      let aiResponse;
      try {
        let jsonStr = text.replace(/```json|```/g, '').trim();
        if (!jsonStr.startsWith('{')) {
          const match = jsonStr.match(/\{[\s\S]*\}/);
          if (match) jsonStr = match[0];
        }
        aiResponse = JSON.parse(jsonStr);
      } catch (parseError) {
        throw new Error('AI struggled to format its response correctly. Please take another picture.');
      }

      if (aiResponse.error) throw new Error(aiResponse.error);

      const name = aiResponse.name || aiResponse.commonName || 'Unknown Bird';
      const scientificName = aiResponse.scientificName || 'Aves unknown';
      
      let identifiedBird = BIRD_DATABASE.find(b => 
        (name && b.name.toLowerCase() === name.toLowerCase()) || 
        (scientificName && b.scientificName.toLowerCase() === scientificName.toLowerCase())
      );

      if (!identifiedBird) {
         // Create local dynamic bird
         identifiedBird = {
           id: name.toLowerCase().replace(/\s+/g, '-'),
           name: name,
           scientificName: scientificName,
           rarity: (aiResponse.rarity || 'Common') as any,
           description: aiResponse.description || 'A fascinating bird species.',
           imageUrl: uri, // Attach URI to image
           length: aiResponse.length || 'Unknown',
           weight: aiResponse.weight || 'Unknown'
         };
      } else {
        // override image url
        identifiedBird = { ...identifiedBird, imageUrl: uri };
      }
      
      // Upload image to Supabase if wanted
      // We will skip file buffer upload for now and rely on signed url locally
      
      return {
        bird: identifiedBird,
        confidence: aiResponse.confidence || 0.95,
        probabilityMatrix: [
          { name: identifiedBird.name, probability: Math.round((aiResponse.confidence || 0.95) * 100) },
          { name: 'Other Species', probability: Math.round((1 - (aiResponse.confidence || 0.95)) * 100) }
        ]
      };

    } catch (apiError: any) {
      throw new Error(apiError.message || 'The Bird Expert AI could not be reached.');
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
      captureHistory, addBirdToCollection, getDailyStreak, getConsecutiveStreak, getSightingCount, 
      isLoading, totalXp, userLevel, rankTitle, nextLevelProgress, missions,
      analyzeImage, dailyBountyId, presentationMode,
      togglePresentationMode: async () => {
        const newValue = !presentationMode;
        setPresentationMode(newValue);
        await AsyncStorage.setItem('@birdwatch_presentation_mode', JSON.stringify(newValue));
      }
    }}>
      {children}
    </BirdContext.Provider>
  );
}

export function useBirds() {
  const context = useContext(BirdContext);
  if (context === undefined) throw new Error('useBirds must be used within a BirdProvider');
  return context;
}
