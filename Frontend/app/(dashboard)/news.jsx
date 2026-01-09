import {StyleSheet, View, ScrollView, RefreshControl, ActivityIndicator, Image} from 'react-native'
import { useCallback, useState, useEffect } from 'react';
import axios from 'axios';

import Spacer from "../../components/Spacer"
import ThemedText from "../../components/ThemedText"
import ThemedView from "../../components/ThemedView"
import { NEWS_API_URL, NEWS_PARAMS } from '../../constants/NewsAPI';

const News1 = () => {
    const [refreshing, setRefreshing] = useState(false);
    const [newsData, setNewsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch news from Newsdata.io
    const fetchNews = useCallback(async (isRefreshing = false) => {
        try {
            setError(null);
            if (!isRefreshing) {
                setLoading(true);
            }
            console.log('Fetching news...');
            console.log('Timestamp:', new Date().toISOString());
            
            const response = await axios.get(NEWS_API_URL, { params: NEWS_PARAMS });
            
            console.log('API Response status:', response.status);
            console.log('Number of results:', response.data?.results?.length || 0);
            
            if (response.data && response.data.results) {
                setNewsData(response.data.results);
            } else {
                setNewsData([]);
            }
        } catch (err) {
            console.error('Error fetching news:', err);
            console.error('Error details:', err.response?.data || err.message);
            setError('Failed to load news. Please try again.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    // Fetch news on component mount
    useEffect(() => {
        fetchNews();
    }, [fetchNews]);

    const onRefresh = useCallback(() => {
        console.log('Refresh triggered');
        setRefreshing(true);
        fetchNews(true);
    }, [fetchNews]);

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
                    bounces={true}
                    alwaysBounceVertical={true}
                    overScrollMode="always"
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor="#4CAF50"
                            colors={["#4CAF50"]}
                        />
                    }>
                    
                    {/* Loading State */}
                    {loading && (
                        <View style={styles.centerContainer}>
                            <ActivityIndicator size="large" color="#4CAF50" />
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
                        <View key={article.article_id || index} style={styles.newsCard}>
                            {/* News Image - Top Half */}
                            {article.image_url ? (
                                <Image 
                                    source={{ uri: article.image_url }}
                                    style={styles.newsImage}
                                    resizeMode="cover"
                                />
                            ) : (
                                <View style={styles.noImageContainer}>
                                    <ThemedText style={styles.noImageText}>No Image</ThemedText>
                                </View>
                            )}
                            
                            {/* News Text - Bottom Half */}
                            <View style={styles.newsTextContainer}>
                                <ThemedText style={styles.newsTitle}>
                                    {article.title || 'No title'}
                                </ThemedText>
                                <Spacer/>
                                <ThemedText style={styles.newsDescription}>
                                    {article.description || article.content || 'No description available'}
                                </ThemedText>
                                {article.pubDate && (
                                    <ThemedText style={styles.newsDate}>
                                        {new Date(article.pubDate).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                    </ThemedText>
                                )}
                            </View>
                        </View>
                    ))}

                    {/* No News State */}
                    {!loading && !error && newsData.length === 0 && (
                        <View style={styles.centerContainer}>
                            <ThemedText style={styles.noNewsText}>No news available</ThemedText>
                        </View>
                    )}

                </ScrollView>
            </ThemedView>
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
    newsCard: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        marginBottom: 16,
        overflow: 'hidden',
        minHeight: 300,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    newsImage: {
        width: '100%',
        height: 180,
        backgroundColor: '#f0f0f0',
    },
    noImageContainer: {
        width: '100%',
        height: 180,
        backgroundColor: '#e0e0e0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    noImageText: {
        fontSize: 16,
        color: '#999',
    },
    newsTextContainer: {
        padding: 16,
    },
    newsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    newsDescription: {
        fontSize: 14,
        lineHeight: 20,
        color: '#666',
    },
    newsDate: {
        fontSize: 12,
        color: '#999',
        marginTop: 8,
        fontStyle: 'italic',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
    errorText: {
        fontSize: 16,
        color: '#D32F2F',
        textAlign: 'center',
    },
    noNewsText: {
        fontSize: 16,
        color: '#999',
        textAlign: 'center',
    },
    newsItem: {
        fontSize: 16,
        textAlign: 'center',
    },
})