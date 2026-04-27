import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AdminHomeScreen from '../screens/admin/AdminHomeScreen';
import UserManagementScreen from '../screens/admin/UserManagementScreen';
import AdminModulePlaceholderScreen from '../screens/admin/AdminModulePlaceholderScreen';
import AdminEventManagementScreen from '../screens/events/admin/AdminEventManagementScreen';
import AdminAddEditEventScreen from '../screens/events/admin/AdminAddEditEventScreen';
import AdminEventBookingsScreen from '../screens/events/admin/AdminEventBookingsScreen';
import { stackScreenOptions } from './screenOptions';

const Stack = createNativeStackNavigator();

export default function AdminStack() {
  return (
    <Stack.Navigator initialRouteName="AdminHome" screenOptions={stackScreenOptions}>
      <Stack.Screen name="AdminHome"          component={AdminHomeScreen}               options={{ headerShown: false }} />
      <Stack.Screen name="UserManagement"     component={UserManagementScreen}          options={{ headerShown: false }} />

      {/* ── Event Management (your module) ── */}
      <Stack.Screen name="AdminEventManagement" component={AdminEventManagementScreen}  options={{ headerShown: false }} />
      <Stack.Screen name="AdminAddEvent"        component={AdminAddEditEventScreen}     options={{ headerShown: false }} />
      <Stack.Screen name="AdminEditEvent"       component={AdminAddEditEventScreen}     options={{ headerShown: false }} />
      <Stack.Screen name="AdminEventBookings"   component={AdminEventBookingsScreen}    options={{ headerShown: false }} />

      {/* ── Other modules (placeholders) ── */}
      <Stack.Screen name="AdminEntryTicketsShowBooking"    component={AdminModulePlaceholderScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AdminAnimalEncounterPhotography" component={AdminModulePlaceholderScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AdminAnimalInformationEducation" component={AdminModulePlaceholderScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AdminOnlineStore"                component={AdminModulePlaceholderScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AdminFeedbackInquiryReview"      component={AdminModulePlaceholderScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}