import React, { useState, useEffect } from 'react'
import { StyleSheet, View, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, StatusBar, Platform, FlatList, Alert, Modal, TextInput } from 'react-native'
import { useRouter } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Ionicons } from '@expo/vector-icons'

import ThemedText from '../../components/ThemedText'
import ThemedView from '../../components/ThemedView'
import Spacer from '../../components/Spacer'
import ThemedIonicons from '../../components/ThemedIonIcons'
import { API_BASE } from '../../constants/API'

const AdminComplaints = () => {
  const router = useRouter()
  const [feedbacks, setFeedbacks] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedFeedback, setSelectedFeedback] = useState(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [adminResponse, setAdminResponse] = useState('')
  const [responseStatus, setResponseStatus] = useState('reviewed')
  const [submitting, setSubmitting] = useState(false)

  const fetchFeedbacks = async () => {
    try {
      const token = await AsyncStorage.getItem('token')
      const response = await fetch(`${API_BASE}/feedback/all`, {
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
        Alert.alert('Error', data.message || 'Failed to fetch complaints')
      }
    } catch (error) {
      console.error('Fetch feedbacks error:', error)
      Alert.alert('Error', 'Cannot connect to server')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchFeedbacks()
  }, [])

  const onRefresh = () => {
    setRefreshing(true)
    fetchFeedbacks()
  }

  const getFilteredFeedbacks = () => {
    let filtered = feedbacks

    if (filterType !== 'all') {
      filtered = filtered.filter(f => f.type === filterType)
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(f => f.status === filterStatus)
    }

    return filtered
  }

  const handleUpdateStatus = async () => {
    if (!selectedFeedback) return

    setSubmitting(true)
    try {
      const token = await AsyncStorage.getItem('token')
      const response = await fetch(`${API_BASE}/feedback/${selectedFeedback._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: responseStatus,
          adminResponse: adminResponse.trim(),
        }),
      })

      const data = await response.json()

      if (data.success) {
        Alert.alert('Success', 'Status updated successfully')
        setModalVisible(false)
        fetchFeedbacks()
      } else {
        Alert.alert('Error', data.message || 'Failed to update status')
      }
    } catch (error) {
      console.error('Update status error:', error)
      Alert.alert('Error', 'Cannot connect to server')
    } finally {
      setSubmitting(false)
    }
  }

  const openDetailsModal = (feedback) => {
    setSelectedFeedback(feedback)
    setAdminResponse(feedback.adminResponse || '')
    setResponseStatus(feedback.status || 'reviewed')
    setModalVisible(true)
  }

  const filteredData = getFilteredFeedbacks()

  const renderFeedbackItem = ({ item }) => (
    <TouchableOpacity
      style={styles.feedbackCard}
      onPress={() => openDetailsModal(item)}>
      <View style={styles.feedbackHeader}>
        <View style={styles.feedbackTitleRow}>
          <View style={[styles.typeBadge, item.type === 'complaint' ? styles.badgeComplaint : styles.badgeFeedback]}>
            <ThemedText style={styles.typeBadgeText}>
              {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
            </ThemedText>
          </View>
          <View style={[styles.statusBadge, item.status === 'pending' ? styles.statusPending : item.status === 'reviewed' ? styles.statusReviewed : styles.statusResolved]}>
            <ThemedText style={styles.statusBadgeText}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </ThemedText>
          </View>
        </View>
        <ThemedText style={styles.userName}>{item.userName}</ThemedText>
      </View>

      <ThemedText style={styles.subject}>{item.subject}</ThemedText>
      <ThemedText style={styles.message} numberOfLines={2}>{item.message}</ThemedText>

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

      <ThemedText style={styles.email}>{item.userEmail}</ThemedText>
      <ThemedText style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</ThemedText>
    </TouchableOpacity>
  )

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <ThemedText style={styles.loadingText}>Loading complaints...</ThemedText>
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
        <ThemedText style={styles.headerTitle}>Complaints & Feedback</ThemedText>
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

          <View style={styles.filterDivider} />

          <TouchableOpacity
            style={[styles.filterButton, filterStatus === 'all' && styles.filterButtonActive]}
            onPress={() => setFilterStatus('all')}>
            <ThemedText style={[styles.filterButtonText, filterStatus === 'all' && styles.filterButtonTextActive]}>All Status</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filterStatus === 'pending' && styles.filterButtonActive]}
            onPress={() => setFilterStatus('pending')}>
            <ThemedText style={[styles.filterButtonText, filterStatus === 'pending' && styles.filterButtonTextActive]}>Pending</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filterStatus === 'reviewed' && styles.filterButtonActive]}
            onPress={() => setFilterStatus('reviewed')}>
            <ThemedText style={[styles.filterButtonText, filterStatus === 'reviewed' && styles.filterButtonTextActive]}>Reviewed</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filterStatus === 'resolved' && styles.filterButtonActive]}
            onPress={() => setFilterStatus('resolved')}>
            <ThemedText style={[styles.filterButtonText, filterStatus === 'resolved' && styles.filterButtonTextActive]}>Resolved</ThemedText>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* List */}
      {filteredData.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="inbox-outline" size={64} color="#ccc" />
          <ThemedText style={styles.emptyText}>No complaints or feedback</ThemedText>
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

      {/* Details Modal */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Details</ThemedText>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={28} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              {selectedFeedback && (
                <>
                  <ThemedText style={styles.detailLabel}>Type</ThemedText>
                  <ThemedText style={styles.detailValue}>{selectedFeedback.type.charAt(0).toUpperCase() + selectedFeedback.type.slice(1)}</ThemedText>

                  <ThemedText style={styles.detailLabel}>User</ThemedText>
                  <ThemedText style={styles.detailValue}>{selectedFeedback.userName}</ThemedText>

                  <ThemedText style={styles.detailLabel}>Email</ThemedText>
                  <ThemedText style={styles.detailValue}>{selectedFeedback.userEmail}</ThemedText>

                  <ThemedText style={styles.detailLabel}>Subject</ThemedText>
                  <ThemedText style={styles.detailValue}>{selectedFeedback.subject}</ThemedText>

                  <ThemedText style={styles.detailLabel}>Message</ThemedText>
                  <ThemedText style={styles.detailValue}>{selectedFeedback.message}</ThemedText>

                  {selectedFeedback.type === 'feedback' && selectedFeedback.rating && (
                    <>
                      <ThemedText style={styles.detailLabel}>Rating</ThemedText>
                      <View style={styles.ratingRow}>
                        {[...Array(5)].map((_, i) => (
                          <Ionicons
                            key={i}
                            name={i < selectedFeedback.rating ? 'star' : 'star-outline'}
                            size={20}
                            color={i < selectedFeedback.rating ? '#FFD700' : '#ccc'}
                          />
                        ))}
                      </View>
                    </>
                  )}

                  <Spacer height={15} />

                  <ThemedText style={styles.detailLabel}>Current Status</ThemedText>
                  <View style={styles.statusSelectContainer}>
                    {['pending', 'reviewed', 'resolved'].map(status => (
                      <TouchableOpacity
                        key={status}
                        style={[styles.statusOption, responseStatus === status && styles.statusOptionActive]}
                        onPress={() => setResponseStatus(status)}>
                        <ThemedText style={[styles.statusOptionText, responseStatus === status && styles.statusOptionTextActive]}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </ThemedText>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <ThemedText style={styles.detailLabel}>Admin Response</ThemedText>
                  <TextInput
                    style={styles.responseInput}
                    placeholder="Add your response here"
                    value={adminResponse}
                    onChangeText={setAdminResponse}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />

                  <TouchableOpacity
                    style={[styles.updateButton, submitting && styles.updateButtonDisabled]}
                    onPress={handleUpdateStatus}
                    disabled={submitting}>
                    <ThemedText style={styles.updateButtonText}>
                      {submitting ? 'Updating...' : 'Update Status'}
                    </ThemedText>
                  </TouchableOpacity>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ThemedView>
  )
}

export default AdminComplaints

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
  filterDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#ddd',
    marginHorizontal: 10,
  },
  listContent: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  feedbackCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  feedbackHeader: {
    marginBottom: 10,
  },
  feedbackTitleRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
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
  statusPending: {
    backgroundColor: '#ff4444',
  },
  statusReviewed: {
    backgroundColor: '#ffd700',
  },
  statusResolved: {
    backgroundColor: '#4CAF50',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#fff',
  },
  userName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  subject: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 5,
  },
  message: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 8,
  },
  email: {
    fontSize: 11,
    color: '#999',
    marginBottom: 4,
  },
  date: {
    fontSize: 10,
    color: '#bbb',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: '#ddd',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalScroll: {
    paddingHorizontal: 20,
    paddingTop: 15,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 12,
    marginBottom: 5,
  },
  detailValue: {
    fontSize: 13,
    color: '#333',
    lineHeight: 18,
  },
  statusSelectContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 15,
  },
  statusOption: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  statusOptionActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  statusOptionText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
  },
  statusOptionTextActive: {
    color: '#fff',
  },
  responseInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    backgroundColor: '#f9f9f9',
    textAlignVertical: 'top',
    minHeight: 80,
  },
  updateButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 10,
  },
  updateButtonDisabled: {
    opacity: 0.6,
  },
  updateButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
})
