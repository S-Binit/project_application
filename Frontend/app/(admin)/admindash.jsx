import React, { useState } from 'react'
import { StyleSheet, View, TouchableOpacity, ScrollView, Platform, StatusBar } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

import ThemedText from '../../components/ThemedText'
import ThemedView from '../../components/ThemedView'
import Spacer from '../../components/Spacer'

const AdminDashHome = () => {
  const [activeTab, setActiveTab] = useState('home')

  return (
    <ThemedView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <ThemedText style={styles.headerTitle}>Admin Dashboard</ThemedText>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Spacer height={20} />

        {/* Welcome Section */}
        <View style={styles.welcomeCard}>
          <Ionicons name="shield-checkmark" size={48} color="#2196F3" />
          <Spacer height={15} />
          <ThemedText style={styles.welcomeTitle}>Welcome Admin</ThemedText>
          <Spacer height={10} />
          <ThemedText style={styles.welcomeDescription}>
            Manage your waste management system efficiently
          </ThemedText>
        </View>

        <Spacer height={25} />

        {/* Quick Stats */}
        <ThemedText style={styles.sectionTitle}>Quick Overview</ThemedText>
        <Spacer height={12} />

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#e3f2fd' }]}>
              <Ionicons name="people" size={24} color="#2196F3" />
            </View>
            <Spacer height={10} />
            <ThemedText style={styles.statNumber}>Users</ThemedText>
            <ThemedText style={styles.statValue}>Monitor</ThemedText>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#f3e5f5' }]}>
              <Ionicons name="car" size={24} color="#9C27B0" />
            </View>
            <Spacer height={10} />
            <ThemedText style={styles.statNumber}>Drivers</ThemedText>
            <ThemedText style={styles.statValue}>Manage</ThemedText>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#fff3e0' }]}>
              <Ionicons name="chatbubbles" size={24} color="#FF9800" />
            </View>
            <Spacer height={10} />
            <ThemedText style={styles.statNumber}>Feedback</ThemedText>
            <ThemedText style={styles.statValue}>Review</ThemedText>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#e8f5e9' }]}>
              <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
            </View>
            <Spacer height={10} />
            <ThemedText style={styles.statNumber}>Status</ThemedText>
            <ThemedText style={styles.statValue}>Active</ThemedText>
          </View>
        </View>

        <Spacer height={25} />

        {/* Features Section */}
        <ThemedText style={styles.sectionTitle}>Key Features</ThemedText>
        <Spacer height={12} />

        <View style={styles.featureList}>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            <ThemedText style={styles.featureText}>Manage driver accounts</ThemedText>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            <ThemedText style={styles.featureText}>Review complaints and feedback</ThemedText>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            <ThemedText style={styles.featureText}>Track system status</ThemedText>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            <ThemedText style={styles.featureText}>View real-time data</ThemedText>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            <ThemedText style={styles.featureText}>Manage updates and news</ThemedText>
          </View>
        </View>

        <Spacer height={30} />
      </ScrollView>
    </ThemedView>
  )
}

export default AdminDashHome

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
    borderBottomWidth: 0.5,
    borderBottomColor: '#ddd',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
  },
  content: {
    flex: 1,
    paddingHorizontal: 15,
  },
  welcomeCard: {
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  welcomeDescription: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    alignItems: 'center',
  },
  statIcon: {
    width: 50,
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  statValue: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  featureList: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 14,
    color: '#555',
    flex: 1,
  },
})
