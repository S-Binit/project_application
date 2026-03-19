import { StyleSheet, View, ScrollView, TouchableOpacity, FlatList, Platform, StatusBar, RefreshControl } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useCallback, useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

import ThemedText from "../../components/ThemedText"
import ThemedView from "../../components/ThemedView"
import ThemedIonicons from '../../components/ThemedIonIcons'
import { API_BASE } from '../../constants/API'

const PaymentReport = () => {
    const router = useRouter()
    const [paymentHistory, setPaymentHistory] = useState([])
    const [totalPaid, setTotalPaid] = useState(0)
    const [paymentCount, setPaymentCount] = useState(0)
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)

    useEffect(() => {
        fetchPaymentHistory()
    }, [])

    const fetchPaymentHistory = async () => {
        try {
            setLoading(true)
            const token = await AsyncStorage.getItem('token')
            const response = await fetch(`${API_BASE}/payment/history`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })
            const data = await response.json()
            if (data.success) {
                setPaymentHistory(data.payments || [])
                setTotalPaid(data.totalPaid || 0)
                setPaymentCount(data.paymentCount || 0)
            }
        } catch (error) {
            console.error('Failed to fetch payment history:', error)
        } finally {
            setLoading(false)
        }
    }

    const onRefresh = useCallback(() => {
        setRefreshing(true)
        fetchPaymentHistory().finally(() => setRefreshing(false))
    }, [])

    const renderPaymentItem = ({ item, index }) => (
        <View style={styles.paymentCard}>
            <View style={styles.cardHeader}>
                <View style={styles.cardLeft}>
                    <ThemedIonicons name="checkmark-circle" size={28} style={styles.successIcon} />
                    <View style={styles.cardInfo}>
                        <ThemedText style={styles.monthText}>{item.billMonth}</ThemedText>
                        <ThemedText style={styles.dateText}>
                            {new Date(item.date).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric' 
                            })}
                        </ThemedText>
                    </View>
                </View>
                <ThemedText style={styles.amountText}>Rs. {item.amount}</ThemedText>
            </View>

            <View style={styles.cardBody}>
                <View style={styles.detailRow}>
                    <ThemedText style={styles.detailLabel}>Transaction ID:</ThemedText>
                    <ThemedText style={styles.detailValue}>{item.transactionId.substring(0, 20)}...</ThemedText>
                </View>
                <View style={styles.detailRow}>
                    <ThemedText style={styles.detailLabel}>Provider:</ThemedText>
                    <View style={[styles.providerBadge, item.provider === 'esewa' ? styles.esewaProvider : styles.khaltiProvider]}>
                        <ThemedText style={styles.providerText}>
                            {item.provider.toUpperCase()}
                        </ThemedText>
                    </View>
                </View>
            </View>
        </View>
    )

    return (
        <ThemedView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity 
                    onPress={() => router.back()}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Ionicons name="arrow-back" size={26} color="#333" />
                </TouchableOpacity>
                <ThemedText style={styles.headerTitle}>Payment Report</ThemedText>
                <View style={{ width: 26 }} />
            </View>

            {/* Summary Cards */}
            <ScrollView 
                style={styles.scrollView}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#4CAF50"
                        colors={["#4CAF50"]}
                    />
                }
                showsVerticalScrollIndicator={false}>
                
                <View style={styles.summarySection}>
                    <View style={styles.summaryCard}>
                        <View style={styles.summaryCardContent}>
                            <ThemedIonicons name="wallet" size={32} style={styles.summaryIcon} />
                            <View style={styles.summaryText}>
                                <ThemedText style={styles.summaryLabel}>Total Paid</ThemedText>
                                <ThemedText style={styles.summaryValue}>Rs. {totalPaid}</ThemedText>
                            </View>
                        </View>
                    </View>

                    <View style={styles.summaryCard}>
                        <View style={styles.summaryCardContent}>
                            <ThemedIonicons name="receipt" size={32} style={styles.summaryIcon} />
                            <View style={styles.summaryText}>
                                <ThemedText style={styles.summaryLabel}>Transactions</ThemedText>
                                <ThemedText style={styles.summaryValue}>{paymentCount}</ThemedText>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Payment History */}
                <View style={styles.historySection}>
                    <ThemedText style={styles.historyTitle}>Payment History</ThemedText>
                    
                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ThemedText style={styles.loadingText}>Loading...</ThemedText>
                        </View>
                    ) : paymentHistory.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="wallet-outline" size={48} color="#ccc" />
                            <ThemedText style={styles.emptyText}>No payments yet</ThemedText>
                        </View>
                    ) : (
                        <FlatList
                            data={paymentHistory}
                            renderItem={renderPaymentItem}
                            keyExtractor={(item, index) => item.id || index.toString()}
                            scrollEnabled={false}
                            contentContainerStyle={styles.listContent}
                        />
                    )}
                </View>
            </ScrollView>
        </ThemedView>
    )
}

export default PaymentReport

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fafafa',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingVertical: 12,
        paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 12) : 12,
        backgroundColor: '#fff',
        borderBottomWidth: 0.5,
        borderBottomColor: '#e0e0e0',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    scrollView: {
        flex: 1,
    },
    summarySection: {
        flexDirection: 'row',
        paddingHorizontal: 15,
        paddingVertical: 15,
        gap: 12,
    },
    summaryCard: {
        flex: 1,
        backgroundColor: '#e8f5e9',
        borderRadius: 12,
        padding: 16,
        borderLeftWidth: 4,
        borderLeftColor: '#4CAF50',
    },
    summaryCardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    summaryIcon: {
        color: '#4CAF50',
    },
    summaryText: {
        flex: 1,
    },
    summaryLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
    },
    summaryValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2e7d32',
    },
    historySection: {
        paddingHorizontal: 15,
        paddingVertical: 10,
        flex: 1,
    },
    historyTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
    },
    listContent: {
        paddingBottom: 20,
    },
    paymentCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottomMargin: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    cardLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 12,
    },
    successIcon: {
        color: '#4CAF50',
    },
    cardInfo: {
        flex: 1,
    },
    monthText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    dateText: {
        fontSize: 12,
        color: '#999',
        marginTop: 2,
    },
    amountText: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#4CAF50',
    },
    cardBody: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fafafa',
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    detailLabel: {
        fontSize: 12,
        color: '#666',
        fontWeight: '500',
    },
    detailValue: {
        fontSize: 12,
        color: '#333',
        fontWeight: '600',
        flex: 1,
        textAlign: 'right',
    },
    providerBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
    },
    esewaProvider: {
        backgroundColor: '#c8e6c9',
    },
    khaltiProvider: {
        backgroundColor: '#bbdefb',
    },
    providerText: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#333',
    },
    loadingContainer: {
        paddingVertical: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 14,
        color: '#999',
    },
    emptyContainer: {
        paddingVertical: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 14,
        color: '#999',
        marginTop: 12,
    },
})
