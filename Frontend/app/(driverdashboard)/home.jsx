import {StyleSheet, TouchableOpacity} from 'react-native'
import { Ionicons} from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import Spacer from "../../components/Spacer"
import ThemedText from "../../components/ThemedText"
import ThemedViewDriver from "../../components/ThemedViewDriver"
import ThemedIonicons from '../../components/ThemedIonIcons';

const Profile2 = () => {
    const router = useRouter();

    return (
        <ThemedViewDriver style={styles.container} safe={true}>

            <TouchableOpacity
                onPress={()=>router.push('/(innerdashboard)/driverprofile')}
                style={styles.profileButton}
                hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}>
                <ThemedIonicons name="person" size={28}/>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={()=>router.push('/(innerdashboard)/drivernotification')}
                style={styles.notifButton}>
                <ThemedIonicons name="notifications-outline" size={28}/>
            </TouchableOpacity>

            <ThemedText title={true} style={styles.heading}>
                Driver Dashboard
            </ThemedText>
            <Spacer/>

            <ThemedText>Home Page</ThemedText>
            <Spacer/>

        </ThemedViewDriver>
    )
}

export default Profile2
const styles = StyleSheet.create({
    container:{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    heading:{
        fontWeight: "bold",
        fontSize: 18,
        textAlign: "center",
    },
    profileButton:{
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 10,
        padding: 10,
        borderRadius: 25,
        backgroundColor: 'rgba(255, 255, 255, 0.59)',
    },
    notifButton:{
        position: 'absolute',
        top: 50,
        right: 80,
        zIndex: 10,
        padding: 10,
        borderRadius: 25,
        backgroundColor: 'rgba(255,255,255,0)',
    },
})