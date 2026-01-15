import { Stack, useRouter } from "expo-router"
import { ActivityIndicator, View } from "react-native"
import { useEffect, useState } from "react"
import AsyncStorage from '@react-native-async-storage/async-storage'
import { ColorsDriver } from "../../constants/ColorsDriver"

const DashboardLayout = () => {
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
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
                <ActivityIndicator size="large" color="#1D9BF0" />
            </View>
        )
    }

    if (!isAuthenticated) {
        return null
    }

  return (
    <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="map" />
    </Stack>      
  )
}

export default DashboardLayout