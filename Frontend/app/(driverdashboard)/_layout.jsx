import { Tabs, useRouter } from "expo-router"
import { useColorScheme, ActivityIndicator, View } from "react-native"
import { useEffect, useState } from "react"
import AsyncStorage from '@react-native-async-storage/async-storage'
import { ColorsDriver } from "../../constants/ColorsDriver"
import {Ionicons} from '@expo/vector-icons'

const DashboardLayout = () => {
    const colorScheme = useColorScheme()
    const theme = ColorsDriver[colorScheme] ?? ColorsDriver.light
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(true)
    const [isAuthenticated, setIsAuthenticated] = useState(false)

    useEffect(() => {
        checkAuth()
    }, [])

    const checkAuth = async () => {
        try {
            const token = await AsyncStorage.getItem('token')
            const userRole = await AsyncStorage.getItem('userRole')
            
            if (token && userRole === 'driver') {
                setIsAuthenticated(true)
            } else {
                // Not authenticated, redirect to driver login
                router.replace('/(auth)/driverlogin')
            }
        } catch (error) {
            console.error('Auth check error:', error)
            router.replace('/(auth)/driverlogin')
        } finally {
            setIsLoading(false)
        }
    }

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={theme.text} />
            </View>
        )
    }

    if (!isAuthenticated) {
        return null
    }

  return (
    <Tabs 
        screenOptions={{
            headerShown: false, 
            tabBarStyle:{
                backgroundColor: theme.navBackground, 
                paddingTop: 10,
                height: 100
                },
                tabBarActiveTintColor: theme.iconColorFocused,
                tabBarInactiveTintColor: theme.iconColor
            }} 
        >
        <Tabs.Screen 
            name="home" 
            options={{title: 'Home', tabBarIcon: ({focused}) => (
                <Ionicons
                    size={24}
                    name={focused ? 'home' : 'home-outline'}
                    color={focused ? theme.iconColorFocused : theme.iconColor}
                />
            )}}
        />
        <Tabs.Screen 
            name="map" 
            options={{title: 'Map', tabBarIcon: ({focused}) => (
                 <Ionicons
                    size={24}
                    name={focused ? 'map' : 'map-outline'}
                    color={focused ? theme.iconColorFocused : theme.iconColor}
                />
            )}}
        />
        <Tabs.Screen 
            name="news" 
            options={{title: 'News', tabBarIcon: ({focused}) => (
                <Ionicons
                    size={24}
                    name={focused ? 'newspaper' : 'newspaper-outline'}
                    color={focused ? theme.iconColorFocused : theme.iconColor}
                />
            )}}
        />
        <Tabs.Screen 
            name="profile" 
            options={{title: 'Profile', tabBarIcon: ({focused}) => (
                <Ionicons
                    size={24}
                    name={focused ? 'person' : 'person-outline'}
                    color={focused ? theme.iconColorFocused : theme.iconColor}
                />
            )}}
        />
    </Tabs>      
  )
}

export default DashboardLayout