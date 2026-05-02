import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DashboardScreen from '../screens/home/DashboardScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import UserProfileDetailsScreen from '../screens/profile/UserProfileDetailsScreen';
import MyTicketsScreen from '../screens/profile/MyTicketsScreen';
import TicketShowPlaceholder from '../screens/ticketShow/TicketShowPlaceholder';
import TicketBookingScreen from '../screens/ticketShow/TicketBookingScreen';
import TicketShowSelectionScreen from '../screens/ticketShow/TicketShowSelectionScreen';
import TicketPaymentScreen from '../screens/ticketShow/TicketPaymentScreen';
import TicketPaymentSuccessScreen from '../screens/ticketShow/TicketPaymentSuccessScreen';
import GroupBookingRequestScreen from '../screens/ticketShow/GroupBookingRequestScreen';
import GroupRequestSubmittedScreen from '../screens/ticketShow/GroupRequestSubmittedScreen';
import MyGroupRequestsScreen from '../screens/ticketShow/MyGroupRequestsScreen';
import EventsPlaceholder from '../screens/events/EventsPlaceholder';
import FeedbackModuleScreen from '../screens/feedback/FeedbackModuleScreen';
import FeedbackListScreen from '../screens/feedback/FeedbackListScreen';
import AddFeedbackScreen from '../screens/feedback/AddFeedbackScreen';
import InquiryListScreen from '../screens/feedback/InquiryListScreen';
import AddInquiryScreen from '../screens/feedback/AddInquiryScreen';
import ReviewListScreen from '../screens/feedback/ReviewListScreen';
import AddReviewScreen from '../screens/feedback/AddReviewScreen';
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
      <Stack.Screen name="MyTickets" component={MyTicketsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="TicketShow" component={TicketShowPlaceholder} options={{ title: 'Entry Tickets and Show Booking' }} />
      <Stack.Screen name="TicketBooking" component={TicketBookingScreen} options={{ title: 'Booking' }} />
      <Stack.Screen name="TicketShowSelection" component={TicketShowSelectionScreen} options={{ title: 'Select shows' }} />
      <Stack.Screen name="Payment" component={TicketPaymentScreen} options={{ title: 'Payment' }} />
      <Stack.Screen name="PaymentSuccess" component={TicketPaymentSuccessScreen} options={{ title: 'Payment successful' }} />
      <Stack.Screen name="GroupBookingRequest" component={GroupBookingRequestScreen} options={{ title: 'Group booking request' }} />
      <Stack.Screen name="GroupRequestSubmitted" component={GroupRequestSubmittedScreen} options={{ title: 'Request submitted' }} />
      <Stack.Screen name="MyGroupRequests" component={MyGroupRequestsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Events" component={EventsPlaceholder} options={{ title: 'Event Booking' }} />
      <Stack.Screen name="Feedback" component={FeedbackModuleScreen} options={{ title: 'Feedback & Inquiries' }} />
      <Stack.Screen name="FeedbackList" component={FeedbackListScreen} options={{ title: 'My Feedbacks' }} />
      <Stack.Screen name="AddFeedback" component={AddFeedbackScreen} options={{ title: 'Submit Feedback' }} />
      <Stack.Screen name="InquiryList" component={InquiryListScreen} options={{ title: 'My Inquiries' }} />
      <Stack.Screen name="AddInquiry" component={AddInquiryScreen} options={{ title: 'Submit Inquiry' }} />
      <Stack.Screen name="ReviewList" component={ReviewListScreen} options={{ title: 'My Reviews' }} />
      <Stack.Screen name="AddReview" component={AddReviewScreen} options={{ title: 'Submit Review' }} />
      <Stack.Screen name="Animals" component={AnimalsPlaceholder} options={{ title: 'Animal Information and Education' }} />
      <Stack.Screen name="Encounters" component={EncountersPlaceholder} options={{ title: 'Animal Ecounter and Photography' }} />
      <Stack.Screen name="Store" component={StorePlaceholder} options={{ title: 'Online Store' }} />
    </Stack.Navigator>
  );
}
