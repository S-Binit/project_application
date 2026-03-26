import React, { useEffect, useState } from 'react'
import {
  StyleSheet,
  View,
  TouchableOpacity,
  StatusBar,
  Platform,
  FlatList,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native'
import { useRouter } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Ionicons } from '@expo/vector-icons'

import ThemedText from '../../components/ThemedText'
import ThemedView from '../../components/ThemedView'
import { API_BASE } from '../../constants/API'

const ResetDriverPassword = () => {
  const router = useRouter()
  const [drivers, setDrivers] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedDriver, setSelectedDriver] = useState(null)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchDrivers = async () => {
    try {
      const token = await AsyncStorage.getItem('token')
      const response = await fetch(`${API_BASE}/driver/all`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()
      if (data.success) {
        setDrivers(Array.isArray(data.drivers) ? data.drivers : [])
      } else {
        Alert.alert('Error', data.message || 'Failed to fetch drivers')
      }
    } catch (_error) {
      Alert.alert('Error', 'Cannot connect to server')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDrivers()
  }, [])

  const openResetModal = (driver) => {
    setSelectedDriver(driver)
    setNewPassword('')
    setConfirmPassword('')
    setModalVisible(true)
  }

  const submitPasswordReset = async () => {
    if (!selectedDriver?._id) return

    if (!newPassword || newPassword.length < 6) {
      Alert.alert('Invalid Password', 'New password must be at least 6 characters')
      return
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Mismatch', 'Passwords do not match')
      return
    }

    setSubmitting(true)
    try {
      const token = await AsyncStorage.getItem('token')
      const response = await fetch(`${API_BASE}/driver/${selectedDriver._id}/password`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newPassword }),
      })

      const data = await response.json()
      if (data.success) {
        Alert.alert('Success', 'Driver password updated successfully')
        setModalVisible(false)
      } else {
        Alert.alert('Error', data.message || 'Failed to update driver password')
      }
    } catch (_error) {
      Alert.alert('Error', 'Cannot connect to server')
    } finally {
      setSubmitting(false)
    }
  }

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => openResetModal(item)}>
      <View style={styles.avatar}>
        <Ionicons name="person" size={22} color="#fff" />
      </View>
      <View style={styles.infoWrap}>
        <ThemedText style={styles.name}>{item.name || 'Driver'}</ThemedText>
        <ThemedText style={styles.meta}>{item.email || 'No email'}</ThemedText>
      </View>
      <Ionicons name="key" size={20} color="#FF9800" />
    </TouchableOpacity>
  )

  return (
    <ThemedView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#000" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Reset Driver Password</ThemedText>
        <View style={{ width: 28 }} />
      </View>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="#FF9800" />
          <ThemedText style={styles.loadingText}>Loading drivers...</ThemedText>
        </View>
      ) : (
        <FlatList
          data={drivers}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<ThemedText style={styles.empty}>No drivers found</ThemedText>}
        />
      )}

      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <ThemedText style={styles.modalTitle}>Set New Password</ThemedText>
            <ThemedText style={styles.modalSub}>{selectedDriver?.name || 'Driver'}</ThemedText>

            <TextInput
              style={styles.input}
              placeholder="New password"
              placeholderTextColor="#888"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />

            <TextInput
              style={styles.input}
              placeholder="Confirm new password"
              placeholderTextColor="#888"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />

            <View style={styles.actionRow}>
              <TouchableOpacity style={[styles.actionBtn, styles.cancelBtn]} onPress={() => setModalVisible(false)}>
                <ThemedText style={styles.cancelText}>Cancel</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, styles.submitBtn, submitting && { opacity: 0.6 }]}
                onPress={submitPasswordReset}
                disabled={submitting}
              >
                <ThemedText style={styles.submitText}>{submitting ? 'Updating...' : 'Update'}</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ThemedView>
  )
}

export default ResetDriverPassword

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafafa' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 12,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 10 : 25,
    backgroundColor: '#fff',
    borderBottomWidth: 0.5,
    borderBottomColor: '#ddd',
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#000' },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: '#666' },
  list: { padding: 15 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FF9800',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoWrap: { flex: 1 },
  name: { fontSize: 15, fontWeight: '700', color: '#222' },
  meta: { fontSize: 12, color: '#777', marginTop: 2 },
  empty: { textAlign: 'center', marginTop: 20, color: '#888' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 18,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#111' },
  modalSub: { fontSize: 13, color: '#666', marginTop: 4, marginBottom: 14 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#111',
    marginBottom: 10,
  },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
  actionBtn: {
    flex: 1,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
  },
  cancelBtn: { backgroundColor: '#f2f2f2' },
  submitBtn: { backgroundColor: '#FF9800' },
  cancelText: { color: '#444', fontWeight: '600' },
  submitText: { color: '#fff', fontWeight: '700' },
})
