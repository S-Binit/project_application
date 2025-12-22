import { Tabs } from "expo-router"
import { useColorScheme } from "react-native"
import { Colors } from "../../constants/Colors"
import {Ionicons} from '@expo/vector-icons'

const DashboardLayout = () => {
    const colorScheme = useColorScheme()
    const theme = Colors[colorScheme] ?? Colors.light

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