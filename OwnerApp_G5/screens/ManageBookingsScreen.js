import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Button, Alert, Pressable } from 'react-native';
import { collection, doc, updateDoc, getDocs, where } from 'firebase/firestore';
import { db } from '../FirebaseConfig';
import { auth } from "../FirebaseConfig";
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { StackActions, useIsFocused } from "@react-navigation/native";

const ManageBookingsScreen = ({ navigation, route }) => {
  const routeEmail = route.params
  const [loggedInUser, setLoggedInUser] = useState(null)
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [items, setItems] = useState([]);

  function searchUserByEmail(email) {
    console.log(users)
    for (let i = 0; i < users.length; i++) {
      if (users[i].email === email) {
        console.log("searchUserByEmail: " + users[i])
        return users[i];
      }
    }
  }

  function searchItemByID(id) {
    console.log(items)
    for (let i = 0; i < items.length; i++) {
      if (items[i].id === id) {
        console.log("searchItemByID: " + items[i])
        return items[i];
      }
    }
  }

  const ManageListingsPressed = () => {
    console.log(`manage listing pressed`);
    navigation.navigate('ManageListings', routeEmail);
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

  //get All document from booking from owner email
  const getAllBooking = async (userEmail) => {
    console.log("Retrieving all documents from the 'bookings' collection...")

    try {
      const querySnapshot = await getDocs(collection(db, "bookings"))

      const resultsFromDB = []

      querySnapshot.forEach((currDoc) => {
        console.log(`Booking id: ${currDoc.id}`)
        console.log("Booking data:")
        console.log(currDoc.data())

        if (currDoc.data().ownerEmail == userEmail) {

          console.log("searchUserByEmail")
          const renter = searchUserByEmail(currDoc.data().renterEmail)
          console.log("Renter: " + renter)

          console.log("searchItemByID")
          const bookingItem = searchItemByID(currDoc.data().itemID)
          console.log("Laptop: " + bookingItem)

          const booking = {
            id: currDoc.id,
            renter: renter,
            bookingItem: bookingItem,
            ...currDoc.data()
          }

          console.log(booking)
          resultsFromDB.push(booking)
        }
      })

      setBookings(resultsFromDB)
    } catch (err) {
      console.log(err)
    }
  }

  //get All document from users
  const getAllUsers = async () => {
    console.log("Retrieving all documents from the 'users' collection...")

    try {
      const querySnapshot = await getDocs(collection(db, "users"))

      const resultsFromDB = []

      querySnapshot.forEach((currDoc) => {
        console.log(`Users id: ${currDoc.id}`)
        console.log("Users data:")
        console.log(currDoc.data())

        const user = {
          id: currDoc.id,
          ...currDoc.data()
        }
        resultsFromDB.push(user)
      })

      setUsers(resultsFromDB)
      console.log(users)
    } catch (err) {
      console.log(err)
    }
  }

  //get All document from bookingItems
  const getAllItems = async () => {
    console.log("Retrieving all documents from the 'bookingItems' collection...")

    try {
      const querySnapshot = await getDocs(collection(db, "bookingItems"))

      const resultsFromDB = []

      querySnapshot.forEach((currDoc) => {
        console.log(`Items id: ${currDoc.id}`)
        console.log("Items data:")
        console.log(currDoc.data())

        const bookingItem = {
          id: currDoc.id,
          ...currDoc.data()
        }
        resultsFromDB.push(bookingItem)
      })

      setItems(resultsFromDB)
      console.log(items)
    } catch (err) {
      console.log(err)
    }
  }

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <Pressable style={{ marginLeft: 10 }} onPress={logoutPressed}>
          <Text>Logout</Text>
        </Pressable>
      ),
      headerRight: () => (
        <Pressable style={{ marginRight: 10 }} onPress={ManageListingsPressed}>
          <Text>Manage Listings</Text>
        </Pressable>
      ),
    });
  }, [navigation])

  //run every time user is on this screen
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
          setLoggedInUser(userFromFirebaseAuth)
          getAllUsers()
          getAllItems()
          getAllBooking(userFromFirebaseAuth.email)
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
      getAllBooking()
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={{ marginBottom: 16, textAlign: "center" }}>Hello <Text style={{ fontWeight: "bold" }}>{routeEmail}</Text>, theses are your current bookings...</Text>
      <FlatList
        data={bookings}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.bookingItem}>
            
            {/* need await, won't work until item and user getting is done before booking getting start */}

            {/* <Text>Laptop: {item.bookingItem.brand} {item.bookingItem.screenSize}" {item.bookingItem.model}</Text>
            <Text>Total Price: ${item.bookingItem.price}</Text>
            <Text>Renter: {item.renter.name}</Text> */}
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
