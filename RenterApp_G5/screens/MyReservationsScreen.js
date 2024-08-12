import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Button, Alert, Pressable, Image } from 'react-native';
import { collection, doc, updateDoc, getDocs, where } from 'firebase/firestore';
import { db } from '../FirebaseConfig';
import { auth } from "../FirebaseConfig";
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { StackActions, useIsFocused } from "@react-navigation/native";

const MyReservationsScreen = ({ navigation }) => {
  const [loggedInUser, setLoggedInUser] = useState(null)
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [items, setItems] = useState([]);
  //booking start signify when to start getAll booking
  const [bookingStart, setBookingStart] = useState(false)
  //booking end signify when getAll booking is finished
  const [bookingEnd, setBookingEnd] = useState(false)

  function searchUserByEmail(email) {
    for (let i = 0; i < users.length; i++) {
      if (users[i].email === email) {
        return users[i];
      }
    }
  }

  function searchItemByID(id) {
    for (let i = 0; i < items.length; i++) {
      if (items[i].itemID === id) {
        return items[i];
      }
    }
  }

  const SearchPressed = () => {
    console.log(`search pressed`);
    navigation.navigate('Search');
  }

  const logoutPressed = async () => {
    console.log(`logout pressed`);
    setBookingEnd(false)

    try {
      await signOut(auth)

      console.log(`DEBUG --- 'Logout successful`);

      //navigate to first screen (sign in screen)
      navigation.dispatch(StackActions.popToTop())

    } catch (err) {
      console.log(`DEBUG --- Error while logging out : ${err}`);
    }
  }

  //get All document from booking from renter email
  const getAllBooking = async () => {
    console.log("Retrieving all documents from the 'bookings' collection...")

    try {
      const querySnapshot = await getDocs(collection(db, "bookings"))

      const resultsFromDB = []

      querySnapshot.forEach((currDoc) => {
        console.log(`Booking id: ${currDoc.id}`)
        console.log("Booking data:")
        console.log(currDoc.data())

        if (currDoc.data().renterEmail == loggedInUser.email) {

          const owner = searchUserByEmail(currDoc.data().ownerEmail)
          const bookingItem = searchItemByID(currDoc.data().itemID)

          const booking = {
            id: currDoc.id,
            owner: owner,
            bookingItem: bookingItem,
            ...currDoc.data()
          }

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
        <Pressable style={{ marginRight: 10 }} onPress={SearchPressed}>
          <Text>Search</Text>
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

          // Alert.alert(`Currently logged in user : ${userFromFirebaseAuth.email}`)
          //set the user info to loggedInUser state
          setLoggedInUser(userFromFirebaseAuth)

          //when getAll users and Items finishes retrieving data, bookingStart signal is set to true 
          //but users and items array is still empty until the screen refresh
          const promises = [getAllUsers(), getAllItems()]
          Promise.allSettled(promises).then(() => {
            console.log("start running get all booking")
            setBookingStart(true)
          })
        } else {
          //if not, we don't have access to currently logged in user
          setLoggedInUser(null)
        }
      })

      return listener
    }
  }, [isUserOnThisScreen])

  //whenever useEffect is run, the screen refreshes so users and items array is not empty
  //when booking start is updated, this useEffect take action
  //if bookingStart is true then getAll booking is run
  //when it finishes, set bookingEnd to true, sigifying that booking have completed
  //but bookings array is still empty until the screen refresh again
  useEffect(() => {
    if (bookingStart == true) {
      getAllBooking().then(() => {
        setBookingEnd(true)
      })
    }
  }, [bookingStart]);

  //when booking end is updated, this useEffect take action and refresh the screen again
  //screen refreshes -> bookings array no longer empty
  //since bookingEnd is true, flatlist finally renders
  useEffect(() => {
    if (bookingEnd == true) {
      setBookingStart(false)
    }
  }, [bookingEnd]);

  const cancelBooking = async (bookingId) => {
    try {
      await updateDoc(doc(db, 'bookings', bookingId), {
        status: 'CANCELED',
      });
      Alert.alert('Success', 'Booking canceled');
      const promises = [getAllUsers(), getAllItems()]
      Promise.allSettled(promises).then(() => {
        console.log("start running get all booking")
        setBookingStart(true)
        setBookingEnd(false)
      })
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      {
        (bookingEnd == true)
          ?
          <Text style={{ marginBottom: 16, textAlign: "center" }}>Hello <Text style={{ fontWeight: "bold" }}>{loggedInUser.email}</Text>, theses are your current bookings...</Text>
          :
          <Text></Text>
      }
      {
        // Flatlist only render when bookingEnd signal is true
        (bookingEnd == true)
          ?
          <FlatList
            data={bookings}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.bookingItem}>
                <Text><Text style={{ fontWeight: "bold" }}>Laptop:</Text> {item.bookingItem.brand} {item.bookingItem.screenSize}" {item.bookingItem.model}</Text>
                <Text><Text style={{ fontWeight: "bold" }}>Total Price:</Text> ${item.bookingItem.price}</Text>
                <Text><Text style={{ fontWeight: "bold" }}>Renter:</Text> {item.owner.name}</Text>
                <Image source={{ uri: item.owner.imageURL }} height={50} width={50} />
                <Text>Status: <Text style={{ fontWeight: "bold" }}>{item.status}</Text></Text>
                <Text style={{ marginBottom: 8 }}><Text style={{ fontWeight: "bold" }}>Confirmation Code:</Text> {item.bookingID}</Text>
                {item.status !== 'CANCELED' && (
                  <Button title="Cancel Booking" onPress={() => cancelBooking(item.id)} />
                )}
              </View>
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
          :
          <Text></Text>
      }
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

export default MyReservationsScreen;
