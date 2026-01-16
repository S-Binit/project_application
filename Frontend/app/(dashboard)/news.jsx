import {StyleSheet, View, ScrollView, TouchableOpacity, Image, Modal, ActivityIndicator, RefreshControl} from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useState, useEffect } from 'react'
import { API_BASE } from '../../constants/API'

import Spacer from "../../components/Spacer"
import ThemedText from "../../components/ThemedText"
import ThemedView from "../../components/ThemedView"

const News1 = () => {
    const router = useRouter()
    const [newsList, setNewsList] = useState([])
    const [loading, setLoading] = useState(false)
    const [refreshing, setRefreshing] = useState(false)
    const [fullScreenImage, setFullScreenImage] = useState(null)

    const fetchNews = async () => {
        try {
            setLoading(true)
            const response = await fetch(`${API_BASE}/news`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            })

            const data = await response.json()

            if (data.success) {
                setNewsList(data.news || [])
            }
        } catch (error) {
            console.error('Fetch news error:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchNews()
    }, [])

    const onRefresh = async () => {
        setRefreshing(true)
        await fetchNews()
        setRefreshing(false)
    }

    return (
        <View style={styles.container}>
            {/* Fixed Header */}
            <ThemedView style={styles.header} safe={true}>
                <ThemedText title={true} style={styles.heading}>
                    News
                </ThemedText>
            </ThemedView>

            {/* Scrollable Content */}
            <ThemedView style={styles.body}>
                <ScrollView 
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }>
                    
                    <Spacer height={20} />
                    
                    {/* Schedule Button */}
                    <View style={styles.centerContainer}>
                        <TouchableOpacity
                            style={styles.scheduleButton}
                            onPress={() => router.push('/(dashboard)/schedule')}>
                            <Ionicons name="calendar-outline" size={24} color="#fff" />
                            <ThemedText style={styles.scheduleButtonText}>View Schedule</ThemedText>
                        </TouchableOpacity>
                    </View>

                    {/* News Section */}
                    {loading ? (
                        <View style={styles.centerContainer}>
                            <ActivityIndicator size="large" color="#4CAF50" />
                        </View>
                    ) : newsList.length > 0 ? (
                        <View style={styles.newsSection}>
                            <ThemedText style={styles.newsListTitle}>Latest News</ThemedText>
                            {newsList.map((news) => (
                                <View key={news._id} style={styles.newsCard}>
                                    {news.imageUrl && (
                                        <TouchableOpacity 
                                            activeOpacity={0.7}
                                            onPress={() => setFullScreenImage(news.imageUrl)}>
                                            <Image
                                                source={{ uri: news.imageUrl }}
                                                style={styles.newsImage}
                                            />
                                        </TouchableOpacity>
                                    )}
                                    <Spacer height={10} />
                                    <ThemedText style={styles.newsTitle}>{news.title}</ThemedText>
                                    <Spacer height={8} />
                                    <ThemedText style={styles.newsDescription}>{news.description}</ThemedText>
                                    <Spacer height={8} />
                                    <ThemedText style={styles.newsDate}>
                                        {news.uploadedByName && `Posted by ${news.uploadedByName}`}
                                        {news.createdAt && ` • ${new Date(news.createdAt).toLocaleDateString()}`}
                                    </ThemedText>
                                </View>
                            ))}
                        </View>
                    ) : (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="newspaper-outline" size={48} color="#999" />
                            <Spacer height={15} />
                            <ThemedText style={styles.emptyText}>No news available yet</ThemedText>
                        </View>
                    )}
                </ScrollView>
            </ThemedView>

            {/* Full Screen Image Modal */}
            <Modal
                visible={!!fullScreenImage}
                transparent={true}
                onRequestClose={() => setFullScreenImage(null)}>
                <View style={styles.fullScreenModal}>
                    <TouchableOpacity 
                        style={styles.closeButton}
                        onPress={() => setFullScreenImage(null)}>
                        <Ionicons name="close" size={30} color="#fff" />
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

export default News1

const styles = StyleSheet.create({
    container:{
        flex: 1,
    },
    body: {
        flex: 1,
        backgroundColor: '#f0f7f5ff',
    },
    header: {
        paddingBottom: 20,
        paddingHorizontal: 15,
        paddingVertical: 15,
        backgroundColor: 'inherit',
        borderBottomColor: 'rgba(0,0,0,0.1)',
        backgroundColor: '#f0f7f5ff',
    },
    heading:{
        paddingTop: 10,
        fontWeight: "bold",
        fontSize: 24,
        textAlign: "center",
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
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 20,
    },
    scheduleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#4CAF50',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 12,
        gap: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    scheduleButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    newsSection: {
        marginTop: 20,
        marginBottom: 20,
    },
    newsListTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    newsCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    newsImage: {
        width: '100%',
        height: 200,
        borderRadius: 8,
        backgroundColor: '#f0f0f0',
    },
    newsTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    newsDescription: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    newsDate: {
        fontSize: 12,
        color: '#999',
    },
    emptyContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
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