import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Button, Alert } from 'react-native';
import { collection, onSnapshot, doc, updateDoc, getDocs, where } from 'firebase/firestore';
import { db } from '../FirebaseConfig';
import { auth } from "../FirebaseConfig";
import { onAuthStateChanged } from 'firebase/auth';
import { StackActions, useIsFocused } from "@react-navigation/native";

const ManageBookingsScreen = ({ navigation, route }) => {
  const [loggedInUser, setLoggedInUser] = useState(null)
  const [bookings, setBookings] = useState([]);

  const createListingPressed = () => {

  }

  const logoutPressed = async () => {
    console.log(`logout pressed`);

    try {
      await signOut(auth)

      console.log(`DEBUG --- 'Logout successful`);

      //navigate to first screen (sign in screen)
      navigation.dispatch(StackActions.popToTop())

    } catch (err) {
      console.log(`DEBUG --- Error while logging out : ${err}`);
    }
  }

  //get All document from booking
  const getAll = async (userEmail) => {
    console.log("Retrieving all documents from the 'bookings' collection...")

    try {
      const querySnapshot = await getDocs(collection(db, "bookings"))

      const resultsFromDB = []

      querySnapshot.forEach((currDoc) => {
        console.log(`Document id: ${currDoc.id}`)
        console.log("Document data:")
        console.log(currDoc.data())

        const booking = {
          id: currDoc.id,
          ...currDoc.data()
        }

        console.log(booking)
        if (booking.ownerEmail == userEmail) {
          resultsFromDB.push(booking)
        }
      })

      setBookings(resultsFromDB)
    } catch (err) {
      console.log(err)
    }
  }

  // useEffect(() => {
  //   //listen for any changes in authentication changes
  //   const listener = onAuthStateChanged(auth, (userFromFirebaseAuth) => {
  //     //check if userFromFirebaseAuth is available
  //     if (userFromFirebaseAuth) {
  //       //if yes, that means we have access to currently logged in user
  //       console.log(`DEBUG --- userFromFirebaseAuth : ${JSON.stringify(userFromFirebaseAuth)}`);
  //       console.log(`Currently logged in user : ${userFromFirebaseAuth.email}`)

  //       Alert.alert(`Currently logged in user : ${userFromFirebaseAuth.email}`)
  //       //set the user info to loggedInUser state
  //       setLoggedInUser(userFromFirebaseAuth)
  //       getAll()
  //     } else {
  //       //if not, we don't have access to currently logged in user
  //       setLoggedInUser(null)
  //     }
  //   })

  //   return listener
  // }, [])

  const isUserOnThisScreen = useIsFocused()
  useEffect(() => {
    if (!isUserOnThisScreen)
      console.log(`MANAGE BOOKING NOT LOADED: ${isUserOnThisScreen}`)
    else {
      console.log(`MANAGE BOOKING IS LOADED: ${isUserOnThisScreen}`)

      //listen for any changes in authentication changes
      const listener = onAuthStateChanged(auth, (userFromFirebaseAuth) => {
        //check if userFromFirebaseAuth is available
        if (userFromFirebaseAuth) {
          //if yes, that means we have access to currently logged in user
          console.log(`DEBUG --- userFromFirebaseAuth : ${JSON.stringify(userFromFirebaseAuth)}`);
          console.log(`Currently logged in user : ${userFromFirebaseAuth.email}`)

          Alert.alert(`Currently logged in user : ${userFromFirebaseAuth.email}`)
          //set the user info to loggedInUser state
          getAll(userFromFirebaseAuth.email)
          setLoggedInUser(userFromFirebaseAuth)
        } else {
          //if not, we don't have access to currently logged in user
          setLoggedInUser(null)
        }
      })

      return listener
    }
  }, [isUserOnThisScreen])

  const cancelBooking = async (bookingId) => {
    try {
      await updateDoc(doc(db, 'bookings', bookingId), {
        status: 'CANCELED',
      });
      Alert.alert('Success', 'Booking canceled');
      getAll()
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={{marginBottom: 16, textAlign: "center"}}>Hello {loggedInUser.email}, theses are your current bookings...</Text>
      <FlatList
        data={bookings}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.bookingItem}>
            <Text>itemID: {item.itemID}</Text>
            <Text>OwnerEmail: {item.ownerEmail}</Text>
            <Text>RenterEmail: {item.renterEmail}</Text>
            <Text>Status: {item.status}</Text>
            <Text>Confirmation Code: {item.bookingID}</Text>
            {item.status !== 'CANCELED' && (
              <Button title="Cancel Booking" onPress={() => cancelBooking(item.id)} />
            )}
          </View>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  bookingItem: {
    padding: 16,
    backgroundColor: '#f8f8f8',
  },
  separator: {
    height: 1,
    backgroundColor: '#ddd',
  },
});

export default ManageBookingsScreen;
