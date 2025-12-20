import { StyleSheet, Pressable, Text } from 'react-native'
import { Link, useRouter } from 'expo-router'
import { Colors } from '../../constants/Colors'
import React from 'react'

//themed components
import ThemedText from '../../components/ThemedText'
import ThemedView from '../../components/ThemedView'
import Spacer from '../../components/Spacer'
import ThemedButton from '../../components/ThemedButton'


const Login = () => {
    const router = useRouter()

    const handleSubmit = () => {
        console.log('login form submitted')
        // Navigate to dashboard after login
        router.push('/home')
    }

  return (
    <ThemedView style={styles.container}>

    <Spacer/>
    <ThemedText title={true} style={styles.title}>
        Login to Your Account
    </ThemedText>

    <ThemedButton onPress={handleSubmit}>
        <Text style={{color: '#f2f2f2'}}>Login</Text>
    </ThemedButton>

    <Spacer height={100}/>
    <Link href='/register'>
        <ThemedText style={{textAlign: 'center'}}>
            Register instead
        </ThemedText>
    </Link>

    </ThemedView>
  )
}

export default Login

const styles = StyleSheet.create({
    container:{
        flex: 1,
        justifyContent: "center",
        alignItems: 'center',
    },
    title: {
        textAlign: "center",
        fontSize: 18,
        marginBottom: 30
    },
    btn: {
        backgroundColor: Colors.primary,
        padding: 15,
        borderRadius: 5,
    },
    pressed:{
        opacity: 0.8
    }
})