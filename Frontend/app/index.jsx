import { StyleSheet, Text, View, Image, Pressable } from 'react-native'
import {Link, useRouter} from 'expo-router'
import Logo from '../assets/img/logo.png'
import React from 'react'

//fonts

//themed components
import ThemedView from '../components/ThemedView'
import ThemedLogo from '../components/ThemedLogo'
import Spacer from '../components/Spacer'
import ThemedText from '../components/ThemedText'
import ThemedButton from '../components/ThemedButton'

const Home = () => {
  const router = useRouter()
  
      const gologin = () => {
          // Navigate to login page
          router.push('/login')
      }
      const goregister = () => {
          // Navigate to register page
          router.push('/register')
      }

  return (

    <><ThemedView style={styles.WelcomeText}>

      <View style={styles.imgcontainer}>
        <ThemedLogo style={styles.image} />
      </View>

      <ThemedText style={styles.title} >Welcome!</ThemedText>

    </ThemedView>
    
    <ThemedView style={styles.container}>

    <ThemedButton onPress={gologin}>
      <Text style={{color: '#000', fontSize: 18}}>LOGIN</Text>
    </ThemedButton>

    <ThemedButton onPress={goregister}>
      <Text style={{color: '#000', fontSize: 18}}>SIGN UP</Text>
    </ThemedButton>

      <Link href="/profile" style={styles.link}>
        <ThemedText>Profile Page</ThemedText>
      </Link>

    </ThemedView></>
  )
}

export default Home

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  WelcomeText: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 50,
  },
  title:{
    fontWeight:'bold',
    fontSize: 34,
    marginTop: 40,
  },
  imgcontainer: {
    width: 175,        
    height: 175,       
    borderRadius: 20, 
    overflow: 'hidden',
    marginBottom: 20,
    // marginTop: 115,
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