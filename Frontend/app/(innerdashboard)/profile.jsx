import {StyleSheet, View, TouchableOpacity, Pressable, ScrollView, Modal} from 'react-native'
import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Ionicons } from '@expo/vector-icons'

import Spacer from "../../components/Spacer"
import ThemedText from "../../components/ThemedText"
import ThemedView from "../../components/ThemedView"
import ThemedIonicons from '../../components/ThemedIonIcons'

const Profile1 = () => {
    const [name, setName] = useState('');
    const [theme, setTheme] = useState('System');
    const [themeModalVisible, setThemeModalVisible] = useState(false);
    const [logoutModalVisible, setLogoutModalVisible] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const loadName = async () => {
            try {
                const storedName = await AsyncStorage.getItem('userName');
                setName(storedName || '');
            } catch (err) {
                console.warn('Unable to load userName', err);
            }
        };

        loadName();
    }, []);

    return (
        <ThemedView style={styles.container} safe={true}>
            <ThemedView style={styles.header}>
                <ThemedText title={true} style={styles.heading}>
                    My Profile
                </ThemedText>

                <TouchableOpacity
                    onPress={()=>{
                        router.back();
                    }}
                    style={styles.backButton}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <ThemedIonicons name="chevron-back" size={26}/>
                </TouchableOpacity>

                <View style={styles.profileRow}>
                    <TouchableOpacity style={styles.avatarPlaceholder} activeOpacity={0.8}>
                        <ThemedText style={styles.avatarText}>+</ThemedText>
                    </TouchableOpacity>

                    <View style={styles.nameBlock}>
                        <ThemedText style={styles.nameValue}>
                            {name || 'User'}
                        </ThemedText>
                    </View>
                </View>
            </ThemedView>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                bounces={true}>

                <Spacer height={12} />

                <ThemedText style={styles.sectionTitle}>Basic Information</ThemedText>
                <Spacer height={12} />

                <View style={styles.actionsRow}>
                <Pressable style={({pressed}) => [styles.actionButton, pressed && {opacity: 0.6}]} onPress={() => {}}>
                    <Ionicons name="person-outline" size={20} color="#2c3330" style={styles.actionIcon} />
                    <ThemedText style={styles.actionText}>My Information</ThemedText>
                </Pressable>
                <Pressable
                    style={({pressed}) => [styles.actionButton, styles.actionButtonDanger, pressed && {backgroundColor: 'rgba(197, 22, 16, 0.15)'}]}
                    onPress={() => setLogoutModalVisible(true)}
                >
                    <Ionicons name="log-out-outline" size={20} color="#c51610" style={styles.actionIcon} />
                    <ThemedText style={[styles.actionText, styles.actionTextDanger]}>Logout</ThemedText>
                </Pressable>
            </View>

            <Spacer height={16} />

            <ThemedText style={styles.sectionTitle}>Settings</ThemedText>
            <Spacer height={12} />

            <View style={styles.actionsRow}>
                <Pressable style={({pressed}) => [styles.actionButton, pressed && {opacity: 0.6}]} onPress={() => {}}>
                    <Ionicons name="key-outline" size={20} color="#2c3330" style={styles.actionIcon} />
                    <ThemedText style={styles.actionText}>Change Password</ThemedText>
                </Pressable>
                <Pressable style={({pressed}) => [styles.actionButton, pressed && {opacity: 0.6}]} onPress={() => {}}>
                    <Ionicons name="shield-checkmark-outline" size={20} color="#2c3330" style={styles.actionIcon} />
                    <ThemedText style={styles.actionText}>Permissions</ThemedText>
                </Pressable>
                <Pressable style={({pressed}) => [styles.actionButton, pressed && {opacity: 0.6}]} onPress={() => setThemeModalVisible(true)}>
                    <Ionicons name="color-palette-outline" size={20} color="#2c3330" style={styles.actionIcon} />
                    <ThemedText style={styles.actionText}>Themes</ThemedText>
                    <View style={styles.pickerContainer}>
                        <ThemedText style={styles.selectedThemeText}>{theme}</ThemedText>
                        <Ionicons name="chevron-down" size={18} color="#6b7a73" />
                    </View>
                </Pressable>
            </View>

            <Spacer height={16} />

            <ThemedText style={styles.sectionTitle}>Help & Legal</ThemedText>
            <Spacer height={12} />

            <View style={styles.actionsRow}>
                <Pressable style={({pressed}) => [styles.actionButton, pressed && {opacity: 0.6}]} onPress={() => {}}>
                    <Ionicons name="help-circle-outline" size={20} color="#2c3330" style={styles.actionIcon} />
                    <ThemedText style={styles.actionText}>FAQ</ThemedText>
                </Pressable>
                <Pressable style={({pressed}) => [styles.actionButton, pressed && {opacity: 0.6}]} onPress={() => {}}>
                    <Ionicons name="document-text-outline" size={20} color="#2c3330" style={styles.actionIcon} />
                    <ThemedText style={styles.actionText}>Policies</ThemedText>
                </Pressable>
            </View>

            <Spacer height={16} />

            <ThemedText style={styles.sectionTitle}>More</ThemedText>
            <Spacer height={12} />

            <View style={styles.actionsRow}>
                <Pressable style={({pressed}) => [styles.actionButton, pressed && {opacity: 0.6}]} onPress={() => {}}>
                    <Ionicons name="car-outline" size={20} color="#2c3330" style={styles.actionIcon} />
                    <ThemedText style={styles.actionText}>Driver Account</ThemedText>
                </Pressable>
                <Pressable style={({pressed}) => [styles.actionButton, styles.actionButtonDanger, pressed && {backgroundColor: 'rgba(197, 22, 16, 0.15)'}]} onPress={() => setDeleteModalVisible(true)}>
                    <Ionicons name="trash-outline" size={20} color="#c51610" style={styles.actionIcon} />
                    <ThemedText style={[styles.actionText, styles.actionTextDanger]}>Delete Account</ThemedText>
                </Pressable>
            </View>

            {/* Add profile content below */}
            </ScrollView>

            {/* Theme Selection Modal */}
            <Modal
                visible={themeModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setThemeModalVisible(false)}>
                <Pressable 
                    style={styles.modalOverlay}
                    onPress={() => setThemeModalVisible(false)}>
                    <View style={styles.modalContent}>
                        <ThemedText style={styles.modalTitle}>Select Theme</ThemedText>
                        
                        <Pressable 
                            style={({pressed}) => [styles.themeOption, theme === 'Light' && styles.themeOptionSelected, pressed && {opacity: 0.6}]}
                            onPress={() => {
                                setTheme('Light');
                                setThemeModalVisible(false);
                            }}>
                            <ThemedText style={[styles.themeOptionText, theme === 'Light' && styles.themeOptionTextSelected]}>
                                Light
                            </ThemedText>
                            {theme === 'Light' && <Ionicons name="checkmark" size={20} color="#4CAF50" />}
                        </Pressable>

                        <Pressable 
                            style={({pressed}) => [styles.themeOption, theme === 'Dark' && styles.themeOptionSelected, pressed && {opacity: 0.6}]}
                            onPress={() => {
                                setTheme('Dark');
                                setThemeModalVisible(false);
                            }}>
                            <ThemedText style={[styles.themeOptionText, theme === 'Dark' && styles.themeOptionTextSelected]}>
                                Dark
                            </ThemedText>
                            {theme === 'Dark' && <Ionicons name="checkmark" size={20} color="#4CAF50" />}
                        </Pressable>

                        <Pressable 
                            style={({pressed}) => [styles.themeOption, theme === 'System' && styles.themeOptionSelected, pressed && {opacity: 0.6}]}
                            onPress={() => {
                                setTheme('System');
                                setThemeModalVisible(false);
                            }}>
                            <ThemedText style={[styles.themeOptionText, theme === 'System' && styles.themeOptionTextSelected]}>
                                System
                            </ThemedText>
                            {theme === 'System' && <Ionicons name="checkmark" size={20} color="#4CAF50" />}
                        </Pressable>
                    </View>
                </Pressable>
            </Modal>

            {/* Logout Confirmation Modal */}
            <Modal
                visible={logoutModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setLogoutModalVisible(false)}>
                <Pressable 
                    style={styles.modalOverlay}
                    onPress={() => setLogoutModalVisible(false)}>
                    <View style={styles.modalContent}>
                        <Ionicons name="log-out-outline" size={48} color="#c51610" style={{alignSelf: 'center', marginBottom: 12}} />
                        <ThemedText style={styles.modalTitle}>Logout</ThemedText>
                        <ThemedText style={styles.modalMessage}>Are you sure you want to logout?</ThemedText>
                        
                        <View style={styles.modalActions}>
                            <Pressable 
                                style={({pressed}) => [styles.modalButton, styles.modalButtonCancel, pressed && {opacity: 0.6}]}
                                onPress={() => setLogoutModalVisible(false)}>
                                <ThemedText style={styles.modalButtonText}>Cancel</ThemedText>
                            </Pressable>

                            <Pressable 
                                style={({pressed}) => [styles.modalButton, styles.modalButtonConfirm, pressed && {backgroundColor: 'rgba(197, 22, 16, 0.85)'}]}
                                onPress={async () => {
                                    try {
                                        await AsyncStorage.multiRemove(['token','userRole','userId','userName']);
                                    } catch {}
                                    setLogoutModalVisible(false);
                                    router.dismissAll();
                                    router.replace('/');
                                }}>
                                <ThemedText style={styles.modalButtonTextConfirm}>Logout</ThemedText>
                            </Pressable>
                        </View>
                    </View>
                </Pressable>
            </Modal>

            {/* Delete Account Confirmation Modal */}
            <Modal
                visible={deleteModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setDeleteModalVisible(false)}>
                <Pressable 
                    style={styles.modalOverlay}
                    onPress={() => setDeleteModalVisible(false)}>
                    <View style={styles.modalContent}>
                        <Ionicons name="trash-outline" size={48} color="#c51610" style={{alignSelf: 'center', marginBottom: 12}} />
                        <ThemedText style={styles.modalTitle}>Delete Account</ThemedText>
                        <ThemedText style={styles.modalMessage}>Are you sure you want to delete your account? This action cannot be undone.</ThemedText>
                        
                        <View style={styles.modalActions}>
                            <Pressable 
                                style={({pressed}) => [styles.modalButton, styles.modalButtonCancel, pressed && {opacity: 0.6}]}
                                onPress={() => setDeleteModalVisible(false)}>
                                <ThemedText style={styles.modalButtonText}>Cancel</ThemedText>
                            </Pressable>

                            <Pressable 
                                style={({pressed}) => [styles.modalButton, styles.modalButtonConfirm, pressed && {backgroundColor: 'rgba(197, 22, 16, 0.85)'}]}
                                onPress={async () => {
                                    try {
                                        await AsyncStorage.multiRemove(['token','userRole','userId','userName']);
                                    } catch {}
                                    setDeleteModalVisible(false);
                                    router.dismissAll();
                                    router.replace('/');
                                }}>
                                <ThemedText style={styles.modalButtonTextConfirm}>Delete</ThemedText>
                            </Pressable>
                        </View>
                    </View>
                </Pressable>
            </Modal>
        </ThemedView>
    )
}

export default Profile1
const styles = StyleSheet.create({
    container:{
        flex: 1,
        backgroundColor: '#f0f7f5ff',
    },
    header:{
        paddingTop: 6,
        paddingHorizontal: 20,
        paddingBottom: 10,
        borderBottomColor: 'rgba(0,0,0,0.08)',
        borderBottomWidth: 1,
        backgroundColor: '#f0f7f5ff',
    },
    heading:{
        fontWeight: "bold",
        fontSize: 22,
        textAlign: "center",
    },
    profileRow:{
        marginTop: 14,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
    },
    avatarPlaceholder:{
        width: 125,
        height: 125,
        borderRadius: 62.5,
        backgroundColor: '#dfe9e5',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.08)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText:{
        fontSize: 32,
        fontWeight: 'bold',
        color: '#5a6b64',
    },
    nameBlock:{
        flex: 1,
        justifyContent: 'center',
    },
    nameValue:{
        fontSize: 26,
        fontWeight: '600',
        color: '#2c3330',
        paddingVertical: 4,
        paddingBottom: 50,
    },
    actionsRow:{
        marginTop: 0,
        paddingHorizontal: 22,
        flexDirection: 'column',
        gap: 12,
    },
    actionButton:{
        width: '100%',
        height: 52,
        borderRadius: 12,
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.08)',
        justifyContent: 'flex-start',
        alignItems: 'center',
        flexDirection: 'row',
        paddingHorizontal: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    actionButtonDanger:{
        borderColor: '#c51610',
    },
    actionText:{
        fontSize: 16,
        fontWeight: '600',
        color: '#2c3330',
    },
    actionTextDanger:{
        color: '#c51610',
    },
    actionIcon:{
        marginRight: 8,
    },
    sectionTitle:{
        fontSize: 14,
        fontWeight: '600',
        color: '#6b7a73',
        paddingHorizontal: 22,
        marginBottom: 4,
    },
    backButton:{
        padding: 6,
        borderRadius: 20,
        backgroundColor: 'transparent',
        height: 40,
        width: 60,
        justifyContent: 'center',
        alignItems: 'center',
        alignContent: 'center',
        marginTop: -32,
    },
    scrollView: {
        flex: 1,
        backgroundColor: '#f0f7f5ff',
    },
    scrollContent: {
        paddingBottom: 40,
    },
    pickerContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 8,
    },
    selectedThemeText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#6b7a73',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 20,
        width: '80%',
        maxWidth: 300,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2c3330',
        marginBottom: 16,
        textAlign: 'center',
    },
    themeOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 10,
        marginBottom: 8,
        backgroundColor: '#f5f5f5',
    },
    themeOptionSelected: {
        backgroundColor: '#e8f5e9',
        borderWidth: 1,
        borderColor: '#4CAF50',
    },
    themeOptionText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#2c3330',
    },
    themeOptionTextSelected: {
        color: '#4CAF50',
        fontWeight: '600',
    },
    modalMessage: {
        fontSize: 14,
        color: '#6b7a73',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 20,
    },
    modalActions: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    modalButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalButtonCancel: {
        backgroundColor: '#e8e8e8',
    },
    modalButtonConfirm: {
        backgroundColor: '#c51610',
    },
    modalButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#2c3330',
    },
    modalButtonTextConfirm: {
        fontSize: 15,
        fontWeight: '600',
        color: '#ffffff',
    },
})
