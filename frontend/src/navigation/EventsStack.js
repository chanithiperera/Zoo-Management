import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import EventsListScreen            from "../screens/events/EventsListScreen";
import EventDetailScreen           from "../screens/events/EventDetailScreen";
import EventBookingScreen          from "../screens/events/EventBookingScreen";
import MyBookingsScreen            from "../screens/events/MyBookingsScreen";
import AdminEventManagementScreen  from "../screens/events/admin/AdminEventManagementScreen";
import AdminAddEditEventScreen     from "../screens/events/admin/AdminAddEditEventScreen";
import AdminEventBookingsScreen    from "../screens/events/admin/AdminEventBookingsScreen";

const Stack = createNativeStackNavigator();

export default function EventsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* User Screens */}
      <Stack.Screen name="EventsList"   component={EventsListScreen} />
      <Stack.Screen name="EventDetail"  component={EventDetailScreen} />
      <Stack.Screen name="EventBooking" component={EventBookingScreen} />
      <Stack.Screen name="MyBookings"   component={MyBookingsScreen} />

      {/* Admin Screens */}
      <Stack.Screen name="AdminEventManagement" component={AdminEventManagementScreen} />
      <Stack.Screen name="AdminAddEvent"        component={AdminAddEditEventScreen} />
      <Stack.Screen name="AdminEditEvent"       component={AdminAddEditEventScreen} />
      <Stack.Screen name="AdminEventBookings"   component={AdminEventBookingsScreen} />
    </Stack.Navigator>
  );
}