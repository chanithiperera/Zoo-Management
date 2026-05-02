import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DashboardScreen from '../screens/home/DashboardScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import UserProfileDetailsScreen from '../screens/profile/UserProfileDetailsScreen';
import MyTicketsScreen from '../screens/profile/MyTicketsScreen';
import TicketShowPlaceholder from '../screens/ticketShow/TicketShowPlaceholder';
import EventsStack from './EventsStack';
import TicketBookingScreen from '../screens/ticketShow/TicketBookingScreen';
import TicketShowSelectionScreen from '../screens/ticketShow/TicketShowSelectionScreen';
import TicketPaymentScreen from '../screens/ticketShow/TicketPaymentScreen';
import TicketPaymentSuccessScreen from '../screens/ticketShow/TicketPaymentSuccessScreen';
import GroupBookingRequestScreen from '../screens/ticketShow/GroupBookingRequestScreen';
import GroupRequestSubmittedScreen from '../screens/ticketShow/GroupRequestSubmittedScreen';
import MyGroupRequestsScreen from '../screens/ticketShow/MyGroupRequestsScreen';
import FeedbackPlaceholder from '../screens/feedback/FeedbackPlaceholder';
import AnimalsPlaceholder from '../screens/animals/AnimalsPlaceholder';
<<<<<<< HEAD
import AnimalListScreen from '../screens/encounters/AnimalListScreen';
import BookingScreen from '../screens/encounters/BookingScreen';
import MyBookingsScreen from '../screens/encounters/MyBookingsScreen';
import PhotoGalleryScreen from '../screens/encounters/PhotoGalleryScreen';
import StorePlaceholder from '../screens/store/StorePlaceholder';
=======
import EncountersPlaceholder from '../screens/encounters/EncountersPlaceholder';
import StoreStack from './StoreStack';
>>>>>>> c824c01f2ee0305888ee69dff77383ac43361c08
import { stackScreenOptions } from './screenOptions';

const Stack = createNativeStackNavigator();

export default function AppStack() {
  return (
    <Stack.Navigator initialRouteName="Profile" screenOptions={stackScreenOptions}>
      <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
      <Stack.Screen name="UserProfileDetails" component={UserProfileDetailsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="MyTickets" component={MyTicketsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="TicketShow" component={TicketShowPlaceholder} options={{ title: 'Entry Tickets and Show Booking' }} />
      <Stack.Screen name="Events" component={EventsStack} options={{ headerShown: false }} />
      <Stack.Screen name="TicketBooking" component={TicketBookingScreen} options={{ title: 'Booking' }} />
      <Stack.Screen name="TicketShowSelection" component={TicketShowSelectionScreen} options={{ title: 'Select shows' }} />
      <Stack.Screen name="Payment" component={TicketPaymentScreen} options={{ title: 'Payment' }} />
      <Stack.Screen name="PaymentSuccess" component={TicketPaymentSuccessScreen} options={{ title: 'Payment successful' }} />
      <Stack.Screen name="GroupBookingRequest" component={GroupBookingRequestScreen} options={{ title: 'Group booking request' }} />
      <Stack.Screen name="GroupRequestSubmitted" component={GroupRequestSubmittedScreen} options={{ title: 'Request submitted' }} />
      <Stack.Screen name="MyGroupRequests" component={MyGroupRequestsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Events" component={EventsStack} options={{ headerShown: false }} />
      <Stack.Screen name="Feedback" component={FeedbackPlaceholder} options={{ title: 'Submit Feedbacks, Inquiries or Reviews' }} />
      <Stack.Screen name="Animals" component={AnimalsPlaceholder} options={{ title: 'Animal Information and Education' }} />
<<<<<<< HEAD
      <Stack.Screen name="Encounters" component={AnimalListScreen} options={{ title: 'Animal Encounter and Photography' }} />
      <Stack.Screen name="Booking" component={BookingScreen} options={({ route }) => ({ title: `${route.params?.type || 'Booking'} Session` })} />
      <Stack.Screen name="MyBookings" component={MyBookingsScreen} options={{ title: 'My Bookings' }} />
      <Stack.Screen name="PhotoGallery" component={PhotoGalleryScreen} options={{ title: 'Photo Gallery' }} />
      <Stack.Screen name="Store" component={StorePlaceholder} options={{ title: 'Online Store' }} />
=======
      <Stack.Screen name="Encounters" component={EncountersPlaceholder} options={{ title: 'Animal Ecounter and Photography' }} />
      <Stack.Screen name="Store" component={StoreStack} options={{ headerShown: false }} />
>>>>>>> c824c01f2ee0305888ee69dff77383ac43361c08
    </Stack.Navigator>
  );
}