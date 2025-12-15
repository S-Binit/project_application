import { Stack} from 'expo-router'
import { StyleSheet, Text, useColorScheme, View } from 'react-native'
import {Colors} from "../constants/Colors"
import { StatusBar } from 'react-native'
import React from 'react'

const RootLayout = () => {
  const colorScheme = useColorScheme()
  const theme = Colors[colorScheme] ?? Colors.light

  return (
    <>
      <StatusBar value="auto"/> 
      <Stack screenOptions={{
        headerStyle: {backgroundColor: theme.navBackground},
        headerTintColor: theme.title,
      }}>
        <Stack.Screen name="index" options={{title: 'Home'}}/>
        <Stack.Screen name="about" options={{title: 'About'}}/>
        <Stack.Screen name="contact" options={{title: 'Contact', headerShown: false}}/>
      </Stack> 
    </>
  )
}

export default RootLayout

const styles = StyleSheet.create({})