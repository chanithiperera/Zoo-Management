import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AdminStoreDashboard from '../screens/admin/store/AdminStoreDashboard';
import ManageProducts from '../screens/admin/store/ManageProducts';
import ManageOrders from '../screens/admin/store/ManageOrders';
import { stackScreenOptions } from './screenOptions';

const Stack = createNativeStackNavigator();

export default function AdminStoreStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="StoreDashboard" component={AdminStoreDashboard} options={{ headerShown: false }} />
      <Stack.Screen name="ManageProducts" component={ManageProducts} options={{ title: 'Manage Products' }} />
      <Stack.Screen name="ManageOrders" component={ManageOrders} options={{ title: 'Manage Orders' }} />
    </Stack.Navigator>
  );
}
