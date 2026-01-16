import React, { useEffect, useMemo, useState } from 'react'
import { StyleSheet, View, TouchableOpacity, StatusBar, Platform, FlatList, RefreshControl, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Ionicons } from '@expo/vector-icons'

import ThemedText from '../../components/ThemedText'
import ThemedView from '../../components/ThemedView'
import Spacer from '../../components/Spacer'
import { API_BASE, LOCATION_URL } from '../../constants/API'

const DriverStatus = () => {
  const router = useRouter()
  const [drivers, setDrivers] = useState([])
  const [sharingIds, setSharingIds] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchDrivers = async () => {
    try {
      const token = await AsyncStorage.getItem('token')
      const res = await fetch(`${API_BASE}/driver/all`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await res.json()
      if (data.success) {
        setDrivers(data.drivers || [])
      }
    } catch (err) {
      console.error('Fetch drivers error:', err)
    }
  }

  const fetchSharing = async () => {
    try {
      const res = await fetch(`${LOCATION_URL}/shared`, {
        headers: {
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
        },
      })
      const data = await res.json()
      if (Array.isArray(data.drivers)) {
        setSharingIds(new Set(data.drivers.map(d => d.driverId)))
      } else {
        setSharingIds(new Set())
      }
    } catch (err) {
      console.error('Fetch sharing error:', err)
      setSharingIds(new Set())
    }
  }

  const load = async () => {
    setLoading(true)
    await Promise.all([fetchDrivers(), fetchSharing()])
    setLoading(false)
    setRefreshing(false)
  }

  useEffect(() => {
    load()
  }, [])

  const onRefresh = () => {
    setRefreshing(true)
    load()
  }

  const rows = useMemo(() => {
    return drivers.map(d => ({
      ...d,
      active: sharingIds.has(d._id),
    }))
  }, [drivers, sharingIds])

  const handleDriverPress = (item) => {
    if (item.active) {
      router.push({
        pathname: '/(admin)/map',
        params: { driverId: item._id, driverName: item.name }
      })
    }
  }

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => handleDriverPress(item)}
      activeOpacity={item.active ? 0.7 : 1}
      disabled={!item.active}>
      <View style={styles.infoRow}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person" size={28} color="#fff" />
        </View>
        <View style={{ flex: 1 }}>
          <ThemedText style={styles.name}>{item.name}</ThemedText>
          <ThemedText style={styles.email}>{item.email}</ThemedText>
          <ThemedText style={styles.phone}>{item.phoneNumber}</ThemedText>
          <ThemedText style={styles.vehicle}>{item.vehicleModel} - {item.vehicleNumber}</ThemedText>
        </View>
        <View style={styles.cardRight}>
          <View style={[styles.statusBadge, item.active ? styles.statusActive : styles.statusInactive]}>
            <ThemedText style={styles.statusText}>{item.active ? 'Active' : 'Inactive'}</ThemedText>
          </View>
          {item.active && (
            <Ionicons name="location" size={20} color="#4CAF50" style={{ marginTop: 4 }} />
          )}
        </View>
      </View>
    </TouchableOpacity>
  )

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.push('/(admin)/drivermanagement')}>
            <Ionicons name="arrow-back" size={28} color="#000" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Driver Status</ThemedText>
          <View style={{ width: 28 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <ThemedText style={styles.loadingText}>Loading drivers...</ThemedText>
        </View>
      </ThemedView>
    )
  }

  return (
    <ThemedView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/(admin)/drivermanagement')}>
          <Ionicons name="arrow-back" size={28} color="#000" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Driver Status</ThemedText>
        <View style={{ width: 28 }} />
      </View>

      {rows.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={64} color="#ccc" />
          <ThemedText style={styles.emptyText}>No drivers found</ThemedText>
        </View>
      ) : (
        <FlatList
          data={rows}
          renderItem={renderItem}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      )}
    </ThemedView>
  )
}

export default DriverStatus

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
    padding: 15,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardRight: {
    alignItems: 'center',
  },
  avatarContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#2196F3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  email: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  phone: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  vehicle: {
    fontSize: 12,
    color: '#777',
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    minWidth: 78,
    alignItems: 'center',
  },
  statusActive: {
    backgroundColor: '#e8f5e9',
  },
  statusInactive: {
    backgroundColor: '#fbe9e7',
  },
  statusText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#111',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    marginTop: 10,
    color: '#999',
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
