import {StyleSheet, TouchableOpacity, View, ScrollView, Platform, StatusBar, RefreshControl, Image} from 'react-native'
import { Ionicons} from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useState, useEffect } from 'react';

import Spacer from "../../components/Spacer"
import ThemedText from "../../components/ThemedText"
import ThemedView from "../../components/ThemedView"
import ThemedIonicons from '../../components/ThemedIonIcons';
import ThemedDashLogo from '../../components/ThemedDashLogo';

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
            
            // Nepali months (Bikram Sambat)
            const nepaliMonths = [
                'Baisakh', 'Jestha', 'Asar', 'Shrawan', 'Bhadra', 'Ashoj',
                'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra'
            ];
            
            // Nepali days of week
            const nepaliDays = [
                'Sunday', 'Monday', 'Tuesday', 'Wednesday', 
                'Thursday', 'Friday', 'Saturday'
            ];
            
            // Calculate Bikram Sambat year and month more accurately
            const month = today.getMonth(); // 0-11
            const day = today.getDate();
            
            // Nepali year conversion from Gregorian
            // The conversion date is usually mid-April (around April 13-14)
            let nepaliYear = today.getFullYear() + 56;
            if (month >= 3) {
                nepaliYear = today.getFullYear() + 57;
            }
            
            // More accurate month mapping based on Gregorian to Bikram Sambat conversion
            // This accounts for the approximate conversion around mid-April
            let nepaliMonth = month;
            let nepaliDay = day;
            
            // Adjust for the transition around mid-April
            if (month === 3 && day >= 13) { // April 13 onwards
                nepaliMonth = 0; // Baisakh
                nepaliDay = day - 13;
            } else if (month < 3) { // Jan-Mar
                nepaliMonth = (month + 8) % 12; // Maps to Poush, Magh, Falgun of previous Nepali year
                if (month === 0) nepaliDay = day + 16; // Jan -> Poush (approx)
                else if (month === 1) nepaliDay = day + 17; // Feb -> Magh (approx)
                else nepaliDay = day + 16; // Mar -> Falgun (approx)
            } else { // Apr-Dec
                nepaliMonth = month - 3;
                nepaliDay = day - 13;
            }
            
            const nepaliMonthName = nepaliMonths[nepaliMonth];
            const nepaliDayName = nepaliDays[today.getDay()];
            
            setCurrentDate(`${nepaliDayName}, ${nepaliMonthName} ${nepaliDay}, ${nepaliYear}`);
            
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
                    
                    {/* Current Date Container */}
                    <View style={styles.dateContainer}>
                        <ThemedText style={styles.dateText}>{currentDate}</ThemedText>
                        
                        <View style={styles.pickupStatusRow}>
                            <ThemedText style={styles.pickupText}>{pickupText}</ThemedText>
                            
                            <TouchableOpacity 
                                onPress={() => truckStatus === 'active' && router.push('/(dashboard)/map')}
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
                        <TouchableOpacity style={styles.reportButton}>
                            <ThemedText style={styles.reportButtonText}>Report Here →</ThemedText>
                        </TouchableOpacity>
                    </View>
                    
                    {/* Add more content here to test scrolling */}
                
                </ScrollView>
            </ThemedView>
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
    dateContainer: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        borderLeftWidth: 4,
        borderLeftColor: '#4CAF50',
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
        color: '#4CAF50',
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
    headerText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#333',
        textAlign: 'right',
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
        backgroundColor: '#4CAF50',
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
})