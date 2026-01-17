import {StyleSheet, TouchableOpacity, View, ScrollView, Platform, StatusBar, RefreshControl, Image} from 'react-native'
import { Ionicons} from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useState, useEffect } from 'react';

import Spacer from "../../components/Spacer"
import ThemedText from "../../components/ThemedText"
import ThemedIonicons from '../../components/ThemedIonIcons';
import ThemedAdminDashLogo from '../../components/ThemedAdminDashLogo';
import ThemedViewAdmin from '../../components/ThemedViewAdmin';

const Profile1 = () => {
    const router = useRouter();
    const [refreshing, setRefreshing] = useState(false);
    const [currentDate, setCurrentDate] = useState('');
    const [truckStatus, setTruckStatus] = useState('active'); // 'active' or 'inactive'
    const [pickupText, setPickupText] = useState('');

    // Update date on mount and every minute
    useEffect(() => {
        const updateDate = () => {
            const today = new Date();
            
            // Format date in AD (Anno Domini) format
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            const formattedDate = today.toLocaleDateString('en-US', options);
            
            setCurrentDate(formattedDate);
            
            // Determine truck status based on day of week
            // 0 = Sunday, 2 = Tuesday, 4 = Thursday
            const activeDays = [0, 2, 4];
            const isActive = activeDays.includes(today.getDay());
            setTruckStatus(isActive ? 'active' : 'inactive');
            
            // Calculate pickup day text
            const dayOfWeek = today.getDay();
            let pickup = '';
            
            if (activeDays.includes(dayOfWeek)) {
                pickup = 'Pickup Day Today! 🚛';
            } else {
                let nextDay = '';
                let isTomorrow = false;
                
                if (dayOfWeek === 1) { // Monday
                    nextDay = 'Tuesday 🗓️\n';
                    isTomorrow = '(Tomorrow)';
                } else if (dayOfWeek === 3) { // Wednesday
                    nextDay = 'Thursday 🗓️\n';
                    isTomorrow = '(Tomorrow)';
                } else if (dayOfWeek === 5) { // Friday
                    nextDay = 'Sunday 🗓️\n';
                    isTomorrow = '(Day After Tomorrow)';
                } else if (dayOfWeek === 6) { // Saturday
                    nextDay = 'Sunday 🗓️\n';
                    isTomorrow = '(Tomorrow)';
                }
                
                pickup = `Next Pickup: ${nextDay} ${isTomorrow}`;
            }
            
            setPickupText(pickup);
        };
        
        updateDate();
        
        const interval = setInterval(() => {
            updateDate();
        }, 60000); // Update every minute
        
        return () => clearInterval(interval);
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        // Simulate refresh work; replace with real data fetch if needed
        setTimeout(() => setRefreshing(false), 800);
    }, []);

    return (
        <View style={styles.container}>
            {/* Fixed Header */}
            <ThemedViewAdmin style={styles.header} safe={true}>
                <View style={styles.logoContainer}>
                    <ThemedAdminDashLogo style={styles.logo} />
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

            </ThemedViewAdmin>

            {/* Scrollable Content */}
            <ThemedViewAdmin style={styles.body}>
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
                    
                    {/* Current Date Container */}
                    <View style={styles.dateContainer}>
                        <ThemedText style={styles.dateText}>{currentDate}</ThemedText>
                        
                        <View style={styles.pickupStatusRow}>
                            <ThemedText style={styles.pickupText}>{pickupText}</ThemedText>
                            
                            <TouchableOpacity 
                                onPress={() => truckStatus === 'active' && router.push('/(admin)/map')}
                                disabled={truckStatus === 'inactive'}
                                activeOpacity={truckStatus === 'active' ? 0.7 : 1}
                            >
                                <View style={[styles.statusPill, truckStatus === 'active' ? styles.pillActive : styles.pillInactive]}>
                                    <Ionicons name="car" size={18} color="white" style={styles.pillIcon}/>
                                    <ThemedText style={styles.statusText}>
                                        Truck {truckStatus === 'active' ? 'Active' : 'Inactive'}
                                    </ThemedText>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                    
                    {/* New Container */}
                    <View style={styles.contentContainer}>
                        <View style={styles.contentBody}>
                            <Image 
                                source={require('../../assets/img/like_dislike.png')}
                                style={styles.containerImage}
                                resizeMode="contain"
                            />
                            <View style={styles.rightTextContainer}>
                                <ThemedText style={styles.complaintsText}>Complaints</ThemedText>
                                <ThemedText style={styles.middleText}>and</ThemedText>
                                <ThemedText style={styles.feedbacksText}>Feedbacks</ThemedText>
                            </View>
                        </View>
                        <TouchableOpacity 
                            style={styles.reportButton}
                            onPress={() => router.push('/(innerdashboard)/complaints')}>
                            <ThemedText style={styles.reportButtonText}>See complaints and feedback →</ThemedText>
                        </TouchableOpacity>
                    </View>

                    <Spacer height={20}/>

                    {/* Driver Management Button */}
                    <TouchableOpacity 
                        style={styles.driverManagementButton}
                        onPress={() => router.push('/(admin)/drivermanagement')}>
                        <ThemedText style={styles.driverManagementText}>Driver Management</ThemedText>
                    </TouchableOpacity>
                    
                    {/* Add more content here to test scrolling */}
                
                </ScrollView>
            </ThemedViewAdmin>
        </View>
    )
}

export default Profile1

const headerHeight = Platform.OS === 'android' ? 135 : 100;

const styles = StyleSheet.create({
    container:{
        flex: 1,
    },
    body: {
        flex: 1,
        backgroundColor: '#fafafa',
    },
    header: {
        height: headerHeight,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingVertical: 5,
        paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ? StatusBar.currentHeight + 20 : 0) : 5,
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
        backgroundColor: '#ffebee',
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
        backgroundColor: '#ffebee',
    },
    heading:{
        fontWeight: "bold",
        fontSize: 24,
        textAlign: "center",
        marginTop: 10,
        marginBottom: 10,
    },
    dateContainer: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        borderLeftWidth: 4,
        borderLeftColor: '#c55d5d',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dateText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#c55d5d',
        textAlign: 'center',
        marginBottom: 12,
    },
    pickupStatusRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        marginTop: 12,
    },
    pickupText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        flex: 1,
    },
    statusPill: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    pillActive: {
        backgroundColor: '#4CAF50',
    },
    pillInactive: {
        backgroundColor: '#999',
    },
    pillIcon: {
        marginRight: 2,
    },
    statusText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '600',
    },
    contentContainer: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        marginBottom: 20,
        minHeight: 180,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
        justifyContent: 'space-between',
    },
    contentBody: {
        flex: 1,
        justifyContent: 'center',
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
    },
    containerImage: {
        width: 120,
        height: 120,
        marginRight: 20,
        marginLeft: 20,
    },
    rightTextContainer: {
        alignItems: 'flex-end',
        marginRight: 20,
        flex: 1,
        justifyContent: 'center',
    },
    middleText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#333',
        textAlign: 'center',
        marginVertical: 2,
        width: '100%',
        marginHorizontal: -32,
    },
    reportButton: {
        backgroundColor: '#c55d5d',
        paddingVertical: 16,
        alignItems: 'center',
        width: '100%',
        borderBottomLeftRadius: 12,
        borderBottomRightRadius: 12,
    },
    reportButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
    // Driver Management Button
    driverManagementButton: {
        backgroundColor: '#FF9800',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    driverManagementText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    complaintsText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#EF5350',
        textAlign: 'right',
    },
    feedbacksText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1976D2',
        textAlign: 'right',
    },
})