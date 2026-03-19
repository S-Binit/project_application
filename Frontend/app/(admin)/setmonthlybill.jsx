import { useEffect, useState, useCallback } from 'react'
import {
  StyleSheet,
  View,
  TouchableOpacity,
  TextInput,
  Platform,
  StatusBar,
  Alert,
  Switch,
  ActivityIndicator,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useRouter } from 'expo-router'

import ThemedViewAdmin from '../../components/ThemedViewAdmin'
import ThemedText from '../../components/ThemedText'
import { API_BASE } from '../../constants/API'

const SetMonthlyBill = () => {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [monthlyAmount, setMonthlyAmount] = useState('')
  const [applyToPendingBills, setApplyToPendingBills] = useState(true)
  const [currentAmount, setCurrentAmount] = useState(0)

  const loadSettings = useCallback(async () => {
    setLoading(true)
    try {
      const token = await AsyncStorage.getItem('token')
      const response = await fetch(`${API_BASE}/payment/admin/monthly-bill`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      })

      const data = await response.json()
      if (!response.ok || !data?.success) {
        throw new Error(data?.message || 'Failed to load monthly bill settings')
      }

      const value = Number(data.monthlyAmount || 0)
      setCurrentAmount(value)
      setMonthlyAmount(value > 0 ? String(value) : '')
    } catch (error) {
      console.error('Load monthly bill settings error:', error.message)
      Alert.alert('Error', error.message || 'Could not load monthly bill settings')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  const handleSave = async () => {
    const parsedAmount = Number(monthlyAmount)
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid positive number.')
      return
    }

    setSaving(true)
    try {
      const token = await AsyncStorage.getItem('token')
      const response = await fetch(`${API_BASE}/payment/admin/monthly-bill`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          monthlyAmount: parsedAmount,
          applyToPendingBills,
        }),
      })

      const data = await response.json()
      if (!response.ok || !data?.success) {
        throw new Error(data?.message || 'Failed to save monthly bill settings')
      }

      setCurrentAmount(Number(data.monthlyAmount || parsedAmount))

      const updatedCount = Number(data.updatedPendingBills || 0)
      Alert.alert(
        'Updated',
        `Monthly bill is now Rs. ${data.monthlyAmount}. ${updatedCount} pending bill(s) updated for current month.`
      )
    } catch (error) {
      console.error('Save monthly bill settings error:', error.message)
      Alert.alert('Error', error.message || 'Could not save monthly bill settings')
    } finally {
      setSaving(false)
    }
  }

  return (
    <ThemedViewAdmin style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/(admin)/payments')}>
          <Ionicons name="arrow-back" size={26} color="#333" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Set Monthly Bill</ThemedText>
        <View style={{ width: 26 }} />
      </View>

      {loading ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color="#ef6c00" />
          <ThemedText style={styles.loaderText}>Loading current settings...</ThemedText>
        </View>
      ) : (
        <View style={styles.content}>
          <View style={styles.card}>
            <ThemedText style={styles.label}>Current Monthly Bill</ThemedText>
            <ThemedText style={styles.currentAmount}>Rs. {currentAmount}</ThemedText>

            <ThemedText style={styles.label}>New Monthly Bill Amount</ThemedText>
            <TextInput
              value={monthlyAmount}
              onChangeText={setMonthlyAmount}
              keyboardType="decimal-pad"
              placeholder="Enter amount (e.g. 750)"
              placeholderTextColor="#9ca3af"
              style={styles.input}
            />

            <View style={styles.switchRow}>
              <View style={{ flex: 1 }}>
                <ThemedText style={styles.switchTitle}>Apply to all pending bills</ThemedText>
                <ThemedText style={styles.switchHint}>Updates pending bills for this month only.</ThemedText>
              </View>
              <Switch
                value={applyToPendingBills}
                onValueChange={setApplyToPendingBills}
                thumbColor={applyToPendingBills ? '#ef6c00' : '#cbd5e1'}
                trackColor={{ false: '#e2e8f0', true: '#fed7aa' }}
              />
            </View>

            <TouchableOpacity
              style={[styles.saveButton, saving && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={saving}
            >
              <ThemedText style={styles.saveText}>{saving ? 'Saving...' : 'Save Monthly Bill'}</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ThemedViewAdmin>
  )
}

export default SetMonthlyBill

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff7ed',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 12,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 10 : 12,
    backgroundColor: '#fff',
    borderBottomWidth: 0.5,
    borderBottomColor: '#fde68a',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  loaderWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  loaderText: {
    color: '#64748b',
    fontSize: 13,
  },
  content: {
    padding: 14,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fed7aa',
    padding: 14,
  },
  label: {
    fontSize: 13,
    color: '#475569',
    marginTop: 8,
    marginBottom: 6,
  },
  currentAmount: {
    fontSize: 24,
    color: '#9a3412',
    fontWeight: '700',
    marginBottom: 8,
  },
  input: {
    height: 46,
    borderWidth: 1,
    borderColor: '#fdba74',
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: '#fffbeb',
    fontSize: 16,
    color: '#111827',
  },
  switchRow: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  switchTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  switchHint: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  saveButton: {
    marginTop: 18,
    backgroundColor: '#ef6c00',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
})
