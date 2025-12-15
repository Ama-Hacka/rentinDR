import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, LogOut, Plus } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { AuthModal } from '@/components/AuthModal'
import { cn } from '@/lib/utils'

export const Header: React.FC = () => {
  const navigate = useNavigate()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin')
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
  
  const { user, loading, signOut, checkAuth } = useAuthStore()

  useEffect(() => {
    checkAuth()
  }, [])

  const handleSignIn = () => {
    setAuthMode('signin')
    setShowAuthModal(true)
  }

  const handleSignUp = () => {
    setAuthMode('signup')
    setShowAuthModal(true)
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const handleListProperty = () => {
    if (!user) {
      setAuthMode('signup')
      setShowAuthModal(true)
      return
    }
    const role = (user as any)?.user_metadata?.role
    if (role === 'owner') {
      navigate('/owner/upload')
    } else {
      alert('Only property owners can list properties. Please sign up as an owner.')
      setAuthMode('signup')
      setShowAuthModal(true)
    }
  }

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div 
              className="flex items-center cursor-pointer"
              onClick={() => navigate('/')}
            >
              <h1 className="text-2xl font-bold text-blue-600">RentinDR</h1>
              <span className="ml-2 text-sm text-gray-500 hidden sm:inline">
                Find your perfect rental
              </span>
            </div>

            {/* Navigation */}
            <nav className="flex items-center space-x-4">
              {import.meta.env.DEV && supabaseUrl && (
                <span className="hidden md:inline text-xs text-gray-400 mr-2">
                  Supabase: {new URL(supabaseUrl).host}
                </span>
              )}
              <button
                onClick={handleListProperty}
                className={cn(
                  "flex items-center px-4 py-2 rounded-lg transition-colors",
                  "bg-blue-600 hover:bg-blue-700 text-white"
                )}
              >
                <Plus className="w-4 h-4 mr-2" />
                List Property
              </button>

              {user ? (
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => navigate('/account')}
                    className="flex items-center text-gray-700 hover:text-gray-900"
                  >
                    <User className="w-4 h-4 mr-2" />
                    <span className="text-sm font-medium">
                      {user.email?.split('@')[0]}
                    </span>
                  </button>
                  {(user as any)?.user_metadata?.role === 'owner' && (
                    <button
                      onClick={() => navigate('/owner/dashboard')}
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors text-sm"
                    >
                      My Properties
                    </button>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                    disabled={loading}
                  >
                    <LogOut className="w-4 h-4 mr-1" />
                    <span className="text-sm">Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleSignIn}
                    className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={handleSignUp}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
      />
    </>
  )
}
