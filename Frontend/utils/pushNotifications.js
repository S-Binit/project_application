import Constants from 'expo-constants'

const isExpoGo = Constants?.appOwnership === 'expo'

let notificationsModule = null
let handlerConfigured = false
let channelConfigured = false

const ensureAndroidChannel = async (Notifications) => {
  if (channelConfigured) {
    return
  }

  if (Constants?.platform?.android) {
    await Notifications.setNotificationChannelAsync('nearby-driver', {
      name: 'Nearby Driver Alerts',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#4CAF50',
      sound: 'default',
    })
  }

  channelConfigured = true
}

const getNotificationsModule = async () => {
  if (!notificationsModule) {
    const mod = await import('expo-notifications')
    notificationsModule = mod
  }

  if (!handlerConfigured && notificationsModule) {
    notificationsModule.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    })
    handlerConfigured = true
  }

  await ensureAndroidChannel(notificationsModule)

  return notificationsModule
}

/**
 * Request notification permissions from user
 * @returns {Promise<boolean>} - true if permission granted, false otherwise
 */
export const requestNotificationPermissions = async () => {
  try {
    const Notifications = await getNotificationsModule()

    const { status } = await Notifications.requestPermissionsAsync()
    return status === 'granted'
  } catch (error) {
    console.error('Error requesting notification permissions:', error)
    return false
  }
}

/**
 * Send a local notification (popup message) to the user
 * @param {string} title - Notification title
 * @param {string} body - Notification message
 * @param {object} data - Additional data to pass with notification
 */
export const sendLocalNotification = async (title, body, data = {}) => {
  try {
    const Notifications = await getNotificationsModule()

    await Notifications.scheduleNotificationAsync({
      content: {
        title: title,
        body: body,
        sound: 'default',
        badge: 1,
        channelId: 'nearby-driver',
        data: data,
      },
      trigger: null, // null trigger means show immediately
    })
    return true
  } catch (error) {
    console.error('Error sending local notification:', error)
    return false
  }
}

/**
 * Initialize notification listeners
 * Call this once in your app root (like _layout.jsx)
 */
export const initializeNotificationListeners = () => {
  // Return async setup so the module loads only when the app is ready.
  return (async () => {
    const Notifications = await getNotificationsModule()

    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log('Notification tapped:', response.notification.request.content.data)
      }
    )

    return subscription
  })()
}
