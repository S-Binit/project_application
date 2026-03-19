import React, { useState } from 'react'
import { StyleSheet, View, TouchableOpacity, Alert, Linking, StatusBar, Platform, ActivityIndicator, RefreshControl, ScrollView } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useEffect, useCallback } from 'react'

import ThemedText from '../../components/ThemedText'
import { API_BASE } from '../../constants/API'

const PayBill = () => {
  const router = useRouter()
  const [paying, setPaying] = useState(false)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [bill, setBill] = useState(null)
  const [latestPayment, setLatestPayment] = useState(null)

  const loadBill = useCallback(async (showRefresh = false) => {
    if (showRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }

    try {
      const token = await AsyncStorage.getItem('token')
      const response = await fetch(`${API_BASE}/payment/my-bill`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()
      if (!response.ok || !data?.success || !data?.bill) {
        Alert.alert('Error', data?.message || 'Failed to load bill details.')
        return
      }

      setBill(data.bill)
      setLatestPayment(data.latestPayment || null)
    } catch (error) {
      console.error('Load bill error:', error)
      Alert.alert('Error', 'Cannot connect to server to load bill details.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    loadBill()
  }, [loadBill])

  const formatDate = (dateString) => {
    if (!dateString) {
      return '-'
    }

    return new Date(dateString).toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  }

  const handlePayWithEsewa = async () => {
    if (paying) {
      return
    }

    if (!bill) {
      Alert.alert('Bill Not Found', 'Cannot find bill details. Please refresh.')
      return
    }

    setPaying(true)
    try {
      const token = await AsyncStorage.getItem('token')

      const response = await fetch(`${API_BASE}/payment/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          provider: 'esewa',
          amount: bill.amount || 750,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data?.success || !data?.paymentUrl) {
        Alert.alert('Payment Error', data?.message || 'Could not start eSewa payment.')
        return
      }

      const canOpen = await Linking.canOpenURL(data.paymentUrl)
      if (!canOpen) {
        Alert.alert('Payment Error', 'Cannot open eSewa payment page on this device.')
        return
      }

      await Linking.openURL(data.paymentUrl)

      setTimeout(() => {
        loadBill(true)
      }, 2000)
    } catch (error) {
      console.error('eSewa payment error:', error)
      Alert.alert('Payment Error', 'Cannot connect to payment server.')
    } finally {
      setPaying(false)
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#000" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Pay Bill</ThemedText>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadBill(true)}
            colors={['#4CAF50']}
            tintColor="#4CAF50"
          />
        }
      >
        {loading ? (
          <View style={styles.loaderWrap}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <ThemedText style={styles.loadingText}>Loading your bill...</ThemedText>
          </View>
        ) : bill ? (
          <>
            <View style={styles.billCard}>
              <ThemedText style={styles.billTitle}>Waste Collection Bill</ThemedText>

              <View style={styles.row}>
                <ThemedText style={styles.label}>Billing Month</ThemedText>
                <ThemedText style={styles.value}>{bill.billingMonth || '-'}</ThemedText>
              </View>

              <View style={styles.row}>
                <ThemedText style={styles.label}>Due Date</ThemedText>
                <ThemedText style={styles.value}>{formatDate(bill.dueDate)}</ThemedText>
              </View>

              <View style={styles.row}>
                <ThemedText style={styles.label}>Status</ThemedText>
                <ThemedText style={styles.status}>{bill.status === 'paid' ? 'Paid' : 'Pending'}</ThemedText>
              </View>

              {latestPayment && (
                <View style={styles.row}>
                  <ThemedText style={styles.label}>Last Payment</ThemedText>
                  <ThemedText style={styles.value}>{latestPayment.status}</ThemedText>
                </View>
              )}

              <View style={styles.amountBox}>
                <ThemedText style={styles.amountLabel}>Total Amount</ThemedText>
                <ThemedText style={styles.amount}>Rs. {bill.amount}</ThemedText>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.payButton, (paying || bill.status === 'paid') && styles.payButtonDisabled]}
              onPress={handlePayWithEsewa}
              disabled={paying || bill.status === 'paid'}
            >
              <ThemedText style={styles.payButtonText}>
                {bill.status === 'paid' ? 'Already Paid' : paying ? 'Opening eSewa...' : 'Pay with eSewa'}
              </ThemedText>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.loaderWrap}>
            <ThemedText style={styles.loadingText}>No bill available.</ThemedText>
          </View>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 12,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 10 : 10,
    backgroundColor: '#fff',
    borderBottomWidth: 0.5,
    borderBottomColor: '#ddd',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  body: {
    flex: 1,
    backgroundColor: '#E8F5F2',
  },
  bodyContent: {
    padding: 20,
    paddingBottom: 30,
  },
  loaderWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 15,
    color: '#666',
  },
  billCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  billTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1b1b1b',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: '#666',
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1b1b1b',
  },
  status: {
    fontSize: 14,
    fontWeight: '700',
    color: '#EF6C00',
  },
  amountBox: {
    marginTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 14,
  },
  amountLabel: {
    fontSize: 13,
    color: '#777',
    marginBottom: 4,
  },
  amount: {
    fontSize: 30,
    fontWeight: '700',
    color: '#111',
  },
  payButton: {
    backgroundColor: '#4CAF50',
    marginTop: 20,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  payButtonDisabled: {
    opacity: 0.6,
  },
  payButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
})

export default PayBill
