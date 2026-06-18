import { createContext, useContext } from 'react'

export const GalleryContext = createContext(null)

export function useGallery() {
  const ctx = useContext(GalleryContext)
  if (!ctx) throw new Error('useGallery must be used within GalleryProvider')
  return ctx
}
