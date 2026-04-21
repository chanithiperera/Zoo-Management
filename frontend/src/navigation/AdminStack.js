import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AdminHomeScreen from '../screens/admin/AdminHomeScreen';
import UserManagementScreen from '../screens/admin/UserManagementScreen';
import AdminModulePlaceholderScreen from '../screens/admin/AdminModulePlaceholderScreen';
import AdminStoreStack from './AdminStoreStack';
import { stackScreenOptions } from './screenOptions';

const Stack = createNativeStackNavigator();

const adminModulePlaceholderOptions = { headerShown: false };

export default function AdminStack() {
  return (
    <Stack.Navigator initialRouteName="AdminHome" screenOptions={stackScreenOptions}>
      <Stack.Screen name="AdminHome" component={AdminHomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="UserManagement" component={UserManagementScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name="AdminEntryTicketsShowBooking"
        component={AdminModulePlaceholderScreen}
        options={adminModulePlaceholderOptions}
      />
      <Stack.Screen name="AdminEventManagement" component={AdminModulePlaceholderScreen} options={adminModulePlaceholderOptions} />
      <Stack.Screen
        name="AdminAnimalEncounterPhotography"
        component={AdminModulePlaceholderScreen}
        options={adminModulePlaceholderOptions}
      />
      <Stack.Screen
        name="AdminAnimalInformationEducation"
        component={AdminModulePlaceholderScreen}
        options={adminModulePlaceholderOptions}
      />
      <Stack.Screen name="AdminOnlineStore" component={AdminStoreStack} options={adminModulePlaceholderOptions} />
      <Stack.Screen
        name="AdminFeedbackInquiryReview"
        component={AdminModulePlaceholderScreen}
        options={adminModulePlaceholderOptions}
      />
    </Stack.Navigator>
  );
}
