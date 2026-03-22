import { useEffect, useState, useCallback } from 'react'
import { StyleSheet, View, TouchableOpacity, FlatList, RefreshControl, ActivityIndicator, Platform, StatusBar } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useRouter } from 'expo-router'

import ThemedText from '../../components/ThemedText'
import ThemedViewAdmin from '../../components/ThemedViewAdmin'
import { API_BASE } from '../../constants/API'

const PaymentUsers = () => {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [payments, setPayments] = useState([])
  const [summary, setSummary] = useState({
    totalPayments: 0,
    totalPaidUsers: 0,
    totalAmountCollected: 0,
  })

  const fetchPaidUsers = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }

    try {
      const token = await AsyncStorage.getItem('token')
      const response = await fetch(`${API_BASE}/payment/admin/paid-users`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      const contentType = response.headers.get('content-type') || ''
      const rawBody = await response.text()
      let data = null

      if (rawBody) {
        try {
          data = JSON.parse(rawBody)
        } catch (_parseError) {
          data = null
        }
      }

      if (!contentType.includes('application/json') && rawBody.trim().startsWith('<')) {
        throw new Error('Server returned HTML instead of JSON. Check API_URL and backend status.')
      }

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || `Failed to fetch paid users (${response.status})`)
      }

      setPayments(Array.isArray(data.payments) ? data.payments : [])
      setSummary({
        totalPayments: Number(data.totalPayments || 0),
        totalPaidUsers: Number(data.totalPaidUsers || 0),
        totalAmountCollected: Number(data.totalAmountCollected || 0),
      })
      setErrorMessage('')
    } catch (error) {
      console.error('Fetch admin paid users error:', error.message)
      setErrorMessage(error.message || 'Unable to load paid users report')
      setPayments([])
      setSummary({ totalPayments: 0, totalPaidUsers: 0, totalAmountCollected: 0 })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchPaidUsers(false)
  }, [fetchPaidUsers])

  const onRefresh = useCallback(() => {
    fetchPaidUsers(true)
  }, [fetchPaidUsers])

  const formatDate = (value) => {
    if (!value) return '-'
    return new Date(value).toLocaleString()
  }

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <ThemedText style={styles.userName}>{item.userName}</ThemedText>
        <View style={styles.providerBadge}>
          <ThemedText style={styles.providerText}>{String(item.provider || '').toUpperCase()}</ThemedText>
        </View>
      </View>

      <ThemedText style={styles.userEmail}>{item.userEmail}</ThemedText>
      <View style={styles.metaRow}>
        <ThemedText style={styles.metaLabel}>Bill Month:</ThemedText>
        <ThemedText style={styles.metaValue}>{item.billMonth}</ThemedText>
      </View>
      <View style={styles.metaRow}>
        <ThemedText style={styles.metaLabel}>Amount:</ThemedText>
        <ThemedText style={styles.amount}>Rs. {item.amount}</ThemedText>
      </View>
      <View style={styles.metaRow}>
        <ThemedText style={styles.metaLabel}>Paid At:</ThemedText>
        <ThemedText style={styles.metaValue}>{formatDate(item.paidAt)}</ThemedText>
      </View>
      <View style={styles.metaRow}>
        <ThemedText style={styles.metaLabel}>Txn ID:</ThemedText>
        <ThemedText style={styles.txnValue}>{item.transactionId}</ThemedText>
      </View>
    </View>
  )

  return (
    <ThemedViewAdmin style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/(admin)/payments')}>
          <Ionicons name="arrow-back" size={26} color="#333" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Paid Users</ThemedText>
        <View style={{ width: 26 }} />
      </View>

      {errorMessage ? (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle-outline" size={16} color="#b91c1c" />
          <ThemedText style={styles.errorText}>{errorMessage}</ThemedText>
        </View>
      ) : null}

      <View style={styles.summaryWrap}>
        <View style={styles.summaryCard}>
          <ThemedText style={styles.summaryLabel}>Paid Users</ThemedText>
          <ThemedText style={styles.summaryValue}>{summary.totalPaidUsers}</ThemedText>
        </View>
        <View style={styles.summaryCard}>
          <ThemedText style={styles.summaryLabel}>Payments</ThemedText>
          <ThemedText style={styles.summaryValue}>{summary.totalPayments}</ThemedText>
        </View>
        <View style={styles.summaryCard}>
          <ThemedText style={styles.summaryLabel}>Collected</ThemedText>
          <ThemedText style={styles.summaryValue}>Rs. {summary.totalAmountCollected}</ThemedText>
        </View>
      </View>

      {loading ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color="#0288d1" />
          <ThemedText style={styles.loaderText}>Loading paid users...</ThemedText>
        </View>
      ) : (
        <FlatList
          data={payments}
          keyExtractor={(item, index) => item.paymentId || String(index)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#0288d1"
              colors={['#0288d1']}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Ionicons name="receipt-outline" size={34} color="#90a4ae" />
              <ThemedText style={styles.emptyText}>No successful payments found yet.</ThemedText>
            </View>
          }
        />
      )}
    </ThemedViewAdmin>
  )
}

export default PaymentUsers

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 12,
   paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 10 : 25,
    backgroundColor: '#fff',
    borderBottomWidth: 0.5,
    borderBottomColor: '#dce3ea',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  summaryWrap: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  errorBanner: {
    marginHorizontal: 12,
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#fecaca',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  errorText: {
    flex: 1,
    fontSize: 12,
    color: '#991b1b',
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#e1f5fe',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#0288d1',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#546e7a',
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#01579b',
    marginTop: 4,
  },
  listContent: {
    paddingHorizontal: 12,
    paddingBottom: 18,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 12,
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  providerBadge: {
    backgroundColor: '#dbeafe',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  providerText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1d4ed8',
  },
  userEmail: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 6,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
    gap: 8,
  },
  metaLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  metaValue: {
    fontSize: 12,
    color: '#111827',
    flex: 1,
    textAlign: 'right',
  },
  amount: {
    fontSize: 13,
    fontWeight: '700',
    color: '#047857',
  },
  txnValue: {
    fontSize: 11,
    color: '#374151',
    flex: 1,
    textAlign: 'right',
  },
  loaderWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  loaderText: {
    fontSize: 13,
    color: '#607d8b',
  },
  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  emptyText: {
    fontSize: 13,
    color: '#78909c',
  },
})
