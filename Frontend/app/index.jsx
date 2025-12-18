import { StyleSheet, Text, View, Image } from 'react-native'
import {Link} from 'expo-router'
import Logo from '../assets/img/logo.png'
import React from 'react'

//themed components
import ThemedView from '../components/ThemedView'
import ThemedLogo from '../components/ThemedLogo'
import Spacer from '../components/Spacer'
import ThemedText from '../components/ThemedText'

const Home = () => {
  return (
    <ThemedView style={styles.container}>
      <View style={styles.imgcontainer}>
        <ThemedLogo style={styles.image}/>
      </View>
      <ThemedText style={styles.title} title ={true}>The Number 1</ThemedText>

      <Spacer height={10}/>
      <ThemedText>Smart Waste Tracker</ThemedText>
      <Spacer/>

      <Link href="/login" style={styles.link}>
      <ThemedText>Login Page</ThemedText>
      </Link>

      <Link href="/register" style={styles.link}>
      <ThemedText>Register Page</ThemedText>
      </Link>

    </ThemedView>
  )
}

export default Home

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  title:{
    fontWeight:'bold',
    fontSize: 18
  },
  imgcontainer: {
    width: 150,        
    height: 150,       
    borderRadius: 20, 
    overflow: 'hidden',
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  link:{
    marginVertical: 10,
    borderBottomWidth: 1,
  }
})