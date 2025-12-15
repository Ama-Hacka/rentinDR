import React, { useState } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { PropertyImage } from '@/types/property'
import { cn } from '@/lib/utils'

interface ImageGalleryProps {
  images: PropertyImage[]
  title: string
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({ images, title }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showLightbox, setShowLightbox] = useState(false)

  const goToPrevious = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? images.length - 1 : prev - 1
    )
  }

  const goToNext = () => {
    setCurrentImageIndex((prev) => 
      prev === images.length - 1 ? 0 : prev + 1
    )
  }

  const openLightbox = (index: number) => {
    setCurrentImageIndex(index)
    setShowLightbox(true)
  }

  const closeLightbox = () => {
    setShowLightbox(false)
  }

  if (!images || images.length === 0) {
    return (
      <div className="relative w-full h-96 bg-gray-200 rounded-lg overflow-hidden" />
    )
  }

  return (
    <>
      {/* Main Image Gallery */}
      <div className="space-y-4">
        {/* Main Image */}
        <div className="relative w-full h-96 bg-gray-200 rounded-lg overflow-hidden">
          <img
            src={images[currentImageIndex]?.image_url}
            alt={`${title} - Image ${currentImageIndex + 1}`}
            className="w-full h-full object-cover cursor-pointer"
            loading="lazy"
            onClick={() => openLightbox(currentImageIndex)}
          />
          
          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Image Counter */}
          <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
            {currentImageIndex + 1} / {images.length}
          </div>
        </div>

        {/* Thumbnail Strip */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {images.map((image, index) => (
              <button
                key={image.id}
                onClick={() => setCurrentImageIndex(index)}
                className={cn(
                  "flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all",
                  currentImageIndex === index
                    ? "border-blue-600 ring-2 ring-blue-200"
                    : "border-gray-300 hover:border-gray-400"
                )}
              >
                <img
                  src={image.image_url}
                  alt={`${title} thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {showLightbox && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
          <div className="relative max-w-4xl max-h-full p-4">
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            >
              <X className="w-8 h-8" />
            </button>
            
            <div className="relative">
              <img
                src={images[currentImageIndex]?.image_url}
                alt={`${title} - Full size`}
                className="max-w-full max-h-full object-contain rounded-lg"
                loading="lazy"
              />
              
              {images.length > 1 && (
                <>
                  <button
                    onClick={goToPrevious}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-all"
                  >
                    <ChevronLeft className="w-8 h-8" />
                  </button>
                  <button
                    onClick={goToNext}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-all"
                  >
                    <ChevronRight className="w-8 h-8" />
                  </button>
                </>
              )}
            </div>

            {/* Lightbox Thumbnails */}
            <div className="flex justify-center gap-2 mt-4 overflow-x-auto">
              {images.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => setCurrentImageIndex(index)}
                  className={cn(
                    "flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all",
                    currentImageIndex === index
                      ? "border-white ring-2 ring-white"
                      : "border-gray-500 hover:border-gray-300"
                  )}
                >
                  <img
                    src={image.image_url}
                    alt={`${title} thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
