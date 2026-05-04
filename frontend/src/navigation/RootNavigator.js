import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../hooks/useAuth';
import SplashScreen from '../screens/shared/SplashScreen';
import AuthStack from './AuthStack';
import AppStack from './AppStack';
import AdminStack from './AdminStack';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator key={user ? 'authenticated' : 'guest'} screenOptions={{ headerShown: false }}>
      {user ? (
        user.role === 'admin' ? (
          <Stack.Screen name="AdminMain" component={AdminStack} />
        ) : (
          <Stack.Screen name="Main" component={AppStack} />
        )
      ) : (
        <Stack.Screen name="Auth" component={AuthStack} />
      )}
    </Stack.Navigator>
  );
}
