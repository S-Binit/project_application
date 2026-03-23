import { StyleSheet, TouchableOpacity, View, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import Spacer from '../../components/Spacer';
import ThemedText from '../../components/ThemedText';
import ThemedView from '../../components/ThemedView';
import ThemedIonicons from '../../components/ThemedIonIcons';

const sections = [
    {
        title: 'Who Can Apply',
        points: [
            'Must be at least 18 years old.',
            'Must have a valid government-issued ID.',
            'Must hold a valid driving license.',
            'Should be available for scheduled route timings.',
        ],
    },
    {
        title: 'Required Information',
        points: [
            'Full name and active contact number.',
            'Email address used for account access.',
            'License number and vehicle type details.',
            'Emergency contact information for safety.',
        ],
    },
    {
        title: 'How To Become A Driver',
        points: [
            'Step 1: Open the app and log in with your account.',
            'Step 2: Request driver onboarding through support/admin.',
            'Step 3: Submit required personal and license information.',
            'Step 4: Wait for admin review and verification.',
            'Step 5: Once approved, sign in from Driver Login.',
        ],
    },
    {
        title: 'Driver Responsibilities',
        points: [
            'Follow assigned schedules and mapped routes.',
            'Provide respectful and safe service during collection.',
            'Keep profile and vehicle information up to date.',
            'Report delays, incidents, or route issues immediately.',
        ],
    },
];

const DriverAccount = () => {
    const router = useRouter();

    return (
        <ThemedView style={styles.container} safe={true}>
            <View style={styles.header}>
                <ThemedText title={true} style={styles.heading}>
                    Driver Account
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

                {sections.map((section, index) => (
                    <View key={`${section.title}-${index}`} style={styles.card}>
                        <View style={styles.titleRow}>
                            <Ionicons name="car-sport-outline" size={18} color="#4f5f58" />
                            <ThemedText style={styles.sectionTitle}>{section.title}</ThemedText>
                        </View>

                        {section.points.map((point, itemIndex) => (
                            <View key={`${section.title}-point-${itemIndex}`} style={styles.pointRow}>
                                <View style={styles.dot} />
                                <ThemedText style={styles.pointText}>{point}</ThemedText>
                            </View>
                        ))}
                    </View>
                ))}
            </ScrollView>
        </ThemedView>
    );
};

export default DriverAccount;

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
    card: {
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
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 15,
        color: '#2c3330',
        fontWeight: '700',
        flex: 1,
    },
    pointRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 8,
        paddingRight: 4,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginTop: 7,
        marginRight: 10,
        backgroundColor: '#5f6f67',
    },
    pointText: {
        flex: 1,
        fontSize: 14,
        lineHeight: 20,
        color: '#57655f',
    },
});
