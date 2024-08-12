import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import OwnerLoginScreen from './screens/OwnerLoginScreen';
import CreateListingScreen from './screens/CreateListingScreen';
import ManageListingsScreen from './screens/ManageListingsScreen';
import ManageBookingsScreen from './screens/ManageBookingsScreen';

const Stack = createStackNavigator();

const OwnerApp = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" options={{ title: "Login to Owner", headerleft: null }} component={OwnerLoginScreen} />
        <Stack.Screen name="CreateListing" options={{ title: "New Listing", headerleft: null }} component={CreateListingScreen} />
        <Stack.Screen name="ManageListings" options={{ title: "Manage Laptop Listings", headerleft: null }} component={ManageListingsScreen} />
        <Stack.Screen name="ManageBookings" options={{ title: "Manage Laptop Bookings", headerleft: null }} component={ManageBookingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default OwnerApp;
