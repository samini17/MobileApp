import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import RenterLoginScreen from './screens/RenterLoginScreen';
import SearchScreen from './screens/SearchScreen';
import MyReservationsScreen from './screens/MyReservationsScreen';

const Stack = createStackNavigator();

const RenterApp = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" options={{ title: "Login to Renter", headerleft: null }} component={RenterLoginScreen} />
        <Stack.Screen name="Search" options={{ title: "Search for Laptop", headerleft: null }} component={SearchScreen} />
        <Stack.Screen name="MyReservations" options={{ title: "My Laptop Reservations", headerleft: null }} component={MyReservationsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RenterApp;
