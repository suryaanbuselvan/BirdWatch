import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { StyleSheet, Platform } from 'react-native';

import { RootStackParamList, MainTabParamList } from './types';
import HomeScreen from '../screens/HomeScreen';
import CollectionScreen from '../screens/CollectionScreen';
import IdentifyScreen from '../screens/IdentifyScreen';
import DetailsScreen from '../screens/DetailsScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import MapScreen from '../screens/MapScreen';
import BadgesScreen from '../screens/BadgesScreen';
import MissionsScreen from '../screens/MissionsScreen';
import IdentificationFailureScreen from '../screens/IdentificationFailureScreen';
import SignInScreen from '../screens/SignInScreen';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function MainTabNavigator() {
  const { colors, theme } = useTheme();
  
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 0,
          backgroundColor: Platform.OS === 'web' ? colors.surfaceGlass : 'transparent',
          borderTopWidth: 0,
          height: 60,
          paddingBottom: 8,
        },
        tabBarBackground: () => (
          Platform.OS !== 'web' ? (
            <BlurView tint={theme === 'dark' ? 'dark' : 'light'} intensity={80} style={StyleSheet.absoluteFill} />
          ) : null
        ),
        tabBarActiveTintColor: colors.tabBarActive,
        tabBarInactiveTintColor: colors.tabBarInactive,
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen 
        name="Collection" 
        component={CollectionScreen} 
        options={{ tabBarLabel: 'Collection' }}
      />
      <Tab.Screen 
        name="Map" 
        component={MapScreen} 
        options={{ tabBarLabel: 'Map' }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { isAuthenticated, isLoading } = useUser();
  const { colors } = useTheme();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen 
            name="SignIn" 
            component={SignInScreen} 
            options={{ animation: 'fade' }}
          />
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={MainTabNavigator} />
            <Stack.Screen 
              name="Identify" 
              component={IdentifyScreen} 
              options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }}
            />
            <Stack.Screen 
              name="Details" 
              component={DetailsScreen} 
              options={{ presentation: 'modal' }}
            />
            <Stack.Screen 
              name="EditProfile" 
              component={EditProfileScreen} 
              options={{ 
                presentation: 'modal',
                animation: 'slide_from_bottom'
              }}
            />
            <Stack.Screen 
              name="Badges" 
              component={BadgesScreen} 
              options={{ presentation: 'modal' }}
            />
            <Stack.Screen 
              name="IdentificationFailure" 
              component={IdentificationFailureScreen} 
              options={{ presentation: 'modal' }}
            />
            <Stack.Screen 
              name="Missions" 
              component={MissionsScreen} 
              options={{ presentation: 'card', animation: 'slide_from_right', headerShown: true, title: 'Quest Log' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
