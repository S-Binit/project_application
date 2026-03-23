import {useEffect, useMemo, useRef, useState} from 'react'
import {StyleSheet, View, Animated, Alert} from 'react-native'
import Constants from 'expo-constants'
import MapView, {Marker, AnimatedRegion, UrlTile} from 'react-native-maps'
import * as Location from 'expo-location'
import AsyncStorage from '@react-native-async-storage/async-storage'

import ThemedView from "../../components/ThemedView"
import {LOCATION_URL} from "../../constants/API"
import { createSocketClient } from '../../utils/socket'
import {
    addUserNotification,
    removeDriverNotifications,
} from '../../utils/notifications'

const TILE_URL = Constants?.expoConfig?.extra?.TILE_URL
const TILE_USER_AGENT = Constants?.expoConfig?.extra?.TILE_USER_AGENT

const mapTileUrl = TILE_URL || 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
const mapTileUserAgent = TILE_USER_AGENT || 'project-app/1.0 (contact: you@example.com)'

const DEFAULT_REGION = {
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
}

const NEARBY_DISTANCE_METERS = 1500

const toRadians = (value) => (value * Math.PI) / 180

const getDistanceInMeters = (from, to) => {
    const earthRadius = 6371000
    const deltaLat = toRadians(to.latitude - from.latitude)
    const deltaLon = toRadians(to.longitude - from.longitude)
    const lat1 = toRadians(from.latitude)
    const lat2 = toRadians(to.latitude)

    const a =
        Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
        Math.cos(lat1) * Math.cos(lat2) *
        Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2)

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return earthRadius * c
}

const regionFromCoords = (coords) => ({
    ...DEFAULT_REGION,
    latitude: coords.latitude,
    longitude: coords.longitude,
})

const Map1 = () => {
    const [region, setRegion] = useState(DEFAULT_REGION)
    const [drivers, setDrivers] = useState([])
    const [userLocation, setUserLocation] = useState(null)
    const [error, setError] = useState(null)
    const [initialCenter, setInitialCenter] = useState(true)
    const mapRef = useRef(null)
    const locationWatcherRef = useRef(null)
    const socketRef = useRef(null)
    const nearDriversRef = useRef(new Set())
    const [etaInfo, setEtaInfo] = useState(null)

    // Load initial data and subscribe to live driver updates over sockets.
    useEffect(() => {
        let isMounted = true

        const loadDriverLocation = async () => {
            try {
                const res = await fetch(`${LOCATION_URL}/shared`, {
                    // Add cache-busting to prevent stale data
                    headers: {
                        'Cache-Control': 'no-cache',
                        'Pragma': 'no-cache'
                    }
                })
                const data = await res.json()
                if (!isMounted) return

                if (data?.sharing && Array.isArray(data.drivers)) {
                    setDrivers(prev => {
                        if (JSON.stringify(prev) === JSON.stringify(data.drivers)) {
                            return prev
                        }
                        return data.drivers
                    })
                    
                    setError(null)
                } else {
                    setDrivers([])
                }
            } catch (_err) {
                if (!isMounted) return
                setError('Unable to load driver location right now.')
            }
        }

        const connectSocket = async () => {
            const token = await AsyncStorage.getItem('token')
            const socket = createSocketClient(token)
            socketRef.current = socket

            socket.on('connect', () => {
                if (!isMounted) return
                setError(null)
            })

            socket.on('drivers:update', (payload) => {
                if (!isMounted) return
                if (payload?.sharing && Array.isArray(payload.drivers)) {
                    setDrivers(payload.drivers)
                } else {
                    setDrivers([])
                }
            })

            socket.on('connect_error', () => {
                if (!isMounted) return
                setError('Realtime connection lost. Showing latest known data.')
            })
        }

        loadDriverLocation()
        connectSocket()

        return () => {
            isMounted = false
            socketRef.current?.disconnect()
        }
    }, [])

    // Continuous real-time user location tracking
    useEffect(() => {
        let isMounted = true

        const startUserLocationTracking = async () => {
            try {
                const {status} = await Location.requestForegroundPermissionsAsync()
                if (!isMounted) return
                if (status !== 'granted') return

                // Get initial location and center map on it
                const lastKnown = await Location.getLastKnownPositionAsync()
                if (isMounted && lastKnown?.coords?.latitude && lastKnown?.coords?.longitude) {
                    const seededRegion = regionFromCoords(lastKnown.coords)
                    setRegion(seededRegion)

                    if (initialCenter) {
                        setTimeout(() => {
                            if (mapRef.current) {
                                mapRef.current.animateToRegion(seededRegion, 800)
                            }
                        }, 300)
                        setInitialCenter(false)
                    }
                }

                // Use watchPositionAsync for continuous real-time updates
                locationWatcherRef.current = await Location.watchPositionAsync(
                    {
                        accuracy: Location.Accuracy.High,
                        timeInterval: 1000, // Update every 1 second
                        distanceInterval: 5, // Update every 5 meters
                    },
                    ({coords}) => {
                        if (!isMounted) return
                        
                        const coord = {
                            latitude: coords.latitude, 
                            longitude: coords.longitude
                        }
                        
                        setUserLocation(coord)

                        // Auto-center map on user's location when first loaded
                        if (initialCenter) {
                            const currentRegion = regionFromCoords(coords)
                            setRegion(currentRegion)
                            setTimeout(() => {
                                if (mapRef.current) {
                                    mapRef.current.animateToRegion(currentRegion, 1000)
                                }
                            }, 500)
                            setInitialCenter(false)
                        }
                    }
                )
            } catch (_err) {
                // ignore user location errors silently
            }
        }

        startUserLocationTracking()
        
        return () => {
            isMounted = false
            locationWatcherRef.current?.remove()
        }
    }, [])

    const hasDriver = drivers.length > 0
    
    // Optimize marker rendering with useMemo and add timestamp info
    const driverMarkers = useMemo(() => {
        const deduped = new Map()

        drivers.forEach(d => {
            const lat = d?.location?.latitude
            const lng = d?.location?.longitude
            const valid = Number.isFinite(lat) && Number.isFinite(lng)
            if (!valid) return

            if (!deduped.has(d.driverId)) {
                const lastUpdate = d.updatedAt ? new Date(d.updatedAt).toLocaleTimeString() : 'unknown'
                deduped.set(d.driverId, {
                    key: d.driverId,
                    coordinate: { latitude: lat, longitude: lng },
                    title: d.name ? `Driver: ${d.name}` : 'Driver',
                    description: `Live • Updated: ${lastUpdate}`,
                    updatedAt: d.updatedAt,
                })
            }
        })

        return Array.from(deduped.values())
    }, [drivers])

    const nearestDriver = useMemo(() => {
        if (!userLocation || driverMarkers.length === 0) return null

        let nearest = null
        for (const marker of driverMarkers) {
            const distance = getDistanceInMeters(userLocation, marker.coordinate)
            if (!nearest || distance < nearest.distanceMeters) {
                nearest = {
                    driverId: marker.key,
                    driverName: marker.title.replace('Driver: ', ''),
                    distanceMeters: distance,
                }
            }
        }

        return nearest
    }, [userLocation, driverMarkers])

    useEffect(() => {
        let isMounted = true
        let intervalId = null

        const fetchEta = async () => {
            if (!nearestDriver || !userLocation) {
                if (isMounted) setEtaInfo(null)
                return
            }

            try {
                const response = await fetch(
                    `${LOCATION_URL}/eta?driverId=${encodeURIComponent(nearestDriver.driverId)}&userLat=${encodeURIComponent(userLocation.latitude)}&userLng=${encodeURIComponent(userLocation.longitude)}`
                )
                const data = await response.json()

                if (!isMounted) return

                if (response.ok && data?.success) {
                    setEtaInfo({
                        driverId: data.driverId,
                        driverName: data.driverName || nearestDriver.driverName,
                        etaMinutes: data.etaMinutes,
                        distanceKm: data.distanceKm,
                        updatedAt: data.updatedAt,
                    })
                } else {
                    setEtaInfo(null)
                }
            } catch (_error) {
                if (isMounted) setEtaInfo(null)
            }
        }

        fetchEta()
        intervalId = setInterval(fetchEta, 15000)

        return () => {
            isMounted = false
            if (intervalId) clearInterval(intervalId)
        }
    }, [nearestDriver?.driverId, userLocation?.latitude, userLocation?.longitude])

    useEffect(() => {
        const syncStoppedSharingDrivers = async () => {
            const activeDriverIds = new Set(driverMarkers.map(marker => marker.key))
            const previouslyNearIds = Array.from(nearDriversRef.current)
            const stoppedDriverIds = previouslyNearIds.filter(id => !activeDriverIds.has(id))

            if (stoppedDriverIds.length > 0) {
                await removeDriverNotifications(stoppedDriverIds)
            }

            nearDriversRef.current = new Set(
                previouslyNearIds.filter(id => activeDriverIds.has(id))
            )
        }

        syncStoppedSharingDrivers()
    }, [driverMarkers])

    useEffect(() => {
        let isMounted = true

        const notifyWhenDriverIsNearby = async () => {
            if (!userLocation) return

            if (driverMarkers.length === 0) {
                nearDriversRef.current = new Set()
                return
            }

            const currentNearDrivers = new Set()

            for (const marker of driverMarkers) {
                const distance = getDistanceInMeters(userLocation, marker.coordinate)
                if (distance > NEARBY_DISTANCE_METERS) {
                    continue
                }

                currentNearDrivers.add(marker.key)

                if (nearDriversRef.current.has(marker.key)) {
                    continue
                }

                const message = `${marker.title.replace('Driver: ', '')} is near your area (${Math.round(distance)}m away).`
                const notification = {
                    id: `${marker.key}-${Date.now()}`,
                    title: 'Driver Nearby',
                    message,
                    driverId: marker.key,
                    createdAt: Date.now(),
                }

                await addUserNotification(notification)

                if (isMounted) {
                    Alert.alert('Driver Nearby', message)
                }
            }

            nearDriversRef.current = currentNearDrivers
        }

        notifyWhenDriverIsNearby()

        return () => {
            isMounted = false
        }
    }, [userLocation, driverMarkers])

    return (
        <ThemedView style={styles.container}>
            <View style={styles.mapWrapper}>
                {etaInfo && (
                    <View style={styles.etaBanner}>
                        <Animated.Text style={styles.etaTitle}>
                            {etaInfo.driverName} arriving in {etaInfo.etaMinutes} min
                        </Animated.Text>
                        <Animated.Text style={styles.etaMeta}>
                            {etaInfo.distanceKm} km away
                        </Animated.Text>
                    </View>
                )}
                <MapView
                    ref={mapRef}
                    style={styles.map}
                    initialRegion={region}
                    showsUserLocation
                    showsMyLocationButton
                    loadingEnabled
                    // Optimization props for smoother performance
                    moveOnMarkerPress={false}
                    tracksViewChanges={false} // Improves performance
                    zoomEnabled={true}
                    rotateEnabled={true}
                    pitchEnabled={true}
                    scrollEnabled={true}
                    // Use OpenStreetMap tiles as base layer
                    mapType="none"
                >
                    {/* OpenStreetMap base tiles */}
                    <UrlTile
                        urlTemplate={mapTileUrl}
                        maximumZ={19}
                        flipY={false}
                        userAgent={mapTileUserAgent}
                    />
                    {driverMarkers.map(marker => (
                        <Marker
                            key={marker.key}
                            coordinate={marker.coordinate}
                            title={marker.title}
                            description={marker.description}
                            pinColor="#d32f2f"
                            // Optimize marker rendering
                            tracksViewChanges={false}
                        />
                    ))}
                </MapView>
                {/* OSM attribution (required) */}
                <View style={styles.attribution} pointerEvents="none">
                    <Animated.Text style={styles.attrText}>© OpenStreetMap contributors</Animated.Text>
                </View>
            </View>
        </ThemedView>
    )
}

export default Map1

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    mapWrapper: {
        flex: 1,
    },
    map: {
        flex: 1,
    },
    etaBanner: {
        position: 'absolute',
        top: 16,
        left: 14,
        right: 14,
        zIndex: 10,
        backgroundColor: 'rgba(20, 60, 28, 0.9)',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    etaTitle: {
        color: '#f4fff7',
        fontSize: 14,
        fontWeight: '700',
    },
    etaMeta: {
        color: '#d9fbe3',
        fontSize: 12,
        marginTop: 2,
    },
    attribution: {
        position: 'absolute',
        right: 8,
        bottom: 8,
        backgroundColor: 'rgba(0,0,0,0.4)',
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    attrText: {
        color: '#fff',
        fontSize: 11,
    },
})