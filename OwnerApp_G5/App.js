import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import OwnerLoginScreen from './screens/OwnerLoginScreen';
import CreateListingScreen from './screens/CreateListingScreen';
import ManageBookingsScreen from './screens/ManageBookingsScreen';

const Stack = createStackNavigator();

const OwnerApp = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={OwnerLoginScreen} />
        <Stack.Screen name="CreateListing" options={{ title: "New Listing", headerleft: null }} component={CreateListingScreen} />
        <Stack.Screen name="ManageBookings" options={{ title: "Manage Bookings", headerleft: null }} component={ManageBookingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default OwnerApp;
