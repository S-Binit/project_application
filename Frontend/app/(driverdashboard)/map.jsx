import AsyncStorage from '@react-native-async-storage/async-storage'
import {useCallback, useEffect, useRef, useState} from 'react'
import {StyleSheet, View, TextInput, ScrollView, TouchableOpacity, Modal, FlatList} from 'react-native'
import Constants from 'expo-constants'
import MapView, {Marker, UrlTile, Polyline} from 'react-native-maps'
import * as Location from 'expo-location'

import ThemedButton from "../../components/ThemedButton"
import ThemedText from "../../components/ThemedText"
import ThemedViewDriver from "../../components/ThemedViewDriver"
import {LOCATION_URL, API_BASE} from "../../constants/API"

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

// Real-time update intervals
const LOCATION_UPDATE_INTERVAL = 1000 // 1 second
const LOCATION_DISTANCE_INTERVAL = 5 // 5 meters

const Map2 = () => {
    const [region, setRegion] = useState(DEFAULT_REGION)
    const [status, setStatus] = useState('requesting')
    const [isSharing, setIsSharing] = useState(false)
    const [shareError, setShareError] = useState(null)
    const [initialCenter, setInitialCenter] = useState(true)
    const [showDestinationModal, setShowDestinationModal] = useState(false)
    const [destination, setDestination] = useState('')
    const [destinationCoords, setDestinationCoords] = useState(null)
    const [routeCoordinates, setRouteCoordinates] = useState([])
    const [savedRoute, setSavedRoute] = useState(null)
    const [suggestions, setSuggestions] = useState([])
    const [loadingSuggestions, setLoadingSuggestions] = useState(false)
    const watcherRef = useRef(null)
    const mapRef = useRef(null)
    const suggestionTimeoutRef = useRef(null)

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

    const fetchSuggestions = async (query) => {
        if (!query.trim() || query.length < 2) {
            setSuggestions([])
            return
        }
        try {
            setLoadingSuggestions(true)
            const response = await fetch(`${API_BASE}/route/geocode?location=${encodeURIComponent(query)}`)
            const data = await response.json()
            if (data.success && Array.isArray(data.locations) && data.locations.length > 0) {
                setSuggestions(data.locations.map((loc) => ({
                    id: loc.id || loc.name,
                    name: loc.name,
                    latitude: loc.latitude,
                    longitude: loc.longitude,
                })))
            } else {
                setSuggestions([])
            }
            setLoadingSuggestions(false)
        } catch (error) {
            setSuggestions([])
            setLoadingSuggestions(false)
        }
    }

    const handleDestinationChange = (text) => {
        setDestination(text)
        if (suggestionTimeoutRef.current) clearTimeout(suggestionTimeoutRef.current)
        suggestionTimeoutRef.current = setTimeout(() => fetchSuggestions(text), 300)
    }

    const selectSuggestion = (suggestion) => {
        setDestination(suggestion.name)
        setDestinationCoords(suggestion)
        setSuggestions([])
        setShowDestinationModal(false)
        setShareError(null)
        setTimeout(() => generateRoute(suggestion, region), 500)
    }

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
                        
                        // Auto-center map on driver's location when first loaded
                        if (initialCenter) {
                            setTimeout(() => {
                                if (mapRef.current) {
                                    mapRef.current.animateToRegion(nextRegion, 1000)
                                }
                            }, 500)
                            setInitialCenter(false)
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

    // Generate route using backend API
    const generateRoute = async (destination, startCoords) => {
        if (!startCoords || !destination) {
            console.log('Missing coordinates', { startCoords, destination })
            return
        }

        try {
            const url = `${API_BASE}/route/calculate?startLat=${startCoords.latitude}&startLon=${startCoords.longitude}&endLat=${destination.latitude}&endLon=${destination.longitude}`
            console.log('Fetching route from:', url)
            
            const response = await fetch(url)
            const data = await response.json()
            
            console.log('Route response:', data)

            if (data.success && data.route?.coordinates && data.route.coordinates.length > 0) {
                setRouteCoordinates(data.route.coordinates)
                setSavedRoute(data.route.coordinates)
                setShareError(null)
                
                // Fit map to route
                if (mapRef.current) {
                    setTimeout(() => {
                        mapRef.current.fitToCoordinates(data.route.coordinates, {
                            edgePadding: { top: 100, right: 100, bottom: 100, left: 100 },
                            animated: true,
                        })
                    }, 500)
                }
            } else {
                setShareError(data.message || 'Could not calculate route')
            }
        } catch (error) {
            console.error('Route error:', error)
            setShareError('Failed to fetch route: ' + error.message)
        }
    }

    const handleDestinationSubmit = async () => {
        if (!destination.trim()) {
            setShareError('Enter a destination')
            return
        }

        try {
            const url = `${API_BASE}/route/geocode?location=${encodeURIComponent(destination)}`
            console.log('Geocoding:', url)
            
            const response = await fetch(url)
            const data = await response.json()
            
            console.log('Geocode response:', data)

            const firstLocation = data?.locations?.[0]
            if (data.success && firstLocation) {
                setDestinationCoords(firstLocation)
                setShowDestinationModal(false)
                setShareError(null)
                // Generate route with the destination coordinates we just received
                setTimeout(() => generateRoute(firstLocation, region), 500)
            } else {
                setShareError(data.message || 'Location not found')
            }
        } catch (error) {
            console.error('Geocoding error:', error)
            setShareError('Failed to find location: ' + error.message)
        }
    }

    const toggleSharing = async () => {
        const next = !isSharing
        if (next && !hasLocation) {
            setShareError('Waiting for GPS lock before sharing...')
            return
        }

        if (!next) {
            // Tell backend sharing stopped
            if (region && region.latitude && region.longitude) {
                await sendLocationToServer(region, false)
            }
            setIsSharing(false)
            setSavedRoute(null)
            setRouteCoordinates([])
            setDestinationCoords(null)
            setDestination('')
            return
        }

        // Show destination selection (don't start sharing yet)
        if (next) {
            setShowDestinationModal(true)
        }
    }

    const confirmAndShare = async () => {
        if (!savedRoute) {
            setShareError('Please set a route first')
            return
        }

        if (!hasLocation) {
            setShareError('Waiting for GPS lock before sharing...')
            return
        }

        if (region && region.latitude && region.longitude) {
            setIsSharing(true)
            setShareError(null)
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
                    tracksViewChanges={false}
                    zoomEnabled={true}
                    rotateEnabled={true}
                    pitchEnabled={true}
                    scrollEnabled={true}
                    mapType="none"
                >
                    {/* OpenStreetMap base tiles */}
                    <UrlTile
                        urlTemplate={mapTileUrl}
                        maximumZ={19}
                        flipY={false}
                        userAgent={mapTileUserAgent}
                    />
                    {/* Route polyline */}
                    {routeCoordinates.length > 0 && (
                        <Polyline
                            coordinates={routeCoordinates}
                            strokeColor="#1D9BF0"
                            strokeWidth={4}
                            lineDashPattern={[10, 5]}
                        />
                    )}
                    {hasLocation && (
                        <Marker
                            coordinate={region}
                            title="Driver (you)"
                            description={`Live driver location${isSharing ? ' • SHARING' : ''}`}
                            pinColor={isSharing ? "#4CAF50" : "#FFA726"}
                            tracksViewChanges={false}
                        />
                    )}
                    {destinationCoords && (
                        <Marker
                            coordinate={destinationCoords}
                            title="Destination"
                            description={destination}
                            pinColor="#FF6B6B"
                            tracksViewChanges={false}
                        />
                    )}
                </MapView>

                {/* OSM attribution */}
                <View style={styles.attribution} pointerEvents="none">
                    <ThemedText style={styles.attrText}>© OpenStreetMap contributors</ThemedText>
                </View>

                {/* Destination Modal */}
                <Modal
                    visible={showDestinationModal}
                    transparent
                    animationType="slide"
                    onRequestClose={() => {
                        setShowDestinationModal(false)
                        setIsSharing(false)
                    }}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <ThemedText style={styles.modalTitle}>Enter Destination</ThemedText>
                            <TextInput
                                style={styles.destinationInput}
                                placeholder="Enter destination address or location"
                                placeholderTextColor="#999"
                                value={destination}
                                onChangeText={handleDestinationChange}
                                autoCorrect={false}
                                autoCapitalize="none"
                                returnKeyType="search"
                            />
                            {suggestions.length > 0 && (
                                <ScrollView style={styles.suggestionsContainer}>
                                    {suggestions.map((suggestion) => (
                                        <TouchableOpacity
                                            key={suggestion.id}
                                            style={styles.suggestionItem}
                                            onPress={() => selectSuggestion(suggestion)}
                                        >
                                            <ThemedText style={styles.suggestionText}>
                                                {suggestion.name}
                                            </ThemedText>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            )}
                            {loadingSuggestions && (
                                <ThemedText style={styles.loadingText}>Searching...</ThemedText>
                            )}
                            <View style={styles.modalActions}>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.cancelButton]}
                                    onPress={() => {
                                        setShowDestinationModal(false)
                                        setIsSharing(false)
                                    }}
                                >
                                    <ThemedText style={styles.modalButtonText}>Cancel</ThemedText>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.submitButton]}
                                    onPress={handleDestinationSubmit}
                                >
                                    <ThemedText style={styles.modalButtonText}>Find Route</ThemedText>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>

                {/* Route confirmation and sharing */}
                <View style={styles.actions}>
                    {savedRoute && !isSharing && (
                        <ThemedButton onPress={confirmAndShare}>
                            <ThemedText style={styles.actionText}>✓ Confirm & Share Route</ThemedText>
                        </ThemedButton>
                    )}
                    {!savedRoute && (
                        <ThemedButton onPress={toggleSharing}>
                            <ThemedText style={styles.actionText}>
                                {isSharing ? 'Stop sharing location' : 'Share my location'}
                            </ThemedText>
                        </ThemedButton>
                    )}
                    {isSharing && savedRoute && (
                        <ThemedButton onPress={async () => {
                            // Tell backend to stop sharing
                            if (region && region.latitude && region.longitude) {
                                await sendLocationToServer(region, false)
                            }
                            setIsSharing(false)
                            setSavedRoute(null)
                            setRouteCoordinates([])
                            setDestinationCoords(null)
                            setDestination('')
                        }}>
                            <ThemedText style={styles.actionText}>Stop Sharing</ThemedText>
                        </ThemedButton>
                    )}
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#1a1a1a',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        padding: 20,
        paddingBottom: 40,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#fff',
    },
    destinationInput: {
        borderWidth: 1,
        borderColor: '#1D9BF0',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        color: '#fff',
        backgroundColor: '#0a0a0a',
        fontSize: 16,
    },
    modalActions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 16,
    },
    modalButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButton: {
        backgroundColor: '#666',
    },
    submitButton: {
        backgroundColor: '#1D9BF0',
    },
    modalButtonText: {
        fontWeight: 'bold',
        fontSize: 14,
        color: '#fff',
    },
    suggestionsContainer: {
        maxHeight: 150,
        backgroundColor: '#0a0a0a',
        borderRadius: 8,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#333',
    },
    suggestionItem: {
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    suggestionText: {
        color: '#1D9BF0',
        fontSize: 14,
    },
    loadingText: {
        color: '#999',
        fontSize: 12,
        fontStyle: 'italic',
        marginBottom: 8,
    },
})