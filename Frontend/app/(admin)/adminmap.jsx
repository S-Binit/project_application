import { useEffect, useRef, useState } from 'react'
import { StyleSheet, View, Animated, Platform, StatusBar } from 'react-native'
import Constants from 'expo-constants'
import MapView, { Marker, UrlTile } from 'react-native-maps'
import * as Location from 'expo-location'

import ThemedView from "../../components/ThemedView"
import ThemedText from "../../components/ThemedText"
import { LOCATION_URL } from "../../constants/API"

const TILE_URL = Constants?.expoConfig?.extra?.TILE_URL
const TILE_USER_AGENT = Constants?.expoConfig?.extra?.TILE_USER_AGENT

const mapTileUrl = TILE_URL || 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
const mapTileUserAgent = TILE_USER_AGENT || 'project-app/1.0 (contact: you@example.com)'

const DEFAULT_REGION = {
    latitude: 27.7172,
    longitude: 85.3240,
    latitudeDelta: 0.6,
    longitudeDelta: 0.6,
}

const UPDATE_INTERVAL = 1500

const AdminMap = () => {
    const [region, setRegion] = useState(DEFAULT_REGION)
    const [drivers, setDrivers] = useState([])
    const [error, setError] = useState(null)
    const mapRef = useRef(null)

    // Fetch driver locations
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
                    setError(null)
                } else {
                    setDrivers([])
                }
            } catch (_err) {
                if (!isMounted) return
                setError('Unable to load driver locations')
            }
        }

        loadDriverLocation()
        const intervalId = setInterval(loadDriverLocation, UPDATE_INTERVAL)

        return () => {
            isMounted = false
            clearInterval(intervalId)
        }
    }, [])

    return (
        <ThemedView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#2196F3" />
            
            {error && (
                <View style={styles.errorBanner}>
                    <ThemedText style={styles.errorText}>{error}</ThemedText>
                </View>
            )}

            <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={region}
                showsUserLocation={true}
                provider="google">

                <UrlTile
                    urlTemplate={mapTileUrl}
                    userAgent={mapTileUserAgent}
                    maximumZ={19}
                />

                {drivers.map((driver, index) => (
                    <Marker
                        key={index}
                        coordinate={{
                            latitude: driver.latitude,
                            longitude: driver.longitude,
                        }}
                        title={driver.name || 'Driver'}
                        description={`Vehicle: ${driver.vehicleNumber || 'N/A'}`}
                    />
                ))}
            </MapView>

            <View style={styles.infoBox}>
                <ThemedText style={styles.infoTitle}>Active Drivers</ThemedText>
                <ThemedText style={styles.infoCount}>{drivers.length}</ThemedText>
            </View>
        </ThemedView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    map: {
        flex: 1,
    },
    errorBanner: {
        backgroundColor: '#f44336',
        paddingVertical: 10,
        paddingHorizontal: 15,
    },
    errorText: {
        color: '#fff',
        fontSize: 12,
    },
    infoBox: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        backgroundColor: '#2196F3',
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3,
        elevation: 5,
    },
    infoTitle: {
        fontSize: 12,
        color: '#fff',
        opacity: 0.8,
    },
    infoCount: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginTop: 4,
    },
})

export default AdminMap
