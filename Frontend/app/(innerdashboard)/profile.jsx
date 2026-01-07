import {StyleSheet, View, TouchableOpacity, Pressable} from 'react-native'
import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Ionicons } from '@expo/vector-icons'

import Spacer from "../../components/Spacer"
import ThemedText from "../../components/ThemedText"
import ThemedView from "../../components/ThemedView"

const Profile1 = () => {
    const [name, setName] = useState('');
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

            <Spacer height={12} />

            <ThemedText style={styles.sectionTitle}>Basic Information</ThemedText>
            <Spacer height={12} />

            <View style={styles.actionsRow}>
                <Pressable style={styles.actionButton} onPress={() => {}}>
                    <Ionicons name="person-outline" size={20} color="#2c3330" style={styles.actionIcon} />
                    <ThemedText style={styles.actionText}>My Information</ThemedText>
                </Pressable>
                <Pressable
                    style={[styles.actionButton, styles.actionButtonDanger]}
                    onPress={async () => {
                        try {
                            await AsyncStorage.multiRemove(['token','userRole','userId','userName']);
                        } catch {}
                        router.dismissAll();
                        router.replace('/');
                    }}
                >
                    <Ionicons name="log-out-outline" size={20} color="#c51610" style={styles.actionIcon} />
                    <ThemedText style={[styles.actionText, styles.actionTextDanger]}>Logout</ThemedText>
                </Pressable>
            </View>

            <Spacer height={16} />

            <ThemedText style={styles.sectionTitle}>Settings</ThemedText>
            <Spacer height={12} />

            <View style={styles.actionsRow}>
                <Pressable style={styles.actionButton} onPress={() => {}}>
                    <Ionicons name="key-outline" size={20} color="#2c3330" style={styles.actionIcon} />
                    <ThemedText style={styles.actionText}>Change Password</ThemedText>
                </Pressable>
            </View>

            {/* Add profile content below */}
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
})