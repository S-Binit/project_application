import { StyleSheet, TouchableOpacity, View, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import Spacer from '../../components/Spacer';
import ThemedText from '../../components/ThemedText';
import ThemedView from '../../components/ThemedView';
import ThemedIonicons from '../../components/ThemedIonIcons';

const faqs = [
    {
        question: 'How do I check my pickup schedule?',
        answer: 'Open Schedule from your dashboard to see upcoming collection dates and route timings.',
    },
    {
        question: 'How can I pay my monthly bill?',
        answer: 'Go to Pay Bill in your dashboard, choose your payment method, and confirm the transaction.',
    },
    {
        question: 'Why am I not receiving notifications?',
        answer: 'Ensure notification permission is enabled on your device and check your internet connection.',
    },
    {
        question: 'How do I send feedback or complaints?',
        answer: 'Use the Feedback or Complaints page to submit your concern. Admin will review it promptly.',
    },
    {
        question: 'Can I update my account information?',
        answer: 'Basic account details are shown in My Information. Contact support for profile updates.',
    },
];

const FAQ = () => {
    const router = useRouter();

    return (
        <ThemedView style={styles.container} safe={true}>
            <View style={styles.header}>
                <ThemedText title={true} style={styles.heading}>
                    FAQ
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

                {faqs.map((item, index) => (
                    <View key={`${item.question}-${index}`} style={styles.faqCard}>
                        <View style={styles.questionRow}>
                            <Ionicons name="help-buoy-outline" size={18} color="#4f5f58" />
                            <ThemedText style={styles.question}>{item.question}</ThemedText>
                        </View>
                        <ThemedText style={styles.answer}>{item.answer}</ThemedText>
                    </View>
                ))}
            </ScrollView>
        </ThemedView>
    );
};

export default FAQ;

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
    faqCard: {
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
    questionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    question: {
        fontSize: 15,
        color: '#2c3330',
        fontWeight: '700',
        flex: 1,
    },
    answer: {
        fontSize: 14,
        lineHeight: 20,
        color: '#57655f',
    },
});
