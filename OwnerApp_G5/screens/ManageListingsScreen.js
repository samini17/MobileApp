import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Button, Alert, Pressable } from 'react-native';
import { collection, onSnapshot, doc, updateDoc, getDocs, deleteDoc, where } from 'firebase/firestore';
import { db } from '../FirebaseConfig';
import { auth } from "../FirebaseConfig";
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { StackActions, useIsFocused } from "@react-navigation/native";

const ManageListingsScreen = ({ navigation, route }) => {
  const routeEmail = route.params
  const [loggedInUser, setLoggedInUser] = useState(null)
  const [items, setItems] = useState([]);

  const CreateListingPressed = () => {
    console.log(`create listing pressed`);
    navigation.navigate('CreateListing', routeEmail);
  }

  const deleteListing = async (listingId) => {
    try {
      await deleteDoc(doc(db, "bookingItems", listingId))
      Alert.alert('Success', 'Listing deleted');
      getAllItems()
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  //get All document from booking from owner email
  const getAllItems = async (userEmail) => {
    console.log("Retrieving all documents from the 'bookings' collection...")

    try {
      const querySnapshot = await getDocs(collection(db, "bookingItems"))

      const resultsFromDB = []

      querySnapshot.forEach((currDoc) => {
        console.log(`Items id: ${currDoc.id}`)
        console.log("Items data:")
        console.log(currDoc.data())

        if (currDoc.data().ownerEmail == userEmail) {
          const bookingItem = {
            id: currDoc.id,
            ...currDoc.data()
          }
          console.log("HELLOOOOOOOOOOOOOOOOOOOOOOOOOOO")
          console.log(bookingItem)
          resultsFromDB.push(bookingItem)
        }
      })

      setItems(resultsFromDB)
    } catch (err) {
      console.log(err)
    }
  }

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable style={{ marginRight: 10 }} onPress={CreateListingPressed}>
          <Text>Create Listings</Text>
        </Pressable>
      ),
    });
  }, [navigation])

  //run every time user is on this screen
  const isUserOnThisScreen = useIsFocused()
  useEffect(() => {
    if (!isUserOnThisScreen)
      console.log(`MANAGE LISTING NOT LOADED: ${isUserOnThisScreen}`)
    else {
      console.log(`MANAGE LISTING IS LOADED: ${isUserOnThisScreen}`)

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
          getAllItems(userFromFirebaseAuth.email)
        } else {
          //if not, we don't have access to currently logged in user
          setLoggedInUser(null)
        }
      })

      return listener
    }
  }, [isUserOnThisScreen])

  return (
    <View style={styles.container}>
      <Text>Hello</Text>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.bookingItem}>
            <Text>Laptop: {item.brand} {item.screenSize}" {item.model}</Text>
            <Text>Total Price: ${item.price}</Text>
            <Button title="Delete Listing" onPress={() => deleteListing(item.id)} />
          </View>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  )
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
  
  export default ManageListingsScreen;