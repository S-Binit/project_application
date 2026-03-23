import { StyleSheet, TouchableOpacity, View, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

import Spacer from '../../components/Spacer';
import ThemedText from '../../components/ThemedText';
import ThemedView from '../../components/ThemedView';
import ThemedIonicons from '../../components/ThemedIonIcons';
import { AUTH_URL } from '../../constants/API';

const ChangePassword = () => {
    const router = useRouter();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChangePassword = async () => {
        setError('');
        setSuccess('');

        if (!currentPassword || !newPassword || !confirmPassword) {
            setError('All fields are required.');
            return;
        }

        if (newPassword.length < 6) {
            setError('New password must be at least 6 characters.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('New password and confirm password do not match.');
            return;
        }

        if (currentPassword === newPassword) {
            setError('New password must be different from current password.');
            return;
        }

        try {
            setLoading(true);
            const token = await AsyncStorage.getItem('token');

            if (!token) {
                setError('You are not logged in. Please log in again.');
                return;
            }

            const response = await fetch(`${AUTH_URL}/change-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    currentPassword,
                    newPassword,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || 'Unable to change password.');
                return;
            }

            setSuccess('Password changed successfully.');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            setError('Cannot connect to server. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ThemedView style={styles.container} safe={true}>
            <View style={styles.header}>
                <ThemedText title={true} style={styles.heading}>
                    Change Password
                </ThemedText>

                <TouchableOpacity
                    onPress={() => router.back()}
                    style={styles.backButton}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <ThemedIonicons name="chevron-back" size={26} />
                </TouchableOpacity>
            </View>

            <Spacer height={16} />

            <View style={styles.formCard}>
                <ThemedText style={styles.label}>Current Password</ThemedText>
                <View style={styles.inputWrapper}>
                    <TextInput
                        style={styles.input}
                        value={currentPassword}
                        onChangeText={setCurrentPassword}
                        secureTextEntry={!showCurrent}
                        placeholder="Enter current password"
                        placeholderTextColor="#9aa8a2"
                    />
                    <Pressable onPress={() => setShowCurrent((v) => !v)}>
                        <Ionicons name={showCurrent ? 'eye-off-outline' : 'eye-outline'} size={20} color="#66756f" />
                    </Pressable>
                </View>

                <Spacer height={12} />

                <ThemedText style={styles.label}>New Password</ThemedText>
                <View style={styles.inputWrapper}>
                    <TextInput
                        style={styles.input}
                        value={newPassword}
                        onChangeText={setNewPassword}
                        secureTextEntry={!showNew}
                        placeholder="Enter new password"
                        placeholderTextColor="#9aa8a2"
                    />
                    <Pressable onPress={() => setShowNew((v) => !v)}>
                        <Ionicons name={showNew ? 'eye-off-outline' : 'eye-outline'} size={20} color="#66756f" />
                    </Pressable>
                </View>

                <Spacer height={12} />

                <ThemedText style={styles.label}>Confirm New Password</ThemedText>
                <View style={styles.inputWrapper}>
                    <TextInput
                        style={styles.input}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry={!showConfirm}
                        placeholder="Confirm new password"
                        placeholderTextColor="#9aa8a2"
                    />
                    <Pressable onPress={() => setShowConfirm((v) => !v)}>
                        <Ionicons name={showConfirm ? 'eye-off-outline' : 'eye-outline'} size={20} color="#66756f" />
                    </Pressable>
                </View>

                {error ? <ThemedText style={styles.errorText}>{error}</ThemedText> : null}
                {success ? <ThemedText style={styles.successText}>{success}</ThemedText> : null}

                <Spacer height={16} />

                <Pressable
                    style={({ pressed }) => [styles.submitButton, pressed && { opacity: 0.8 }, loading && styles.disabledButton]}
                    onPress={handleChangePassword}
                    disabled={loading}>
                    {loading ? (
                        <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                        <ThemedText style={styles.submitButtonText}>Update Password</ThemedText>
                    )}
                </Pressable>
            </View>
        </ThemedView>
    );
};

export default ChangePassword;

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
    formCard: {
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.08)',
        backgroundColor: '#ffffff',
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#5b6b64',
    },
    inputWrapper: {
        marginTop: 6,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.1)',
        borderRadius: 10,
        backgroundColor: '#f9fcfb',
        paddingHorizontal: 12,
        height: 48,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    input: {
        flex: 1,
        height: '100%',
        color: '#2c3330',
        fontSize: 14,
        paddingRight: 10,
    },
    submitButton: {
        height: 48,
        borderRadius: 10,
        backgroundColor: '#2f7f5f',
        alignItems: 'center',
        justifyContent: 'center',
    },
    submitButtonText: {
        color: '#ffffff',
        fontSize: 15,
        fontWeight: '700',
    },
    disabledButton: {
        backgroundColor: '#7ca391',
    },
    errorText: {
        marginTop: 12,
        color: '#c51610',
        fontSize: 13,
        fontWeight: '600',
    },
    successText: {
        marginTop: 12,
        color: '#2f7f5f',
        fontSize: 13,
        fontWeight: '600',
    },
});
