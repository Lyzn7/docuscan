import React, { useEffect, useState, useRef } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, Image, StyleSheet, Animated, Easing } from 'react-native';
import { AppNavigator } from './src/navigation/AppNavigator';
import { initDatabase } from './src/services/DatabaseService';

export default function App() {
  const [loadingStep, setLoadingStep] = useState<0 | 1 | 2>(0);
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    initDatabase().catch(console.error);
  }, []);

  useEffect(() => {
    const timer1 = setTimeout(() => setLoadingStep(1), 100);
    const timer2 = setTimeout(() => setLoadingStep(2), 1200);
    const timer3 = setTimeout(() => setLoadingStep(0), 2300);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  useEffect(() => {
    if (loadingStep === 0) return;
    fade.setValue(0);
    Animated.sequence([
      Animated.timing(fade, { toValue: 1, duration: 300, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      Animated.delay(700),
      Animated.timing(fade, { toValue: 0, duration: 300, easing: Easing.in(Easing.ease), useNativeDriver: true }),
    ]).start();
  }, [loadingStep, fade]);

  const renderLoading = () => {
    if (loadingStep === 0) return null;
    const source = loadingStep === 1 ? require('./assets/loading1.png') : require('./assets/loading2.png');
    return (
      <Animated.View style={[styles.loadingContainer, { opacity: fade }]}>
        <Image source={source} style={styles.loadingImage} resizeMode="contain" />
      </Animated.View>
    );
  };

  return (
    <SafeAreaProvider>
      {loadingStep !== 0 ? renderLoading() : <AppNavigator />}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingImage: {
    width: '80%',
    height: '80%',
  },
});
