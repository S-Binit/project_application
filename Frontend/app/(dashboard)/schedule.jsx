import React, { useState, useEffect } from 'react'
import { StyleSheet, View, ScrollView, Image, ActivityIndicator, RefreshControl, TouchableOpacity, Modal, StatusBar, Platform } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

import Spacer from "../../components/Spacer"
import ThemedText from "../../components/ThemedText"
import ThemedView from "../../components/ThemedView"
import { API_BASE } from '../../constants/API'

const Schedule = () => {
    const router = useRouter()
    const [schedules, setSchedules] = useState([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [fullScreenImage, setFullScreenImage] = useState(null)

    const fetchSchedule = async () => {
        try {
            const response = await fetch(`${API_BASE}/schedule`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            })

            const data = await response.json()

            if (data.success) {
                setSchedules(data.schedules || [])
            } else {
                setSchedules([])
            }
        } catch (error) {
            console.error('Fetch schedule error:', error)
            setSchedules([])
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    useEffect(() => {
        fetchSchedule()
    }, [])

    const onRefresh = () => {
        setRefreshing(true)
        fetchSchedule()
    }

    return (
        <View style={styles.container}>
            {/* Fixed Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.push('/(dashboard)/news')}>
                    <Ionicons name="arrow-back" size={28} color="#000" />
                </TouchableOpacity>
                <ThemedText style={styles.headerTitle}>
                    Schedule
                </ThemedText>
                <View style={{ width: 28 }} />
            </View>

            {/* Scrollable Content */}
            <View style={styles.body}>
                <ScrollView 
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={['#4CAF50']}
                            tintColor="#4CAF50"
                        />
                    }>
                    
                    <Spacer height={20} />
                    
                    {loading ? (
                        <View style={styles.centerContainer}>
                            <ActivityIndicator size="large" color="#4CAF50" />
                            <Spacer height={10} />
                            <ThemedText style={styles.loadingText}>Loading schedule...</ThemedText>
                        </View>
                    ) : schedules.length > 0 ? (
                        <View style={styles.scheduleContainer}>
                            {schedules.map((schedule, index) => (
                                <View key={schedule._id}>
                                    {index > 0 && <Spacer height={20} />}
                                    <View style={styles.scheduleCard}>
                                        <TouchableOpacity onPress={() => setFullScreenImage(schedule.imageUrl)}>
                                            <Image 
                                                source={{ uri: schedule.imageUrl }} 
                                                style={styles.scheduleImage} 
                                                resizeMode="contain"
                                            />
                                        </TouchableOpacity>
                                        {schedule.description && (
                                            <>
                                                <Spacer height={15} />
                                                <ThemedText style={styles.description}>
                                                    {schedule.description}
                                                </ThemedText>
                                            </>
                                        )}
                                        <Spacer height={10} />
                                        <ThemedText style={styles.uploadDate}>
                                            Updated: {new Date(schedule.createdAt).toLocaleDateString()}
                                        </ThemedText>
                                    </View>
                                </View>
                            ))}
                        </View>
                    ) : (
                        <View style={styles.centerContainer}>
                            <ThemedText style={styles.emptyText}>No schedule available</ThemedText>
                            <Spacer height={10} />
                            <ThemedText style={styles.emptySubText}>
                                Pull down to refresh
                            </ThemedText>
                        </View>
                    )}
                </ScrollView>
            </View>

            {/* Full Screen Image Modal */}
            <Modal
                visible={fullScreenImage !== null}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setFullScreenImage(null)}>
                <View style={styles.fullScreenModal}>
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={() => setFullScreenImage(null)}>
                        <Ionicons name="close" size={32} color="#fff" />
                    </TouchableOpacity>
                    {fullScreenImage && (
                        <Image
                            source={{ uri: fullScreenImage }}
                            style={styles.fullScreenImage}
                            resizeMode="contain"
                        />
                    )}
                </View>
            </Modal>
        </View>
    )
}

const styles = StyleSheet.create({
    container:{
        flex: 1,
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
    body: {
        flex: 1,
        backgroundColor: '#f0f7f5ff',
    },
    scrollView: {
        flex: 1,
        backgroundColor: '#f0f7f5ff',
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    scheduleContainer: {
        flex: 1,
    },
    scheduleCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    scheduleImage: {
        width: '100%',
        height: 400,
        borderRadius: 8,
        backgroundColor: '#f0f0f0',
    },
    description: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    uploadDate: {
        fontSize: 12,
        color: '#999',
    },
    loadingText: {
        fontSize: 16,
        color: '#666',
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
    },
    emptySubText: {
        fontSize: 14,
        color: '#ccc',
    },
    fullScreenModal: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullScreenImage: {
        width: '100%',
        height: '100%',
    },
    closeButton: {
        position: 'absolute',
        top: 40,
        right: 20,
        zIndex: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 20,
        padding: 8,
    },
})

export default Schedule
