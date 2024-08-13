import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Button, Alert, Platform, StatusBar, Text, SafeAreaView, Pressable, Image } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../FirebaseConfig';
import { auth } from "../FirebaseConfig";
import { onAuthStateChanged } from 'firebase/auth';
import { StackActions, useIsFocused, useLinkProps } from "@react-navigation/native";


const SearchScreen = ({ navigation }) => {
  const [loggedInUser, setLoggedInUser] = useState(null)
  const [items, setItems] = useState([])
  const [itemCoords, setItemCoords] = useState([])


  // selected bookingItem index
  const [selectedItemIndex, setSelectedItemIndex] = useState(null)

  // ref - used to move the map to a specific location
  const mapRef = useRef(null)


  useEffect(() => {
    // when the screen loads, ask for permissions
    requestPermissions()
  }, [])

  // function to ask for permission
  const requestPermissions = async () => {
    try {
      const permissionsObject =
        await Location.requestForegroundPermissionsAsync()
      if (permissionsObject.status === "granted") {
        alert("Permission granted!")
      } else {
        alert("Permission denied or not provided")
      }
    } catch (err) {
      console.log(err)
    }
  }

  const doFwdGeocode = async (address) => {
    try {
      const geocodedLocation = await Location.geocodeAsync(address)
      // console.log(geocodedLocation) // array of possible locations

      const result = geocodedLocation[0]
      if (result === undefined) {
        alert("No coordinates found")
        return
      }

      setItemCoords(itemCoords => [...itemCoords, result])

      // console.log(`Latitude: ${result.latitude}`)
      // console.log(`Longitude: ${result.longitude}`)
    } catch (err) {
      console.log(err)
    }
  }
  const doReverseGeocode = async (userLatitude, userLongitude) => {
    try {
      // create the coordinates object
      // properties here: https://docs.expo.dev/versions/latest/sdk/location/#locationgeocodedlocation
      const coords = {
        latitude: parseFloat(userLatitude),
        longitude: parseFloat(userLongitude)
      }
      // returns an array of LocationGeocodedAddress objects
      // properties of this object are here: https://docs.expo.dev/versions/latest/sdk/location/#locationgeocodedaddress
      const postalAddresses
        = await Location.reverseGeocodeAsync(coords, {})
      const result = postalAddresses[0]

      if (result === undefined) {
        alert("No results found.")
        return
      }

      await getAllItems(result.city)

    } catch (err) {
      console.log(err)
    }

  }

  const getCurrLocation = async () => {
    try {
      // Get device location
      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });


      console.log(`The current location is:`)
      console.log(location)

      // Move the map to the user's location
      // a. Create a region with the user's location at the center
      const myRegion = { latitude: location.coords.latitude, longitude: location.coords.longitude, latitudeDelta: 1, longitudeDelta: 1 }
      // b. Animate the map to the user's location
      if (mapRef === null) {
        console.log("ERROR: MapView is null, cannot move map")
        return
      }
      mapRef.current.animateToRegion(myRegion, 1000)

      // Wait for getCurrLocation to finish
      await doReverseGeocode(location.coords.latitude, location.coords.longitude)
    } catch (err) {
      console.log(err)
    }
  }

  const handleBookNow = async () => {
    try {
      const booking = {
        bookingID: Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000,
        itemID: items[selectedItemIndex].itemID,
        ownerEmail: items[selectedItemIndex].ownerEmail,
        renterEmail: loggedInUser.email,
        status: "CONFIRMED"
      };
      await addDoc(collection(db, 'bookings'), booking);
      Alert.alert('Booking', `Booking for ${items[selectedItemIndex].model} is pending approval`);
      navigation.dispatch(StackActions.pop(1));
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  //get All document from booking from owner email
  const getAllItems = async (cityName) => {
    console.log("Retrieving all documents from the 'bookingItems' collection...")

    try {
      const querySnapshot = await getDocs(collection(db, "bookingItems"))

      const resultsFromDB = []

      for (const currDoc of querySnapshot.docs) {
        if (currDoc.data().city == cityName) {
          console.log(`Items id: ${currDoc.id}`)
          console.log("Items data:")
          console.log(currDoc.data())
          const bookingItem = {
            id: currDoc.id,
            ...currDoc.data()
          }
          await doFwdGeocode(bookingItem.address)
          resultsFromDB.push(bookingItem)
        }
      }
      setItems(resultsFromDB)
    } catch (err) {
      console.log(err)
    }
  }

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

          //set the user info to loggedInUser state
          setLoggedInUser(userFromFirebaseAuth)
          getCurrLocation();
        } else {
          //if not, we don't have access to currently logged in user
          setLoggedInUser(null)
        }
      })

      return listener
    }
  }, [isUserOnThisScreen])

  return (
    <SafeAreaView styles={styles.container}>

      <View>
        <MapView showsUserLocation={true} style={styles.map} ref={mapRef} pointerEvents="box-none">
          {items.map((item, index) => {
            return (
              <Marker
                key={item.itemID}
                onPress={() => setSelectedItemIndex(index)}
                coordinate={{ latitude: itemCoords[index].latitude, longitude: itemCoords[index].longitude }}>
                <Pressable
                  style={{ backgroundColor: "white", borderRadius: 10, borderColor: "white", borderWidth: 3 }}>
                  <Text>${item.price}</Text>
                </Pressable>
              </Marker>
            )
          })
          }
        </MapView>
        {(selectedItemIndex != null)
          ?
          <View style={{margin: 15}}>
            <Text style={{fontWeight: "bold", fontSize: 25, marginBottom: 10}}>{items[selectedItemIndex].brand} {items[selectedItemIndex].screenSize}" {items[selectedItemIndex].model}</Text>
            <Image style={{borderWidth: 1, borderRadius: 10, marginBottom: 10}} source={{ uri: items[selectedItemIndex].imageURL }} height={150} width={250} />  
            <Text style={{marginBottom: 5}}><Text style={{fontWeight: "bold"}}>Rental Price:</Text> ${items[selectedItemIndex].price}/day</Text>          
            <Text style={{marginBottom: 5}}><Text style={{fontWeight: "bold"}}>Pickup Address:</Text> {items[selectedItemIndex].address}</Text>
            <Text style={{marginBottom: 5}}><Text style={{fontWeight: "bold"}}>City:</Text> {items[selectedItemIndex].city}</Text>
            <Text style={{marginBottom: 20}}><Text style={{fontWeight: "bold"}}>Contact Email:</Text> {items[selectedItemIndex].ownerEmail}</Text>            
            <Button title="Book Now" onPress={handleBookNow} />
          </View>
          :
          <View></View>}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    paddingTop: (Platform.OS === "android") ? StatusBar.currentHeight : 0,
  },
  text: {
    fontSize: 18,
    marginVertical: 8,
    textAlign: "center"
  },
  headingText: {
    fontSize: 24,
    marginVertical: 8,
    textAlign: "center",
  },
  input: {
    height: 40,
    margin: 8,
    borderWidth: 1,
    padding: 10,
  },
  map: {
    borderWidth: 1,
    borderColor: "black",
    height: 300,
  }

});

export default SearchScreen;
