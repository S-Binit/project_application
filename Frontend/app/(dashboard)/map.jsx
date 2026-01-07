import {useEffect, useMemo, useRef, useState} from 'react'
import {StyleSheet, View, Animated} from 'react-native'
import MapView, {Marker, AnimatedRegion} from 'react-native-maps'
import * as Location from 'expo-location'

import ThemedView from "../../components/ThemedView"
import {LOCATION_URL} from "../../constants/API"

const DEFAULT_REGION = {
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.6,
    longitudeDelta: 0.6,
}

// Faster update interval for real-time tracking
const UPDATE_INTERVAL = 1500 // 1.5 seconds instead of 5 seconds

const Map1 = () => {
    const [region, setRegion] = useState(DEFAULT_REGION)
    const [drivers, setDrivers] = useState([])
    const [userLocation, setUserLocation] = useState(null)
    const [error, setError] = useState(null)
    const [initialLoad, setInitialLoad] = useState(true)
    const mapRef = useRef(null)
    const locationWatcherRef = useRef(null)

    // Real-time driver location fetching with faster updates
    useEffect(() => {
        let isMounted = true
        let fetchCount = 0

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
                        // Only update if data actually changed
                        if (JSON.stringify(prev) === JSON.stringify(data.drivers)) {
                            return prev
                        }
                        return data.drivers
                    })
                    
                    // Only auto-center on first load or when switching drivers
                    if (initialLoad && data.drivers.length > 0) {
                        const first = data.drivers[0]?.location
                        if (first?.latitude && first?.longitude) {
                            setRegion(curr => ({
                                ...curr,
                                latitude: first.latitude,
                                longitude: first.longitude,
                            }))
                            setInitialLoad(false)
                        }
                    }
                    setError(null)
                } else {
                    setDrivers([])
                }
                
                fetchCount++
            } catch (_err) {
                if (!isMounted) return
                setError('Unable to load driver location right now.')
            }
        }

        // Load immediately
        loadDriverLocation()
        
        // Set up faster polling interval
        const intervalId = setInterval(loadDriverLocation, UPDATE_INTERVAL)

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

                        // Only center on user if no drivers present and first time
                        if (initialLoad && drivers.length === 0) {
                            setRegion(current => ({
                                ...current,
                                latitude: coord.latitude,
                                longitude: coord.longitude,
                            }))
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
    }, [drivers.length, initialLoad])

    // Auto-center map only once when markers are first loaded
    useEffect(() => {
        if (!mapRef.current || !initialLoad) return
        
        const coords = []
        drivers.forEach(d => {
            if (d.location?.latitude && d.location?.longitude) {
                coords.push({
                    latitude: d.location.latitude,
                    longitude: d.location.longitude,
                })
            }
        })
        if (userLocation) coords.push(userLocation)
        if (coords.length === 0) return

        // Center the map on markers once
        setTimeout(() => {
            if (mapRef.current) {
                mapRef.current.fitToCoordinates(coords, {
                    edgePadding: { top: 250, right: 250, bottom: 250, left: 250 },
                    animated: true,
                })
                setInitialLoad(false) // Disable future auto-centering
            }
        }, 500)
    }, [drivers.length, userLocation, initialLoad])

    const hasDriver = drivers.length > 0
    
    // Optimize marker rendering with useMemo and add timestamp info
    const driverMarkers = useMemo(() => drivers.map(d => {
        const lastUpdate = d.updatedAt ? new Date(d.updatedAt).toLocaleTimeString() : 'unknown'
        return {
            key: d.driverId,
            coordinate: d.location,
            title: d.name ? `Driver: ${d.name}` : 'Driver',
            description: `Live • Updated: ${lastUpdate}`,
            updatedAt: d.updatedAt,
        }
    }), [drivers])

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
                    mapType="standard"
                    // Enable native driver for smooth animations
                    provider="google"
                >
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
                    {userLocation && (
                        <Marker
                            coordinate={userLocation}
                            title="You"
                            description="Your live location"
                            pinColor="#1D9BF0"
                            tracksViewChanges={false}
                        />
                    )}
                </MapView>

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
})