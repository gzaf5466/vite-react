import { format } from 'date-fns'

const ConversationList = ({ conversations, onConversationClick }) => {
  const formatLastMessageTime = (timestamp) => {
    if (!timestamp) return ''
    
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))
    
    if (diffInHours < 24) {
      return format(date, 'HH:mm')
    } else if (diffInHours < 168) { // 7 days
      return format(date, 'EEE')
    } else {
      return format(date, 'MMM dd')
    }
  }

  const truncateMessage = (message, maxLength = 50) => {
    if (!message) return ''
    return message.length > maxLength ? message.substring(0, maxLength) + '...' : message
  }

  return (
    <div className="divide-y divide-gray-200">
      {conversations.length === 0 ? (
        <div className="p-4 text-center text-gray-500">
          No conversations yet
        </div>
      ) : (
        conversations.map((conversation) => (
          <div
            key={conversation.id}
            className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
            onClick={() => onConversationClick(conversation)}
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
                {conversation.participant ? 
                  `${conversation.participant.firstName?.charAt(0)}${conversation.participant.lastName?.charAt(0)}` :
                  conversation.name?.charAt(0) || 'G'
                }
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {conversation.name || 
                      (conversation.participant ? 
                        `${conversation.participant.firstName} ${conversation.participant.lastName}` : 
                        'Unknown'
                      )
                    }
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatLastMessageTime(conversation.lastMessageTime)}
                  </p>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-sm text-gray-500 truncate">
                    {truncateMessage(conversation.lastMessage)}
                  </p>
                  {conversation.unreadCount > 0 && (
                    <span className="ml-2 bg-primary-600 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                      {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                    </span>
                  )}
                </div>
                {conversation.participant && (
                  <div className="flex items-center mt-1">
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                      conversation.participant.status === 'online' ? 'bg-green-500' :
                      conversation.participant.status === 'away' ? 'bg-yellow-500' :
                      conversation.participant.status === 'busy' ? 'bg-red-500' : 'bg-gray-500'
                    }`}></div>
                    <p className="text-xs text-gray-400">
                      {conversation.participant.status === 'online' ? 'Online' : 'Offline'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

export default ConversationList 