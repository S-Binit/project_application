import React, { useState, useEffect } from 'react'
import { StyleSheet, View, TouchableOpacity, StatusBar, Platform, Alert, Image, ScrollView, ActivityIndicator, TextInput, Modal } from 'react-native'
import { useRouter } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Ionicons } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'

import ThemedText from '../../components/ThemedText'
import ThemedViewAdmin from '../../components/ThemedViewAdmin'
import Spacer from '../../components/Spacer'
import { API_BASE } from '../../constants/API'

const Schedule = () => {
  const router = useRouter()
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)
  const [description, setDescription] = useState('')
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
      }
    } catch (error) {
      console.error('Fetch schedule error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSchedule()
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

  const uploadSchedule = async () => {
    if (!selectedImage) {
      Alert.alert('Error', 'Please select an image first')
      return
    }

    setUploading(true)
    try {
      const token = await AsyncStorage.getItem('token')
      const uri = selectedImage
      const fileName = uri.split('/').pop() || `schedule-${Date.now()}.jpg`
      const ext = fileName.split('.').pop()
      const mimeType = ext ? `image/${ext.toLowerCase()}` : 'image/jpeg'

      const formData = new FormData()
      formData.append('image', {
        uri,
        name: fileName,
        type: mimeType,
      })
      formData.append('description', description.trim())

      const response = await fetch(`${API_BASE}/schedule/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      })

      const data = await response.json()

      if (data.success) {
        Alert.alert('Success', 'Schedule uploaded successfully')
        setSelectedImage(null)
        setDescription('')
        fetchSchedule()
      } else {
        Alert.alert('Error', data.message || 'Failed to upload schedule')
      }
    } catch (error) {
      console.error('Upload schedule error:', error)
      Alert.alert('Error', 'Cannot connect to server')
    } finally {
      setUploading(false)
    }
  }

  const deleteSchedule = (scheduleId) => {
    Alert.alert(
      'Delete Schedule',
      'Are you sure you want to delete this schedule?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('token')
              const response = await fetch(`${API_BASE}/schedule/${scheduleId}`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${token}`,
                },
              })

              const data = await response.json()

              if (data.success) {
                Alert.alert('Success', 'Schedule deleted successfully')
                fetchSchedule()
              } else {
                Alert.alert('Error', data.message || 'Failed to delete schedule')
              }
            } catch (error) {
              console.error('Delete schedule error:', error)
              Alert.alert('Error', 'Cannot connect to server')
            }
          },
        },
      ]
    )
  }

  if (loading) {
    return (
      <ThemedViewAdmin style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={28} color="#000" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Schedule</ThemedText>
          <View style={{ width: 28 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <ThemedText style={styles.loadingText}>Loading schedule...</ThemedText>
        </View>
      </ThemedViewAdmin>
    )
  }

  return (
    <ThemedViewAdmin style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/(admin)/post')}>
          <Ionicons name="arrow-back" size={28} color="#000" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Schedule</ThemedText>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <Spacer height={20} />

        {/* Upload New Schedule */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Upload Schedule</ThemedText>

          <TouchableOpacity style={styles.pickImageButton} onPress={pickImage}>
            <Ionicons name="image-outline" size={24} color="#4CAF50" />
            <ThemedText style={styles.pickImageText}>Select Image</ThemedText>
          </TouchableOpacity>

          {selectedImage && (
            <>
              <Spacer height={15} />
              <Image source={{ uri: selectedImage }} style={styles.previewImage} resizeMode="contain" />
              <Spacer height={15} />
              <ThemedText style={styles.inputLabel}>Description (optional)</ThemedText>
              <TextInput
                style={styles.input}
                placeholder="Add a description..."
                placeholderTextColor="#999"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
              />
              <Spacer height={15} />
              <TouchableOpacity
                style={[styles.uploadButton, uploading && styles.uploadButtonDisabled]}
                onPress={uploadSchedule}
                disabled={uploading}>
                {uploading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="cloud-upload-outline" size={20} color="#fff" />
                    <ThemedText style={styles.uploadButtonText}>Upload</ThemedText>
                  </>
                )}
              </TouchableOpacity>
              <Spacer height={10} />
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setSelectedImage(null)
                  setDescription('')
                }}>
                <Ionicons name="close-outline" size={20} color="#666" />
                <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Uploaded Schedules */}
        {schedules.length > 0 && (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>
              Uploaded Schedules ({schedules.length})
            </ThemedText>
            {schedules.map((schedule) => (
              <View key={schedule._id} style={styles.scheduleCard}>
                <TouchableOpacity onPress={() => setFullScreenImage(schedule.imageUrl)}>
                  <Image source={{ uri: schedule.imageUrl }} style={styles.scheduleImage} resizeMode="contain" />
                </TouchableOpacity>
                {schedule.description && (
                  <>
                    <Spacer height={10} />
                    <ThemedText style={styles.description}>{schedule.description}</ThemedText>
                  </>
                )}
                <Spacer height={10} />
                <ThemedText style={styles.uploadDate}>
                  Uploaded: {new Date(schedule.createdAt).toLocaleDateString()}
                </ThemedText>
                <Spacer height={15} />
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => deleteSchedule(schedule._id)}>
                  <Ionicons name="trash-outline" size={20} color="#fff" />
                  <ThemedText style={styles.deleteButtonText}>Delete</ThemedText>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

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
    </ThemedViewAdmin>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
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
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 15,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
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
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f44336',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  pickImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 15,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#4CAF50',
    borderStyle: 'dashed',
    gap: 10,
  },
  pickImageText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
  },
  previewImage: {
    width: '100%',
    height: 300,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  inputLabel: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#000',
    borderWidth: 1,
    borderColor: '#ddd',
    textAlignVertical: 'top',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
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
