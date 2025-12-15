import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePropertyStore } from '@/stores/propertyStore'
import { useAuthStore } from '@/stores/authStore'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { Helmet } from 'react-helmet-async'

export const OwnerDashboard: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { properties, loading, error, fetchOwnerProperties, deleteProperty } = usePropertyStore()

  useEffect(() => {
    const role = (user as any)?.user_metadata?.role
    if (!user || role !== 'owner') {
      navigate('/')
      return
    }
    fetchOwnerProperties()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this property? This cannot be undone.')) return
    try {
      await deleteProperty(id)
    } catch (e) {
      alert('Failed to delete property')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Owner Dashboard — RentinDR</title>
        <meta name="description" content="Manage your property listings, edit details, and publish new rentals on RentinDR." />
        <link rel="canonical" href={typeof window !== 'undefined' ? `${window.location.origin}/owner/dashboard` : 'https://rentindr.com/owner/dashboard'} />
        <meta name="robots" content="noindex" />
      </Helmet>
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">My Properties</h1>
          <button
            onClick={() => navigate('/owner/upload')}
            className="flex items-center px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            List New Property
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <p className="text-gray-600">Loading...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : properties.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">You have no properties yet.</p>
            <button
              onClick={() => navigate('/owner/upload')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              List Your First Property
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((p) => (
              <div key={p.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="h-40 bg-gray-100">
                  {p.thumbnail_url && (
                    <img src={p.thumbnail_url} alt={p.title} className="w-full h-full object-cover" loading="lazy" />
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900">{p.title}</h3>
                  <p className="text-sm text-gray-600">{p.location}</p>
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-gray-900 font-medium">${p.price.toLocaleString()}/mo</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/owner/edit/${p.id}`)}
                        className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
