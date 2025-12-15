import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImageUploadProps {
  onImagesChange: (images: File[]) => void
  maxImages?: number
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ 
  onImagesChange, 
  maxImages = 10 
}) => {
  const [images, setImages] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const validFiles = acceptedFiles.filter(file => 
      file.type.startsWith('image/') && 
      file.size <= 10 * 1024 * 1024 // 10MB limit
    )

    if (images.length + validFiles.length > maxImages) {
      alert(`You can only upload up to ${maxImages} images`)
      return
    }

    const newImages = [...images, ...validFiles]
    setImages(newImages)
    onImagesChange(newImages)
  }, [images, maxImages, onImagesChange])

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    setImages(newImages)
    onImagesChange(newImages)
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    multiple: true
  })

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all",
          isDragActive 
            ? "border-blue-500 bg-blue-50" 
            : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
        )}
      >
        <input {...getInputProps()} />
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        {isDragActive ? (
          <p className="text-blue-600 font-medium">Drop the images here...</p>
        ) : (
          <div>
            <p className="text-gray-600 mb-2">
              Drag & drop images here, or click to select
            </p>
            <p className="text-sm text-gray-500">
              Up to {maxImages} images, max 10MB each
            </p>
          </div>
        )}
      </div>

      {/* Image Preview */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={URL.createObjectURL(image)}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <button
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Progress */}
      {uploading && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600 mr-2" />
          <span className="text-gray-600">Uploading images...</span>
        </div>
      )}

      {/* Image Count */}
      <div className="text-sm text-gray-500 text-center">
        {images.length} of {maxImages} images selected
      </div>
    </div>
  )
}
