import { Cloudinary } from '@cloudinary/url-gen'

// Cloudinary configuration
const cloudinaryConfig = {
  cloudName: 'dcgcuvk02', 
  apiKey: '858562345227478',
}

// Cloudinary instance for frontend
export const cld = new Cloudinary({
  cloud: {
    cloudName: cloudinaryConfig.cloudName
  }
})

// Cloudinary upload functions
export const cloudinaryService = {
  // Upload image to Cloudinary
  uploadImage: async (file, folder = 'avrcrafts') => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', 'avrcrafts_preset') 
    formData.append('folder', folder)
    
    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      )
      
      if (!response.ok) {
        throw new Error('Upload failed')
      }
      
      const data = await response.json()
      return data.secure_url // Return secure URL
    } catch (error) {
      console.error('Cloudinary upload error:', error)
      throw error
    }
  },

  // Upload multiple images
  uploadMultipleImages: async (files, folder = 'avrcrafts') => {
    const uploadPromises = files.map(file => 
      cloudinaryService.uploadImage(file, folder)
    )
    return Promise.all(uploadPromises)
  },

  // Delete image from Cloudinary (server-side implementation needed)
  deleteImage: async (publicId) => {
    // Ye function server-side implement karna hoga
    console.log('Delete image with public ID:', publicId)
  }
}

export default cloudinaryService