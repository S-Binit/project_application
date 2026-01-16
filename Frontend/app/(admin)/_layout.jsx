import { Tabs } from "expo-router"
import { useColorScheme, Platform } from "react-native"
import { Colors } from "../../constants/Colors"
import {Ionicons} from '@expo/vector-icons'

const DashboardLayout = () => {
    const colorScheme = useColorScheme()
    const theme = Colors[colorScheme] ?? Colors.light

  return (
        <Tabs
          screenOptions={{
              headerShown: false,
              tabBarStyle: {
                  backgroundColor: theme.navBackground,
                  paddingTop: 10,
                  height: 100,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: -3 },
                  shadowOpacity: 0.1,
                  shadowRadius: 3,
                  elevation: 5,
              },
              tabBarActiveTintColor: theme.iconColorFocused,
              tabBarInactiveTintColor: theme.iconColor
          }}
      >
              <Tabs.Screen
                  name="home"
                  options={{
                      title: 'Home', tabBarIcon: ({ focused }) => (
                          <Ionicons
                              size={24}
                              name={focused ? 'home' : 'home-outline'}
                              color={focused ? theme.iconColorFocused : theme.iconColor} />
                      )
                  }} />
              <Tabs.Screen
                  name="map"
                  options={{
                      title: 'Map', tabBarIcon: ({ focused }) => (
                          <Ionicons
                              size={24}
                              name={focused ? 'map' : 'map-outline'}
                              color={focused ? theme.iconColorFocused : theme.iconColor} />
                      )
                  }} />
              <Tabs.Screen
                  name="post"
                  options={{
                      title: 'Post', tabBarIcon: ({ focused }) => (
                          <Ionicons
                              size={24}
                              name={focused ? 'newspaper' : 'newspaper-outline'}
                              color={focused ? theme.iconColorFocused : theme.iconColor} />
                      )
                  }} />
              <Tabs.Screen
                  name="admindash"
                  options={{
                      href: null
                  }} />
              <Tabs.Screen
                  name="adminmap"
                  options={{
                      href: null
                  }} />
              <Tabs.Screen
                  name="adminnews"
                  options={{
                      href: null
                  }} />
              <Tabs.Screen
                  name="createdriver"
                  options={{
                      href: null
                  }} />
              <Tabs.Screen
                  name="deletedriver"
                  options={{
                      href: null
                  }} />
              <Tabs.Screen
                  name="driverinfo"
                  options={{
                      href: null
                  }} />
              <Tabs.Screen
                  name="drivermanagement"
                  options={{
                      href: null
                  }} />
              <Tabs.Screen
                  name="driverstatus"
                  options={{
                      href: null
                  }} />
              <Tabs.Screen
                  name="schedule"
                  options={{
                      href: null
                  }} />
          </Tabs>     
  )
}

export default DashboardLayout