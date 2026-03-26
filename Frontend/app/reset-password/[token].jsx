import React, { useEffect, useMemo, useState } from 'react'
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Text,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

import ThemedView from '../../components/ThemedView'
import ThemedText from '../../components/ThemedText'
import Spacer from '../../components/Spacer'
import { AUTH_URL } from '../../constants/API'

const ResetPassword = () => {
  const router = useRouter()
  const params = useLocalSearchParams()
  const rawToken = params?.token
  const token = useMemo(() => {
    if (Array.isArray(rawToken)) return rawToken[0] || ''
    return rawToken || ''
  }, [rawToken])

  const [verifying, setVerifying] = useState(true)
  const [validToken, setValidToken] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    let mounted = true

    const verify = async () => {
      if (!token) {
        if (mounted) {
          setError('Invalid reset link')
          setVerifying(false)
          setValidToken(false)
        }
        return
      }

      try {
        const response = await fetch(`${AUTH_URL}/reset-password/${encodeURIComponent(token)}/verify`)
        const data = await response.json()

        if (!mounted) return

        if (response.ok && data?.success) {
          setValidToken(true)
          setError('')
        } else {
          setValidToken(false)
          setError(data?.message || 'Reset link is invalid or expired')
        }
      } catch (_error) {
        if (!mounted) return
        setValidToken(false)
        setError('Cannot verify reset link. Please try again.')
      } finally {
        if (mounted) setVerifying(false)
      }
    }

    verify()
    return () => { mounted = false }
  }, [token])

  const handleResetPassword = async () => {
    setError('')
    setSuccess('')

    if (!password || !confirmPassword) {
      setError('Please fill both password fields')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`${AUTH_URL}/reset-password/${encodeURIComponent(token)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword: password }),
      })

      const data = await response.json()
      if (!response.ok || !data?.success) {
        setError(data?.message || 'Failed to reset password')
        return
      }

      setSuccess('Password updated successfully. Please login with your new password.')
      setTimeout(() => {
        router.dismissAll()
        router.replace('/(auth)/login')
      }, 1200)
    } catch (_error) {
      setError('Cannot connect to server. Make sure backend is running.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardRoot}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
        >
          <Ionicons name="arrow-back" size={26} color="#000" />
        </TouchableOpacity>

        <View style={styles.content}>
          <ThemedText title={true} style={styles.title}>Reset Password</ThemedText>
          <Spacer height={10} />

          {verifying ? (
            <ThemedText style={styles.subtitle}>Verifying reset link...</ThemedText>
          ) : null}

          {!verifying && !validToken ? (
            <Text style={styles.errorText}>{error || 'Reset link is invalid or expired'}</Text>
          ) : null}

          {!verifying && validToken ? (
            <>
              <ThemedText style={styles.subtitle}>Enter your new password.</ThemedText>
              <Spacer height={24} />

              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={22} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="New password"
                  placeholderTextColor="#999"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={22} color="#666" />
                </TouchableOpacity>
              </View>

              <Spacer height={14} />

              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={22} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm new password"
                  placeholderTextColor="#999"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showPassword}
                />
              </View>

              <Spacer height={16} />

              {error ? <Text style={styles.errorText}>{error}</Text> : null}
              {success ? <Text style={styles.successText}>{success}</Text> : null}

              <Spacer height={24} />

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleResetPassword}
                disabled={loading}
              >
                <Text style={styles.buttonText}>{loading ? 'Updating...' : 'Update Password'}</Text>
              </TouchableOpacity>
            </>
          ) : null}
        </View>
      </KeyboardAvoidingView>
    </ThemedView>
  )
}

export default ResetPassword

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardRoot: { flex: 1 },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    padding: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  title: {
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 54,
  },
  inputIcon: { marginRight: 10 },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  errorText: {
    color: '#d32f2f',
    textAlign: 'center',
  },
  successText: {
    color: '#2e7d32',
    textAlign: 'center',
  },
  button: {
    height: 54,
    borderRadius: 27,
    backgroundColor: '#43A047',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
})
