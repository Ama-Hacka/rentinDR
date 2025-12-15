import React, { useState, useEffect } from 'react'
import { Search, Filter, MapPin, Loader2, ChevronDown } from 'lucide-react'
import { Listbox } from '@headlessui/react'
import { PropertyCard } from '@/components/PropertyCard'
import { FilterPanel } from '@/components/FilterPanel'
import { usePropertyStore } from '@/stores/propertyStore'
import { PropertyFilters } from '@/types/property'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { Helmet } from 'react-helmet-async'

export const PropertyListings: React.FC = () => {
  const navigate = useNavigate()
  const [showFilters, setShowFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  
  const {
    properties,
    filters,
    loading,
    error,
    setFilters,
    fetchProperties,
    loadFavorites
  } = usePropertyStore()
  const { user } = useAuthStore()
  const [roomsInput, setRoomsInput] = useState<string>('')
  const [priceMinInput, setPriceMinInput] = useState<string>('')
  const [priceMaxInput, setPriceMaxInput] = useState<string>('')
  const [sqmInput, setSqmInput] = useState<string>('')

  useEffect(() => {
    fetchProperties()
  }, [filters])

  useEffect(() => {
    loadFavorites()
  }, [user?.id])

  const handleFiltersChange = (newFilters: PropertyFilters) => {
    setFilters(newFilters)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    handleFiltersChange({ ...filters, location: e.target.value })
  }

  const handlePropertyClick = (propertyId: string) => {
    navigate(`/property/${propertyId}`)
  }

  // quick chips removed; dropdowns below handle filters

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>RentinDR — Properties for Rent in the Dominican Republic</title>
        <meta
          name="description"
          content={
            loading
              ? 'Browse rental properties across the Dominican Republic on RentinDR.'
              : `${properties.length} properties found${filters.location ? ` in ${filters.location}` : ''}. Filter by price, rooms, pets, and more.`
          }
        />
        <link rel="canonical" href={typeof window !== 'undefined' ? `${window.location.origin}/` : 'https://rentindr.com/'} />
        <meta property="og:title" content="RentinDR — Properties for Rent in the Dominican Republic" />
        <meta property="og:description" content="Find apartments and villas with photos, amenities, and direct owner contact." />
        <meta property="og:url" content={typeof window !== 'undefined' ? window.location.href : 'https://rentindr.com/'} />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      {/* Search Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by location, neighborhood, or keywords..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => setShowFilters(true)}
              className="flex items-center px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              <Filter className="w-5 h-5 mr-2" />
              Filters
            </button>
          </div>
          {/* quick chips removed */}
          <div className="mt-3 flex flex-wrap gap-4">
            <div className="relative">
              <Listbox
                value={(filters.rooms ?? 'any') as any}
                onChange={(val: any) => {
                  if (val === 'any') setFilters({ ...filters, rooms: undefined })
                  else setFilters({ ...filters, rooms: parseInt(val, 10) })
                }}
              >
                <Listbox.Button className="text-sm text-gray-700 inline-flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Rooms
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </Listbox.Button>
                <Listbox.Options className="absolute z-10 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg focus:outline-none">
                  <div className="px-3 py-2 border-b border-gray-100">
                    <input
                      type="number"
                      min={0}
                      value={roomsInput}
                      onChange={(e) => setRoomsInput(e.target.value)}
                      placeholder="Type rooms"
                      className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => {
                          const v = parseInt(roomsInput, 10)
                          if (!isNaN(v)) {
                            setFilters({ ...filters, rooms: v })
                            setRoomsInput('')
                          }
                        }}
                        className="flex-1 text-sm px-2 py-1 border border-blue-200 rounded-md text-blue-700 hover:bg-blue-50"
                      >
                        Apply
                      </button>
                      <button
                        onClick={() => {
                          setFilters({ ...filters, rooms: undefined })
                          setRoomsInput('')
                        }}
                        className="flex-1 text-sm px-2 py-1 border border-gray-200 rounded-md text-gray-600 hover:bg-gray-50"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                  <Listbox.Option value="any" className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer">
                    Any
                  </Listbox.Option>
                  <Listbox.Option value="1" className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer">
                    1
                  </Listbox.Option>
                  <Listbox.Option value="2" className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer">
                    2
                  </Listbox.Option>
                  <Listbox.Option value="3" className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer">
                    3
                  </Listbox.Option>
                  <Listbox.Option value="4" className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer">
                    4
                  </Listbox.Option>
                </Listbox.Options>
              </Listbox>
            </div>
            <div className="relative">
              <Listbox
                value={
                  filters.price_min === undefined && filters.price_max === undefined
                    ? 'any'
                    : filters.price_min === undefined && filters.price_max === 1000
                    ? 'under_1000'
                    : filters.price_min === 1000 && filters.price_max === 2000
                    ? '1000_2000'
                    : filters.price_min === 2000 && filters.price_max === 3000
                    ? '2000_3000'
                    : filters.price_min === 3000 && filters.price_max === undefined
                    ? 'over_3000'
                    : 'any'
                }
                onChange={(val: any) => {
                  if (val === 'any') setFilters({ ...filters, price_min: undefined, price_max: undefined })
                  else if (val === 'under_1000') setFilters({ ...filters, price_min: undefined, price_max: 1000 })
                  else if (val === '1000_2000') setFilters({ ...filters, price_min: 1000, price_max: 2000 })
                  else if (val === '2000_3000') setFilters({ ...filters, price_min: 2000, price_max: 3000 })
                  else if (val === 'over_3000') setFilters({ ...filters, price_min: 3000, price_max: undefined })
                }}
              >
                <Listbox.Button className="text-sm text-gray-700 inline-flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Price
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </Listbox.Button>
                <Listbox.Options className="absolute z-10 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg focus:outline-none">
                  <div className="px-3 py-2 border-b border-gray-100">
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min={0}
                        value={priceMinInput}
                        onChange={(e) => setPriceMinInput(e.target.value)}
                        placeholder="Min"
                        className="w-1/2 border border-gray-300 rounded-md px-2 py-1 text-sm"
                      />
                      <input
                        type="number"
                        min={0}
                        value={priceMaxInput}
                        onChange={(e) => setPriceMaxInput(e.target.value)}
                        placeholder="Max"
                        className="w-1/2 border border-gray-300 rounded-md px-2 py-1 text-sm"
                      />
                    </div>
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => {
                          const mn = priceMinInput ? parseInt(priceMinInput, 10) : undefined
                          const mx = priceMaxInput ? parseInt(priceMaxInput, 10) : undefined
                          setFilters({ ...filters, price_min: isNaN(mn as any) ? undefined : mn, price_max: isNaN(mx as any) ? undefined : mx })
                        }}
                        className="flex-1 text-sm px-2 py-1 border border-blue-200 rounded-md text-blue-700 hover:bg-blue-50"
                      >
                        Apply
                      </button>
                      <button
                        onClick={() => {
                          setFilters({ ...filters, price_min: undefined, price_max: undefined })
                          setPriceMinInput('')
                          setPriceMaxInput('')
                        }}
                        className="flex-1 text-sm px-2 py-1 border border-gray-200 rounded-md text-gray-600 hover:bg-gray-50"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                  <Listbox.Option value="any" className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer">
                    Any
                  </Listbox.Option>
                  <Listbox.Option value="under_1000" className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer">
                    Under $1,000
                  </Listbox.Option>
                  <Listbox.Option value="1000_2000" className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer">
                    $1k–$2k
                  </Listbox.Option>
                  <Listbox.Option value="2000_3000" className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer">
                    $2k–$3k
                  </Listbox.Option>
                  <Listbox.Option value="over_3000" className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer">
                    $3k+
                  </Listbox.Option>
                </Listbox.Options>
              </Listbox>
            </div>
            <div className="relative">
              <Listbox
                value={(filters.square_meters_min ?? 'any') as any}
                onChange={(val: any) => {
                  if (val === 'any') setFilters({ ...filters, square_meters_min: undefined })
                  else setFilters({ ...filters, square_meters_min: parseInt(val, 10) })
                }}
              >
                <Listbox.Button className="text-sm text-gray-700 inline-flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Square meters
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </Listbox.Button>
                <Listbox.Options className="absolute z-10 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg focus:outline-none">
                  <div className="px-3 py-2 border-b border-gray-100">
                    <input
                      type="number"
                      min={0}
                      value={sqmInput}
                      onChange={(e) => setSqmInput(e.target.value)}
                      placeholder="Min m²"
                      className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => {
                          const v = sqmInput ? parseInt(sqmInput, 10) : undefined
                          setFilters({ ...filters, square_meters_min: isNaN(v as any) ? undefined : v })
                        }}
                        className="flex-1 text-sm px-2 py-1 border border-blue-200 rounded-md text-blue-700 hover:bg-blue-50"
                      >
                        Apply
                      </button>
                      <button
                        onClick={() => {
                          setFilters({ ...filters, square_meters_min: undefined })
                          setSqmInput('')
                        }}
                        className="flex-1 text-sm px-2 py-1 border border-gray-200 rounded-md text-gray-600 hover:bg-gray-50"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                  <Listbox.Option value="any" className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer">
                    Any
                  </Listbox.Option>
                  <Listbox.Option value="60" className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer">
                    60+
                  </Listbox.Option>
                  <Listbox.Option value="80" className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer">
                    80+
                  </Listbox.Option>
                  <Listbox.Option value="100" className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer">
                    100+
                  </Listbox.Option>
                  <Listbox.Option value="120" className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer">
                    120+
                  </Listbox.Option>
                </Listbox.Options>
              </Listbox>
            </div>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {loading ? 'Loading properties...' : `${properties.length} properties found`}
          </h2>
          <div className="text-sm text-gray-500">
            {filters.price_min && `Min: $${filters.price_min.toLocaleString()} `}
            {filters.price_max && `Max: $${filters.price_max.toLocaleString()} `}
            {filters.rooms && `${filters.rooms} rooms `}
            {filters.location && `in ${filters.location}`}
          </div>
        </div>
      </div>

      {/* Property Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => fetchProperties()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-12">
            <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
            <p className="text-gray-500 mb-4">Try adjusting your search criteria or filters</p>
            <button
              onClick={() => handleFiltersChange({})}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onClick={() => handlePropertyClick(property.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <FilterPanel
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClose={() => setShowFilters(false)}
        />
      )}
    </div>
  )
}
