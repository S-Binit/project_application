import AsyncStorage from '@react-native-async-storage/async-storage'
import {useCallback, useEffect, useRef, useState} from 'react'
import {StyleSheet, View} from 'react-native'
import MapView, {Marker} from 'react-native-maps'
import * as Location from 'expo-location'

import ThemedButton from "../../components/ThemedButton"
import ThemedText from "../../components/ThemedText"
import ThemedViewDriver from "../../components/ThemedViewDriver"
import {LOCATION_URL} from "../../constants/API"

const DEFAULT_REGION = {
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
}

// Real-time update intervals
const LOCATION_UPDATE_INTERVAL = 1000 // 1 second
const LOCATION_DISTANCE_INTERVAL = 5 // 5 meters

const Map2 = () => {
    const [region, setRegion] = useState(DEFAULT_REGION)
    const [status, setStatus] = useState('requesting')
    const [isSharing, setIsSharing] = useState(false)
    const [shareError, setShareError] = useState(null)
    const [initialCenter, setInitialCenter] = useState(true)
    const watcherRef = useRef(null)
    const mapRef = useRef(null)

    const sendLocationToServer = useCallback(async (coords, sharingFlag) => {
        try {
            const token = await AsyncStorage.getItem('token')
            if (!token) {
                setShareError('Missing driver token. Please log in again.')
                return
            }
            await fetch(`${LOCATION_URL}/share`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    latitude: coords.latitude,
                    longitude: coords.longitude,
                    sharing: sharingFlag,
                }),
            })
            setShareError(null)
        } catch (_err) {
            setShareError('Unable to share location right now.')
        }
    }, [])

    useEffect(() => {
        let isMounted = true

        const startLocationUpdates = async () => {
            try {
                const {status: permissionStatus} = await Location.requestForegroundPermissionsAsync()
                if (!isMounted) return

                if (permissionStatus !== 'granted') {
                    setStatus('denied')
                    return
                }

                setStatus('pending')
                watcherRef.current = await Location.watchPositionAsync(
                    {
                        accuracy: Location.Accuracy.High, // Higher accuracy for drivers
                        timeInterval: LOCATION_UPDATE_INTERVAL,
                        distanceInterval: LOCATION_DISTANCE_INTERVAL,
                    },
                    async ({coords}) => {
                        if (!isMounted) return

                        const nextRegion = {
                            ...DEFAULT_REGION,
                            latitude: coords.latitude,
                            longitude: coords.longitude,
                        }
                        setRegion(nextRegion)
                        setStatus('ready')
                        
                        // Center map only on first location lock
                        if (initialCenter && mapRef.current) {
                            setTimeout(() => {
                                mapRef.current?.animateToRegion(nextRegion, 1000)
                                setInitialCenter(false)
                            }, 300)
                        }
                        
                        // Send location updates in real-time when sharing
                        if (isSharing) {
                            await sendLocationToServer(coords, true)
                        }
                    }
                )
            } catch (_err) {
                if (!isMounted) return
                setStatus('error')
            }
        }

        startLocationUpdates()
        return () => {
            isMounted = false
            watcherRef.current?.remove?.()
        }
    }, [isSharing, sendLocationToServer])

    const hasLocation = status === 'ready'

    const toggleSharing = async () => {
        const next = !isSharing
        if (next && !hasLocation) {
            setShareError('Waiting for GPS lock before sharing...')
            return
        }

        setIsSharing(next)
        if (!next) {
            // Tell backend sharing stopped
            if (region && region.latitude && region.longitude) {
                await sendLocationToServer(region, false)
            }
            return
        }

        // If we already have a location, send immediately
        if (region && region.latitude && region.longitude) {
            await sendLocationToServer(region, true)
        }
    }

    return (
        <ThemedViewDriver style={styles.container}>
            <View style={styles.mapWrapper}>
                <MapView
                    ref={mapRef}
                    style={styles.map}
                    initialRegion={DEFAULT_REGION}
                    showsUserLocation
                    showsMyLocationButton
                    loadingEnabled
                    // Performance optimizations
                    tracksViewChanges={false}
                    zoomEnabled={true}
                    rotateEnabled={true}
                    pitchEnabled={true}
                    scrollEnabled={true}
                    provider="google"
                >
                    {hasLocation && (
                        <Marker
                            coordinate={region}
                            title="Driver (you)"
                            description={`Live driver location${isSharing ? ' • SHARING' : ''}`}
                            pinColor={isSharing ? "#4CAF50" : "#FFA726"}
                            tracksViewChanges={false}
                        />
                    )}
                </MapView>
                <View style={styles.actions}>
                    <ThemedButton onPress={toggleSharing}>
                        <ThemedText style={styles.actionText}>
                            {isSharing ? 'Stop sharing location' : 'Share my location'}
                        </ThemedText>
                    </ThemedButton>
                    {shareError ? (
                        <ThemedText style={styles.errorText}>{shareError}</ThemedText>
                    ) : null}
                </View>
            </View>
        </ThemedViewDriver>
    )
}

export default Map2

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
    actions: {
        position: 'absolute',
        bottom: 32,
        left: 0,
        right: 0,
        alignItems: 'center',
        gap: 8,
    },
    actionText: {
        fontWeight: 'bold',
    },
    errorText: {
        color: '#d32f2f',
        marginTop: 6,
    },
})