import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../FirebaseConfig';

const MyReservationsScreen = () => {
  const [reservations, setReservations] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'bookings'), (snapshot) => {
      const reservationData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setReservations(reservationData);
    });

    return unsubscribe;
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={reservations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.reservationItem}>
            <Text>Item: {item.itemName}</Text>
            <Text>Owner: {item.ownerName}</Text>
            <Text>Status: {item.status}</Text>
            <Text>Confirmation Code: {item.confirmationCode}</Text>
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
  reservationItem: {
    padding: 16,
    backgroundColor: '#f8f8f8',
  },
  separator: {
    height: 1,
    backgroundColor: '#ddd',
  },
});

export default MyReservationsScreen;
