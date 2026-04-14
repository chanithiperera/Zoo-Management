import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DashboardScreen from '../screens/home/DashboardScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import UserProfileDetailsScreen from '../screens/profile/UserProfileDetailsScreen';
import TicketShowPlaceholder from '../screens/ticketShow/TicketShowPlaceholder';
import EventsPlaceholder from '../screens/events/EventsPlaceholder';
import FeedbackPlaceholder from '../screens/feedback/FeedbackPlaceholder';
import AnimalsPlaceholder from '../screens/animals/AnimalsPlaceholder';
import EncountersPlaceholder from '../screens/encounters/EncountersPlaceholder';
import StorePlaceholder from '../screens/store/StorePlaceholder';
import { stackScreenOptions } from './screenOptions';

const Stack = createNativeStackNavigator();

export default function AppStack() {
  return (
    <Stack.Navigator initialRouteName="Profile" screenOptions={stackScreenOptions}>
      <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
      <Stack.Screen name="UserProfileDetails" component={UserProfileDetailsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="TicketShow" component={TicketShowPlaceholder} options={{ title: 'Entry Tickets and Show Booking' }} />
      <Stack.Screen name="Events" component={EventsPlaceholder} options={{ title: 'Event Booking' }} />
      <Stack.Screen name="Feedback" component={FeedbackPlaceholder} options={{ title: 'Submit Feedbacks, Inquiries or Reviews' }} />
      <Stack.Screen name="Animals" component={AnimalsPlaceholder} options={{ title: 'Animal Information and Education' }} />
      <Stack.Screen name="Encounters" component={EncountersPlaceholder} options={{ title: 'Animal Ecounter and Photography' }} />
      <Stack.Screen name="Store" component={StorePlaceholder} options={{ title: 'Online Store' }} />
    </Stack.Navigator>
  );
}
