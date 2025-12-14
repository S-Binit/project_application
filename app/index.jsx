import { StyleSheet, Text, View, Image } from 'react-native'
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
})