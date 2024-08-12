import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, Image, Pressable, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { collection, addDoc } from 'firebase/firestore';
import { StackActions, useIsFocused } from '@react-navigation/native';
import { db } from '../FirebaseConfig';
import { auth } from "../FirebaseConfig";
import { onAuthStateChanged } from 'firebase/auth';

const CreateListingScreen = ({ navigation }) => {
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [screenSize, setScreenSize] = useState('');
  const [imageURL, setImageURL] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [price, setPrice] = useState('');

  const isUserOnThisScreen = useIsFocused();
  useEffect(() => {
    if (!isUserOnThisScreen)
      console.log(`MANAGE LISTING NOT LOADED: ${isUserOnThisScreen}`)
    else {
      console.log(`MANAGE LISTING IS LOADED: ${isUserOnThisScreen}`)

      const listener = onAuthStateChanged(auth, (userFromFirebaseAuth) => {
        if (userFromFirebaseAuth) {
          console.log(`DEBUG --- userFromFirebaseAuth : ${JSON.stringify(userFromFirebaseAuth)}`);
          console.log(`Currently logged in user : ${userFromFirebaseAuth.email}`);

          setLoggedInUser(userFromFirebaseAuth);
        } else {
          setLoggedInUser(null);
        }
      });

      return listener;
    }
  }, [isUserOnThisScreen]);

  const ManageListingsPressed = () => {
    console.log(`making listings pressed`);
    navigation.dispatch(StackActions.pop(1));
  }

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <Pressable style={{ marginLeft: 10 }} onPress={ManageListingsPressed}>
          <Text>Cancel</Text>
        </Pressable>
      ),
    });
  }, [navigation]);

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
        ownerEmail: loggedInUser.email,
      };
      await addDoc(collection(db, 'bookingItems'), listing);
      Alert.alert('Success', 'Listing created successfully');
      navigation.dispatch(StackActions.pop(1));
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0} 
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps='handled'>
            <View style={styles.container}>
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
              {imageURL ? <Image source={{ uri: imageURL }} style={styles.image} /> : <Image source={require("../assets/product-placeholder-wp.jpg")} style={styles.image} />}
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
            </View>
          </ScrollView>
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
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
