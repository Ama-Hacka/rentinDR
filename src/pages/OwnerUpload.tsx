import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Upload, Save, Eye, Home, DollarSign, Ruler, Bed, PawPrint, Check, MapPin } from 'lucide-react'
import { ImageUpload } from '@/components/ImageUpload'
import { usePropertyStore } from '@/stores/propertyStore'
import { useAuthStore } from '@/stores/authStore'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import { Helmet } from 'react-helmet-async'

const AMENITIES = [
  'Gym', 'Pool', 'Parking', 'Balcony', 'Air Conditioning', 
  'Heating', 'Dishwasher', 'Washer/Dryer', 'Hardwood Floors', 'Storage'
]

const NEGOTIABLE_ITEMS = [
  'Price', 'Lease Duration', 'Security Deposit', 'Pet Policy', 
  'Move-in Date', 'Utilities Included', 'Furniture', 'Parking'
]

export const OwnerUpload: React.FC = () => {
  const navigate = useNavigate()
  const { createProperty, loading } = usePropertyStore()
  const { user } = useAuthStore()
  
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
  const [showPreview, setShowPreview] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [accountPhone, setAccountPhone] = useState<string | null>(null)
  const [useAccountPhone, setUseAccountPhone] = useState(true)
  const [contactPhone, setContactPhone] = useState('')

  useEffect(() => {
    const role = (user as any)?.user_metadata?.role
    if (!user || role !== 'owner') {
      alert('Only property owners can upload listings')
      navigate('/')
    }
    const fetchPhone = async () => {
      if (!user) return
      const { data } = await supabase
        .from('users')
        .select('account_type, email, account_type, phone')
        .eq('id', user.id)
        .single()
      const phone = (data as any)?.phone || null
      setAccountPhone(phone)
    }
    fetchPhone()
  }, [user])

  const handleInputChange = (field: string, value: string | boolean | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleAmenityToggle = (amenity: string) => {
    const current = formData.amenities
    const newAmenities = current.includes(amenity)
      ? current.filter(a => a !== amenity)
      : [...current, amenity]
    handleInputChange('amenities', newAmenities)
  }

  const handleNegotiableToggle = (item: string) => {
    const current = formData.negotiable_items
    const newItems = current.includes(item)
      ? current.filter(i => i !== item)
      : [...current, item]
    handleInputChange('negotiable_items', newItems)
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.title.trim()) newErrors.title = 'Title is required'
    if (!formData.description.trim()) newErrors.description = 'Description is required'
    if (!formData.price || Number(formData.price) <= 0) newErrors.price = 'Valid price is required'
    if (!formData.location.trim()) newErrors.location = 'Location is required'
    if (!formData.rooms || Number(formData.rooms) <= 0) newErrors.rooms = 'Number of rooms is required'
    if (!formData.square_meters || Number(formData.square_meters) <= 0) newErrors.square_meters = 'Square meters is required'
    if (images.length === 0) newErrors.images = 'At least one image is required'
    if (!useAccountPhone && !contactPhone.trim()) newErrors.contact_phone = 'Contact phone is required or select account phone'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      if (submitting) return
      setSubmitting(true)
      if (!user) {
        alert('Please sign in to upload property images')
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
            order_index: i
          })
        }
      }

      await createProperty({
        title: formData.title,
        description: formData.description,
        price: Number(formData.price),
        location: formData.location,
        rooms: Number(formData.rooms),
        square_meters: Number(formData.square_meters),
        pets_allowed: formData.pets_allowed,
        negotiable: formData.negotiable,
        negotiable_items: formData.negotiable_items,
        amenities: formData.amenities,
        images: uploadedImages,
        contact_phone: useAccountPhone ? accountPhone || undefined : contactPhone
      } as any)
      
      navigate('/')
    } catch (error) {
      console.error('Error creating property:', error)
      alert('Failed to create property. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handlePreview = () => {
    if (validateForm()) {
      setShowPreview(true)
    }
  }

  if (showPreview) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Preview Header */}
        <nav className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowPreview(false)}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Form
              </button>
              <div className="text-sm text-gray-500">Preview Mode</div>
            </div>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* Preview Image */}
            <div className="relative h-96 bg-gray-200">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Property Preview</p>
                  <p className="text-sm text-gray-400">{images.length} images will be uploaded</p>
                </div>
              </div>
            </div>

            {/* Preview Content */}
            <div className="p-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{formData.title || 'Property Title'}</h1>
              
              <div className="flex items-center text-gray-600 mb-6">
                <MapPin className="w-5 h-5 mr-2" />
                <span className="text-lg">{formData.location || 'Location'}</span>
              </div>

              {/* Key Details */}
              <div className="grid grid-cols-4 gap-6 mb-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <DollarSign className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">
                    ${formData.price ? Number(formData.price).toLocaleString() : '0'}
                  </div>
                  <div className="text-sm text-gray-600">per month</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Bed className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{formData.rooms || '0'}</div>
                  <div className="text-sm text-gray-600">rooms</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Ruler className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{formData.square_meters || '0'}</div>
                  <div className="text-sm text-gray-600">sq meters</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <PawPrint className={cn("w-8 h-8 mx-auto mb-2", formData.pets_allowed ? "text-green-600" : "text-gray-400")} />
                  <div className="text-lg font-semibold text-gray-900">
                    {formData.pets_allowed ? 'Pets OK' : 'No Pets'}
                  </div>
                  <div className="text-sm text-gray-600">policy</div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Description</h3>
                <p className="text-gray-700 leading-relaxed">
                  {formData.description || 'Property description will appear here.'}
                </p>
              </div>

              {/* Amenities */}
              {formData.amenities.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Amenities</h3>
                  <div className="flex flex-wrap gap-2">
                    {formData.amenities.map((amenity) => (
                      <span key={amenity} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Negotiable Items */}
              {formData.negotiable_items.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Negotiable Items</h3>
                  <div className="flex flex-wrap gap-2">
                    {formData.negotiable_items.map((item) => (
                      <span key={item} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-8">
            <button
              onClick={() => setShowPreview(false)}
              className="flex-1 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Edit Listing
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Publish Listing'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>List Your Property — RentinDR</title>
        <meta name="description" content="Upload your property details, photos, and contact information to list on RentinDR." />
        <link rel="canonical" href={typeof window !== 'undefined' ? `${window.location.origin}/owner/upload` : 'https://rentindr.com/owner/upload'} />
      </Helmet>
      {/* Header */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Home
            </button>
            <h1 className="text-xl font-semibold text-gray-900">List Your Property</h1>
            <div className="w-20"></div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Property Images */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Upload className="w-5 h-5 mr-2" />
              Property Images
            </h2>
            <ImageUpload onImagesChange={setImages} />
            {errors.images && (
              <p className="text-red-600 text-sm mt-2">{errors.images}</p>
            )}
          </div>

          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Home className="w-5 h-5 mr-2" />
              Basic Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className={cn(
                    "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                    errors.title ? "border-red-500" : "border-gray-300"
                  )}
                  placeholder="e.g., Modern 2BR Apartment with City View"
                />
                {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monthly Rent *
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  className={cn(
                    "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                    errors.price ? "border-red-500" : "border-gray-300"
                  )}
                  placeholder="2500"
                />
                {errors.price && <p className="text-red-600 text-sm mt-1">{errors.price}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className={cn(
                    "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                    errors.location ? "border-red-500" : "border-gray-300"
                  )}
                  placeholder="e.g., Downtown, Santo Domingo"
                />
                {errors.location && <p className="text-red-600 text-sm mt-1">{errors.location}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Rooms *
                </label>
                <select
                  value={formData.rooms}
                  onChange={(e) => handleInputChange('rooms', e.target.value)}
                  className={cn(
                    "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                    errors.rooms ? "border-red-500" : "border-gray-300"
                  )}
                >
                  <option value="">Select rooms</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                    <option key={num} value={num}>{num} {num === 1 ? 'Room' : 'Rooms'}</option>
                  ))}
                </select>
                {errors.rooms && <p className="text-red-600 text-sm mt-1">{errors.rooms}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Square Meters *
                </label>
                <input
                  type="number"
                  value={formData.square_meters}
                  onChange={(e) => handleInputChange('square_meters', e.target.value)}
                  className={cn(
                    "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                    errors.square_meters ? "border-red-500" : "border-gray-300"
                  )}
                  placeholder="120"
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

          {/* Contact Phone */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Phone</h2>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={useAccountPhone}
                  onChange={() => setUseAccountPhone(true)}
                  className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  Use account phone {accountPhone ? `(${accountPhone})` : '(not set)'}
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={!useAccountPhone}
                  onChange={() => setUseAccountPhone(false)}
                  className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 mr-3">Use custom number</span>
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+1 555-123-4567"
                  disabled={useAccountPhone}
                />
              </label>
              {errors.contact_phone && <p className="text-red-600 text-sm mt-1">{errors.contact_phone}</p>}
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Property Description *</h2>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={6}
              className={cn(
                "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                errors.description ? "border-red-500" : "border-gray-300"
              )}
              placeholder="Describe your property in detail. Mention what makes it special, nearby attractions, transportation, etc."
            />
            {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description}</p>}
          </div>

          {/* Amenities */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Amenities</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {AMENITIES.map((amenity) => (
                <label key={amenity} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.amenities.includes(amenity)}
                    onChange={() => handleAmenityToggle(amenity)}
                    className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{amenity}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Negotiable Items */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Negotiable Items</h2>
            <p className="text-sm text-gray-600 mb-4">Select items that you're willing to negotiate with potential tenants.</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {NEGOTIABLE_ITEMS.map((item) => (
                <label key={item} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.negotiable_items.includes(item)}
                    onChange={() => handleNegotiableToggle(item)}
                    className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{item}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={handlePreview}
              className="flex-1 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
            >
              <Eye className="w-5 h-5 mr-2" />
              Preview Listing
            </button>
            <button
              type="submit"
              disabled={loading || submitting}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <Save className="w-5 h-5 mr-2" />
              {loading ? 'Publishing...' : 'Publish Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
