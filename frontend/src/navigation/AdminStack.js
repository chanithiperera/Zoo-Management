import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import { stackScreenOptions } from './screenOptions';

const Stack = createNativeStackNavigator();

export default function AdminStack() {
  return (
    <Stack.Navigator initialRouteName="AdminDashboard" screenOptions={stackScreenOptions}>
      <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} options={{ title: 'Admin Dashboard' }} />
    </Stack.Navigator>
  );
}
