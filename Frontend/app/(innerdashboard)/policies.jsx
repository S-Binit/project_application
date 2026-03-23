import { StyleSheet, TouchableOpacity, View, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import Spacer from '../../components/Spacer';
import ThemedText from '../../components/ThemedText';
import ThemedView from '../../components/ThemedView';
import ThemedIonicons from '../../components/ThemedIonIcons';

const policies = [
    {
        title: 'Data Privacy',
        detail: 'Your account information is used only for service operations such as billing, scheduling, and notifications.',
    },
    {
        title: 'Payment Policy',
        detail: 'Monthly payments should be completed on time. Failed or cancelled payments may require you to retry the transaction.',
    },
    {
        title: 'Service Usage',
        detail: 'Users must provide accurate profile and location details to ensure proper waste collection service delivery.',
    },
    {
        title: 'Feedback and Complaints',
        detail: 'All submitted feedback and complaints are reviewed by the admin team and used to improve service quality.',
    },
    {
        title: 'Account Security',
        detail: 'Keep your login credentials private. You are responsible for actions performed through your account.',
    },
];

const Policies = () => {
    const router = useRouter();

    return (
        <ThemedView style={styles.container} safe={true}>
            <View style={styles.header}>
                <ThemedText title={true} style={styles.heading}>
                    Policies
                </ThemedText>

                <TouchableOpacity
                    onPress={() => router.back()}
                    style={styles.backButton}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <ThemedIonicons name="chevron-back" size={26} />
                </TouchableOpacity>
            </View>

            <View style={styles.divider} />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}>
                <Spacer height={12} />

                {policies.map((item, index) => (
                    <View key={`${item.title}-${index}`} style={styles.policyCard}>
                        <View style={styles.titleRow}>
                            <Ionicons name="shield-checkmark-outline" size={18} color="#4f5f58" />
                            <ThemedText style={styles.title}>{item.title}</ThemedText>
                        </View>
                        <ThemedText style={styles.detail}>{item.detail}</ThemedText>
                    </View>
                ))}
            </ScrollView>
        </ThemedView>
    );
};

export default Policies;

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
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 30,
        gap: 12,
    },
    policyCard: {
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
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    title: {
        fontSize: 15,
        color: '#2c3330',
        fontWeight: '700',
        flex: 1,
    },
    detail: {
        fontSize: 14,
        lineHeight: 20,
        color: '#57655f',
    },
});
