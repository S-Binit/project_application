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
      <Stack initialRouteName="index" screenOptions={{
        headerShown: false, 
        headerStyle: {backgroundColor: theme.navBackground},
        headerTintColor: theme.title,
        animation: 'slide_from_right',
        gestureDirection: "horizontal",
        transitionStyle: "default",
      }}>
        <Stack.Screen name='(auth)' options={{headerShown: false}}/>
        <Stack.Screen name='(dashboard)' options={{headerShown: false}}/>

        <Stack.Screen name="index" options={{title: 'Home'}}/>
    
      </Stack> 
    </>
  )
}

export default RootLayout

const styles = StyleSheet.create({})