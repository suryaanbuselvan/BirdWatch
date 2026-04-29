import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin, statusCodes, User } from '@react-native-google-signin/google-signin';
import { supabase } from '../config/supabase';

export const DEFAULT_AVATAR = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png';
export const DEFAULT_NAME = 'Guest';

interface UserContextType {
  user: User | null;
  userName: string;
  userAvatar: string;
  unlockedBadges: string[];
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (name: string, avatarUri: string) => Promise<void>;
  unlockBadge: (badgeId: string) => Promise<void>;
  recentlyUnlockedBadge: string | null;
  clearRecentlyUnlockedBadge: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
  supabaseUserId: string | null;
}

const UserContext = createContext<UserContextType | undefined>(undefined);
const USER_STORAGE_KEY = '@birdwatch_user_profile';

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userName, setUserName] = useState<string>(DEFAULT_NAME);
  const [userAvatar, setUserAvatar] = useState<string>(DEFAULT_AVATAR);
  const [unlockedBadges, setUnlockedBadges] = useState<string[]>([]);
  const [recentlyUnlockedBadge, setRecentlyUnlockedBadge] = useState<string | null>(null);
  const [supabaseUserId, setSupabaseUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      GoogleSignin.configure({
        webClientId: '532193312597-1h44fjg9drqmnn8t9ij5nqf63eb0olj2.apps.googleusercontent.com',
      });
    }
    loadUserProfile();
  }, []);

  const syncUserWithSupabase = async (googleUser: any, badges: string[] = []) => {
    try {
      const email = googleUser.email;
      const password = `shadow_${googleUser.id}_pwd`;
      
      let { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error && error.message.includes('Invalid login credentials')) {
        const res = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: {
              name: googleUser.name || DEFAULT_NAME,
              avatar_url: googleUser.photo || DEFAULT_AVATAR
            }
          }
        });
        data = res.data;
      }
      
      if (data?.user) {
        // Also ensure auth metadata is up to date if they were already signed up
        await supabase.auth.updateUser({
          data: {
            name: googleUser.name || DEFAULT_NAME,
            avatar_url: googleUser.photo || DEFAULT_AVATAR
          }
        });

        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            name: googleUser.name || DEFAULT_NAME,
            avatar_url: googleUser.photo || DEFAULT_AVATAR,
            unlocked_badges: badges
          }, { onConflict: 'id' });
          
        if (profileError) {
          console.error('Supabase profile error:', profileError);
        } else {
          console.log('Supabase profile synced successfully for ID:', data.user.id);
        }
        
        setSupabaseUserId(data.user.id);
      } else {
        console.warn('Supabase sync warning: No data.user returned from auth');
      }
    } catch (e) {
      console.error('Supabase sync exception:', e);
    }
  };

  const loadUserProfile = async () => {
    try {
      const storedData = await AsyncStorage.getItem(USER_STORAGE_KEY);
      let localBadges: string[] = [];
      if (storedData) {
        const parsed = JSON.parse(storedData);
        setUserName(parsed.name || DEFAULT_NAME);
        setUserAvatar(parsed.avatar || DEFAULT_AVATAR);
        setUnlockedBadges(parsed.unlockedBadges || []);
        localBadges = parsed.unlockedBadges || [];
      }
      
      const response = Platform.OS !== 'web' ? await GoogleSignin.signInSilently() : null;
      
      if (response?.data?.user) {
        setUser(response.data.user as any);
        setUserName(response.data.user.name || DEFAULT_NAME);
        setUserAvatar(response.data.user.photo || DEFAULT_AVATAR);
        await syncUserWithSupabase(response.data.user, localBadges);
      }
    } catch (e) {
      console.log('[Google SDK] No active session or Silent Sign-In failed');
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async () => {
    try {
      setIsLoading(true);

      if (Platform.OS === 'web') {
        // Mock user for web testing
        const mockUser = {
          id: 'web-user-123',
          name: 'Web Tester',
          email: 'web@tester.com',
          photo: DEFAULT_AVATAR
        };
        setUser(mockUser as any);
        setUserName(mockUser.name);
        setUserAvatar(mockUser.photo);
        const payload = { name: mockUser.name, avatar: mockUser.photo, unlockedBadges };
        await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(payload));
        // Note: Supabase auth might still fail on web without proper setup, 
        // but we'll try to sync it just in case.
        await syncUserWithSupabase(mockUser, unlockedBadges);
        return;
      }

      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      
      if (response?.data?.user) {
        setUser(response.data.user as any);
        const name = response.data.user.name || DEFAULT_NAME;
        const avatar = response.data.user.photo || DEFAULT_AVATAR;
        
        setUserName(name);
        setUserAvatar(avatar);
        
        const payload = { name, avatar, unlockedBadges };
        await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(payload));
        await syncUserWithSupabase(response.data.user, unlockedBadges);
      }
    } catch (error: any) {
      console.error('Sign-In Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      if (Platform.OS !== 'web') {
        await GoogleSignin.signOut();
      }
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local state even if native signOut fails
      setUser(null);
      setUserName(DEFAULT_NAME);
      setUserAvatar(DEFAULT_AVATAR);
      await AsyncStorage.removeItem(USER_STORAGE_KEY);
    }
  };

  const updateProfile = async (name: string, avatarUri: string) => {
    try {
      setUserName(name);
      setUserAvatar(avatarUri);
      
      const payload = { name, avatar: avatarUri, unlockedBadges };
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(payload));
      
      if (user) await syncUserWithSupabase({ ...user, name, photo: avatarUri }, unlockedBadges);
    } catch (e) {
      console.error('Failed to save profile', e);
    }
  };

  const unlockBadge = async (badgeId: string) => {
    if (unlockedBadges.includes(badgeId)) return;
    
    try {
      const newBadges = [...unlockedBadges, badgeId];
      setUnlockedBadges(newBadges);
      setRecentlyUnlockedBadge(badgeId);
      
      const payload = { name: userName, avatar: userAvatar, unlockedBadges: newBadges };
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(payload));
      
      if (user) await syncUserWithSupabase(user, newBadges);
    } catch (e) {
      console.error('Failed to unlock badge', e);
    }
  };

  const clearRecentlyUnlockedBadge = () => setRecentlyUnlockedBadge(null);

  return (
    <UserContext.Provider value={{ 
      user, userName, userAvatar, unlockedBadges, 
      signIn, signOut, updateProfile, unlockBadge, 
      recentlyUnlockedBadge, clearRecentlyUnlockedBadge,
      isLoading, isAuthenticated: !!user,
      supabaseUserId
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) throw new Error('useUser must be used within a UserProvider');
  return context;
}
