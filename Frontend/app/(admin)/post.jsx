import {StyleSheet, View, ScrollView, TouchableOpacity, Alert, TextInput, Image, ActivityIndicator, Modal} from 'react-native'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as ImagePicker from 'expo-image-picker'

import Spacer from "../../components/Spacer"
import ThemedText from "../../components/ThemedText"
import ThemedView from "../../components/ThemedView"
import { API_BASE } from '../../constants/API'

const News1 = () => {
    const router = useRouter()
    const [newsList, setNewsList] = useState([])
    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [showForm, setShowForm] = useState(false)
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [selectedImage, setSelectedImage] = useState(null)
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

    const pickImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync()

        if (permissionResult.granted === false) {
            Alert.alert('Permission Required', 'Permission to access gallery is required!')
            return
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.8,
        })

        if (!result.canceled && result.assets[0]) {
            setSelectedImage(result.assets[0].uri)
        }
    }

    const uploadNews = async () => {
        if (!title.trim() || !description.trim()) {
            Alert.alert('Error', 'Title and description are required')
            return
        }

        setUploading(true)
        try {
            const token = await AsyncStorage.getItem('token')

            const response = await fetch(`${API_BASE}/news/upload`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    title: title.trim(),
                    description: description.trim(),
                    imageUrl: selectedImage || '',
                    imagePublicId: selectedImage ? `news_${Date.now()}` : '',
                }),
            })

            const data = await response.json()

            if (data.success) {
                Alert.alert('Success', 'News posted successfully')
                setTitle('')
                setDescription('')
                setSelectedImage(null)
                setShowForm(false)
                fetchNews()
            } else {
                Alert.alert('Error', data.message || 'Failed to post news')
            }
        } catch (error) {
            console.error('Upload news error:', error)
            Alert.alert('Error', 'Cannot connect to server')
        } finally {
            setUploading(false)
        }
    }

    const deleteNews = (newsId) => {
        Alert.alert(
            'Delete News',
            'Are you sure you want to delete this news?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const token = await AsyncStorage.getItem('token')
                            const response = await fetch(`${API_BASE}/news/${newsId}`, {
                                method: 'DELETE',
                                headers: {
                                    'Authorization': `Bearer ${token}`,
                                },
                            })

                            const data = await response.json()

                            if (data.success) {
                                Alert.alert('Success', 'News deleted successfully')
                                fetchNews()
                            } else {
                                Alert.alert('Error', data.message || 'Failed to delete news')
                            }
                        } catch (error) {
                            console.error('Delete news error:', error)
                            Alert.alert('Error', 'Cannot connect to server')
                        }
                    },
                },
            ]
        )
    }

    return (
        <View style={styles.container}>
            {/* Fixed Header */}
            <ThemedView style={styles.header} safe={true}>
                <ThemedText title={true} style={styles.heading}>
                    Post
                </ThemedText>
            </ThemedView>

            {/* Scrollable Content */}
            <ThemedView style={styles.body}>
                <ScrollView 
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}>
                    
                    <Spacer height={20} />
                    
                    {/* Schedule Button */}
                    <View style={styles.centerContainer}>
                        <TouchableOpacity
                            style={styles.scheduleButton}
                            onPress={() => router.push('/(admin)/schedule')}>
                            <Ionicons name="calendar-outline" size={24} color="#fff" />
                            <ThemedText style={styles.scheduleButtonText}>Manage Schedule</ThemedText>
                        </TouchableOpacity>
                    </View>

                    <Spacer height={30} />

                    {/* News Section */}
                    <View style={styles.newsSection}>
                        <View style={styles.sectionHeader}>
                            <ThemedText style={styles.sectionTitle}>Post News</ThemedText>
                            <TouchableOpacity
                                style={styles.addButton}
                                onPress={() => setShowForm(!showForm)}>
                                <Ionicons name={showForm ? "chevron-up" : "add"} size={24} color="#fff" />
                            </TouchableOpacity>
                        </View>

                        {showForm && (
                            <View style={styles.formContainer}>
                                <ThemedText style={styles.inputLabel}>Title</ThemedText>
                                <TextInput
                                    style={styles.input}
                                    placeholder="News title..."
                                    placeholderTextColor="#999"
                                    value={title}
                                    onChangeText={setTitle}
                                />

                                <Spacer height={12} />
                                <ThemedText style={styles.inputLabel}>Description</ThemedText>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    placeholder="News description..."
                                    placeholderTextColor="#999"
                                    value={description}
                                    onChangeText={setDescription}
                                    multiline
                                    numberOfLines={4}
                                />

                                <Spacer height={12} />
                                <TouchableOpacity style={styles.pickImageButton} onPress={pickImage}>
                                    <Ionicons name="image-outline" size={20} color="#4CAF50" />
                                    <ThemedText style={styles.pickImageText}>
                                        {selectedImage ? 'Change Image' : 'Add Image (optional)'}
                                    </ThemedText>
                                </TouchableOpacity>

                                {selectedImage && (
                                    <>
                                        <Spacer height={12} />
                                        <Image source={{ uri: selectedImage }} style={styles.previewImage} resizeMode="contain" />
                                    </>
                                )}

                                <Spacer height={15} />
                                <TouchableOpacity
                                    style={[styles.uploadButton, uploading && styles.uploadButtonDisabled]}
                                    onPress={uploadNews}
                                    disabled={uploading}>
                                    {uploading ? (
                                        <ActivityIndicator size="small" color="#fff" />
                                    ) : (
                                        <>
                                            <Ionicons name="send-outline" size={20} color="#fff" />
                                            <ThemedText style={styles.uploadButtonText}>Post News</ThemedText>
                                        </>
                                    )}
                                </TouchableOpacity>
                                <Spacer height={10} />
                                <TouchableOpacity
                                    style={styles.cancelButton}
                                    onPress={() => {
                                        setShowForm(false)
                                        setTitle('')
                                        setDescription('')
                                        setSelectedImage(null)
                                    }}>
                                    <Ionicons name="close-outline" size={20} color="#666" />
                                    <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>

                    {/* Posted News List */}
                    {loading ? (
                        <View style={styles.centerContainer}>
                            <ActivityIndicator size="large" color="#4CAF50" />
                        </View>
                    ) : newsList.length > 0 ? (
                        <View style={styles.newsListContainer}>
                            <ThemedText style={styles.newsListTitle}>Posted News ({newsList.length})</ThemedText>
                            {newsList.map((newsItem) => (
                                <View key={newsItem._id} style={styles.newsCard}>
                                    {newsItem.imageUrl && (
                                        <>
                                            <TouchableOpacity onPress={() => setFullScreenImage(newsItem.imageUrl)}>
                                                <Image source={{ uri: newsItem.imageUrl }} style={styles.newsImage} resizeMode="cover" />
                                            </TouchableOpacity>
                                            <Spacer height={10} />
                                        </>
                                    )}
                                    <ThemedText style={styles.newsTitle}>{newsItem.title}</ThemedText>
                                    <Spacer height={8} />
                                    <ThemedText style={styles.newsDescription}>{newsItem.description}</ThemedText>
                                    <Spacer height={10} />
                                    <ThemedText style={styles.newsDate}>
                                        {new Date(newsItem.createdAt).toLocaleDateString()}
                                    </ThemedText>
                                    <Spacer height={12} />
                                    <TouchableOpacity
                                        style={styles.deleteNewsButton}
                                        onPress={() => deleteNews(newsItem._id)}>
                                        <Ionicons name="trash-outline" size={18} color="#fff" />
                                        <ThemedText style={styles.deleteNewsButtonText}>Delete</ThemedText>
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    ) : null}
                </ScrollView>
            </ThemedView>

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
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
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
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    addButton: {
        backgroundColor: '#4CAF50',
        borderRadius: 20,
        padding: 8,
    },
    formContainer: {
        marginTop: 15,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    inputLabel: {
        fontSize: 14,
        color: '#333',
        marginBottom: 8,
        fontWeight: '600',
    },
    input: {
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
        color: '#000',
        borderWidth: 1,
        borderColor: '#ddd',
    },
    textArea: {
        textAlignVertical: 'top',
    },
    pickImageButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#4CAF50',
        borderStyle: 'dashed',
        gap: 10,
    },
    pickImageText: {
        fontSize: 14,
        color: '#4CAF50',
        fontWeight: '600',
    },
    previewImage: {
        width: '100%',
        height: 200,
        borderRadius: 8,
        backgroundColor: '#f0f0f0',
    },
    uploadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#4CAF50',
        paddingVertical: 12,
        borderRadius: 8,
        gap: 8,
    },
    uploadButtonDisabled: {
        backgroundColor: '#a5d6a7',
    },
    uploadButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    cancelButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        paddingVertical: 12,
        borderRadius: 8,
        gap: 8,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    cancelButtonText: {
        color: '#666',
        fontSize: 16,
        fontWeight: 'bold',
    },
    newsListContainer: {
        marginTop: 20,
    },
    newsListTitle: {
        fontSize: 16,
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
        height: 250,
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
    deleteNewsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f44336',
        paddingVertical: 10,
        borderRadius: 8,
        gap: 8,
    },
    deleteNewsButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
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