import { createContext, useContext, useEffect, useState } from 'react'
import socketService from '../services/socket'

const SocketContext = createContext()

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false)

  const connectSocket = (token) => {
    const socketInstance = socketService.connect(token)
    setSocket(socketInstance)
  }

  const disconnectSocket = () => {
    socketService.disconnect()
    setSocket(null)
    setIsConnected(false)
  }

  useEffect(() => {
    if (socket) {
      socket.on('connect', () => {
        setIsConnected(true)
      })

      socket.on('disconnect', () => {
        setIsConnected(false)
      })

      socket.on('authenticated', () => {
        console.log('Socket authenticated')
      })

      socket.on('auth_error', (error) => {
        console.error('Socket auth error:', error)
        disconnectSocket()
      })

      return () => {
        socket.off('connect')
        socket.off('disconnect')
        socket.off('authenticated')
        socket.off('auth_error')
      }
    }
  }, [socket])

  const value = {
    socket,
    isConnected,
    connectSocket,
    disconnectSocket,
    socketService
  }

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  )
} 