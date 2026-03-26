import { Stack} from 'expo-router'
import { StyleSheet, Text, useColorScheme, View } from 'react-native'
import {Colors} from "../constants/Colors"
import { StatusBar } from 'react-native'
import React, { useEffect } from 'react'
import { requestNotificationPermissions, initializeNotificationListeners } from '../utils/pushNotifications'

const RootLayout = () => {
  const colorScheme = useColorScheme()
  const theme = Colors[colorScheme] ?? Colors.light

  // Request notification permissions and initialize listeners on app start
  useEffect(() => {
    let mounted = true
    let subscription = null

    const setupNotifications = async () => {
      // Request notification permissions
      const granted = await requestNotificationPermissions()
      console.log('Notification permissions:', granted ? 'granted' : 'denied')
      
      // Initialize notification listeners
      const listener = await initializeNotificationListeners()
      if (mounted) {
        subscription = listener
      }
    }

    setupNotifications()

    return () => {
      mounted = false
      subscription?.remove?.()
    }
  }, [])

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