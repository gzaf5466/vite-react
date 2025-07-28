import { Link } from 'react-router-dom'
import { MessageCircle, Phone, Video, Shield, Zap, Users } from 'lucide-react'

const LandingPage = () => {
  const features = [
    {
      icon: <MessageCircle className="w-8 h-8 text-primary-600" />,
      title: 'Real-time Messaging',
      description: 'Send and receive messages instantly with real-time updates and typing indicators.'
    },
    {
      icon: <Phone className="w-8 h-8 text-primary-600" />,
      title: 'Voice Calls',
      description: 'Make crystal clear voice calls with high-quality audio and low latency.'
    },
    {
      icon: <Video className="w-8 h-8 text-primary-600" />,
      title: 'Video Calls',
      description: 'Connect face-to-face with HD video calls and screen sharing capabilities.'
    },
    {
      icon: <Shield className="w-8 h-8 text-primary-600" />,
      title: 'Secure & Private',
      description: 'Your conversations are encrypted and secure with end-to-end protection.'
    },
    {
      icon: <Zap className="w-8 h-8 text-primary-600" />,
      title: 'Lightning Fast',
      description: 'Built with modern technologies for blazing fast performance.'
    },
    {
      icon: <Users className="w-8 h-8 text-primary-600" />,
      title: 'User Friendly',
      description: 'Intuitive interface designed for the best user experience.'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-secondary-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <MessageCircle className="w-8 h-8 text-primary-600 mr-2" />
              <span className="text-xl font-bold text-secondary-900">MessagingSystem</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-secondary-600 hover:text-secondary-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="btn-primary text-sm"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-20 pb-12 sm:pb-16">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-secondary-900 mb-4 sm:mb-6">
            Connect with{' '}
            <span className="text-primary-600">Everyone</span>
          </h1>
          <p className="text-lg sm:text-xl text-secondary-600 mb-6 sm:mb-8 max-w-3xl mx-auto px-4">
            Experience seamless messaging, crystal-clear voice calls, and high-quality video conversations. 
            Stay connected with friends, family, and colleagues like never before.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="btn-primary text-lg px-8 py-3"
            >
              Start Messaging Now
            </Link>
            <Link
              to="/login"
              className="btn-secondary text-lg px-8 py-3"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">
            Everything you need to stay connected
          </h2>
          <p className="text-lg text-secondary-600 max-w-2xl mx-auto">
            Our platform provides all the tools you need for modern communication
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="card p-6 hover:shadow-lg transition-shadow duration-300"
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-secondary-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-secondary-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to get started?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join thousands of users who are already enjoying seamless communication
          </p>
          <Link
            to="/register"
            className="bg-white text-primary-600 hover:bg-primary-50 font-medium py-3 px-8 rounded-lg transition-colors duration-200 text-lg"
          >
            Create Your Account
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-secondary-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <MessageCircle className="w-8 h-8 text-primary-400 mr-2" />
              <span className="text-xl font-bold">MessagingSystem</span>
            </div>
            <p className="text-secondary-400 mb-4">
              Connecting people through modern communication
            </p>
            <div className="flex justify-center space-x-6 text-sm text-secondary-400">
              <span>© 2024 MessagingSystem. All rights reserved.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage 