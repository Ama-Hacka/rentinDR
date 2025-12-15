import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save, Upload, Home, DollarSign, Ruler, Bed, PawPrint, Trash2 } from 'lucide-react'
import { usePropertyStore } from '@/stores/propertyStore'
import { useAuthStore } from '@/stores/authStore'
import { ImageUpload } from '@/components/ImageUpload'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import { Helmet } from 'react-helmet-async'

const AMENITIES = [
  'Gym', 'Pool', 'Parking', 'Balcony', 'Air Conditioning',
  'Heating', 'Dishwasher', 'Washer/Dryer', 'Hardwood Floors', 'Storage'
]

export const OwnerEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { currentProperty, fetchPropertyById, updateProperty, loading } = usePropertyStore()

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
    rooms: '',
    square_meters: '',
    pets_allowed: false,
    negotiable: false,
    negotiable_items: [] as string[],
    amenities: [] as string[]
  })
  const [images, setImages] = useState<File[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [removingImageIds, setRemovingImageIds] = useState<string[]>([])
  const [contactPhone, setContactPhone] = useState('')

  useEffect(() => {
    const role = (user as any)?.user_metadata?.role
    if (!user || role !== 'owner') {
      navigate('/')
      return
    }
    if (id) fetchPropertyById(id)
  }, [id])

  useEffect(() => {
    if (currentProperty) {
      setFormData({
        title: currentProperty.title,
        description: currentProperty.description,
        price: String(currentProperty.price),
        location: currentProperty.location,
        rooms: String(currentProperty.rooms),
        square_meters: String(currentProperty.square_meters),
        pets_allowed: currentProperty.pets_allowed,
        negotiable: currentProperty.negotiable,
        negotiable_items: currentProperty.negotiable_items || [],
        amenities: currentProperty.amenities.map(a => a.amenity_name)
      })
      setContactPhone(currentProperty.contact_phone || '')
    }
  }, [currentProperty])

  const handleInputChange = (field: string, value: string | boolean | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.title.trim()) newErrors.title = 'Title is required'
    if (!formData.description.trim()) newErrors.description = 'Description is required'
    if (!formData.price || Number(formData.price) <= 0) newErrors.price = 'Valid price is required'
    if (!formData.location.trim()) newErrors.location = 'Location is required'
    if (!formData.rooms || Number(formData.rooms) <= 0) newErrors.rooms = 'Number of rooms is required'
    if (!formData.square_meters || Number(formData.square_meters) <= 0) newErrors.square_meters = 'Square meters is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm() || !id) return
    try {
      if (removingImageIds.length > 0) return
      if (!user) {
        alert('Please sign in to edit properties')
        return
      }
      const uploadedImages: { image_url: string; order_index: number }[] = []
      if (images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          const file = images[i]
          const path = `${user.id}/${Date.now()}_${i}_${file.name}`
          const { data: uploadData, error: uploadError } = await supabase
            .storage
            .from('property-images')
            .upload(path, file, { cacheControl: '3600', upsert: false })
          if (uploadError) {
            setErrors(prev => ({ ...prev, images: uploadError.message }))
            throw uploadError
          }
          const { data: publicData } = supabase
            .storage
            .from('property-images')
            .getPublicUrl(uploadData.path)
          uploadedImages.push({
            image_url: publicData.publicUrl,
            order_index: i + (currentProperty?.images?.length || 0)
          })
        }
      }

      await updateProperty(id, {
        title: formData.title,
        description: formData.description,
        price: Number(formData.price),
        location: formData.location,
        rooms: Number(formData.rooms),
        square_meters: Number(formData.square_meters),
        pets_allowed: formData.pets_allowed,
        negotiable_items: formData.negotiable_items,
        amenities: formData.amenities,
        images: uploadedImages,
        contact_phone: contactPhone || undefined
      })
      navigate('/owner/dashboard')
    } catch (error) {
      alert('Failed to update property')
    }
  }

  const removeExistingImage = async (imageId: string, imageUrl: string) => {
    if (!currentProperty) return
    try {
      setRemovingImageIds(prev => [...prev, imageId])
      const marker = '/property-images/'
      const idx = imageUrl.indexOf(marker)
      const path = idx >= 0 ? imageUrl.substring(idx + marker.length) : ''
      if (path) {
        await supabase.storage.from('property-images').remove([path])
      }
      await supabase.from('property_images').delete().eq('id', imageId)
      await fetchPropertyById(currentProperty.id)
    } catch (e) {
      alert('Failed to remove image')
    } finally {
      setRemovingImageIds(prev => prev.filter(id => id !== imageId))
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Edit Property — RentinDR</title>
        <meta name="description" content="Edit your property listing details, images, and contact information on RentinDR." />
        <link rel="canonical" href={typeof window !== 'undefined' ? `${window.location.origin}/owner/edit/${id ?? ''}` : 'https://rentindr.com/owner/edit'} />
        <meta name="robots" content="noindex" />
      </Helmet>
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/owner/dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </button>
          <h1 className="text-xl font-semibold text-gray-900">Edit Property</h1>
          <div className="w-20" />
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Upload className="w-5 h-5 mr-2" />
              Images
            </h2>
            {currentProperty && currentProperty.images && currentProperty.images.length > 0 && (
              <div className="mb-4">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {currentProperty.images.map(img => (
                    <div key={img.id} className="relative group">
                      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                        <img src={img.image_url} alt="Property" className="w-full h-full object-cover" loading="lazy" />
                      </div>
                      <button
                        onClick={() => removeExistingImage(img.id, img.image_url)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        disabled={removingImageIds.includes(img.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <ImageUpload onImagesChange={setImages} />
            {errors.images && <p className="text-red-600 text-sm mt-2">{errors.images}</p>}
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Home className="w-5 h-5 mr-2" />
              Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Property Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className={cn("w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent", errors.title ? "border-red-500" : "border-gray-300")}
                />
                {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Rent *</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  className={cn("w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent", errors.price ? "border-red-500" : "border-gray-300")}
                />
                {errors.price && <p className="text-red-600 text-sm mt-1">{errors.price}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className={cn("w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent", errors.location ? "border-red-500" : "border-gray-300")}
                />
                {errors.location && <p className="text-red-600 text-sm mt-1">{errors.location}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Number of Rooms *</label>
                <input
                  type="number"
                  value={formData.rooms}
                  onChange={(e) => handleInputChange('rooms', e.target.value)}
                  className={cn("w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent", errors.rooms ? "border-red-500" : "border-gray-300")}
                />
                {errors.rooms && <p className="text-red-600 text-sm mt-1">{errors.rooms}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Square Meters *</label>
                <input
                  type="number"
                  value={formData.square_meters}
                  onChange={(e) => handleInputChange('square_meters', e.target.value)}
                  className={cn("w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent", errors.square_meters ? "border-red-500" : "border-gray-300")}
                />
                {errors.square_meters && <p className="text-red-600 text-sm mt-1">{errors.square_meters}</p>}
              </div>
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.pets_allowed}
                    onChange={(e) => handleInputChange('pets_allowed', e.target.checked)}
                    className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700 flex items-center">
                    <PawPrint className="w-4 h-4 mr-1" />
                    Pets Allowed
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Property Description *</h2>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={6}
              className={cn("w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent", errors.description ? "border-red-500" : "border-gray-300")}
            />
            {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description}</p>}
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Amenities</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {AMENITIES.map((amenity) => (
                <label key={amenity} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.amenities.includes(amenity)}
                    onChange={() => {
                      const current = formData.amenities
                      const newAmenities = current.includes(amenity)
                        ? current.filter(a => a !== amenity)
                        : [...current, amenity]
                      handleInputChange('amenities', newAmenities)
                    }}
                    className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{amenity}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Phone</h2>
            <input
              type="tel"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="+1 555-123-4567"
            />
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate('/owner/dashboard')}
              className="flex-1 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5 mr-2 inline" />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
