import React from 'react'
import { StyleSheet, View, TouchableOpacity, StatusBar, Platform } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

import ThemedText from '../../components/ThemedText'
import ThemedView from '../../components/ThemedView'
import Spacer from '../../components/Spacer'

const DriverManagement = () => {
  const router = useRouter()

  return (
    <ThemedView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#000" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Driver Management</ThemedText>
        <View style={{ width: 28 }} />
      </View>

      {/* Options */}
      <View style={styles.content}>
        <Spacer height={20} />

        {/* Create Driver */}
        <TouchableOpacity 
          style={styles.optionCard}
          onPress={() => router.push('/(admin)/createdriver')}>
          <View style={styles.iconContainer}>
            <Ionicons name="person-add" size={32} color="#4CAF50" />
          </View>
          <View style={styles.optionTextContainer}>
            <ThemedText style={styles.optionTitle}>Create Driver</ThemedText>
            <ThemedText style={styles.optionDescription}>Add a new driver to the system</ThemedText>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#999" />
        </TouchableOpacity>

        <Spacer height={15} />

        {/* Delete Driver */}
        <TouchableOpacity 
          style={styles.optionCard}
          onPress={() => router.push('/(admin)/deletedriver')}>
          <View style={[styles.iconContainer, { backgroundColor: '#ffebee' }]}>
            <Ionicons name="person-remove" size={32} color="#f44336" />
          </View>
          <View style={styles.optionTextContainer}>
            <ThemedText style={styles.optionTitle}>Delete Driver</ThemedText>
            <ThemedText style={styles.optionDescription}>Remove a driver from the system</ThemedText>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#999" />
        </TouchableOpacity>

        <Spacer height={15} />

        {/* Driver Status */}
        <TouchableOpacity 
          style={styles.optionCard}
          onPress={() => router.push('/(admin)/driverstatus')}>
          <View style={[styles.iconContainer, { backgroundColor: '#fff3e0' }]}>
            <Ionicons name="speedometer" size={32} color="#FF9800" />
          </View>
          <View style={styles.optionTextContainer}>
            <ThemedText style={styles.optionTitle}>Driver Status</ThemedText>
            <ThemedText style={styles.optionDescription}>View and update driver status</ThemedText>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#999" />
        </TouchableOpacity>

        <Spacer height={15} />

        {/* Driver Info */}
        <TouchableOpacity 
          style={styles.optionCard}
          onPress={() => router.push('/(admin)/driverinfo')}>
          <View style={[styles.iconContainer, { backgroundColor: '#e3f2fd' }]}>
            <Ionicons name="information-circle" size={32} color="#2196F3" />
          </View>
          <View style={styles.optionTextContainer}>
            <ThemedText style={styles.optionTitle}>Driver Info</ThemedText>
            <ThemedText style={styles.optionDescription}>View all driver information</ThemedText>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#999" />
        </TouchableOpacity>
      </View>
    </ThemedView>
  )
}

export default DriverManagement

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
    paddingHorizontal: 15,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#e8f5e9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 13,
    color: '#666',
  },
})
