import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

import Spacer from '../../components/Spacer';
import ThemedText from '../../components/ThemedText';
import ThemedView from '../../components/ThemedView';
import ThemedIonicons from '../../components/ThemedIonIcons';

const MyInformation = () => {
    const router = useRouter();
    const [info, setInfo] = useState({
        name: '',
        email: '',
        role: '',
        id: '',
    });

    useEffect(() => {
        const loadUserInfo = async () => {
            try {
                const values = await AsyncStorage.multiGet(['userName', 'userEmail', 'userRole', 'userId']);
                const data = Object.fromEntries(values);

                setInfo({
                    name: data.userName || '',
                    email: data.userEmail || '',
                    role: data.userRole || '',
                    id: data.userId || '',
                });
            } catch (err) {
                console.warn('Unable to load user information', err);
            }
        };

        loadUserInfo();
    }, []);

    const rows = [
        { label: 'Full Name', value: info.name || 'Not available', icon: 'person-outline' },
        { label: 'Email', value: info.email || 'Not available', icon: 'mail-outline' },
        { label: 'Role', value: info.role || 'Not available', icon: 'shield-checkmark-outline' },
        { label: 'User ID', value: info.id || 'Not available', icon: 'finger-print-outline' },
    ];

    return (
        <ThemedView style={styles.container} safe={true}>
            <View style={styles.header}>
                <ThemedText title={true} style={styles.heading}>
                    My Information
                </ThemedText>

                <TouchableOpacity
                    onPress={() => router.back()}
                    style={styles.backButton}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <ThemedIonicons name="chevron-back" size={26} />
                </TouchableOpacity>
            </View>

            <View style={styles.divider} />

            <Spacer height={18} />

            <View style={styles.listWrap}>
                {rows.map((row) => (
                    <View key={row.label} style={styles.infoCard}>
                        <View style={styles.labelRow}>
                            <Ionicons name={row.icon} size={18} color="#4f5f58" />
                            <ThemedText style={styles.label}>{row.label}</ThemedText>
                        </View>
                        <ThemedText style={styles.value}>{row.value}</ThemedText>
                    </View>
                ))}
            </View>
        </ThemedView>
    );
};

export default MyInformation;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f7f5ff',
        paddingHorizontal: 20,
    },
    header: {
        paddingTop: 8,
        paddingBottom: 6,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(0,0,0,0.08)',
        marginVertical: 10,
    },
    heading: {
        fontWeight: 'bold',
        fontSize: 22,
        textAlign: 'center',
    },
    backButton: {
        padding: 6,
        borderRadius: 20,
        backgroundColor: 'transparent',
        height: 40,
        width: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: -32,
    },
    listWrap: {
        gap: 12,
    },
    infoCard: {
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.08)',
        backgroundColor: '#ffffff',
        paddingVertical: 14,
        paddingHorizontal: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    label: {
        fontSize: 13,
        color: '#6b7a73',
        fontWeight: '600',
    },
    value: {
        fontSize: 17,
        color: '#2c3330',
        fontWeight: '600',
    },
});
