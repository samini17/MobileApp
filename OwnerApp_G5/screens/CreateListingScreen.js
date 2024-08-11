import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, Image, Pressable, ScrollView, SafeAreaView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { collection, addDoc } from 'firebase/firestore';
import { StackActions } from '@react-navigation/native';
import { db } from '../FirebaseConfig';

const CreateListingScreen = ({ navigation, route }) => {
  const routeEmail = route.params
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [screenSize, setScreenSize] = useState('');
  const [imageURL, setImageURL] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [price, setPrice] = useState('');

  // const pickImage = async () => {
  //   const result = await ImagePicker.launchImageLibraryAsync({
  //     mediaTypes: ImagePicker.MediaTypeOptions.Images,
  //     allowsEditing: true,
  //     aspect: [4, 3],
  //     quality: 1,
  //   });

  //   if (!result.canceled) {
  //     setImageUri(result.uri);
  //   }
  // };

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
        ownerEmail: routeEmail
      };
      await addDoc(collection(db, 'bookingItems'), listing);
      Alert.alert('Success', 'Listing created successfully');
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
          {/* <Button title="Pick Image" onPress={pickImage} />
      {imageUri ? <Image source={{ uri: imageUri }} style={styles.image} /> : null} */}

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
