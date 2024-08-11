import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Button, Alert, Pressable } from 'react-native';
import { collection, onSnapshot, doc, updateDoc, getDocs, where } from 'firebase/firestore';
import { db } from '../FirebaseConfig';
import { auth } from "../FirebaseConfig";
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { StackActions, useIsFocused } from "@react-navigation/native";

const ManageListingsScreen = ({ navigation, route }) => {

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