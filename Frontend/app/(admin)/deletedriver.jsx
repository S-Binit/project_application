import React, { useState, useEffect } from 'react'
import { StyleSheet, View, TouchableOpacity, StatusBar, Platform, FlatList, Alert, RefreshControl, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Ionicons } from '@expo/vector-icons'

import ThemedText from '../../components/ThemedText'
import ThemedView from '../../components/ThemedView'
import Spacer from '../../components/Spacer'
import { API_BASE } from '../../constants/API'

const DeleteDriver = () => {
  const router = useRouter()
  const [drivers, setDrivers] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchDrivers = async () => {
    try {
      const token = await AsyncStorage.getItem('token')
      const response = await fetch(`${API_BASE}/driver/all`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (data.success) {
        setDrivers(data.drivers || [])
      } else {
        Alert.alert('Error', data.message || 'Failed to fetch drivers')
      }
    } catch (error) {
      console.error('Fetch drivers error:', error)
      Alert.alert('Error', 'Cannot connect to server')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchDrivers()
  }, [])

  const onRefresh = () => {
    setRefreshing(true)
    fetchDrivers()
  }

  const handleDeleteDriver = (driverId, driverName) => {
    Alert.alert(
      'Delete Driver',
      `Are you sure you want to delete ${driverName}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('token')
              const response = await fetch(`${API_BASE}/driver/${driverId}`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${token}`,
                },
              })

              const data = await response.json()

              if (data.success) {
                Alert.alert('Success', 'Driver deleted successfully')
                fetchDrivers()
              } else {
                Alert.alert('Error', data.message || 'Failed to delete driver')
              }
            } catch (error) {
              console.error('Delete driver error:', error)
              Alert.alert('Error', 'Cannot connect to server')
            }
          },
        },
      ]
    )
  }

  const renderDriverItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.driverCard}
      onPress={() => {
        router.push({
          pathname: '/(admin)/driverinfo',
          params: { driverId: item._id }
        })
      }}>
      <View style={styles.driverInfo}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person" size={32} color="#fff" />
        </View>
        <View style={styles.driverDetails}>
          <ThemedText style={styles.driverName}>{item.name}</ThemedText>
          <ThemedText style={styles.driverEmail}>{item.email}</ThemedText>
          <ThemedText style={styles.driverPhone}>{item.phoneNumber}</ThemedText>
          <View style={styles.vehicleInfo}>
            <Ionicons name="car" size={14} color="#666" />
            <ThemedText style={styles.vehicleText}>{item.vehicleModel} - {item.vehicleNumber}</ThemedText>
          </View>
        </View>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={(e) => {
          e.stopPropagation()
          handleDeleteDriver(item._id, item.name)
        }}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <Ionicons name="trash" size={24} color="#f44336" />
      </TouchableOpacity>
    </TouchableOpacity>
  )

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={28} color="#000" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Delete Driver</ThemedText>
          <View style={{ width: 28 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#f44336" />
          <ThemedText style={styles.loadingText}>Loading drivers...</ThemedText>
        </View>
      </ThemedView>
    )
  }

  return (
    <ThemedView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#000" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Delete Driver</ThemedText>
        <View style={{ width: 28 }} />
      </View>

      {/* List */}
      {drivers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="person-outline" size={64} color="#ccc" />
          <ThemedText style={styles.emptyText}>No drivers found</ThemedText>
        </View>
      ) : (
        <FlatList
          data={drivers}
          renderItem={renderDriverItem}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      )}
    </ThemedView>
  )
}

export default DeleteDriver

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
  listContent: {
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  driverCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#666',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  driverDetails: {
    flex: 1,
  },
  driverName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  driverEmail: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  driverPhone: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  vehicleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  vehicleText: {
    fontSize: 12,
    color: '#666',
  },
  deleteButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    marginTop: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
})
