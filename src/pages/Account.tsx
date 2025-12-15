import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { supabase } from '@/lib/supabase'
import { User, Mail, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Helmet } from 'react-helmet-async'

export const Account: React.FC = () => {
  const navigate = useNavigate()
  const { user, loading, error, checkAuth, updateRole, signOut } = useAuthStore()
  const [nextRole, setNextRole] = useState<'seeker' | 'owner'>('seeker')
  const currentRole = (user as any)?.user_metadata?.role || 'seeker'
  const [dbRole, setDbRole] = useState<string | null>(null)
  const [phone, setPhone] = useState('')
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileMessage, setProfileMessage] = useState<string | null>(null)

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    setNextRole(currentRole)
    const fetchDbRole = async () => {
      if (!user) return
      const { data } = await supabase
        .from('users')
        .select('account_type, phone')
        .eq('id', user.id)
        .single()
      setDbRole(data?.account_type ?? null)
      setPhone((data as any)?.phone || '')
    }
    fetchDbRole()
  }, [currentRole])

  const handleSave = async () => {
    if (nextRole === currentRole) return
    try {
      await updateRole(nextRole)
    } catch {
    }
  }

  const handleSaveProfile = async () => {
    if (!user) return
    try {
      setProfileSaving(true)
      setProfileMessage(null)
      const { error } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          email: user.email,
          account_type: (user as any)?.user_metadata?.role || 'seeker',
          phone
        }, { onConflict: 'id' })
      if (error) {
        setProfileMessage(error.message)
      } else {
        setProfileMessage('Profile saved')
      }
    } finally {
      setProfileSaving(false)
    }
  }

  if (loading && !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading account...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-sm text-center">
          <div className="text-gray-700 mb-4">Please sign in to view your account.</div>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Go Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Account — RentinDR</title>
        <meta name="description" content="View and manage your RentinDR account, role, and profile details." />
        <link rel="canonical" href={typeof window !== 'undefined' ? `${window.location.origin}/account` : 'https://rentindr.com/account'} />
        <meta name="robots" content="noindex" />
      </Helmet>
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Account</h1>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Home
          </button>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile</h2>
          <div className="space-y-3">
            <div className="flex items-center text-gray-700">
              <User className="w-5 h-5 mr-2" />
              <span className="text-sm">{user.id}</span>
            </div>
            <div className="flex items-center text-gray-700">
              <Mail className="w-5 h-5 mr-2" />
              <span className="text-sm">{user.email}</span>
            </div>
            <div className="flex items-center text-gray-700">
              <Shield className="w-5 h-5 mr-2" />
              <span className="text-sm">Role: {currentRole} {dbRole ? `(DB: ${dbRole})` : ''}</span>
            </div>
            <div className="flex items-center text-gray-700">
              <span className="text-sm mr-3">Phone</span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="+1 555-123-4567"
              />
            </div>
            <div>
              <button
                onClick={handleSaveProfile}
                disabled={profileSaving}
                className="mt-2 border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg disabled:opacity-50"
              >Save Profile</button>
              {profileMessage && (
                <p className={`text-sm mt-2 ${profileMessage === 'Profile saved' ? 'text-green-600' : 'text-red-600'}`}>
                  {profileMessage}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Type</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <button
              type="button"
              onClick={() => setNextRole('seeker')}
              className={cn(
                "p-4 border rounded-lg text-center transition-colors",
                nextRole === 'seeker'
                  ? "border-blue-600 bg-blue-50 text-blue-700"
                  : "border-gray-300 hover:border-gray-400"
              )}
            >
              Property Seeker
            </button>
            <button
              type="button"
              onClick={() => setNextRole('owner')}
              className={cn(
                "p-4 border rounded-lg text-center transition-colors",
                nextRole === 'owner'
                  ? "border-blue-600 bg-blue-50 text-blue-700"
                  : "border-gray-300 hover:border-gray-400"
              )}
            >
              Property Owner
            </button>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={loading || nextRole === currentRole}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Changes
            </button>
            <button
              onClick={() => signOut()}
              className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg"
            >
              Sign Out
            </button>
          </div>
          {error && <p className="text-red-600 text-sm mt-3">{error}</p>}
        </div>
      </div>
    </div>
  )
}
