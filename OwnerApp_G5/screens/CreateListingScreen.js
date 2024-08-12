import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, Image, Pressable, ScrollView, SafeAreaView } from 'react-native';
import { collection, addDoc } from 'firebase/firestore';
import { StackActions, useIsFocused } from '@react-navigation/native';
import { db } from '../FirebaseConfig';
import { auth } from "../FirebaseConfig";
import { onAuthStateChanged } from 'firebase/auth';

const CreateListingScreen = ({ navigation }) => {
  const [loggedInUser, setLoggedInUser] = useState(null)
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [screenSize, setScreenSize] = useState('');
  const [imageURL, setImageURL] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [price, setPrice] = useState('');


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
        } else {
          //if not, we don't have access to currently logged in user
          setLoggedInUser(null)
        }
      })

      return listener
    }
  }, [isUserOnThisScreen])

  const ManageListingsPressed = () => {
    console.log(`making listings pressed`);
    navigation.dispatch(StackActions.pop(1))
  }

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <Pressable style={{ marginLeft: 10 }} onPress={ManageListingsPressed}>
          <Text>Cancel</Text>
        </Pressable>
      ),
    });
  }, [navigation])

  const handleCreateListing = async () => {
    try {
      const listing = {
        brand: brand,
        model: model,
        screenSize: screenSize,
        itemID: Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000,
        imageURL: imageURL,
        city: city,
        address: address,
        price: price,
        ownerEmail: loggedInUser.email
      };
      await addDoc(collection(db, 'bookingItems'), listing);
      Alert.alert('Success', 'Listing created successfully');
      navigation.dispatch(StackActions.pop(1));
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView>

        <ScrollView>
          <TextInput
            style={styles.input}
            placeholder="Brand"
            value={brand}
            onChangeText={setBrand}
          />
          <TextInput
            style={styles.input}
            placeholder="Model"
            value={model}
            onChangeText={setModel}
          />
          <TextInput
            style={styles.input}
            placeholder="Screen Size"
            value={screenSize}
            onChangeText={setScreenSize}
          />

          <TextInput
            style={styles.input}
            placeholder="Enter image URL here"
            value={imageURL}
            onChangeText={setImageURL}
          />
          {imageURL ? <Image source={{ uri: imageURL }} style={styles.image} height={800} width={800} /> : <Image source={require("../assets/product-placeholder-wp.jpg")} style={styles.image} height={100} width={100} />}

          <TextInput
            style={styles.input}
            placeholder="City"
            value={city}
            onChangeText={setCity}
          />
          <TextInput
            style={styles.input}
            placeholder="Address"
            value={address}
            onChangeText={setAddress}
          />
          <TextInput
            style={styles.input}
            placeholder="Price per day"
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
          />
          <Button title="Create Listing" onPress={handleCreateListing} />
        </ScrollView>
      </SafeAreaView>
    </View>

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 10,
  },
  image: {
    width: '100%',
    height: 200,
    marginTop: 10,
    marginBottom: 10,
  },
});

export default CreateListingScreen;
