import { format } from 'date-fns'

const MessageBubble = ({ message, isOwn }) => {
  const formatTime = (timestamp) => {
    return format(new Date(timestamp), 'HH:mm')
  }

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-2' : 'order-1'}`}>
        <div className={`message-bubble ${isOwn ? 'message-sent' : 'message-received'}`}>
          <p className="text-sm">{message.content}</p>
          <div className={`flex items-center justify-end mt-1 space-x-1 ${isOwn ? 'text-primary-100' : 'text-gray-500'}`}>
            <span className="text-xs">{formatTime(message.created_at)}</span>
            {isOwn && (
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MessageBubble 