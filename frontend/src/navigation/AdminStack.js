<<<<<<< HEAD
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AdminHomeScreen from '../screens/admin/AdminHomeScreen';
import UserManagementScreen from '../screens/admin/UserManagementScreen';
import AdminModulePlaceholderScreen from '../screens/admin/AdminModulePlaceholderScreen';
<<<<<<< HEAD
import PhotoUploadScreen from '../screens/admin/PhotoUploadScreen';
import EncounterPhotographyDashboard from '../screens/admin/EncounterPhotographyDashboard';
import PhotographerManagementScreen from '../screens/admin/PhotographerManagementScreen';
import TimeSlotManagementScreen from '../screens/admin/TimeSlotManagementScreen';
import PhotographyBookingManagementScreen from '../screens/admin/PhotographyBookingManagementScreen';
import AnimalManagementScreen from '../screens/admin/AnimalManagementScreen';
=======
import AdminTicketsShowsListScreen from '../screens/admin/AdminTicketsShowsListScreen';
import AdminManageBookingsScreen from '../screens/admin/AdminManageBookingsScreen';
import AdminManageGroupBookingsScreen from '../screens/admin/AdminManageGroupBookingsScreen';
import AdminScanTicketScreen from '../screens/admin/AdminScanTicketScreen';
import AdminStoreStack from './AdminStoreStack';
import AdminEventManagementScreen from '../screens/events/admin/AdminEventManagementScreen';
import AdminAddEditEventScreen from '../screens/events/admin/AdminAddEditEventScreen';
import AdminEventBookingsScreen from '../screens/events/admin/AdminEventBookingsScreen';
>>>>>>> c824c01f2ee0305888ee69dff77383ac43361c08
import { stackScreenOptions } from './screenOptions';

const Stack = createNativeStackNavigator();

const adminModulePlaceholderOptions = { headerShown: false };

export default function AdminStack() {
  return (
    <Stack.Navigator initialRouteName="AdminHome" screenOptions={stackScreenOptions}>
      <Stack.Screen name="AdminHome" component={AdminHomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="UserManagement" component={UserManagementScreen} options={{ headerShown: false }} />
      
      {/* Animal Encounter & Photography Module */}
      <Stack.Screen
        name="AdminAnimalEncounterPhotography"
        component={EncounterPhotographyDashboard}
        options={{ title: 'Encounter & Photography' }}
      />
      <Stack.Screen 
        name="PhotographerManagement" 
        component={PhotographerManagementScreen} 
        options={{ title: 'Manage Photographers' }} 
      />
      <Stack.Screen 
        name="TimeSlotManagement" 
        component={TimeSlotManagementScreen} 
        options={{ title: 'Manage Time Slots' }} 
      />
      <Stack.Screen 
        name="PhotographyBookingManagement" 
        component={PhotographyBookingManagementScreen} 
        options={{ title: 'Manage Bookings' }} 
      />
      <Stack.Screen 
        name="PhotoUpload" 
        component={PhotoUploadScreen} 
        options={{ title: 'Upload Photos' }} 
      />
      <Stack.Screen 
        name="AnimalManagement" 
        component={AnimalManagementScreen} 
        options={{ title: 'Manage Encounter Animals' }} 
      />

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

      {/* ── Event Management ── */}
      <Stack.Screen
        name="AdminEventManagement"
        component={AdminEventManagementScreen}
        options={adminModulePlaceholderOptions}
      />
      <Stack.Screen name="AdminAddEvent" component={AdminAddEditEventScreen} options={adminModulePlaceholderOptions} />
      <Stack.Screen name="AdminEditEvent" component={AdminAddEditEventScreen} options={adminModulePlaceholderOptions} />
      <Stack.Screen
        name="AdminEventBookings"
        component={AdminEventBookingsScreen}
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
