import React, { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Bed, Square, PawPrint, Mail, Phone, MapPin, Calendar, DollarSign, MessageCircle, Heart } from 'lucide-react'
import { ImageGallery } from '@/components/ImageGallery'
import { usePropertyStore } from '@/stores/propertyStore'
import { cn, isMobileDevice, digitsOnly } from '@/lib/utils'
import { useAuthStore } from '@/stores/authStore'
import { Helmet } from 'react-helmet-async'

export const PropertyDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  
  const {
    currentProperty,
    loading,
    error,
    fetchPropertyById,
    toggleFavorite,
    isFavorite,
    loadFavorites
  } = usePropertyStore()
  const { user } = useAuthStore()

  useEffect(() => {
    if (id) {
      fetchPropertyById(id)
    }
  }, [id])
  useEffect(() => {
    loadFavorites()
  }, [user?.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading property details...</p>
        </div>
      </div>
    )
  }

  if (error || !currentProperty) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Property Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'The property you are looking for could not be found.'}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors duration-200"
          >
            Back to Listings
          </button>
        </div>
      </div>
    )
  }

  const property = currentProperty
  const seeker = (user as any)?.user_metadata?.role === 'seeker'
  const fav = isFavorite(property.id)
  const propertyUrl = typeof window !== 'undefined' ? `${window.location.origin}/property/${property.id}` : ''
  const waMessage = `Hi, I'm interested in this property: ${property.title}\n${propertyUrl}`
  const description = property.description.length > 160 ? `${property.description.slice(0, 157)}...` : property.description
  const imageUrl = property.images?.[0]?.image_url || '/favicon.svg'

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>{property.title} — RentinDR</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={propertyUrl} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={`${property.title} — RentinDR`} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={propertyUrl} />
        <meta property="og:image" content={imageUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${property.title} — RentinDR`} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={imageUrl} />
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'RealEstateListing',
            name: property.title,
            description,
            url: propertyUrl,
            image: imageUrl,
            offers: {
              '@type': 'Offer',
              price: property.price,
              priceCurrency: 'USD',
              availability: 'https://schema.org/InStock'
            },
            additionalProperty: [
              { '@type': 'PropertyValue', name: 'Rooms', value: property.rooms },
              { '@type': 'PropertyValue', name: 'SquareMeters', value: property.square_meters },
              { '@type': 'PropertyValue', name: 'PetsAllowed', value: property.pets_allowed ? 'Yes' : 'No' }
            ],
            areaServed: property.location
          })}
        </script>
      </Helmet>
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Listings
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <ImageGallery images={property.images} title={property.title} />
            </div>

            {/* Property Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-3xl font-bold text-gray-900">{property.title}</h1>
                {seeker && (
                  <button
                    aria-label="Toggle favorite"
                    onClick={async () => {
                      try {
                        await toggleFavorite(property.id)
                      } catch {}
                    }}
                    className={cn(
                      "p-2 rounded-full border transition-colors",
                      fav ? "bg-red-50 border-red-200" : "bg-white border-gray-200 hover:bg-gray-50"
                    )}
                  >
                    <Heart
                      className={cn("w-5 h-5", fav ? "text-red-600" : "text-gray-600")}
                      fill={fav ? "currentColor" : "none"}
                    />
                  </button>
                )}
              </div>
              
              <div className="flex items-center text-gray-600 mb-6">
                <MapPin className="w-5 h-5 mr-2" />
                <span className="text-lg">{property.location}</span>
              </div>

              {/* Key Details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <DollarSign className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">${property.price.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">per month</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Bed className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{property.rooms}</div>
                  <div className="text-sm text-gray-600">rooms</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Square className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{property.square_meters}</div>
                  <div className="text-sm text-gray-600">sq meters</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <PawPrint className={cn("w-8 h-8 mx-auto mb-2", property.pets_allowed ? "text-green-600" : "text-gray-400")} />
                  <div className="text-lg font-semibold text-gray-900">
                    {property.pets_allowed ? 'Pets OK' : 'No Pets'}
                  </div>
                  <div className="text-sm text-gray-600">policy</div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Description</h3>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {property.description}
                </p>
              </div>

              {/* Amenities */}
              {property.amenities.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Amenities</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {property.amenities.map((amenity) => (
                      <div key={amenity.id} className="flex items-center text-gray-700">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                        {amenity.amenity_name}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Negotiable Items */}
              {property.negotiable_items.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Negotiable Items</h3>
                  <div className="flex flex-wrap gap-2">
                    {property.negotiable_items.map((item, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Contact Owner</h3>
              
              <div className="space-y-4">
                {property.contact_email ? (
                  <div className="w-full bg-white border border-gray-300 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-700">
                        <Mail className="w-5 h-5 mr-2" />
                        <a
                          href={`mailto:${property.contact_email}`}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          {property.contact_email}
                        </a>
                      </div>
                      <button
                        onClick={() => navigator.clipboard.writeText(property.contact_email)}
                        className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                ) : (
                  <button className="w-full bg-gray-100 text-gray-400 py-3 px-4 rounded-lg cursor-not-allowed" disabled>
                    <Mail className="w-5 h-5 mr-2 inline" />
                    Email not provided
                  </button>
                )}

                {property.contact_phone ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <a
                      href={`tel:${property.contact_phone}`}
                      className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
                    >
                      <Phone className="w-5 h-5 mr-2" />
                      {isMobileDevice() ? `Call ${property.contact_phone}` : `Call Owner (${property.contact_phone})`}
                    </a>
                    <a
                      href={`https://wa.me/${digitsOnly(property.contact_phone)}?text=${encodeURIComponent(waMessage)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full border border-green-300 hover:bg-green-50 text-green-700 py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
                    >
                      <MessageCircle className="w-5 h-5 mr-2" />
                      WhatsApp
                    </a>
                  </div>
                ) : (
                  <button
                    className="w-full border border-gray-300 text-gray-400 py-3 px-4 rounded-lg cursor-not-allowed"
                    disabled
                  >
                    <Phone className="w-5 h-5 mr-2" />
                    Phone not provided
                  </button>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center text-gray-600 mb-2">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span className="text-sm">Listed on {new Date(property.created_at).toLocaleDateString()}</span>
                </div>
                <div className="text-sm text-gray-500">
                  Reference ID: {property.id.slice(0, 8)}
                </div>
              </div>
            </div>

            {/* Property Status */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Property Status</h3>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span className="text-green-700 font-medium">Available for Rent</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
