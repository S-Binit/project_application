import { StyleSheet } from 'react-native'
import { Link } from 'expo-router'
import React from 'react'

//themed components
import ThemedText from '../../components/ThemedText'
import ThemedView from '../../components/ThemedView'
import Spacer from '../../components/Spacer'


const Register = () => {
  return (
    <ThemedView style={styles.container}>

    <Spacer/>
    <ThemedText title={true} style={styles.title}>
        Register For an Account
    </ThemedText>

    <Spacer height={100}/>
    <Link href='/login'>
        <ThemedText style={{textAlign: 'center'}}>
            Login instead
        </ThemedText>
    </Link>

    </ThemedView>
  )
}

export default Register

const styles = StyleSheet.create({
    container:{
        flex: 1,
        justifyContent: "center",
    },
    title: {
        textAlign: "center",
        fontSize: 18,
        marginBottom: 30
    },
})