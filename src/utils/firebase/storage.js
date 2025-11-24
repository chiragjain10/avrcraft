import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { storage } from './config'

// Upload product image
export const uploadProductImage = async (file, productId) => {
  try {
    const fileExtension = file.name.split('.').pop()
    const storageRef = ref(storage, `products/${productId}/image.${fileExtension}`)
    
    const snapshot = await uploadBytes(storageRef, file)
    const downloadURL = await getDownloadURL(snapshot.ref)
    
    return { success: true, url: downloadURL }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Upload artisan image
export const uploadArtisanImage = async (file, artisanId) => {
  try {
    const fileExtension = file.name.split('.').pop()
    const storageRef = ref(storage, `artisans/${artisanId}/profile.${fileExtension}`)
    
    const snapshot = await uploadBytes(storageRef, file)
    const downloadURL = await getDownloadURL(snapshot.ref)
    
    return { success: true, url: downloadURL }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Upload category image
export const uploadCategoryImage = async (file, categoryId) => {
  try {
    const fileExtension = file.name.split('.').pop()
    const storageRef = ref(storage, `categories/${categoryId}/image.${fileExtension}`)
    
    const snapshot = await uploadBytes(storageRef, file)
    const downloadURL = await getDownloadURL(snapshot.ref)
    
    return { success: true, url: downloadURL }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Delete file
export const deleteFile = async (filePath) => {
  try {
    const storageRef = ref(storage, filePath)
    await deleteObject(storageRef)
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}