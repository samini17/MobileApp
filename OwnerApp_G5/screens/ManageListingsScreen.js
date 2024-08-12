import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Button, Alert, Pressable, Image } from 'react-native';
import { collection, doc, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '../FirebaseConfig';
import { auth } from "../FirebaseConfig";
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { StackActions, useIsFocused } from "@react-navigation/native";

const ManageListingsScreen = ({ navigation }) => {
  const [loggedInUser, setLoggedInUser] = useState(null)
  const [items, setItems] = useState([]);
  const [getItemStart, setGetItemStart] = useState(false)
  const [getItemEnd, setGetItemEnd] = useState(false)

  const CreateListingPressed = () => {
    console.log(`create listing pressed`);
    navigation.navigate('CreateListing');
  }

  const ManageBookingPressed = () => {
    console.log(`making booking pressed`);
    navigation.dispatch(StackActions.pop(1))
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
  const getAllItems = async () => {
    console.log("Retrieving all documents from the 'bookings' collection...")

    try {
      const querySnapshot = await getDocs(collection(db, "bookingItems"))

      const resultsFromDB = []

      querySnapshot.forEach((currDoc) => {
        console.log(`Items id: ${currDoc.id}`)
        console.log("Items data:")
        console.log(currDoc.data())

        if (currDoc.data().ownerEmail == loggedInUser.email) {
          const bookingItem = {
            id: currDoc.id,
            ...currDoc.data()
          }
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
      headerLeft: () => (
        <Pressable style={{ marginLeft: 10 }} onPress={ManageBookingPressed}>
          <Text>Manage Bookings</Text>
        </Pressable>
      ),
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

          // Alert.alert(`Currently logged in user : ${userFromFirebaseAuth.email}`)
          //set the user info to loggedInUser state
          setLoggedInUser(userFromFirebaseAuth)
          setGetItemStart(true)
        } else {
          //if not, we don't have access to currently logged in user
          setLoggedInUser(null)
        }
      })

      return listener
    }
  }, [isUserOnThisScreen])

  useEffect(() => {
    if (getItemStart == true) {
      getAllItems().then(() => {
        setGetItemEnd(true)
      })
    }
  }, [getItemStart]);

  useEffect(() => {
    if (getItemEnd == true) {
      setGetItemStart(false)
    }
  }, [getItemEnd]);

  return (
    <View style={styles.container}>
      {
        (getItemEnd == true)
          ?
          <Text style={{ marginBottom: 16, textAlign: "center" }}>Hello <Text style={{ fontWeight: "bold" }}>{loggedInUser.email}</Text>, theses are your current listings...</Text>
          :
          <Text></Text>
      }
      {
        (getItemEnd == true)
          ?
          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.bookingItem}>
                <Text><Text style={{ fontWeight: "bold" }}>ID:</Text> {item.itemID}</Text>
                <Text><Text style={{ fontWeight: "bold" }}>Laptop:</Text> {item.brand} {item.screenSize}" {item.model}</Text>
                <Image source={{ uri: item.imageURL }} height={50} width={50} />
                <Text><Text style={{ fontWeight: "bold" }}>Renting Price:</Text> ${item.price}</Text>
                <Text style={{ marginBottom: 8 }}><Text style={{ fontWeight: "bold" }}>Address:</Text> {item.address}, {item.city}</Text>
                <Button title="Delete Listing" onPress={() => deleteListing(item.id)} />
              </View>
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
          :
          <Text></Text>
      }
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