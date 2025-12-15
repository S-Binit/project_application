import { StyleSheet, useColorScheme } from 'react-native'
import {Link} from 'expo-router'
import {Colors} from "../constants/Colors"
import React from 'react'

//themed components
import ThemedView from '../components/ThemedView'
import Spacer from '../components/Spacer'
import ThemedText from '../components/ThemedText'

const About = () => {
  const colorScheme = useColorScheme()
    const theme = Colors[colorScheme] ?? Colors.light

  return (
    <ThemedView style={styles.container}>

        <ThemedText style={styles.title}>About Page</ThemedText>

            <Link href="/" style={styles.link}>
            <ThemedText>Back Home</ThemedText>
            </Link>

    </ThemedView>

  )
}

export default About

const styles = StyleSheet.create({
  container:{
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  title:{
    fontWeight:'bold',
    fontSize: 18
  },
  link:{
    marginVertical: 10,
    borderBottomWidth: 1
  }
})