import { createContext, useContext, useEffect, useState, useRef } from 'react'
import { io } from 'socket.io-client'

const SocketContext = createContext(null)

/* 
 * SocketProvider owns a single Socket.IO connection for the whole app.
 * It also exposes a `liveCount` (server-broadcast presence) so any page
 * (Home hero, admin dashboard, etc.) can render a real-time active-user
 * number without opening its own connection.
 */
export function SocketProvider({ children }) {
  const [connected, setConnected] = useState(false)
  const [liveCount, setLiveCount] = useState(0)
  const socketRef = useRef(null)

  useEffect(() => {
    const token = localStorage.getItem('qa_token') || undefined
    const socket = io(import.meta.env.VITE_SOCKET_URL, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      withCredentials: true,
      auth: token ? { token } : undefined,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    })

    socket.on('connect',    () => setConnected(true))
    socket.on('disconnect', () => setConnected(false))
    socket.on('presence:count', ({ count }) => setLiveCount(count))

    socketRef.current = socket
    return () => { socket.close() }
  }, [])

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, connected, liveCount }}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = () => {
  const ctx = useContext(SocketContext)
  if (!ctx) throw new Error('useSocket must be inside SocketProvider')
  return ctx
}
