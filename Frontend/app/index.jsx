import { StyleSheet, Text, View, Image, Pressable, } from 'react-native'
import {Link, useRouter} from 'expo-router'
import React from 'react'

//fonts

//themed components
import ThemedView from '../components/ThemedView'
import ThemedLogo1 from '../components/ThemedLogo'
import Spacer from '../components/Spacer'
import ThemedText from '../components/ThemedText'
import ThemedButton from '../components/ThemedButton'

const RootIndex = () => {
  const router = useRouter()
  
      const gologin = () => {
          // Navigate to login page
          router.push('/login')
      }
      const goregister = () => {
          // Navigate to register page
          router.push('/register')
      }

      const godriverlogin = () => {
        //Navigate to driver login page
        router.push('/driverlogin')
      }

      const goadminlogin = () => {
        //Navigate to admin login page
        router.push('/adminlogin')
      }

  return (
    <><ThemedView style={styles.WelcomeText}>

      <View style={styles.imgcontainer}>
        <ThemedLogo1 style={styles.image} />
      </View>

      <ThemedText style={styles.title} title={true}>Welcome!</ThemedText>
      <ThemedText style={{fontSize: 16}}>Track garbage trucks in real-time for a cleaner city</ThemedText>

      </ThemedView>

          <ThemedView style={styles.container}>

            <ThemedButton onPress={gologin} style={{ backgroundColor: '#43A047' }}>
              <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>LOGIN</Text>
            </ThemedButton>

            <ThemedButton onPress={goregister}>
              <Text style={{ color: '#43A047', fontSize: 18, fontWeight: 'bold' }}>SIGN UP</Text>
            </ThemedButton>

          <Spacer height={25}/>  

            {/* {driver and admin login buttons} */}
            <View style={styles.buttonRow}>
              <Pressable
                onPress={godriverlogin}
                style={({ pressed }) => [
                styles.button,
                  { backgroundColor: pressed ? '#4DA4EA' : '#4DA4EA' },  // Darker when pressed
                  { opacity: pressed ? 0.5 : 1 },
                ]}
              >
                {({ pressed }) => (
                  <Text style={styles.text}>
                    {pressed ? 'DRIVER LOGIN' : 'DRIVER LOGIN'}
                  </Text>
                )}
              </Pressable>

              <Pressable
                onPress={goadminlogin}
                style={({ pressed }) => [
                styles.button,
                  { backgroundColor: pressed ? '#c55d5d' : '#c55d5d' },  // Darker when pressed
                  { opacity: pressed ? 0.5 : 1 },
                ]}
              >
                {({ pressed }) => (
                  <Text style={styles.text}>
                    {pressed ? 'ADMIN LOGIN' : 'ADMIN LOGIN'}
                  </Text>
                )}
              </Pressable>
            </View>
        
          </ThemedView></>
        
  )
}

export default RootIndex

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  background: {
    flex: 1,
    width: 'auto',
    height: 'auto',
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
  button: {
    width: 150,
    height: 56,
    padding: 10,
    borderRadius: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 4,
    elevation: 5,
    justifyContent: 'center',
    alignContent: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
})