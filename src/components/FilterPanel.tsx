import React, { useState } from 'react'
import { X, Filter, DollarSign, Home, Maximize, Heart } from 'lucide-react'
import { PropertyFilters } from '@/types/property'
import { cn } from '@/lib/utils'

interface FilterPanelProps {
  filters: PropertyFilters
  onFiltersChange: (filters: PropertyFilters) => void
  onClose: () => void
}

const AMENITIES = [
  'Gym', 'Pool', 'Parking', 'Balcony', 'Air Conditioning', 
  'Heating', 'Dishwasher', 'Washer/Dryer', 'Hardwood Floors', 'Storage'
]

export const FilterPanel: React.FC<FilterPanelProps> = ({ 
  filters, 
  onFiltersChange, 
  onClose 
}) => {
  const [localFilters, setLocalFilters] = useState<PropertyFilters>(filters)

  const handleFilterChange = (key: keyof PropertyFilters, value: any) => {
    const newFilters = { ...localFilters, [key]: value }
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handleAmenityToggle = (amenity: string) => {
    const currentAmenities = localFilters.amenities || []
    const newAmenities = currentAmenities.includes(amenity)
      ? currentAmenities.filter(a => a !== amenity)
      : [...currentAmenities, amenity]
    
    handleFilterChange('amenities', newAmenities)
  }

  const clearFilters = () => {
    const emptyFilters: PropertyFilters = {}
    setLocalFilters(emptyFilters)
    onFiltersChange(emptyFilters)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
      <div className="bg-white w-full max-w-md h-full overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Filter className="w-5 h-5 mr-2 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">Filters</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Price Range */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-3">
              <DollarSign className="w-4 h-4 mr-2" />
              Price Range
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Min Price</label>
                <input
                  type="number"
                  placeholder="$0"
                  value={localFilters.price_min || ''}
                  onChange={(e) => handleFilterChange('price_min', e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Max Price</label>
                <input
                  type="number"
                  placeholder="No max"
                  value={localFilters.price_max || ''}
                  onChange={(e) => handleFilterChange('price_max', e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Rooms */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-3">
              <Home className="w-4 h-4 mr-2" />
              Number of Rooms
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((rooms) => (
                <button
                  key={rooms}
                  onClick={() => handleFilterChange('rooms', localFilters.rooms === rooms ? undefined : rooms)}
                  className={cn(
                    "py-2 px-3 rounded-lg border transition-colors",
                    localFilters.rooms === rooms
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-700 border-gray-300 hover:border-blue-400"
                  )}
                >
                  {rooms === 5 ? '5+' : rooms}
                </button>
              ))}
            </div>
          </div>

          {/* Square Meters */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-3">
              <Maximize className="w-4 h-4 mr-2" />
              Square Meters
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Min Size</label>
                <input
                  type="number"
                  placeholder="Any"
                  value={localFilters.square_meters_min || ''}
                  onChange={(e) => handleFilterChange('square_meters_min', e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Max Size</label>
                <input
                  type="number"
                  placeholder="Any"
                  value={localFilters.square_meters_max || ''}
                  onChange={(e) => handleFilterChange('square_meters_max', e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Pet Policy */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-3">
              <Heart className="w-4 h-4 mr-2" />
              Pet Policy
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="pets_allowed"
                  checked={localFilters.pets_allowed === undefined}
                  onChange={() => handleFilterChange('pets_allowed', undefined)}
                  className="mr-2"
                />
                <span className="text-sm">Any</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="pets_allowed"
                  checked={localFilters.pets_allowed === true}
                  onChange={() => handleFilterChange('pets_allowed', true)}
                  className="mr-2"
                />
                <span className="text-sm">Pets Allowed</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="pets_allowed"
                  checked={localFilters.pets_allowed === false}
                  onChange={() => handleFilterChange('pets_allowed', false)}
                  className="mr-2"
                />
                <span className="text-sm">No Pets</span>
              </label>
            </div>
          </div>

          {/* Amenities */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-3 block">
              Amenities
            </label>
            <div className="grid grid-cols-2 gap-2">
              {AMENITIES.map((amenity) => (
                <label key={amenity} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={localFilters.amenities?.includes(amenity) || false}
                    onChange={() => handleAmenityToggle(amenity)}
                    className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{amenity}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-3 block">
              Location
            </label>
            <input
              type="text"
              placeholder="Enter location or neighborhood"
              value={localFilters.location || ''}
              onChange={(e) => handleFilterChange('location', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex gap-3">
            <button
              onClick={clearFilters}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Clear All
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}