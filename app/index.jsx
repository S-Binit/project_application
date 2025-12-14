import { StyleSheet, Text, View, Image } from 'react-native'
import {Link} from 'expo-router'
import Logo from '../assets/img/logo.png'
import React from 'react'

const Home = () => {
  return (
    <View style={styles.container}>
      <View style={styles.imgcontainer}>
        <Image source={Logo} style={styles.image}/>
      </View>
      <Text style={styles.title}>The Number 1</Text>

      <Text style={{marginTop: 10, marginBottom: 30}}>Smart Waste Tracker</Text>

      <Link href="/about" style={styles.link}>About Page</Link>

      <Link href="/contact" style={styles.link}>Contact Page</Link>

    </View>
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
    borderBottomWidth: 1
  }
})