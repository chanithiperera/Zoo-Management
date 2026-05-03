import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AdminHomeScreen from '../screens/admin/AdminHomeScreen';
import UserManagementScreen from '../screens/admin/UserManagementScreen';
import EncounterPhotographyDashboard from '../screens/admin/EncounterPhotographyDashboard';
import PhotoUploadScreen from '../screens/admin/PhotoUploadScreen';
import PhotographerManagementScreen from '../screens/admin/PhotographerManagementScreen';
import TimeSlotManagementScreen from '../screens/admin/TimeSlotManagementScreen';
import PhotographyBookingManagementScreen from '../screens/admin/PhotographyBookingManagementScreen';
import AnimalManagementScreen from '../screens/admin/AnimalManagementScreen';
import AdminEntryTicketsHubScreen from '../screens/admin/AdminEntryTicketsHubScreen';
import AdminTicketsShowsListScreen from '../screens/admin/AdminTicketsShowsListScreen';
import AdminManageBookingsScreen from '../screens/admin/AdminManageBookingsScreen';
import AdminManageGroupBookingsScreen from '../screens/admin/AdminManageGroupBookingsScreen';
import AdminScanTicketScreen from '../screens/admin/AdminScanTicketScreen';
import AdminStoreStack from './AdminStoreStack';
import AdminEventManagementScreen from '../screens/events/admin/AdminEventManagementScreen';
import AdminAddEditEventScreen from '../screens/events/admin/AdminAddEditEventScreen';
import AdminEventBookingsScreen from '../screens/events/admin/AdminEventBookingsScreen';
import AdminAnimalInformationEducationScreen from '../screens/admin/AdminAnimalInformationEducationScreen';
import AdminFeedbackScreen from '../screens/admin/AdminFeedbackScreen';
import { stackScreenOptions } from './screenOptions';

const Stack = createNativeStackNavigator();
const noHeader = { headerShown: false };

export default function AdminStack() {
  return (
    <Stack.Navigator initialRouteName="AdminHome" screenOptions={stackScreenOptions}>
      <Stack.Screen name="AdminHome" component={AdminHomeScreen} options={noHeader} />
      <Stack.Screen name="UserManagement" component={UserManagementScreen} options={noHeader} />

      <Stack.Screen
        name="AdminAnimalEncounterPhotography"
        component={EncounterPhotographyDashboard}
        options={noHeader}
      />
      <Stack.Screen name="PhotographerManagement" component={PhotographerManagementScreen} options={{ title: 'Manage Photographers' }} />
      <Stack.Screen name="TimeSlotManagement" component={TimeSlotManagementScreen} options={{ title: 'Manage Time Slots' }} />
      <Stack.Screen
        name="PhotographyBookingManagement"
        component={PhotographyBookingManagementScreen}
        options={{ title: 'Manage Bookings' }}
      />
      <Stack.Screen name="PhotoUpload" component={PhotoUploadScreen} options={{ title: 'Upload Photos' }} />
      <Stack.Screen name="AnimalManagement" component={AnimalManagementScreen} options={{ title: 'Manage Encounter Animals' }} />

      <Stack.Screen name="AdminEntryTicketsShowBooking" component={AdminEntryTicketsHubScreen} options={noHeader} />
      <Stack.Screen name="AdminManageTicketsAndShows" component={AdminTicketsShowsListScreen} options={noHeader} />
      <Stack.Screen name="AdminManageBookings" component={AdminManageBookingsScreen} options={noHeader} />
      <Stack.Screen name="AdminManageGroupBookings" component={AdminManageGroupBookingsScreen} options={noHeader} />
      <Stack.Screen name="AdminScanTicket" component={AdminScanTicketScreen} options={noHeader} />

      <Stack.Screen name="AdminEventManagement" component={AdminEventManagementScreen} options={noHeader} />
      <Stack.Screen name="AdminAddEvent" component={AdminAddEditEventScreen} options={noHeader} />
      <Stack.Screen name="AdminEditEvent" component={AdminAddEditEventScreen} options={noHeader} />
      <Stack.Screen name="AdminEventBookings" component={AdminEventBookingsScreen} options={noHeader} />

      <Stack.Screen
        name="AdminAnimalInformationEducation"
        component={AdminAnimalInformationEducationScreen}
        options={noHeader}
      />
      <Stack.Screen name="AdminOnlineStore" component={AdminStoreStack} options={noHeader} />

      <Stack.Screen
        name="AdminFeedbackInquiryReview"
        component={AdminFeedbackScreen}
        options={noHeader}
      />
    </Stack.Navigator>
  );
}
