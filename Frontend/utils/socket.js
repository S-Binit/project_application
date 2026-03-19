import { io } from 'socket.io-client'
import { API_BASE } from '../constants/API'

export const SOCKET_SERVER_URL = API_BASE.replace(/\/api\/?$/, '')

export const createSocketClient = (token) => io(SOCKET_SERVER_URL, {
  transports: ['websocket'],
  reconnection: true,
  auth: token ? { token } : {},
})
