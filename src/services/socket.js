import { io } from 'socket.io-client'

class SocketService {
  constructor() {
    this.socket = null
    this.isConnected = false
  }

  connect(token) {
    if (this.socket && this.isConnected) {
      return this.socket
    }

    this.socket = io('http://localhost:5000', {
      auth: {
        token
      }
    })

    this.socket.on('connect', () => {
      console.log('Connected to server')
      this.isConnected = true
      this.socket.emit('authenticate', token)
    })

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server')
      this.isConnected = false
    })

    this.socket.on('auth_error', (error) => {
      console.error('Authentication error:', error)
      this.disconnect()
    })

    return this.socket
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.isConnected = false
    }
  }

  getSocket() {
    return this.socket
  }

  // Message events
  joinRoom(roomId) {
    if (this.socket) {
      this.socket.emit('join_room', roomId)
    }
  }

  leaveRoom(roomId) {
    if (this.socket) {
      this.socket.emit('leave_room', roomId)
    }
  }

  sendMessage(data) {
    if (this.socket) {
      this.socket.emit('send_message', data)
    }
  }

  // Typing indicators
  startTyping(roomId) {
    if (this.socket) {
      this.socket.emit('typing', { roomId })
    }
  }

  stopTyping(roomId) {
    if (this.socket) {
      this.socket.emit('stop_typing', { roomId })
    }
  }

  // Call events
  callUser(data) {
    if (this.socket) {
      this.socket.emit('call_user', data)
    }
  }

  acceptCall(data) {
    if (this.socket) {
      this.socket.emit('call_accepted', data)
    }
  }

  rejectCall(data) {
    if (this.socket) {
      this.socket.emit('call_rejected', data)
    }
  }

  endCall(data) {
    if (this.socket) {
      this.socket.emit('call_ended', data)
    }
  }

  // WebRTC signaling
  sendOffer(data) {
    if (this.socket) {
      this.socket.emit('offer', data)
    }
  }

  sendAnswer(data) {
    if (this.socket) {
      this.socket.emit('answer', data)
    }
  }

  sendIceCandidate(data) {
    if (this.socket) {
      this.socket.emit('ice_candidate', data)
    }
  }
}

export default new SocketService() 