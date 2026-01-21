import React, {useState} from 'react';
import { 
    StyleSheet, Pressable, Text, TouchableOpacity, View, TextInput, KeyboardAvoidingView, Platform,
    ScrollView
        } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link, useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors'
import { Ionicons} from '@expo/vector-icons';
import { AUTH_URL } from '../../constants/API';


//themed components
import ThemedText from '../../components/ThemedText';
//import ThemedView from '../../components/ThemedView';
import Spacer from '../../components/Spacer';
import ThemedButton from '../../components/ThemedButton';
import ThemedAdminLoginLogo from '../../components/ThemedAdminLoginLogo';
import ThemedViewAdmin from '../../components/ThemedViewAdmin';


// API base URL is centralized in constants/API.js

const AdminLogin = () => {

    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSignIn = async () => {
        // Clear previous error
        setError('');

        // Validation
        if (!email.trim() || !password.trim()) {
            setError('Email and password are required');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${AUTH_URL}/admin/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email.trim().toLowerCase(),
                    password: password,
                }),
            });

            const data = await response.json();

            if (data.success) {
                // Success! Token received
                console.log('✅ Admin login successful!');
                console.log('Token:', data.token);
                console.log('Admin:', data.user);
                
                // Save token and user data to AsyncStorage
                await AsyncStorage.setItem('token', data.token);
                await AsyncStorage.setItem('userRole', data.user.role);
                await AsyncStorage.setItem('userId', data.user.id);
                await AsyncStorage.setItem('userName', data.user.name || '');
                
                // Navigate to admin dashboard
                router.dismissAll();
                router.replace('/(admin)/home');
            } else {
                // Server returned error
                setError(data.message || 'Login failed');
            }
        } catch (err) {
            console.error('Admin login error:', err);
            setError('Cannot connect to server. Make sure backend is running.');
        } finally {
            setLoading(false);
        }
    };

  return (
    <ThemedViewAdmin style={styles.container}>
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

            <Spacer height={80}/>
               
                {/* {login Logo} */}
            <ThemedViewAdmin style={styles.HeadLogo}>
                <View style={styles.imgcontainer}>
                    <ThemedAdminLoginLogo style={styles.image} />
                </View>
                <ThemedText style={styles.title} title={true}>Log In as Admin</ThemedText>
            </ThemedViewAdmin>

            <Spacer height={40}/>

            {/* Error Message */}
            {error ? (
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={20} color="#ff3b30" />
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            ) : null}

            {error ? <Spacer height={20} /> : null}

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

            <Spacer height={20}/>

            {/* {Password Input} */}
            <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={24} color="#666" style={styles.inputIcon} />
                <TextInput
                    style={styles.input}
                    placeholder="Enter password"
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

            <Spacer height={20}/>

            {/* {Remember Me & Forgot Password} */}
            <View style={styles.optionsRow}>
                <TouchableOpacity
                    style={styles.rememberMe}
                    onPress={() => setRememberMe(!rememberMe)}
                >
                    <Ionicons
                        name={rememberMe ? 'checkbox-outline' : 'square-outline'}
                        size={24}
                        color="#4DA4EA"
                    />
                    <ThemedText style={styles.rememberText}>Remember me</ThemedText>
                </TouchableOpacity>

                <Link href="/forgot-password">
                    <ThemedText style={styles.forgotText}>Forgot password?</ThemedText>
                </Link>
            </View>

            <Spacer height={40}/>

            {/* {Sign In Button} */}
            <TouchableOpacity 
                onPress={handleSignIn} 
                style={[styles.signInButton, loading && styles.buttonDisabled]}
                disabled={loading}
            >
                <Text style={styles.buttonText}>
                    {loading ? 'Signing In...' : 'Log In'}
                </Text>
            </TouchableOpacity>

            {/* {spacer at bottom to prevent overlap} */}
            <Spacer height={100}/>
            </ScrollView>
        </KeyboardAvoidingView>
    </ThemedViewAdmin>
  );
};

export default AdminLogin

const styles = StyleSheet.create({
    container:{
        flex: 1,
        position: 'relative',
        // justifyContent: "center",
        // alignItems: 'center',
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
    scrollContent:{
        paddingHorizontal: 30,
        paddingBottom: 10,
        flexGrow: 0,
        justifyContent: 'center',
    },
    HeadLogo: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    imgcontainer: {
        width: 200,        
        height: 200,       
        buttonDisabled: {
            opacity: 0.6,
        },
        errorContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#ffebee',
            padding: 12,
            borderRadius: 8,
            gap: 8,
        },
        errorText: {
            color: '#ff3b30',
            fontSize: 14,
            flex: 1,
        },
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
    inputWrapper:{
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
   optionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
    },
    rememberMe: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rememberText:{
        marginLeft: 8,
        fontSize: 15,
    },
    forgotText: {
        color: '#c55d5d',
        fontSize: 15,
    },
    signInButton: {
        width: '100%',
        height: 56,
        borderRadius: 28,
        backgroundColor: '#c55d5d', 
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
    registerText: {
        textAlign: 'center',
        fontSize: 16,
        color: '#666',
    },
    registerContainer: {
        marginTop: 30,
    },
    signUpLink:{
        fontWeight: 'bold',
        color: '#201f1fff',
    },
});