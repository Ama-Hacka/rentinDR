import React from 'react'
import { MapPin, Bed, Square, PawPrint, Heart } from 'lucide-react'
import { Property } from '@/types/property'
import { cn } from '@/lib/utils'
import { usePropertyStore } from '@/stores/propertyStore'
import { useAuthStore } from '@/stores/authStore'

interface PropertyCardProps {
  property: Property
  onClick: () => void
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property, onClick }) => {
  const { toggleFavorite, isFavorite } = usePropertyStore()
  const { user } = useAuthStore()
  const seeker = (user as any)?.user_metadata?.role === 'seeker'
  const fav = isFavorite(property.id)
  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer",
        "border border-gray-200 overflow-hidden group"
      )}
      style={{ maxWidth: 420 }}
    >
      {/* Property Image */}
      <div className="relative h-48 bg-gray-200 overflow-hidden">
        {property.thumbnail_url ? (
          <img
            src={property.thumbnail_url}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gray-200" />
        )}
        <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
          ${property.price.toLocaleString()}/mo
        </div>
        {seeker && (
          <button
            aria-label="Toggle favorite"
            onClick={async (e) => {
              e.stopPropagation()
              try {
                await toggleFavorite(property.id)
              } catch {}
            }}
            className={cn(
              "absolute top-4 right-4 p-2 rounded-full border transition-colors",
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

      {/* Property Details */}
      <div className="p-6 flex flex-col" style={{ minHeight: 260 }}>
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
          {property.title}
        </h3>
        
        <div className="flex items-center text-gray-600 mb-3">
          <MapPin className="w-4 h-4 mr-1" />
          <span className="text-sm">{property.location}</span>
          {property.source_url ? (
            <a
              href={property.source_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="ml-2 text-xs text-blue-600 hover:text-blue-700 underline"
            >
              Source
            </a>
          ) : (
            <span className="ml-2 text-xs text-gray-400">Source</span>
          )}
        </div>

        <div className="flex items-center gap-4 mb-4 text-gray-600">
          <div className="flex items-center">
            <Bed className="w-4 h-4 mr-1" />
            <span className="text-sm">{property.rooms} rooms</span>
          </div>
          <div className="flex items-center">
            <Square className="w-4 h-4 mr-1" />
            <span className="text-sm">{property.square_meters} m²</span>
          </div>
          {property.pets_allowed && (
            <div className="flex items-center text-green-600">
              <PawPrint className="w-4 h-4 mr-1" />
              <span className="text-sm">Pets OK</span>
            </div>
          )}
        </div>

        <p className="text-gray-600 text-sm line-clamp-2 mb-4" style={{ minHeight: 40 }}>
          {property.description}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {property.negotiable_items.slice(0, 3).map((item, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
            >
              {item}
            </span>
          ))}
          {property.negotiable_items.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
              +{property.negotiable_items.length - 3} more
            </span>
          )}
        </div>

        <button className="mt-auto w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors duration-200 font-medium">
          View Details
        </button>
      </div>
    </div>
  )
}
