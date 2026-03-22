import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { StyleSheet, View, TouchableOpacity, ScrollView, Platform, StatusBar, RefreshControl } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useRouter } from 'expo-router'

import ThemedText from '../../components/ThemedText'
import ThemedView from '../../components/ThemedView'
import Spacer from '../../components/Spacer'
import { LOCATION_URL } from '../../constants/API'
import { createSocketClient } from '../../utils/socket'

const AdminDashHome = () => {
  const router = useRouter()
  const [drivers, setDrivers] = useState([])
  const [refreshing, setRefreshing] = useState(false)
  const [connectionState, setConnectionState] = useState('connecting')
  const [lastSyncAt, setLastSyncAt] = useState(null)
  const socketRef = useRef(null)

  const applyDriverPayload = useCallback((payload) => {
    if (payload?.sharing && Array.isArray(payload.drivers)) {
      const deduped = new Map()

      payload.drivers.forEach((d) => {
        const lat = d?.location?.latitude
        const lng = d?.location?.longitude
        const valid = Number.isFinite(lat) && Number.isFinite(lng)
        if (!valid) return

        if (!deduped.has(d.driverId)) {
          deduped.set(d.driverId, {
            ...d,
            location: { latitude: lat, longitude: lng },
          })
        }
      })

      setDrivers(Array.from(deduped.values()))
    } else {
      setDrivers([])
    }

    setLastSyncAt(new Date())
  }, [])

  const loadDrivers = useCallback(async () => {
    try {
      const res = await fetch(`${LOCATION_URL}/shared`, {
        headers: {
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
        },
      })
      const data = await res.json()
      applyDriverPayload(data)
    } catch (_error) {
      setConnectionState('offline')
    }
  }, [applyDriverPayload])

  useEffect(() => {
    let isMounted = true

    const connectSocket = async () => {
      const token = await AsyncStorage.getItem('token')
      const socket = createSocketClient(token)
      socketRef.current = socket

      socket.on('connect', () => {
        if (!isMounted) return
        setConnectionState('connected')
      })

      socket.on('drivers:update', (payload) => {
        if (!isMounted) return
        setConnectionState('connected')
        applyDriverPayload(payload)
      })

      socket.on('disconnect', () => {
        if (!isMounted) return
        setConnectionState('reconnecting')
      })

      socket.on('connect_error', () => {
        if (!isMounted) return
        setConnectionState('offline')
      })
    }

    loadDrivers()
    connectSocket()

    return () => {
      isMounted = false
      socketRef.current?.disconnect()
    }
  }, [applyDriverPayload, loadDrivers])

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    loadDrivers().finally(() => setRefreshing(false))
  }, [loadDrivers])

  const stats = useMemo(() => {
    const now = Date.now()
    const staleThresholdMs = 2 * 60 * 1000

    const staleCount = drivers.filter((driver) => {
      const updatedAt = new Date(driver.updatedAt).getTime()
      return Number.isFinite(updatedAt) ? now - updatedAt > staleThresholdMs : true
    }).length

    return {
      active: drivers.length,
      stale: staleCount,
    }
  }, [drivers])

  const connectionLabel = useMemo(() => {
    if (connectionState === 'connected') return 'Live'
    if (connectionState === 'reconnecting') return 'Reconnecting'
    if (connectionState === 'offline') return 'Offline'
    return 'Connecting'
  }, [connectionState])

  const connectionColor = useMemo(() => {
    if (connectionState === 'connected') return '#2e7d32'
    if (connectionState === 'reconnecting') return '#f57c00'
    if (connectionState === 'offline') return '#c62828'
    return '#607d8b'
  }, [connectionState])

  return (
    <ThemedView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#000" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <ThemedText style={styles.headerTitle}>Live Operations Board</ThemedText>
          <View style={styles.connectionRow}>
            <View style={[styles.connectionDot, { backgroundColor: connectionColor }]} />
            <ThemedText style={styles.connectionText}>{connectionLabel}</ThemedText>
          </View>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#c62828"
            colors={["#c62828"]}
          />
        }
      >
        <Spacer height={20} />

        {/* Snapshot */}
        <View style={styles.welcomeCard}>
          <Ionicons name="speedometer" size={44} color="#b71c1c" />
          <Spacer height={12} />
          <ThemedText style={styles.welcomeTitle}>Realtime Fleet Snapshot</ThemedText>
          <Spacer height={10} />
          <ThemedText style={styles.welcomeDescription}>
            {lastSyncAt
              ? `Last sync: ${lastSyncAt.toLocaleTimeString()}`
              : 'Waiting for first live update...'}
          </ThemedText>
        </View>

        <Spacer height={25} />

        {/* Stats */}
        <ThemedText style={styles.sectionTitle}>Operations Metrics</ThemedText>
        <Spacer height={12} />

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#e3f2fd' }]}>
              <Ionicons name="car-sport" size={24} color="#1565c0" />
            </View>
            <Spacer height={10} />
            <ThemedText style={styles.statNumber}>Active Drivers</ThemedText>
            <ThemedText style={styles.statValue}>{stats.active}</ThemedText>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#fff3e0' }]}>
              <Ionicons name="warning" size={24} color="#ef6c00" />
            </View>
            <Spacer height={10} />
            <ThemedText style={styles.statNumber}>Stale Updates</ThemedText>
            <ThemedText style={styles.statValue}>{stats.stale}</ThemedText>
          </View>
        </View>

        <Spacer height={25} />

        {/* Live Driver Feed */}
        <ThemedText style={styles.sectionTitle}>Live Driver Feed</ThemedText>
        <Spacer height={12} />

        <View style={styles.featureList}>
          {drivers.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="car-outline" size={22} color="#b71c1c" />
              <ThemedText style={styles.emptyText}>No active drivers currently sharing location.</ThemedText>
            </View>
          )}

          {drivers.map((driver) => (
            <View key={driver.driverId} style={styles.driverCard}>
              <View style={styles.driverHeaderRow}>
                <View style={styles.driverTitleWrap}>
                  <ThemedText style={styles.driverName}>{driver.name || 'Driver'}</ThemedText>
                  <ThemedText style={styles.driverMeta}>ID: {driver.driverId}</ThemedText>
                </View>
                <View style={styles.liveBadge}>
                  <ThemedText style={styles.liveBadgeText}>LIVE</ThemedText>
                </View>
              </View>

              <Spacer height={6} />
              <ThemedText style={styles.driverMeta}>
                Updated {driver.updatedAt ? new Date(driver.updatedAt).toLocaleTimeString() : 'unknown'}
              </ThemedText>
              <ThemedText style={styles.driverMeta}>
                Lat: {driver.location?.latitude?.toFixed?.(5)} | Lng: {driver.location?.longitude?.toFixed?.(5)}
              </ThemedText>

              <Spacer height={10} />
              <TouchableOpacity
                style={styles.trackBtn}
                onPress={() => router.push({
                  pathname: '/(admin)/map',
                  params: {
                    driverId: driver.driverId,
                    driverName: driver.name || 'Driver',
                  },
                })}
              >
                <Ionicons name="navigate" size={16} color="#fff" />
                <ThemedText style={styles.trackBtnText}>Track on Map</ThemedText>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <Spacer height={30} />
      </ScrollView>
    </ThemedView>
  )
}

export default AdminDashHome

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 15,
    paddingVertical: 12,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 10 : 25,
    backgroundColor: '#fff',
    borderBottomWidth: 0.5,
    borderBottomColor: '#ddd',
    gap: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
  },
  connectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  connectionDot: {
    width: 9,
    height: 9,
    borderRadius: 20,
    marginRight: 7,
  },
  connectionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#455a64',
  },
  content: {
    flex: 1,
    paddingHorizontal: 15,
  },
  welcomeCard: {
    backgroundColor: '#ffebee',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ffcdd2',
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#b71c1c',
  },
  welcomeDescription: {
    fontSize: 14,
    color: '#6d4c41',
    textAlign: 'center',
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    alignItems: 'center',
  },
  statIcon: {
    width: 50,
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  statValue: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  featureList: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    gap: 14,
  },
  emptyState: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fff3f3',
    borderRadius: 10,
    padding: 10,
  },
  emptyText: {
    fontSize: 14,
    color: '#7b4a4a',
    flex: 1,
  },
  driverCard: {
    borderWidth: 1,
    borderColor: '#f2d6d6',
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#fffaf9',
  },
  driverHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  driverTitleWrap: {
    flex: 1,
  },
  driverName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#3e2723',
  },
  driverMeta: {
    fontSize: 12,
    color: '#6d4c41',
  },
  liveBadge: {
    backgroundColor: '#2e7d32',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  liveBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  trackBtn: {
    alignSelf: 'flex-start',
    backgroundColor: '#b71c1c',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  trackBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
})
