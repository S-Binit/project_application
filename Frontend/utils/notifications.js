import AsyncStorage from '@react-native-async-storage/async-storage'

export const USER_NOTIFICATIONS_KEY = 'user_notifications'
const MAX_NOTIFICATION_ITEMS = 50

export const getUserNotifications = async () => {
  try {
    const raw = await AsyncStorage.getItem(USER_NOTIFICATIONS_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch (_error) {
    return []
  }
}

export const saveUserNotifications = async (items) => {
  const safeItems = Array.isArray(items) ? items.slice(0, MAX_NOTIFICATION_ITEMS) : []
  await AsyncStorage.setItem(USER_NOTIFICATIONS_KEY, JSON.stringify(safeItems))
}

export const addUserNotification = async (notification) => {
  const current = await getUserNotifications()
  const next = [notification, ...current].slice(0, MAX_NOTIFICATION_ITEMS)
  await saveUserNotifications(next)
}

export const removeDriverNotifications = async (driverIds) => {
  if (!Array.isArray(driverIds) || driverIds.length === 0) return

  const idSet = new Set(driverIds)
  const current = await getUserNotifications()
  const filtered = current.filter(item => !idSet.has(item?.driverId))

  if (filtered.length !== current.length) {
    await saveUserNotifications(filtered)
  }
}
