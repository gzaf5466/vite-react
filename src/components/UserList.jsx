import { Phone, Video, MessageCircle } from 'lucide-react'

const UserList = ({ users, onUserClick, onCallUser }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'online':
        return 'bg-green-500'
      case 'away':
        return 'bg-yellow-500'
      case 'busy':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const formatLastSeen = (lastSeen) => {
    if (!lastSeen) return 'Unknown'
    
    const date = new Date(lastSeen)
    const now = new Date()
    const diffInMinutes = Math.floor((now - date) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  return (
    <div className="divide-y divide-gray-200">
      {users.length === 0 ? (
        <div className="p-4 text-center text-gray-500">
          No users found
        </div>
      ) : (
        users.map((user) => (
          <div
            key={user.id}
            className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div 
                className="flex items-center flex-1"
                onClick={() => onUserClick(user.id)}
              >
                <div className="relative">
                  <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(user.status)}`}></div>
                </div>
                <div className="ml-3 flex-1">
                  <div className="flex items-center">
                    <p className="text-sm font-medium text-gray-900">
                      {user.firstName} {user.lastName}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500">@{user.username}</p>
                  <p className="text-xs text-gray-400">
                    {user.status === 'online' ? 'Online' : `Last seen ${formatLastSeen(user.lastSeen)}`}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onCallUser(user, 'audio')
                  }}
                  className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  title="Voice call"
                >
                  <Phone className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onCallUser(user, 'video')
                  }}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Video call"
                >
                  <Video className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onUserClick(user.id)
                  }}
                  className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                  title="Send message"
                >
                  <MessageCircle className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

export default UserList 