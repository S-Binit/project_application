import {StyleSheet, TouchableOpacity, View, ScrollView, Platform, StatusBar, RefreshControl} from 'react-native'
import { Ionicons} from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';

import Spacer from "../../components/Spacer"
import ThemedText from "../../components/ThemedText"
import ThemedView from "../../components/ThemedView"
import ThemedIonicons from '../../components/ThemedIonIcons';
import ThemedDashLogo from '../../components/ThemedDashLogo';

const Profile1 = () => {
    const router = useRouter();
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        // Simulate refresh work; replace with real data fetch if needed
        setTimeout(() => setRefreshing(false), 800);
    }, []);

    return (
        <View style={styles.container}>
            {/* Fixed Header */}
            <ThemedView style={styles.header} safe={true}>
                <View style={styles.logoContainer}>
                    <ThemedDashLogo style={styles.logo} />
                </View>

                <View style={styles.headerActions}>
                    <TouchableOpacity
                        onPress={()=>router.push('/(innerdashboard)/notification')}
                        style={styles.notifButton}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                        <ThemedIonicons name="notifications-outline" size={26}/>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={()=>router.push('/(innerdashboard)/profile')}
                        style={styles.profileButton}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                        <ThemedIonicons name="person" size={26}/>
                    </TouchableOpacity>
                </View>
            </ThemedView>

            {/* Scrollable Content */}
            <ThemedView style={styles.body}>
                <ScrollView 
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    bounces={true}
                    alwaysBounceVertical={true}
                    overScrollMode="always"
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor="#4CAF50"
                            colors={["#4CAF50"]}
                        />
                    }>
                    
                    
                    {/* Add more content here to test scrolling */}
                    <ThemedText style={styles.heading}>Welcome to the Home Screen</ThemedText>
                    <ThemedText style={styles.heading}>Welcome to the Home Screen</ThemedText>
                    <ThemedText style={styles.heading}>Welcome to the Home Screen</ThemedText>
                    <ThemedText style={styles.heading}>Welcome to the Home Screen</ThemedText>
                    <ThemedText style={styles.heading}>Welcome to the Home Screen</ThemedText>
                    <ThemedText style={styles.heading}>Welcome to the Home Screen</ThemedText>
                    <ThemedText style={styles.heading}>Welcome to the Home Screen</ThemedText>
                    <ThemedText style={styles.heading}>Welcome to the Home Screen</ThemedText>
                    <ThemedText style={styles.heading}>Welcome to the Home Screen</ThemedText>
                    <ThemedText style={styles.heading}>Welcome to the Home Screen</ThemedText>
                    <ThemedText style={styles.heading}>Welcome to the Home Screen</ThemedText>
                    <ThemedText style={styles.heading}>Welcome to the Home Screen</ThemedText>
                    <ThemedText style={styles.heading}>Welcome to the Home Screen</ThemedText>
                    <ThemedText style={styles.heading}>Welcome to the Home Screen</ThemedText>
                    <ThemedText style={styles.heading}>Welcome to the Home Screen</ThemedText>
                    <ThemedText style={styles.heading}>Welcome to the Home Screen</ThemedText>
                    <ThemedText style={styles.heading}>Welcome to the Home Screen</ThemedText>
                    <ThemedText style={styles.heading}>Welcome to the Home Screen</ThemedText>
                    <ThemedText style={styles.heading}>Welcome to the Home Screen</ThemedText>
                    <ThemedText style={styles.heading}>Welcome to the Home Screen</ThemedText>
                    <ThemedText style={styles.heading}>Welcome to the Home Screen</ThemedText>
                    <ThemedText style={styles.heading}>Welcome to the Home Screen</ThemedText>
                    <ThemedText style={styles.heading}>Welcome to the Home Screen</ThemedText>
                    <ThemedText style={styles.heading}>Welcome to the Home Screen</ThemedText>
                    <ThemedText style={styles.heading}>Welcome to the Home Screen</ThemedText>
                    <ThemedText style={styles.heading}>Welcome to the Home Screen</ThemedText>

                </ScrollView>
            </ThemedView>
        </View>
    )
}

export default Profile1

const styles = StyleSheet.create({
    container:{
        flex: 1,
    },
    body: {
        flex: 1,
        backgroundColor: '#fafafa',
    },
    header: {
        height: 150,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingVertical: 5,
        paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ? StatusBar.currentHeight - -20 : 0) : 5,
        borderBottomWidth: 0.5,
        backgroundColor: 'inherit',
        zIndex: 100,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    logoContainer: {
        flex: 1,
    },
    logo: {
        width: 120,
        height: 120,
        resizeMode: 'contain',
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    notifButton:{
        padding: 8,
        borderRadius: 20,
        backgroundColor: 'transparent',
    },
    profileButton:{
        padding: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
    },
    scrollView: {
        flex: 1,
        backgroundColor: '#E8F5F2',
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
        backgroundColor: '#E8F5F2',
    },
    heading:{
        fontWeight: "bold",
        fontSize: 24,
        textAlign: "center",
        marginTop: 10,
        marginBottom: 10,
    },
})