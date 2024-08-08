import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Button, Alert } from 'react-native';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../FirebaseConfig';

const ManageBookingsScreen = () => {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'bookings'), (snapshot) => {
      const bookingData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setBookings(bookingData);
    });

    return unsubscribe;
  }, []);

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
