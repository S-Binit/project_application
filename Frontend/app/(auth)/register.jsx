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
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSignUp = () => {
    // Add registration logic here later
    console.log('Sign Up:', { name, email, password });
    router.push('/home');
  };
    
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
                <ThemedText style={styles.title} title={true}>Create an account</ThemedText>
            </ThemedView>

            <Spacer height={40}/>

            {/* {Name Input} */}
            <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={24} color="#666" style={styles.inputIcon} />
                <TextInput
                    style={styles.input}
                    placeholder="Enter full name"
                    placeholderTextColor="#999"
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                />
            </View>

            <Spacer height={20} />

            {/* {Email Input} */}
            <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={24} color="#666" style={styles.inputIcon} />
                <TextInput
                    style={styles.input}
                    placeholder="Enter email"
                    placeholderTextColor="#999"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
            </View>

            <Spacer height={20} />

            {/* {Password Input} */}
            <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={24} color="#666" style={styles.inputIcon} />
                <TextInput
                    style={styles.input}
                    placeholder="Create password"
                    placeholderTextColor="#999"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons
                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={24}
                        color="#666"
                    />
                </TouchableOpacity>
            </View>

            <Spacer height={40} />

            {/* Solid Green Sign Up Button */}
            <TouchableOpacity onPress={handleSignUp} style={styles.signUpButton}>
                <Text style={styles.buttonText}>Sign Up</Text>
            </TouchableOpacity>

            {/* <Spacer height={5} /> */}

           {/* Login Link - Only "Sign In" clickable */}
            <View style={styles.registerContainer}>
                <ThemedText style={styles.registerText}>
                    Already have an account?{' '}
                    <Link href="/login">
                        <Text style={styles.signUpLink}>Log In</Text>
                    </Link>
                </ThemedText>
            </View> 

            <Spacer height={100}/>
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
    scrollContent: {
        paddingHorizontal: 30,
        // paddingBottom: 10,
        flexGrow: 0,
        justifyContent: 'center',
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
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        paddingHorizontal: 15,
        height: 56,
        width: '100%',
        
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#000',
    },
    signUpButton: {
        width: '100%',
        height: 56,
        borderRadius: 28,
        backgroundColor: '#43A047',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 4,
        elevation: 5,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    registerContainer: {
        marginTop: 30,
    },
    registerText: {
        textAlign: 'center',
        fontSize: 16,
    },
    signUpLink: {
        fontWeight: 'bold',
        color: '#43A047',
    },
});