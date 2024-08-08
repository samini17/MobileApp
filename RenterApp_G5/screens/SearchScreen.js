import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Button, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../FirebaseConfig';

const SearchScreen = () => {
  const [listings, setListings] = useState([]);
  const [location, setLocation] = useState(null);

  useEffect(() => {
    const getLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location.coords);
    };

    getLocation();

    const unsubscribe = onSnapshot(collection(db, 'listings'), (snapshot) => {
      const listingsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setListings(listingsData);
    });

    return unsubscribe;
  }, []);

  const handleBookNow = (listingId) => {
    Alert.alert('Booking', `Booking for listing ${listingId} is pending approval`);
  };

  return (
    <View style={styles.container}>
      {location && (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          {listings.map((listing) => (
            <Marker
              key={listing.id}
              coordinate={{
                latitude: listing.latitude,
                longitude: listing.longitude,
              }}
              title={listing.title}
              description={listing.description}
              onPress={() => handleBookNow(listing.id)}
            />
          ))}
        </MapView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
});

export default SearchScreen;
