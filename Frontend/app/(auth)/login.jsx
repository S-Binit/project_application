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
import ThemedLoginLogo from '../../components/ThemedLoginLogo';


const Login = () => {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState('');
    const [rememberMe, setRememberMe] = useState('');

    const handleSignIn = () => {
            //Add validation or API call here later
        console.log('Sign In:',{email,password,rememberMe});
        router.push('/home')
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

                {/* {login Logo} */}
            <ThemedView style={styles.HeadLogo}>
                <View style={styles.imgcontainer}>
                    <ThemedLoginLogo style={styles.image} />
                </View>
                <ThemedText style={styles.title} title={true}>Log In To Smart Waste Tracker</ThemedText>
            </ThemedView>

            <Spacer height={40}/>

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
                        color="#43A047"
                    />
                    <ThemedText style={styles.rememberText}>Remember me</ThemedText>
                </TouchableOpacity>

                <Link href="/forgot-password">
                    <ThemedText style={styles.forgotText}>Forgot password?</ThemedText>
                </Link>
            </View>

            <Spacer height={40}/>

            {/* {Sign In Button} */}
            <TouchableOpacity onPress={handleSignIn} style={styles.signInButton}>
                <Text style={styles.buttonText}>Log In</Text>
            </TouchableOpacity>

            <Spacer height={30} />

            {/* {Register Link} */}
            <View style={styles.registerContainer}>
                <ThemedText style={styles.registerText}>
                    Don't have an account?{' '}
                    <Link href="/register">
                        <Text style={styles.signUpLink}>Sign Up</Text>
                    </Link>
                </ThemedText>
            </View>

            {/* {spacer at bottom to prevent overlap} */}
            <Spacer height={100}/>
            </ScrollView>
        </KeyboardAvoidingView>
    </ThemedView>
  );
};

export default Login

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
        color: '#43A047',
        fontSize: 15,
    },
    signInButton: {
        width: '100%',
        height: 56,
        borderRadius: 28,
        backgroundColor: '#43A047', 
        justifyContent: 'center',
        alignItems: 'center',
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