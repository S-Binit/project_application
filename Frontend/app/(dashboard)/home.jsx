import {StyleSheet, TouchableOpacity, View, ScrollView, Platform, StatusBar, RefreshControl, Image, Modal, TextInput, Alert} from 'react-native'
import { Ionicons} from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';

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
    const [feedbackSubject, setFeedbackSubject] = useState('');
    const [feedbackMessage, setFeedbackMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [missedModalVisible, setMissedModalVisible] = useState(false);
    const [missedMessage, setMissedMessage] = useState('');
    const [missedPhoto, setMissedPhoto] = useState(null);
    const [missedLocation, setMissedLocation] = useState(null);
    const [capturingLocation, setCapturingLocation] = useState(false);

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
                    type: 'complaint',
                    subject: feedbackSubject,
                    message: feedbackMessage,
                    rating: null,
                }),
            });

            const data = await response.json();

            if (data.success) {
                Alert.alert('Success', 'Your complaint has been submitted!');
                setFeedbackModalVisible(false);
                setFeedbackSubject('');
                setFeedbackMessage('');
            } else {
                Alert.alert('Error', data.message || 'Failed to submit complaint');
            }
        } catch (error) {
            console.error('Complaint submission error:', error);
            Alert.alert('Error', 'Cannot connect to server');
        } finally {
            setSubmitting(false);
        }
    };

    const handlePayBillPress = () => {
        router.push('/(dashboard)/paybill');
    };

    const fetchCurrentLocation = async () => {
        try {
            setCapturingLocation(true);
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Needed', 'Location permission is required to submit missed pickup with auto location.');
                return;
            }

            const current = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
            });

            setMissedLocation({
                latitude: current.coords.latitude,
                longitude: current.coords.longitude,
            });
        } catch (error) {
            Alert.alert('Location Error', 'Could not get your current location. Please try again.');
        } finally {
            setCapturingLocation(false);
        }
    };

    const handleOpenMissedModal = async () => {
        setMissedModalVisible(true);
        if (!missedLocation) {
            await fetchCurrentLocation();
        }
    };

    const pickMissedPhoto = async (source) => {
        try {
            if (source === 'camera') {
                const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
                if (cameraPermission.status !== 'granted') {
                    Alert.alert('Permission Needed', 'Camera permission is required.');
                    return;
                }
            } else {
                const mediaPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (mediaPermission.status !== 'granted') {
                    Alert.alert('Permission Needed', 'Gallery permission is required.');
                    return;
                }
            }

            const result = source === 'camera'
                ? await ImagePicker.launchCameraAsync({ quality: 0.7, allowsEditing: true })
                : await ImagePicker.launchImageLibraryAsync({ quality: 0.7, allowsEditing: true });

            if (!result.canceled && result.assets?.[0]?.uri) {
                setMissedPhoto(result.assets[0]);
            }
        } catch (_error) {
            Alert.alert('Image Error', 'Unable to select photo right now.');
        }
    };

    const handleSubmitMissedPickup = async () => {
        if (!missedPhoto?.uri) {
            Alert.alert('Validation Error', 'Please add a photo for missed pickup report.');
            return;
        }

        if (!missedLocation?.latitude || !missedLocation?.longitude) {
            Alert.alert('Validation Error', 'Auto location is required. Tap refresh location and try again.');
            return;
        }

        setSubmitting(true);
        try {
            const token = await AsyncStorage.getItem('token');
            const formData = new FormData();
            formData.append('type', 'complaint');
            formData.append('subject', 'Missed pickup in my area');
            formData.append('message', missedMessage.trim() || 'Driver missed pickup in my area.');
            formData.append('isMissedPickup', 'true');
            formData.append('complaintCategory', 'missed_pickup');
            formData.append('latitude', String(missedLocation.latitude));
            formData.append('longitude', String(missedLocation.longitude));

            const fileName = missedPhoto.fileName || `missed-pickup-${Date.now()}.jpg`;
            formData.append('photo', {
                uri: missedPhoto.uri,
                name: fileName,
                type: missedPhoto.mimeType || 'image/jpeg',
            });

            const response = await fetch(`${API_BASE}/feedback/submit`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });

            const data = await response.json();

            if (data.success) {
                Alert.alert('Submitted', 'Missed pickup report sent with high priority.');
                setMissedModalVisible(false);
                setMissedMessage('');
                setMissedPhoto(null);
                setMissedLocation(null);
            } else {
                Alert.alert('Error', data.message || 'Failed to submit missed pickup report.');
            }
        } catch (error) {
            console.error('Missed pickup submission error:', error);
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
                            </View>
                        </View>
                        <TouchableOpacity 
                            style={styles.reportButton}
                            onPress={() => setFeedbackModalVisible(true)}>
                            <ThemedText style={styles.reportButtonText}>Report Here →</ThemedText>
                        </TouchableOpacity>
                    </View>

                    {/* My Reports + Pay Bill Row */}
                    <View style={styles.actionRow}>
                        <TouchableOpacity
                            style={styles.squareButton}
                            onPress={handleOpenMissedModal}>
                            <ThemedIonicons name="alert-circle" size={32} style={[styles.squareButtonIcon, { color: '#ef6c00' }]} />
                            <ThemedText style={styles.squareButtonText}>Missed My Area</ThemedText>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={styles.squareButton}
                            onPress={() => router.push('/(innerdashboard)/myfeedback')}>
                            <ThemedIonicons name="document-text" size={32} style={styles.squareButtonIcon} />
                            <ThemedText style={styles.squareButtonText}>My Reports</ThemedText>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.squareButton}
                            onPress={handlePayBillPress}>
                            <ThemedIonicons name="card" size={32} style={styles.squareButtonIcon} />
                            <ThemedText style={styles.squareButtonText}>Pay Bill</ThemedText>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={styles.paymentReportBelowButton}
                        onPress={() => router.push('/(dashboard)/paymentreport')}>
                        <ThemedIonicons name="bar-chart" size={24} style={styles.paymentReportIcon} />
                        <ThemedText style={styles.paymentReportBelowText}>Payment Report</ThemedText>
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
                            <ThemedText style={styles.modalTitle}>Submit Complaint</ThemedText>
                            <TouchableOpacity 
                                onPress={() => setFeedbackModalVisible(false)}
                                hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                                <Ionicons name="close" size={28} color="#666" />
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

                        {/* Submit Button */}
                        <TouchableOpacity
                            style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                            onPress={handleSubmitFeedback}
                            disabled={submitting}>
                            <ThemedText style={styles.submitButtonText}>
                                {submitting ? 'Submitting...' : 'Submit Complaint'}
                            </ThemedText>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <Modal
                visible={missedModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setMissedModalVisible(false)}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <ThemedText style={styles.modalTitle}>Missed My Area</ThemedText>
                            <TouchableOpacity
                                onPress={() => setMissedModalVisible(false)}
                                hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                                <Ionicons name="close" size={28} color="#666" />
                            </TouchableOpacity>
                        </View>

                        <ThemedText style={styles.helperText}>Quick high-priority complaint with photo and auto location.</ThemedText>

                        <View style={styles.photoActionsRow}>
                            <TouchableOpacity style={styles.photoButton} onPress={() => pickMissedPhoto('camera')}>
                                <Ionicons name="camera" size={18} color="#fff" />
                                <ThemedText style={styles.photoButtonText}>Take Photo</ThemedText>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.photoButton} onPress={() => pickMissedPhoto('gallery')}>
                                <Ionicons name="images" size={18} color="#fff" />
                                <ThemedText style={styles.photoButtonText}>Choose Photo</ThemedText>
                            </TouchableOpacity>
                        </View>

                        {missedPhoto?.uri && (
                            <Image source={{ uri: missedPhoto.uri }} style={styles.previewImage} resizeMode="cover" />
                        )}

                        <View style={styles.locationRow}>
                            <View style={styles.locationTextWrap}>
                                <ThemedText style={styles.inputLabel}>Auto Location</ThemedText>
                                <ThemedText style={styles.locationValue}>
                                    {missedLocation
                                        ? `${missedLocation.latitude.toFixed(5)}, ${missedLocation.longitude.toFixed(5)}`
                                        : 'Not captured yet'}
                                </ThemedText>
                            </View>
                            <TouchableOpacity style={styles.refreshLocationBtn} onPress={fetchCurrentLocation} disabled={capturingLocation}>
                                <Ionicons name="refresh" size={18} color="#fff" />
                            </TouchableOpacity>
                        </View>

                        <ThemedText style={styles.inputLabel}>Message (Optional)</ThemedText>
                        <TextInput
                            style={[styles.input, styles.messageInput]}
                            placeholder="Add extra detail (house landmark, street, etc.)"
                            placeholderTextColor="#999"
                            value={missedMessage}
                            onChangeText={setMissedMessage}
                            multiline={true}
                            numberOfLines={4}
                            maxLength={500}
                        />

                        <TouchableOpacity
                            style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                            onPress={handleSubmitMissedPickup}
                            disabled={submitting || capturingLocation}>
                            <ThemedText style={styles.submitButtonText}>
                                {submitting ? 'Submitting...' : 'Submit Missed Pickup'}
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
        fontSize: 13,
        fontWeight: 'bold',
        color: '#4CAF50',
    },
    dateContainer: {
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
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        marginBottom: 12,
    },
    paymentReportBelowButton: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#4CAF50',
        height: 56,
        width: '100%',
        paddingHorizontal: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    paymentReportIcon: {
        color: '#4CAF50',
    },
    paymentReportBelowText: {
        color: '#4CAF50',
        fontSize: 15,
        fontWeight: '700',
    },
    helperText: {
        fontSize: 13,
        color: '#4d4d4d',
        marginBottom: 12,
    },
    photoActionsRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 10,
    },
    photoButton: {
        flex: 1,
        backgroundColor: '#2E7D32',
        borderRadius: 8,
        paddingVertical: 10,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 6,
    },
    photoButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
    previewImage: {
        width: '100%',
        height: 160,
        borderRadius: 10,
        marginBottom: 10,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
        backgroundColor: '#f6f8f6',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 8,
    },
    locationTextWrap: {
        flex: 1,
    },
    locationValue: {
        fontSize: 12,
        color: '#2d2d2d',
    },
    refreshLocationBtn: {
        backgroundColor: '#2E7D32',
        borderRadius: 20,
        width: 34,
        height: 34,
        justifyContent: 'center',
        alignItems: 'center',
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
