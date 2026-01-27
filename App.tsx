import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { initDatabase } from './src/services/DatabaseService';

export default function App() {
  useEffect(() => {
    initDatabase().catch(console.error);
  }, []);

  return (
    <SafeAreaProvider>
      <AppNavigator />
    </SafeAreaProvider>
  );
}
