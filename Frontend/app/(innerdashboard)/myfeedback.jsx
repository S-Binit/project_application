import React, { useState, useEffect } from 'react'
import { StyleSheet, View, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, StatusBar, Platform, FlatList, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Ionicons } from '@expo/vector-icons'

import ThemedText from '../../components/ThemedText'
import ThemedView from '../../components/ThemedView'
import Spacer from '../../components/Spacer'
import { API_BASE } from '../../constants/API'

const MyFeedback = () => {
  const router = useRouter()
  const [feedbacks, setFeedbacks] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filterType, setFilterType] = useState('all')

  const fetchMyFeedback = async () => {
    try {
      const token = await AsyncStorage.getItem('token')
      const response = await fetch(`${API_BASE}/feedback/my`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (data.success) {
        setFeedbacks(data.feedbacks || [])
      } else {
        Alert.alert('Error', data.message || 'Failed to fetch feedback')
      }
    } catch (error) {
      console.error('Fetch feedback error:', error)
      Alert.alert('Error', 'Cannot connect to server')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchMyFeedback()
  }, [])

  const onRefresh = () => {
    setRefreshing(true)
    fetchMyFeedback()
  }

  const getFilteredFeedback = () => {
    if (filterType === 'all') return feedbacks
    return feedbacks.filter(f => f.type === filterType)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#ff4444'
      case 'reviewed':
        return '#ffd700'
      case 'resolved':
        return '#4CAF50'
      default:
        return '#999'
    }
  }

  const handleDeleteFeedback = (feedbackId, subject) => {
    Alert.alert(
      'Delete Feedback',
      `Are you sure you want to delete "${subject}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('token')
              const response = await fetch(`${API_BASE}/feedback/${feedbackId}`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${token}`,
                },
              })

              const data = await response.json()

              if (data.success) {
                Alert.alert('Success', 'Feedback deleted')
                fetchMyFeedback()
              } else {
                Alert.alert('Error', data.message || 'Failed to delete')
              }
            } catch (error) {
              console.error('Delete error:', error)
              Alert.alert('Error', 'Cannot connect to server')
            }
          },
        },
      ]
    )
  }

  const renderFeedbackItem = ({ item }) => (
    <View style={styles.feedbackCard}>
      <View style={styles.cardHeader}>
        <View style={styles.titleRow}>
          <View style={[styles.typeBadge, item.type === 'complaint' ? styles.badgeComplaint : styles.badgeFeedback]}>
            <ThemedText style={styles.typeBadgeText}>
              {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
            </ThemedText>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <ThemedText style={styles.statusBadgeText}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </ThemedText>
          </View>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteFeedback(item._id, item.subject)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="trash-outline" size={20} color="#ff4444" />
        </TouchableOpacity>
      </View>

      <ThemedText style={styles.subject}>{item.subject}</ThemedText>
      <ThemedText style={styles.message}>{item.message}</ThemedText>

      {item.type === 'feedback' && item.rating && (
        <View style={styles.ratingRow}>
          {[...Array(5)].map((_, i) => (
            <Ionicons
              key={i}
              name={i < item.rating ? 'star' : 'star-outline'}
              size={16}
              color={i < item.rating ? '#FFD700' : '#ccc'}
            />
          ))}
        </View>
      )}

      <ThemedText style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</ThemedText>

      {item.adminResponse && (
        <View style={styles.responseContainer}>
          <View style={styles.responseHeader}>
            <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
            <ThemedText style={styles.responseLabel}>Admin Response</ThemedText>
          </View>
          <ThemedText style={styles.responseText}>{item.adminResponse}</ThemedText>
        </View>
      )}

      {item.status === 'pending' && (
        <View style={styles.pendingNote}>
          <Ionicons name="time-outline" size={14} color="#ff6b6b" />
          <ThemedText style={styles.pendingNoteText}>Awaiting admin review</ThemedText>
        </View>
      )}
    </View>
  )

  const filteredData = getFilteredFeedback()

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <ThemedText style={styles.loadingText}>Loading your feedback...</ThemedText>
        </View>
      </ThemedView>
    )
  }

  return (
    <ThemedView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#000" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>My Feedback</ThemedText>
        <View style={{ width: 28 }} />
      </View>

      {/* Filters */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          <TouchableOpacity
            style={[styles.filterButton, filterType === 'all' && styles.filterButtonActive]}
            onPress={() => setFilterType('all')}>
            <ThemedText style={[styles.filterButtonText, filterType === 'all' && styles.filterButtonTextActive]}>All</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filterType === 'complaint' && styles.filterButtonActive]}
            onPress={() => setFilterType('complaint')}>
            <ThemedText style={[styles.filterButtonText, filterType === 'complaint' && styles.filterButtonTextActive]}>Complaints</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filterType === 'feedback' && styles.filterButtonActive]}
            onPress={() => setFilterType('feedback')}>
            <ThemedText style={[styles.filterButtonText, filterType === 'feedback' && styles.filterButtonTextActive]}>Feedback</ThemedText>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* List */}
      {filteredData.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="chatbubbles-outline" size={64} color="#ccc" />
          <ThemedText style={styles.emptyText}>
            {filterType === 'feedback'
              ? 'No feedbacks'
              : filterType === 'complaint'
              ? 'No complaints'
              : 'No complaints or feedbacks'}
          </ThemedText>
        </View>
      ) : (
        <FlatList
          data={filteredData}
          renderItem={renderFeedbackItem}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      )}
    </ThemedView>
  )
}

export default MyFeedback

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
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 10 : (StatusBar.currentHeight || 0) + 40,
    backgroundColor: '#fff',
    borderBottomWidth: 0.5,
    borderBottomColor: '#ddd',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  filterContainer: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#ddd',
  },
  filterScroll: {
    paddingHorizontal: 10,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginHorizontal: 5,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  filterButtonActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  filterButtonText: {
    fontSize: 12,
    color: '#666',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  listContent: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  feedbackCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cardHeader: {
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
    flex: 1,
  },
  deleteButton: {
    padding: 4,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeComplaint: {
    backgroundColor: '#ffebee',
  },
  badgeFeedback: {
    backgroundColor: '#e8f5e9',
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#fff',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#fff',
  },
  subject: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  message: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    marginBottom: 10,
  },
  ratingRow: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 10,
  },
  date: {
    fontSize: 11,
    color: '#999',
    marginBottom: 10,
  },
  responseContainer: {
    backgroundColor: '#f0f9ff',
    borderLeftWidth: 3,
    borderLeftColor: '#4CAF50',
    borderRadius: 6,
    padding: 10,
    marginTop: 10,
  },
  responseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  responseLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  responseText: {
    fontSize: 12,
    color: '#333',
    lineHeight: 16,
  },
  pendingNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fff5f5',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 6,
    marginTop: 10,
  },
  pendingNoteText: {
    fontSize: 12,
    color: '#ff6b6b',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    marginTop: 10,
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
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
})
