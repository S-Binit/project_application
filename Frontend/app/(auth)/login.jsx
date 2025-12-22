import { StyleSheet, Pressable, Text, TouchableOpacity, View } from 'react-native'
import { Link, useRouter } from 'expo-router'
import { Colors } from '../../constants/Colors'
import { Ionicons} from '@expo/vector-icons'
import React from 'react'

//themed components
import ThemedText from '../../components/ThemedText'
import ThemedView from '../../components/ThemedView'
import Spacer from '../../components/Spacer'
import ThemedButton from '../../components/ThemedButton'
import ThemedLoginLogo from '../../components/ThemedLoginLogo'


const Login = () => {
    const router = useRouter()

    // const handleSubmit = () => {
    //     console.log('login form submitted')
    //     // Navigate to dashboard after login
    //     router.push('/home')
    // }

  return (
    <ThemedView style={styles.container}>

        <TouchableOpacity
            onPress={()=>router.back()}
            style={styles.backButton}
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
        >
            <Ionicons name="arrow-back" size={28} color="#000"/>
        </TouchableOpacity>

        <ThemedView style={styles.HeadLogo}>

            <View style={styles.imgcontainer}>
                <ThemedLoginLogo style={styles.image} />
            </View>

        </ThemedView>

    </ThemedView>
  );
};

export default Login

const styles = StyleSheet.create({
    container:{
        flex: 1,
        position: 'relative',
        // justifyContent: "center",
        // alignItems: 'center',
    },
    backButton:{
        position: 'absolute',
        top: 50,
        left: 20,
        zIndex: 10,
        padding: 10,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.8)',
    },
    HeadLogo: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 50,
    },
     imgcontainer: {
    width: 200,        
    height: 200,       
    borderRadius: 20, 
    overflow: 'hidden',
    marginBottom: 20,
    // marginTop: 115,
    },
    image: {
    width: '100%',
    height: '100%',
    },
    // title: {
    //     textAlign: "center",
    //     fontSize: 18,
    //     marginBottom: 30
    // },
    // btn: {
    //     backgroundColor: Colors.primary,
    //     padding: 15,
    //     borderRadius: 5,
    // },
    // pressed:{
    //     opacity: 0.8
    // }
})