import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AdminHomeScreen from '../screens/admin/AdminHomeScreen';
import UserManagementScreen from '../screens/admin/UserManagementScreen';
import AdminModulePlaceholderScreen from '../screens/admin/AdminModulePlaceholderScreen';
import AdminTicketsShowsListScreen from '../screens/admin/AdminTicketsShowsListScreen';
import AdminManageBookingsScreen from '../screens/admin/AdminManageBookingsScreen';
import AdminManageGroupBookingsScreen from '../screens/admin/AdminManageGroupBookingsScreen';
import AdminScanTicketScreen from '../screens/admin/AdminScanTicketScreen';
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
      <Stack.Screen
        name="AdminManageTicketsAndShows"
        component={AdminTicketsShowsListScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="AdminManageBookings" component={AdminManageBookingsScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name="AdminManageGroupBookings"
        component={AdminManageGroupBookingsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AdminScanTicket"
        component={AdminScanTicketScreen}
        options={{ headerShown: false }}
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