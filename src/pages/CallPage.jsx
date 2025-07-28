import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff, Settings } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useSocket } from '../contexts/SocketContext'
import LoadingSpinner from '../components/LoadingSpinner'

const CallPage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { socket } = useSocket()
  
  const [callType, setCallType] = useState(searchParams.get('type') || 'audio')
  const [isIncoming, setIsIncoming] = useState(false)
  const [callStatus, setCallStatus] = useState('connecting') // connecting, ringing, connected, ended
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(callType === 'audio')
  const [remoteUser, setRemoteUser] = useState(null)
  
  const localVideoRef = useRef(null)
  const remoteVideoRef = useRef(null)
  const localStreamRef = useRef(null)
  const peerConnectionRef = useRef(null)

  useEffect(() => {
    if (socket) {
      // Handle incoming calls
      socket.on('incoming_call', (data) => {
        setRemoteUser(data)
        setIsIncoming(true)
        setCallStatus('ringing')
      })

      // Handle call accepted
      socket.on('call_accepted', (data) => {
        setCallStatus('connected')
        initializeWebRTC()
      })

      // Handle call rejected
      socket.on('call_rejected', (data) => {
        setCallStatus('ended')
        setTimeout(() => navigate('/dashboard'), 2000)
      })

      // Handle call ended
      socket.on('call_ended', (data) => {
        setCallStatus('ended')
        endCall()
        setTimeout(() => navigate('/dashboard'), 2000)
      })

      // WebRTC signaling
      socket.on('offer', handleOffer)
      socket.on('answer', handleAnswer)
      socket.on('ice_candidate', handleIceCandidate)

      return () => {
        socket.off('incoming_call')
        socket.off('call_accepted')
        socket.off('call_rejected')
        socket.off('call_ended')
        socket.off('offer')
        socket.off('answer')
        socket.off('ice_candidate')
      }
    }
  }, [socket, navigate])

  const initializeWebRTC = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: callType === 'video'
      })
      
      localStreamRef.current = stream
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }

      const peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' }
        ]
      })

      peerConnectionRef.current = peerConnection

      stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream)
      })

      peerConnection.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0]
        }
      }

      peerConnection.onicecandidate = (event) => {
        if (event.candidate && socket) {
          socket.emit('ice_candidate', {
            candidate: event.candidate,
            targetUserId: remoteUser?.callerId || remoteUser?.id
          })
        }
      }

      if (!isIncoming) {
        const offer = await peerConnection.createOffer()
        await peerConnection.setLocalDescription(offer)
        
        if (socket) {
          socket.emit('offer', {
            offer: offer,
            targetUserId: remoteUser?.id
          })
        }
      }
    } catch (error) {
      console.error('Error initializing WebRTC:', error)
      setCallStatus('ended')
    }
  }

  const handleOffer = async (data) => {
    try {
      const peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' }
        ]
      })

      peerConnectionRef.current = peerConnection

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: callType === 'video'
      })

      localStreamRef.current = stream
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }

      stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream)
      })

      peerConnection.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0]
        }
      }

      peerConnection.onicecandidate = (event) => {
        if (event.candidate && socket) {
          socket.emit('ice_candidate', {
            candidate: event.candidate,
            targetUserId: data.callerId
          })
        }
      }

      await peerConnection.setRemoteDescription(data.offer)
      const answer = await peerConnection.createAnswer()
      await peerConnection.setLocalDescription(answer)

      if (socket) {
        socket.emit('answer', {
          answer: answer,
          callerId: data.callerId
        })
      }
    } catch (error) {
      console.error('Error handling offer:', error)
    }
  }

  const handleAnswer = async (data) => {
    try {
      await peerConnectionRef.current.setRemoteDescription(data.answer)
    } catch (error) {
      console.error('Error handling answer:', error)
    }
  }

  const handleIceCandidate = async (data) => {
    try {
      await peerConnectionRef.current.addIceCandidate(data.candidate)
    } catch (error) {
      console.error('Error handling ICE candidate:', error)
    }
  }

  const acceptCall = () => {
    setIsIncoming(false)
    setCallStatus('connected')
    if (socket) {
      socket.emit('call_accepted', { callerId: remoteUser.callerId })
    }
    initializeWebRTC()
  }

  const rejectCall = () => {
    if (socket) {
      socket.emit('call_rejected', { callerId: remoteUser.callerId })
    }
    setCallStatus('ended')
    setTimeout(() => navigate('/dashboard'), 2000)
  }

  const endCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop())
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close()
    }
    if (socket) {
      socket.emit('call_ended', { targetUserId: remoteUser?.id })
    }
    setCallStatus('ended')
  }

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setIsMuted(!audioTrack.enabled)
      }
    }
  }

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        setIsVideoOff(!videoTrack.enabled)
      }
    }
  }

  if (callStatus === 'connecting') {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center text-white">
          <LoadingSpinner size="lg" className="mb-4" />
          <p>Connecting...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gray-900 relative">
      {/* Video Streams */}
      <div className="relative h-full">
        {callType === 'video' && (
          <>
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="absolute top-4 right-4 w-48 h-36 object-cover rounded-lg border-2 border-white"
            />
          </>
        )}
      </div>

      {/* Call Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-8">
        <div className="flex items-center justify-center space-x-4">
          {callStatus === 'ringing' && isIncoming ? (
            <>
              <button
                onClick={acceptCall}
                className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-full transition-colors"
              >
                <Phone className="w-6 h-6" />
              </button>
              <button
                onClick={rejectCall}
                className="bg-red-600 hover:bg-red-700 text-white p-4 rounded-full transition-colors"
              >
                <PhoneOff className="w-6 h-6" />
              </button>
            </>
          ) : callStatus === 'connected' ? (
            <>
              <button
                onClick={toggleMute}
                className={`p-4 rounded-full transition-colors ${
                  isMuted ? 'bg-red-600 text-white' : 'bg-white text-gray-900'
                }`}
              >
                {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </button>
              {callType === 'video' && (
                <button
                  onClick={toggleVideo}
                  className={`p-4 rounded-full transition-colors ${
                    isVideoOff ? 'bg-red-600 text-white' : 'bg-white text-gray-900'
                  }`}
                >
                  {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
                </button>
              )}
              <button
                onClick={endCall}
                className="bg-red-600 hover:bg-red-700 text-white p-4 rounded-full transition-colors"
              >
                <PhoneOff className="w-6 h-6" />
              </button>
            </>
          ) : null}
        </div>
      </div>

      {/* Call Status */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 text-white text-center">
        <h2 className="text-xl font-semibold mb-2">
          {callStatus === 'ringing' && isIncoming ? 'Incoming Call' : 'Call'}
        </h2>
        <p className="text-gray-300">
          {remoteUser?.callerName || remoteUser?.firstName} {remoteUser?.lastName}
        </p>
        <p className="text-sm text-gray-400 capitalize">
          {callType} call • {callStatus}
        </p>
      </div>
    </div>
  )
}

export default CallPage 