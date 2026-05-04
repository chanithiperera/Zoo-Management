<<<<<<< HEAD
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import {
  Dosis_500Medium,
  Dosis_600SemiBold,
  Dosis_700Bold,
  Dosis_800ExtraBold,
} from '@expo-google-fonts/dosis';
import { ComicNeue_400Regular, ComicNeue_700Bold } from '@expo-google-fonts/comic-neue';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider } from './src/context/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Dosis_500Medium,
    Dosis_600SemiBold,
    Dosis_700Bold,
    Dosis_800ExtraBold,
    /** Comic Sans–style (OSS); real Comic Sans MS is not bundled on mobile. */
    ComicNeue_400Regular,
    ComicNeue_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <StatusBar style="dark" />
          <RootNavigator />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
=======
import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { ComicNeue_400Regular, ComicNeue_700Bold } from '@expo-google-fonts/comic-neue';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider } from './src/context/AuthContext';
import { CartProvider } from './src/context/CartContext';
import { Ionicons } from '@expo/vector-icons';
import RootNavigator from './src/navigation/RootNavigator';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    /** Comic Sans–style (OSS); real Comic Sans MS is not bundled on mobile. */
    ComicNeue_400Regular,
    ComicNeue_700Bold,
    ...Ionicons.font,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (fontError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Error loading fonts: {fontError.message}</Text>
      </View>
    );
  }

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ECF3EC' }}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <CartProvider>
          <NavigationContainer>
            <StatusBar style="dark" />
            <RootNavigator />
          </NavigationContainer>
        </CartProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
>>>>>>> 0f8639197f93fefd9284caf0561929e9c2425035
