import {StyleSheet, View, ScrollView, RefreshControl} from 'react-native'
import { useCallback, useState } from 'react';

import Spacer from "../../components/Spacer"
import ThemedText from "../../components/ThemedText"
import ThemedView from "../../components/ThemedView"

const News1 = () => {
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        // Simulate refresh work; replace with real data fetch if needed
        setTimeout(() => setRefreshing(false), 800);
    }, []);

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
                    
                    {/* Add news content here */}
                    {[...Array(5)].map((_, i) => (
                        <View key={i} style={styles.newsCard}>
                            <ThemedText style={styles.newsTitle}>News Article {i + 1}</ThemedText>
                            <Spacer/>
                            <ThemedText style={styles.newsDescription}>
                                This is a brief description of the news article. It provides a summary of what the article is about.
                            </ThemedText>
                        </View>
                    ))}

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
        padding: 16,
        marginBottom: 16,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    newsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    newsDescription: {
        fontSize: 14,
        lineHeight: 20,
    },
    newsItem: {
        fontSize: 16,
        textAlign: 'center',
    },
})