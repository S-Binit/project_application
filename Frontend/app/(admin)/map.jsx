import {useEffect, useMemo, useRef, useState} from 'react'
import {StyleSheet, View, Animated} from 'react-native'
import Constants from 'expo-constants'
import MapView, {Marker, UrlTile} from 'react-native-maps'
import * as Location from 'expo-location'
import { useLocalSearchParams } from 'expo-router'

import ThemedView from "../../components/ThemedView"
import {LOCATION_URL} from "../../constants/API"

const TILE_URL = Constants?.expoConfig?.extra?.TILE_URL
const TILE_USER_AGENT = Constants?.expoConfig?.extra?.TILE_USER_AGENT

const mapTileUrl = TILE_URL || 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
const mapTileUserAgent = TILE_USER_AGENT || 'project-app/1.0 (contact: you@example.com)'

const DEFAULT_REGION = {
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.6,
    longitudeDelta: 0.6,
}

const Map1 = () => {
    const { driverId, driverName } = useLocalSearchParams()
    const [region, setRegion] = useState(DEFAULT_REGION)
    const [drivers, setDrivers] = useState([])
    const [userLocation, setUserLocation] = useState(null)
    const [initialLoad, setInitialLoad] = useState(true)
    const [focusedDriver, setFocusedDriver] = useState(driverId || null)
    const mapRef = useRef(null)
    const locationWatcherRef = useRef(null)

    // Real-time driver location fetching with faster updates
    useEffect(() => {
        let isMounted = true

        const loadDriverLocation = async () => {
            try {
                const res = await fetch(`${LOCATION_URL}/shared`, {
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
                } else {
                    setDrivers([])
                }
            } catch (_err) {
                if (!isMounted) return
            }
        }

        loadDriverLocation()
        const intervalId = setInterval(loadDriverLocation, 1500)

        return () => {
            isMounted = false
            clearInterval(intervalId)
        }
    }, [initialLoad])

    // Continuous real-time user location tracking
    useEffect(() => {
        let isMounted = true

        const startUserLocationTracking = async () => {
            try {
                const {status} = await Location.requestForegroundPermissionsAsync()
                if (!isMounted) return
                if (status !== 'granted') return

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

    // Auto-center map on user's location when first location is obtained
    useEffect(() => {
        if (!userLocation || !initialLoad) return

        const newRegion = {
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
        }
        setRegion(newRegion)
        
        // Use setTimeout to ensure MapView is ready
        setTimeout(() => {
            if (mapRef.current) {
                mapRef.current.animateToRegion(newRegion, 1000)
            }
        }, 500)
        
        setInitialLoad(false)
    }, [userLocation, initialLoad])

    const hasDriver = drivers.length > 0

    // Optimize marker rendering with useMemo and add timestamp info (filter out bad coords)
    const driverMarkers = useMemo(() => {
        const deduped = new Map()

        drivers.forEach(d => {
            const lat = d?.location?.latitude
            const lng = d?.location?.longitude
            const isValid = Number.isFinite(lat) && Number.isFinite(lng)
            if (!isValid) return

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

    return (
        <ThemedView style={styles.container}>
            <View style={styles.mapWrapper}>
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