import { Phone, Video, X } from 'lucide-react'

const CallModal = ({ user, onClose, onAccept }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-sm mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Call {user.firstName}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold text-2xl mx-auto mb-4">
            {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
          </div>
          <p className="text-gray-600">
            Choose how you'd like to call {user.firstName} {user.lastName}
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => onAccept('audio')}
            className="w-full flex items-center justify-center space-x-3 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg transition-colors"
          >
            <Phone className="w-5 h-5" />
            <span>Voice Call</span>
          </button>

          <button
            onClick={() => onAccept('video')}
            className="w-full flex items-center justify-center space-x-3 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition-colors"
          >
            <Video className="w-5 h-5" />
            <span>Video Call</span>
          </button>

          <button
            onClick={onClose}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 px-4 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default CallModal 