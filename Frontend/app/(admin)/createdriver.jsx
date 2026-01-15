import React, { useState } from 'react'
import { StyleSheet, View, TouchableOpacity, StatusBar, Platform, TextInput, ScrollView, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Ionicons } from '@expo/vector-icons'

import ThemedText from '../../components/ThemedText'
import ThemedView from '../../components/ThemedView'
import Spacer from '../../components/Spacer'
import { API_BASE } from '../../constants/API'

const CreateDriver = () => {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    licenseNumber: '',
    licenseExpiry: '',
    vehicleNumber: '',
    vehicleModel: '',
    phoneNumber: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    // Validation
    const { email, password, name, licenseNumber, licenseExpiry, vehicleNumber, vehicleModel, phoneNumber } = formData

    if (!email.trim() || !password.trim() || !name.trim() || !licenseNumber.trim() || 
        !licenseExpiry.trim() || !vehicleNumber.trim() || !vehicleModel.trim() || !phoneNumber.trim()) {
      Alert.alert('Validation Error', 'All fields are required')
      return
    }

    setSubmitting(true)
    try {
      const token = await AsyncStorage.getItem('token')
      const response = await fetch(`${API_BASE}/driver/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        Alert.alert('Success', 'Driver created successfully', [
          { text: 'OK', onPress: () => router.back() }
        ])
      } else {
        Alert.alert('Error', data.message || 'Failed to create driver')
      }
    } catch (error) {
      console.error('Create driver error:', error)
      Alert.alert('Error', 'Cannot connect to server')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <ThemedView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#000" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Create Driver</ThemedText>
        <View style={{ width: 28 }} />
      </View>

      {/* Form */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Spacer height={20} />

        <ThemedText style={styles.label}>Email</ThemedText>
        <TextInput
          style={styles.input}
          placeholder="driver@example.com"
          placeholderTextColor="#999"
          value={formData.email}
          onChangeText={(value) => handleInputChange('email', value)}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Spacer height={15} />

        <ThemedText style={styles.label}>Password</ThemedText>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Enter password"
            placeholderTextColor="#999"
            value={formData.password}
            onChangeText={(value) => handleInputChange('password', value)}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowPassword(!showPassword)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={24}
              color="#666"
            />
          </TouchableOpacity>
        </View>

        <Spacer height={15} />

        <ThemedText style={styles.label}>Name</ThemedText>
        <TextInput
          style={styles.input}
          placeholder="Driver name"
          placeholderTextColor="#999"
          value={formData.name}
          onChangeText={(value) => handleInputChange('name', value)}
        />

        <Spacer height={15} />

        <ThemedText style={styles.label}>License Number</ThemedText>
        <TextInput
          style={styles.input}
          placeholder="DL1234567890"
          placeholderTextColor="#999"
          value={formData.licenseNumber}
          onChangeText={(value) => handleInputChange('licenseNumber', value)}
        />

        <Spacer height={15} />

        <ThemedText style={styles.label}>License Expiry (YYYY-MM-DD)</ThemedText>
        <TextInput
          style={styles.input}
          placeholder="2028-12-31"
          placeholderTextColor="#999"
          value={formData.licenseExpiry}
          onChangeText={(value) => handleInputChange('licenseExpiry', value)}
        />

        <Spacer height={15} />

        <ThemedText style={styles.label}>Vehicle Number</ThemedText>
        <TextInput
          style={styles.input}
          placeholder="ABC1234"
          placeholderTextColor="#999"
          value={formData.vehicleNumber}
          onChangeText={(value) => handleInputChange('vehicleNumber', value)}
          autoCapitalize="characters"
        />

        <Spacer height={15} />

        <ThemedText style={styles.label}>Vehicle Model</ThemedText>
        <TextInput
          style={styles.input}
          placeholder="Toyota Camry"
          placeholderTextColor="#999"
          value={formData.vehicleModel}
          onChangeText={(value) => handleInputChange('vehicleModel', value)}
        />

        <Spacer height={15} />

        <ThemedText style={styles.label}>Phone Number</ThemedText>
        <TextInput
          style={styles.input}
          placeholder="9876543210"
          placeholderTextColor="#999"
          value={formData.phoneNumber}
          onChangeText={(value) => handleInputChange('phoneNumber', value)}
          keyboardType="phone-pad"
        />

        <Spacer height={30} />

        <TouchableOpacity
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={submitting}>
          <ThemedText style={styles.submitButtonText}>
            {submitting ? 'Creating...' : 'Create Driver'}
          </ThemedText>
        </TouchableOpacity>

        <Spacer height={40} />
      </ScrollView>
    </ThemedView>
  )
}

export default CreateDriver

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
    paddingHorizontal: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 14,
    backgroundColor: '#fff',
    color: '#000',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 14,
    color: '#000',
  },
  eyeButton: {
    paddingHorizontal: 12,
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
})
