import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Button, Alert, Platform, StatusBar, Text, SafeAreaView } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import * as Location from 'expo-location';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../FirebaseConfig';
import { auth } from "../FirebaseConfig";
import { onAuthStateChanged } from 'firebase/auth';
import { StackActions, useIsFocused, useLinkProps } from "@react-navigation/native";


const SearchScreen = () => {
  const [userLat, setUserLat] = useState(null)
  const [userLng, setUserLng] = useState(null)
  const [userCity, setUserCity] = useState(null)
  const [loggedInUser, setLoggedInUser] = useState(null)
  const [items, setItems] = useState(null)
  const [getItemStart, setGetItemStart] = useState(false)
  const [getItemEnd, setGetItemEnd] = useState(false)

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

  const doFwdGeocode = async () => {
    try {
      const geocodedLocation = await Location.geocodeAsync()
      console.log(geocodedLocation) // array of possible locations

      const result = geocodedLocation[0]
      if (result === undefined) {
        alert("No coordinates found")
        return
      }

      console.log(result)
      console.log(`Latitude: ${result.latitude}`)
      console.log(`Longitude: ${result.longitude}`)
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

      setUserCity(result.city)

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

      // Output device location to screen
      //setCurrLocationLabel(`Current location: ${JSON.stringify(location)}`)
      //alert(JSON.stringify(location))
      setUserLat(location.coords.latitude)
      setUserLng(location.coords.longitude)

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

  const handleBookNow = (listingId) => {
    Alert.alert('Booking', `Booking for listing ${listingId} is pending approval`);
  };

  //get All document from booking from owner email
  const getAllItems = async (cityName) => {
    console.log("Retrieving all documents from the 'bookingItems' collection...")

    try {
      const querySnapshot = await getDocs(collection(db, "bookingItems"))

      const resultsFromDB = []

      querySnapshot.forEach((currDoc) => {
        if (currDoc.data().city == cityName) {
          console.log(`Items id: ${currDoc.id}`)
          console.log("Items data:")
          console.log(currDoc.data())
          const bookingItem = {
            id: currDoc.id,
            ...currDoc.data()
          }
          resultsFromDB.push(bookingItem)
        }
      })

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

          // Alert.alert(`Currently logged in user : ${userFromFirebaseAuth.email}`)
          //set the user info to loggedInUser state
          setLoggedInUser(userFromFirebaseAuth)

          // const promises = [getCurrLocation()]
          // Promise.allSettled(promises).then(() => {
          //   setGetItemStart(true)
          // })
          getCurrLocation();
        } else {
          //if not, we don't have access to currently logged in user
          setLoggedInUser(null)
        }
      })

      return listener
    }
  }, [isUserOnThisScreen])

  /* useEffect(() => {
    doReverseGeocode().then(() => {
      setGetItemStart(true)
    })
  }, [userLat]);

  useEffect(() => {
    if (getItemStart == true) {
      getAllItems().then(() => {
        setGetItemEnd(true)
      })
    }
  }, [getItemStart]);

  useEffect(() => {
    if (getItemEnd == true) {
      console.log(items)
      setGetItemStart(false)
    }
  }, [getItemEnd]); */

  return (
    <SafeAreaView styles={styles.container}>
      {
        //(getItemEnd == true)
          //?
          <View>
            <MapView style={styles.map} ref={mapRef}>
              <Marker
                coordinate={{ latitude: 43.814670, longitude: -79.285060 }}
              >
                <Callout>
                  <View>
                    <Text style={{ fontWeight: 'bold' }}>Toronto</Text>
                    <Text>Placeholder marker</Text>
                  </View>
                </Callout>
              </Marker>
            </MapView>
            <Text>User Lat: {userLat}</Text>
            <Text>User long: {userLng}</Text>
            <Text>User City: {userCity}</Text>
          </View>
          //:
          //<View></View>
      }
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
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
