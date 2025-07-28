import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from 'react-query'
import { 
  MessageCircle, 
  Phone, 
  Video, 
  Search, 
  LogOut, 
  User, 
  Settings,
  Plus
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useSocket } from '../contexts/SocketContext'
import api from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import UserList from '../components/UserList'
import ConversationList from '../components/ConversationList'
import CallModal from '../components/CallModal'

const Dashboard = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { socket, connectSocket } = useSocket()
  const [activeTab, setActiveTab] = useState('conversations')
  const [searchQuery, setSearchQuery] = useState('')
  const [showCallModal, setShowCallModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)

  // Fetch conversations
  const { data: conversations, isLoading: conversationsLoading } = useQuery(
    ['conversations'],
    () => api.get('/messages/conversations').then(res => res.data.conversations),
    { refetchInterval: 5000 }
  )

  // Fetch users
  const { data: users, isLoading: usersLoading } = useQuery(
    ['users', searchQuery],
    () => api.get(`/users?search=${searchQuery}`).then(res => res.data.users),
    { enabled: activeTab === 'users' }
  )

  useEffect(() => {
    if (user && !socket) {
      const token = localStorage.getItem('token')
      if (token) {
        connectSocket(token)
      }
    }
  }, [user, socket, connectSocket])

  const handleLogout = async () => {
    await logout()
  }

  const handleStartConversation = async (userId) => {
    try {
      const response = await api.get(`/messages/conversation/${userId}`)
      navigate(`/chat/${response.data.conversation.id}`)
    } catch (error) {
      console.error('Error starting conversation:', error)
    }
  }

  const handleCallUser = (user, callType) => {
    setSelectedUser(user)
    setShowCallModal(true)
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-full sm:w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <MessageCircle className="w-8 h-8 text-primary-600 mr-2" />
              <span className="text-xl font-bold text-gray-900">MessagingSystem</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigate('/profile')}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <User className="w-5 h-5" />
              </button>
              <button
                onClick={() => navigate('/settings')}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Settings className="w-5 h-5" />
              </button>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
              {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-500">@{user?.username}</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('conversations')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'conversations'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Conversations
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'users'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Users
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'conversations' ? (
            conversationsLoading ? (
              <div className="flex items-center justify-center h-64">
                <LoadingSpinner />
              </div>
            ) : (
              <ConversationList
                conversations={conversations || []}
                onConversationClick={(conversation) => navigate(`/chat/${conversation.id}`)}
              />
            )
          ) : (
            usersLoading ? (
              <div className="flex items-center justify-center h-64">
                <LoadingSpinner />
              </div>
            ) : (
              <UserList
                users={users || []}
                onUserClick={handleStartConversation}
                onCallUser={handleCallUser}
              />
            )
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Welcome to MessagingSystem
            </h3>
            <p className="text-gray-500 mb-6">
              Select a conversation or start chatting with someone new
            </p>
            <button
              onClick={() => setActiveTab('users')}
              className="btn-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Start New Conversation
            </button>
          </div>
        </div>
      </div>

      {/* Call Modal */}
      {showCallModal && selectedUser && (
        <CallModal
          user={selectedUser}
          onClose={() => setShowCallModal(false)}
          onAccept={(callType) => {
            setShowCallModal(false)
            navigate(`/call?type=${callType}&userId=${selectedUser.id}`)
          }}
        />
      )}
    </div>
  )
}

export default Dashboard 