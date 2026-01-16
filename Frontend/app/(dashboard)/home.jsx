import {StyleSheet, TouchableOpacity, View, ScrollView, Platform, StatusBar, RefreshControl, Image, Modal, TextInput, Alert} from 'react-native'
import { Ionicons} from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Spacer from "../../components/Spacer"
import ThemedText from "../../components/ThemedText"
import ThemedView from "../../components/ThemedView"
import ThemedIonicons from '../../components/ThemedIonIcons';
import ThemedDashLogo from '../../components/ThemedDashLogo';
import { API_BASE } from '../../constants/API';

const Profile1 = () => {
    const router = useRouter();
    const [refreshing, setRefreshing] = useState(false);
    const [currentDate, setCurrentDate] = useState('');
    const [truckStatus, setTruckStatus] = useState('active'); // 'active' or 'inactive'
    const [pickupText, setPickupText] = useState('');
    const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
    const [feedbackType, setFeedbackType] = useState('complaint');
    const [feedbackSubject, setFeedbackSubject] = useState('');
    const [feedbackMessage, setFeedbackMessage] = useState('');
    const [feedbackRating, setFeedbackRating] = useState(5);
    const [submitting, setSubmitting] = useState(false);

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

    const handleSubmitFeedback = async () => {
        if (!feedbackSubject.trim() || !feedbackMessage.trim()) {
            Alert.alert('Validation Error', 'Please fill in subject and message');
            return;
        }

        setSubmitting(true);
        try {
            const token = await AsyncStorage.getItem('token');
            const response = await fetch(`${API_BASE}/feedback/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    type: feedbackType,
                    subject: feedbackSubject,
                    message: feedbackMessage,
                    rating: feedbackType === 'feedback' ? feedbackRating : null,
                }),
            });

            const data = await response.json();

            if (data.success) {
                Alert.alert('Success', 'Your feedback has been submitted!');
                setFeedbackModalVisible(false);
                setFeedbackSubject('');
                setFeedbackMessage('');
                setFeedbackRating(5);
            } else {
                Alert.alert('Error', data.message || 'Failed to submit feedback');
            }
        } catch (error) {
            console.error('Feedback submission error:', error);
            Alert.alert('Error', 'Cannot connect to server');
        } finally {
            setSubmitting(false);
        }
    };

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
                        <TouchableOpacity 
                            style={styles.reportButton}
                            onPress={() => setFeedbackModalVisible(true)}>
                            <ThemedText style={styles.reportButtonText}>Report Here →</ThemedText>
                        </TouchableOpacity>
                    </View>

                    {/* Square Button Below Report Container */}
                    <TouchableOpacity 
                        style={styles.squareButton}
                        onPress={() => router.push('/(innerdashboard)/myfeedback')}>
                        <ThemedIonicons name="document-text" size={32} style={styles.squareButtonIcon} />
                        <ThemedText style={styles.squareButtonText}>My Reports</ThemedText>
                    </TouchableOpacity>
                    
                    {/* Add more content here to test scrolling */}
                
                </ScrollView>
            </ThemedView>

            {/* Feedback Modal */}
            <Modal
                visible={feedbackModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setFeedbackModalVisible(false)}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <ThemedText style={styles.modalTitle}>
                                {feedbackType === 'complaint' ? 'Submit Complaint' : 'Submit Feedback'}
                            </ThemedText>
                            <TouchableOpacity 
                                onPress={() => setFeedbackModalVisible(false)}
                                hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                                <Ionicons name="close" size={28} color="#666" />
                            </TouchableOpacity>
                        </View>

                        {/* Type Selection */}
                        <View style={styles.typeSelectionContainer}>
                            <TouchableOpacity
                                style={[styles.typeButton, feedbackType === 'complaint' && styles.typeButtonActive]}
                                onPress={() => setFeedbackType('complaint')}>
                                <ThemedText style={[styles.typeButtonText, feedbackType === 'complaint' && styles.typeButtonTextActive]}>
                                    Complaint
                                </ThemedText>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.typeButton, feedbackType === 'feedback' && styles.typeButtonActive]}
                                onPress={() => setFeedbackType('feedback')}>
                                <ThemedText style={[styles.typeButtonText, feedbackType === 'feedback' && styles.typeButtonTextActive]}>
                                    Feedback
                                </ThemedText>
                            </TouchableOpacity>
                        </View>
                        

                        {/* Subject Input */}
                        <ThemedText style={styles.inputLabel}>Subject</ThemedText>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter subject"
                            placeholderTextColor="#999"
                            value={feedbackSubject}
                            onChangeText={setFeedbackSubject}
                            maxLength={100}
                        />

                        {/* Message Input */}
                        <ThemedText style={styles.inputLabel}>Message</ThemedText>
                        <TextInput
                            style={[styles.input, styles.messageInput]}
                            placeholder="Enter your message"
                            placeholderTextColor="#999"
                            value={feedbackMessage}
                            onChangeText={setFeedbackMessage}
                            multiline={true}
                            numberOfLines={5}
                            maxLength={500}
                        />

                        {/* Rating (only for feedback) */}
                        {feedbackType === 'feedback' && (
                            <View>
                                <ThemedText style={styles.inputLabel}>Rating</ThemedText>
                                <View style={styles.ratingContainer}>
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <TouchableOpacity
                                            key={star}
                                            onPress={() => setFeedbackRating(star)}
                                            style={styles.starButton}>
                                            <Ionicons
                                                name={star <= feedbackRating ? "star" : "star-outline"}
                                                size={32}
                                                color={star <= feedbackRating ? "#FFD700" : "#ccc"}
                                            />
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        )}

                        {/* Submit Button */}
                        <TouchableOpacity
                            style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                            onPress={handleSubmitFeedback}
                            disabled={submitting}>
                            <ThemedText style={styles.submitButtonText}>
                                {submitting
                                    ? 'Submitting...'
                                    : feedbackType === 'complaint'
                                    ? 'Submit Complaint'
                                    : 'Submit Feedback'}
                            </ThemedText>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
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
    squareButton: {
        width: 100,
        height: 100,
        backgroundColor: '#FFF',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
        flexDirection: 'column',
        gap: 8,
        borderWidth: 2,
        borderColor: '#4CAF50',
    },
    squareButtonIcon: {
        color: '#4CAF50',
    },
    squareButtonText: {
        color: '#4CAF50',
        fontSize: 12,
        fontWeight: '600',
        textAlign: 'center',
    },
    // Modal Styles
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingHorizontal: 20,
        paddingVertical: 20,
        paddingBottom: 40,
        maxHeight: '90%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
    },
    typeSelectionContainer: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 20,
    },
    typeButton: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#ddd',
        alignItems: 'center',
    },
    typeButtonActive: {
        backgroundColor: '#4CAF50',
        borderColor: '#4CAF50',
    },
    typeButtonText: {
        color: '#666',
        fontWeight: '600',
    },
    typeButtonTextActive: {
        color: '#fff',
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginTop: 15,
        marginBottom: 8,
        color: '#333',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
        backgroundColor: '#f9f9f9',
    },
    messageInput: {
        textAlignVertical: 'top',
        paddingVertical: 12,
        minHeight: 100,
    },
    ratingContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginVertical: 10,
    },
    starButton: {
        padding: 5,
    },
    submitButton: {
        backgroundColor: '#4CAF50',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    submitButtonDisabled: {
        opacity: 0.6,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
})