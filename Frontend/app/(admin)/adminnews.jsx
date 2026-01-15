import { StyleSheet, View, ScrollView, RefreshControl, ActivityIndicator, Image, Pressable, Linking, Platform, StatusBar } from 'react-native'
import { useCallback, useState, useEffect } from 'react'
import axios from 'axios'

import Spacer from "../../components/Spacer"
import ThemedText from "../../components/ThemedText"
import ThemedView from "../../components/ThemedView"
import { NEWS_API_URL, NEWS_PARAMS } from '../../constants/NewsAPI'

const AdminNews = () => {
    const [refreshing, setRefreshing] = useState(false)
    const [newsData, setNewsData] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Fetch news from Newsdata.io
    const fetchNews = useCallback(async (isRefreshing = false) => {
        try {
            setError(null)
            if (!isRefreshing) {
                setLoading(true)
            }
            console.log('Fetching news...')
            console.log('Timestamp:', new Date().toISOString())
            
            const response = await axios.get(NEWS_API_URL, { params: NEWS_PARAMS })
            
            console.log('API Response status:', response.status)
            console.log('Number of results:', response.data?.results?.length || 0)
            
            if (response.data && response.data.results) {
                setNewsData(response.data.results)
            } else {
                setNewsData([])
            }
        } catch (err) {
            console.error('Error fetching news:', err)
            console.error('Error details:', err.response?.data || err.message)
            setError('Failed to load news. Please try again.')
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }, [])

    // Fetch news on component mount
    useEffect(() => {
        fetchNews()
    }, [fetchNews])

    const onRefresh = useCallback(() => {
        console.log('Refresh triggered')
        setRefreshing(true)
        fetchNews(true)
    }, [fetchNews])

    return (
        <View style={styles.container}>
            {/* Fixed Header */}
            <ThemedView style={styles.header}>
                <ThemedText style={styles.heading}>
                    News & Updates
                </ThemedText>
                <ThemedText style={styles.subheading}>
                    Latest environmental and waste management news
                </ThemedText>
            </ThemedView>

            {/* Scrollable Content */}
            <ThemedView style={styles.body}>
                <ScrollView 
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    bounces={true}
                    alwaysBounceVertical={true}
                    overScrollMode="always"
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor="#2196F3"
                            colors={["#2196F3"]}
                        />
                    }>
                    
                    {/* Loading State */}
                    {loading && (
                        <View style={styles.centerContainer}>
                            <ActivityIndicator size="large" color="#2196F3" />
                            <ThemedText style={styles.loadingText}>Loading news...</ThemedText>
                        </View>
                    )}

                    {/* Error State */}
                    {error && !loading && (
                        <View style={styles.centerContainer}>
                            <ThemedText style={styles.errorText}>{error}</ThemedText>
                        </View>
                    )}

                    {/* News Content */}
                    {!loading && !error && newsData.length > 0 && newsData.map((article, index) => (
                        <Pressable 
                            key={index} 
                            style={styles.newsCard}
                            onPress={() => {
                                if (article.link) {
                                    Linking.openURL(article.link)
                                }
                            }}>
                            
                            {article.image_url && (
                                <Image
                                    source={{ uri: article.image_url }}
                                    style={styles.newsImage}
                                />
                            )}

                            <View style={styles.newsContent}>
                                <View style={styles.newsHeader}>
                                    <ThemedText style={styles.newsSource}>
                                        {article.source_id?.charAt(0).toUpperCase() + article.source_id?.slice(1) || 'News'}
                                    </ThemedText>
                                    <ThemedText style={styles.newsDate}>
                                        {new Date(article.pubDate).toLocaleDateString()}
                                    </ThemedText>
                                </View>

                                <ThemedText 
                                    style={styles.newsTitle}
                                    numberOfLines={3}>
                                    {article.title}
                                </ThemedText>

                                {article.description && (
                                    <>
                                        <Spacer height={8} />
                                        <ThemedText 
                                            style={styles.newsDescription}
                                            numberOfLines={2}>
                                            {article.description}
                                        </ThemedText>
                                    </>
                                )}

                                <Spacer height={10} />
                                <ThemedText style={styles.readMore}>
                                    Tap to read more →
                                </ThemedText>
                            </View>
                        </Pressable>
                    ))}

                    {/* Empty State */}
                    {!loading && !error && newsData.length === 0 && (
                        <View style={styles.centerContainer}>
                            <ThemedText style={styles.emptyText}>No news available</ThemedText>
                        </View>
                    )}
                </ScrollView>
            </ThemedView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fafafa',
    },
    header: {
        paddingHorizontal: 15,
        paddingVertical: 12,
        paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 10 : 10,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    heading: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 4,
    },
    subheading: {
        fontSize: 12,
        color: '#666',
    },
    body: {
        flex: 1,
        backgroundColor: '#fafafa',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 15,
        paddingVertical: 15,
    },
    newsCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    newsImage: {
        width: '100%',
        height: 200,
        backgroundColor: '#e0e0e0',
    },
    newsContent: {
        padding: 15,
    },
    newsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    newsSource: {
        fontSize: 12,
        fontWeight: '600',
        color: '#2196F3',
    },
    newsDate: {
        fontSize: 11,
        color: '#999',
    },
    newsTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        lineHeight: 22,
    },
    newsDescription: {
        fontSize: 13,
        color: '#666',
        lineHeight: 18,
    },
    readMore: {
        fontSize: 12,
        color: '#2196F3',
        fontWeight: '600',
    },
    centerContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
    },
    loadingText: {
        marginTop: 10,
        color: '#666',
    },
    errorText: {
        color: '#f44336',
        textAlign: 'center',
        fontSize: 14,
    },
    emptyText: {
        color: '#999',
        fontSize: 14,
    },
})

export default AdminNews
