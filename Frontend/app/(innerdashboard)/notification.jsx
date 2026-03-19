import {StyleSheet, View, ScrollView, RefreshControl, TouchableOpacity} from 'react-native'
import { useCallback, useState } from 'react';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';

import Spacer from "../../components/Spacer"
import ThemedText from "../../components/ThemedText"
import ThemedView from "../../components/ThemedView"
import ThemedIonicons from '../../components/ThemedIonIcons';
import { getUserNotifications } from '../../utils/notifications';

const Notification1 = () => {
    const router = useRouter();
    const [refreshing, setRefreshing] = useState(false);
    const [notifications, setNotifications] = useState([]);

    const loadNotifications = useCallback(async () => {
        const items = await getUserNotifications();
        setNotifications(items);
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadNotifications();
        }, [loadNotifications])
    );

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadNotifications().finally(() => setRefreshing(false));
    }, [loadNotifications]);

    return (
        <View style={styles.container}>
            {/* Fixed Header */}
            <ThemedView style={styles.header} safe={true}>
                <ThemedText title={true} style={styles.heading}>
                    Notifications
                </ThemedText>

                <TouchableOpacity
                        onPress={()=>{
                            router.back();
                        }}
                        style={styles.backButton}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                        <ThemedIonicons name="chevron-back" size={26}/>
                </TouchableOpacity>

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
                    
                    {notifications.length === 0 && (
                        <View style={styles.emptyCard}>
                            <ThemedText style={styles.emptyTitle}>No notifications yet</ThemedText>
                            <ThemedText style={styles.emptyDesc}>You will see an alert here when a driver is near your area.</ThemedText>
                        </View>
                    )}

                    {notifications.map((item) => (
                        <View key={item.id} style={styles.newsCard}>
                            <ThemedText style={styles.newsTitle}>{item.title || 'Notification'}</ThemedText>
                            <Spacer height={6}/>
                            <ThemedText style={styles.newsDescription}>{item.message}</ThemedText>
                            <Spacer height={6}/>
                            <ThemedText style={styles.newsItem}>
                                {item.createdAt ? new Date(item.createdAt).toLocaleString() : ''}
                            </ThemedText>
                        </View>
                    ))}

                </ScrollView>
            </ThemedView>
        </View>
    )
}

export default Notification1
const styles = StyleSheet.create({
    container:{
        flex: 1,
    },
    body: {
        flex: 1,
        backgroundColor: '#f0f7f5ff',
    },
    header: {
        height: 100,
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
        paddingHorizontal: 30,
        paddingBottom: 40,
    },
    newsCard: {
        backgroundColor: '#ffffff',
        borderRadius: 18,
        padding: 12,
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
        color: '#3a3a3a',
    },
    newsItem: {
        fontSize: 12,
        color: '#777',
    },
    emptyCard: {
        backgroundColor: '#ffffff',
        borderRadius: 18,
        padding: 18,
        alignItems: 'center',
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    emptyDesc: {
        marginTop: 8,
        fontSize: 14,
        textAlign: 'center',
        color: '#5f5f5f',
    },
    backButton:{
        padding: 6,
        borderRadius: 20,
        backgroundColor: 'transparent',
        height: 40,
        width: 60,
        justifyContent: 'center',
        alignItems: 'center',
        alignContent: 'center',
        marginTop: -35,
    },
})