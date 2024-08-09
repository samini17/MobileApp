import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Button, Alert } from 'react-native';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../FirebaseConfig';
import { auth } from "../FirebaseConfig";


const ManageBookingsScreen = ({navigation, route}) => {
  const [loggedInUser, setLoggedInUser] = useState(null)
  const [bookings, setBookings] = useState([]);

  const unsubscribe = () => {
    const unsubscribe = onSnapshot(collection(db, 'bookings'), (snapshot) => {
      const bookingData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setBookings(bookingData);
    });

    return unsubscribe;
  }

  useEffect(()=>{
    //listen for any changes in authentication changes
    const listener = onAuthStateChanged(auth, (userFromFirebaseAuth) => {
        //check if userFromFirebaseAuth is available
        if (userFromFirebaseAuth){
            //if yes, that means we have access to currently logged in user
            console.log(`DEBUG --- userFromFirebaseAuth : ${JSON.stringify(userFromFirebaseAuth)}`);
            console.log(`Currently logged in user : ${userFromFirebaseAuth.email}`)

            Alert.alert(`Currently logged in user : ${userFromFirebaseAuth.email}`)
            //set the user info to loggedInUser state
            setLoggedInUser(userFromFirebaseAuth)
            unsubscribe()
        }else{
            //if not, we don't have access to currently logged in user
            setLoggedInUser(null)
        }
    })

    return listener
}, [])

  const cancelBooking = async (bookingId) => {
    try {
      await updateDoc(doc(db, 'bookings', bookingId), {
        status: 'CANCELED',
      });
      Alert.alert('Success', 'Booking canceled');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={bookings}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.bookingItem}>
            <Text>Item: {item.itemName}</Text>
            <Text>Renter: {item.renterName}</Text>
            <Text>Status: {item.status}</Text>
            <Text>Confirmation Code: {item.confirmationCode}</Text>
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
