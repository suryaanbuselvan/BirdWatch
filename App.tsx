import 'react-native-url-polyfill/auto';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { BirdProvider } from './src/context/BirdContext';
import { ThemeProvider } from './src/context/ThemeContext';
import { UserProvider } from './src/context/UserContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <UserProvider>
          <BirdProvider>
            <AppNavigator />
          </BirdProvider>
        </UserProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
