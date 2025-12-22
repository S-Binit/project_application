import React, {useState} from 'react';
import { 
    StyleSheet, Pressable, Text, TouchableOpacity, View, TextInput, KeyboardAvoidingView, Platform,
    ScrollView
        } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors'
import { Ionicons} from '@expo/vector-icons';


//themed components
import ThemedText from '../../components/ThemedText';
import ThemedView from '../../components/ThemedView';
import Spacer from '../../components/Spacer';
import ThemedButton from '../../components/ThemedButton';
import ThemedRegisterLogo from '../../components/ThemedRegisterLogo';

const Register = () => {
    const router = useRouter()

    const handleSubmit = () => {
        console.log('register form submitted')
        // Navigate to login after register
        router.push('/login')
    }
    
  return (
    <ThemedView style={styles.container}>
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{flex: 1 }}>

            {/* {Back Button} */}
            <TouchableOpacity
                onPress={()=>router.back()}
                style={styles.backButton}
                hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}>
                <Ionicons name="arrow-back" size={28} color="#000"/>
            </TouchableOpacity>

            <ScrollView
                contentContainerStyle={styles.scrollContent} //Extra bottom padding
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >

            {/* {register logo} */}
             <ThemedView style={styles.HeadLogo}>
                <View style={styles.imgcontainer}>
                    <ThemedRegisterLogo style={styles.image} />
                </View>
                <ThemedText style={styles.title} title={true}>Sign Up</ThemedText>
            </ThemedView>

            </ScrollView>
        </KeyboardAvoidingView>
    </ThemedView>
  )
}

export default Register

const styles = StyleSheet.create({
    container:{
        flex: 1,
        position: 'relative',
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
        paddingTop: 70,
    },
    imgcontainer: {
        width: 200,        
        height: 200,       
        borderRadius: 20, 
        overflow: 'hidden',
        marginBottom: 20,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    title:{
        fontWeight:'bold',
        fontSize: 22,
        marginTop: 16,
        justifyContent: 'flex-end',
    },
})