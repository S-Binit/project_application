import {useEffect, useMemo, useRef, useState} from 'react'
import {StyleSheet, View} from 'react-native'
import MapView, {Marker} from 'react-native-maps'
import * as Location from 'expo-location'

import ThemedView from "../../components/ThemedView"
import {LOCATION_URL} from "../../constants/API"

const DEFAULT_REGION = {
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
}

const Map1 = () => {
    const [region, setRegion] = useState(DEFAULT_REGION)
    const [drivers, setDrivers] = useState([])
    const [userLocation, setUserLocation] = useState(null)
    const [error, setError] = useState(null)
    const mapRef = useRef(null)

    useEffect(() => {
        let isMounted = true

        const loadDriverLocation = async () => {
            try {
                const res = await fetch(`${LOCATION_URL}/shared`)
                const data = await res.json()
                if (!isMounted) return

                if (data?.sharing && Array.isArray(data.drivers)) {
                    setDrivers(data.drivers)
                    const first = data.drivers[0]?.location
                    if (first?.latitude && first?.longitude) {
                        setRegion(curr => ({
                            ...curr,
                            latitude: first.latitude,
                            longitude: first.longitude,
                        }))
                    }
                    setError(null)
                } else {
                    setDrivers([])
                }
            } catch (_err) {
                if (!isMounted) return
                setError('Unable to load driver location right now.')
            }
        }

        loadDriverLocation()
        const intervalId = setInterval(loadDriverLocation, 5000)

        return () => {
            isMounted = false
            clearInterval(intervalId)
        }
    }, [])

    // Fetch user device location for own marker
    useEffect(() => {
        let isMounted = true

        const loadUserLocation = async () => {
            try {
                const {status} = await Location.requestForegroundPermissionsAsync()
                if (!isMounted) return
                if (status !== 'granted') return

                const {coords} = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.Balanced,
                })
                if (!isMounted) return

                const coord = {latitude: coords.latitude, longitude: coords.longitude}
                setUserLocation(coord)

                // If we don't yet have a driver location, center on the user
                setRegion(current => ({
                    ...current,
                    latitude: coord.latitude,
                    longitude: coord.longitude,
                }))
            } catch (_err) {
                // ignore user location errors silently
            }
        }

        loadUserLocation()
        return () => {
            isMounted = false
        }
    }, [])

    // Autofit to markers when they change
    useEffect(() => {
        if (!mapRef.current) return
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

        mapRef.current.fitToCoordinates(coords, {
            edgePadding: { top: 80, right: 80, bottom: 80, left: 80 },
            animated: true,
        })
    }, [drivers, userLocation])

    const hasDriver = drivers.length > 0
    const driverMarkers = useMemo(() => drivers.map(d => ({
        key: d.driverId,
        coordinate: d.location,
        title: d.name ? `Driver: ${d.name}` : 'Driver',
        updatedAt: d.updatedAt,
    })), [drivers])

    return (
        <ThemedView style={styles.container}>
            <View style={styles.mapWrapper}>
                <MapView
                    ref={mapRef}
                    style={styles.map}
                    initialRegion={region}
                    showsMyLocationButton
                    loadingEnabled
                >
                    {driverMarkers.map(marker => (
                        <Marker
                            key={marker.key}
                            coordinate={marker.coordinate}
                            title={marker.title}
                            description="Live driver location"
                            pinColor="#d32f2f"
                        />
                    ))}
                    {userLocation && (
                        <Marker
                            coordinate={userLocation}
                            title="You"
                            description="Your location"
                            pinColor="#1D9BF0"
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