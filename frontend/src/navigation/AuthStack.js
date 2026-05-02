import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/home/HomeScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import TicketShowPlaceholder from '../screens/ticketShow/TicketShowPlaceholder';
import TicketBookingScreen from '../screens/ticketShow/TicketBookingScreen';
import TicketShowSelectionScreen from '../screens/ticketShow/TicketShowSelectionScreen';
import TicketPaymentScreen from '../screens/ticketShow/TicketPaymentScreen';
import TicketPaymentSuccessScreen from '../screens/ticketShow/TicketPaymentSuccessScreen';
import EventsPlaceholder from '../screens/events/EventsPlaceholder';
import FeedbackPlaceholder from '../screens/feedback/FeedbackPlaceholder';
import AnimalsPlaceholder from '../screens/animals/AnimalsPlaceholder';
import EncountersPlaceholder from '../screens/encounters/EncountersPlaceholder';
import StorePlaceholder from '../screens/store/StorePlaceholder';
import { stackScreenOptions } from './screenOptions';

const Stack = createNativeStackNavigator();

export default function AuthStack() {
  return (
    <Stack.Navigator initialRouteName="Home" screenOptions={stackScreenOptions}>
      <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Sign in' }} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Create account' }} />
      <Stack.Screen name="TicketShow" component={TicketShowPlaceholder} options={{ title: 'Entry Tickets and Show Booking' }} />
      <Stack.Screen name="TicketBooking" component={TicketBookingScreen} options={{ title: 'Booking' }} />
      <Stack.Screen name="TicketShowSelection" component={TicketShowSelectionScreen} options={{ title: 'Select shows' }} />
      <Stack.Screen name="Payment" component={TicketPaymentScreen} options={{ title: 'Payment' }} />
      <Stack.Screen name="PaymentSuccess" component={TicketPaymentSuccessScreen} options={{ title: 'Payment successful' }} />
      <Stack.Screen name="Events" component={EventsPlaceholder} options={{ title: 'Event Booking' }} />
      <Stack.Screen name="Feedback" component={FeedbackPlaceholder} options={{ title: 'Submit Feedbacks, Inquiries or Reviews' }} />
      <Stack.Screen name="Animals" component={AnimalsPlaceholder} options={{ title: 'Animal Information and Education' }} />
      <Stack.Screen name="Encounters" component={EncountersPlaceholder} options={{ title: 'Animal Ecounter and Photography' }} />
      <Stack.Screen name="Store" component={StorePlaceholder} options={{ title: 'Online Store' }} />
    </Stack.Navigator>
  );
}
