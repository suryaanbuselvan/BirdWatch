import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const DEFAULT_AVATAR = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png';
export const DEFAULT_NAME = 'Alex';

interface UserContextType {
  userName: string;
  userAvatar: string;
  unlockedBadges: string[];
  updateProfile: (name: string, avatarUri: string) => Promise<void>;
  unlockBadge: (badgeId: string) => Promise<void>;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);
const USER_STORAGE_KEY = '@birdwatch_user_profile';

export function UserProvider({ children }: { children: ReactNode }) {
  const [userName, setUserName] = useState<string>(DEFAULT_NAME);
  const [userAvatar, setUserAvatar] = useState<string>(DEFAULT_AVATAR);
  const [unlockedBadges, setUnlockedBadges] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const storedData = await AsyncStorage.getItem(USER_STORAGE_KEY);
      if (storedData) {
        const parsed = JSON.parse(storedData);
        setUserName(parsed.name || DEFAULT_NAME);
        setUserAvatar(parsed.avatar || DEFAULT_AVATAR);
        setUnlockedBadges(parsed.unlockedBadges || []);
      }
    } catch (e) {
      console.error('Failed to load user profile', e);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (name: string, avatarUri: string) => {
    try {
      setUserName(name);
      setUserAvatar(avatarUri);
      
      const payload = {
        name,
        avatar: avatarUri,
        unlockedBadges,
      };
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.error('Failed to save user profile', e);
    }
  };

  const unlockBadge = async (badgeId: string) => {
    if (unlockedBadges.includes(badgeId)) return;
    
    try {
      const newBadges = [...unlockedBadges, badgeId];
      setUnlockedBadges(newBadges);
      
      const payload = {
        name: userName,
        avatar: userAvatar,
        unlockedBadges: newBadges,
      };
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.error('Failed to unlock badge', e);
    }
  };

  return (
    <UserContext.Provider value={{ userName, userAvatar, unlockedBadges, updateProfile, unlockBadge, isLoading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
