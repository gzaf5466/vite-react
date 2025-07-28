import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { Send, ArrowLeft, Phone, Video, MoreVertical } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useSocket } from '../contexts/SocketContext'
import api from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import MessageBubble from '../components/MessageBubble'

const ChatPage = () => {
  const { conversationId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { socket } = useSocket()
  const queryClient = useQueryClient()
  const messagesEndRef = useRef(null)
  const [message, setMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [typingUsers, setTypingUsers] = useState([])

  // Fetch conversation details
  const { data: conversation, isLoading: conversationLoading } = useQuery(
    ['conversation', conversationId],
    () => api.get(`/messages/conversation/${conversationId}/messages`).then(res => res.data),
    { enabled: !!conversationId }
  )

  // Send message mutation
  const sendMessageMutation = useMutation(
    (messageData) => api.post(`/messages/conversation/${conversationId}/messages`, messageData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['conversation', conversationId])
        queryClient.invalidateQueries(['conversations'])
      }
    }
  )

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [conversation?.messages])

  useEffect(() => {
    if (socket && conversationId) {
      socket.emit('join_room', conversationId)

      socket.on('receive_message', (data) => {
        queryClient.invalidateQueries(['conversation', conversationId])
        queryClient.invalidateQueries(['conversations'])
      })

      socket.on('user_typing', (data) => {
        if (data.userId !== user.id) {
          setTypingUsers(prev => [...prev.filter(u => u !== data.userId), data.userId])
        }
      })

      socket.on('user_stop_typing', (data) => {
        if (data.userId !== user.id) {
          setTypingUsers(prev => prev.filter(u => u !== data.userId))
        }
      })

      return () => {
        socket.emit('leave_room', conversationId)
        socket.off('receive_message')
        socket.off('user_typing')
        socket.off('user_stop_typing')
      }
    }
  }, [socket, conversationId, user.id, queryClient])

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!message.trim()) return

    const messageData = {
      content: message.trim(),
      messageType: 'text'
    }

    try {
      await sendMessageMutation.mutateAsync(messageData)
      setMessage('')
      
      // Emit socket event for real-time
      if (socket) {
        socket.emit('send_message', {
          roomId: conversationId,
          content: messageData.content,
          senderId: user.id,
          messageType: messageData.messageType
        })
      }
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const handleTyping = (e) => {
    setMessage(e.target.value)
    
    if (socket) {
      if (e.target.value && !isTyping) {
        setIsTyping(true)
        socket.emit('typing', { roomId: conversationId })
      } else if (!e.target.value && isTyping) {
        setIsTyping(false)
        socket.emit('stop_typing', { roomId: conversationId })
      }
    }
  }

  const handleCall = (callType) => {
    // Navigate to call page
    navigate(`/call?type=${callType}&conversationId=${conversationId}`)
  }

  if (conversationLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner />
      </div>
    )
  }

  const participant = conversation?.participant

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-3 sm:px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="mr-3 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
              {participant ? 
                `${participant.firstName?.charAt(0)}${participant.lastName?.charAt(0)}` :
                'U'
              }
            </div>
            <div className="ml-3">
              <h2 className="text-lg font-semibold text-gray-900">
                {participant ? 
                  `${participant.firstName} ${participant.lastName}` :
                  'Unknown User'
                }
              </h2>
              <p className="text-sm text-gray-500">
                {participant?.status === 'online' ? 'Online' : 'Offline'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleCall('audio')}
              className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            >
              <Phone className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleCall('video')}
              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Video className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4">
        {conversation?.messages?.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isOwn={msg.sender_id === user.id}
          />
        ))}
        
        {typingUsers.length > 0 && (
          <div className="flex items-center space-x-2 text-gray-500 text-sm">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span>Someone is typing...</span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 p-3 sm:p-4">
        <form onSubmit={handleSendMessage} className="flex space-x-3">
          <input
            type="text"
            value={message}
            onChange={handleTyping}
            placeholder="Type a message..."
            className="flex-1 input-field"
            disabled={sendMessageMutation.isLoading}
          />
          <button
            type="submit"
            disabled={!message.trim() || sendMessageMutation.isLoading}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  )
}

export default ChatPage 