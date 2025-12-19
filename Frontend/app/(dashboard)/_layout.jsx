import { Tabs } from "expo-router"
import { useColorScheme } from "react-native"
import { Colors } from "../../constants/Colors"


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
                height: 80
                },
                tabBarActiveTintColor: theme.iconColorFocused,
                tabBarInactiveTintColor: theme.iconColor
            }} 
        >
        <Tabs.Screen 
            name="home" 
            options={{title: 'Home'}}
        />
        <Tabs.Screen 
            name="map" 
            options={{title: 'Map'}}
        />
        <Tabs.Screen 
            name="news" 
            options={{title: 'News'}}
        />
        <Tabs.Screen 
            name="profile" 
            options={{title: 'Profile'}}
        />
    </Tabs>      
  )
}

export default DashboardLayout