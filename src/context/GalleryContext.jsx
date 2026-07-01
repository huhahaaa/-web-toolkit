import { useState, useCallback, useRef } from 'react'
import { GalleryContext } from './gallery'

const seedImages = [
  { id: '1', name: '团队协作', url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=300&fit=crop', desc: '团队合作办公场景' },
  { id: '2', name: '代码编程', url: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=300&fit=crop', desc: '屏幕上的代码' },
  { id: '3', name: '设计灵感', url: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop', desc: '设计工具与色彩' },
  { id: '4', name: '自然风光', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&h=300&fit=crop', desc: '山水自然景观' },
  { id: '5', name: '城市夜景', url: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400&h=300&fit=crop', desc: '繁华都市的夜晚' },
  { id: '6', name: '创意工作', url: 'https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=400&h=300&fit=crop', desc: '创意工作台场景' },
]

export function GalleryProvider({ children }) {
  const [images, setImages] = useState(() => {
    const saved = localStorage.getItem('toolkit_gallery')
    return saved ? JSON.parse(saved) : seedImages
  })

  const imagesRef = useRef(images)
  imagesRef.current = images

  const persist = useCallback((newImages) => {
    setImages(newImages)
    localStorage.setItem('toolkit_gallery', JSON.stringify(newImages))
  }, [])

  const addImage = useCallback((file) => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const newImg = {
          id: Date.now().toString(),
          name: file.name.replace(/\.[^.]+$/, ''),
          url: e.target.result,
          desc: '',
        }
        const currentImages = imagesRef.current
        persist([...currentImages, newImg])
        resolve(newImg)
      }
      reader.readAsDataURL(file)
    })
  }, [persist])

  const removeImage = useCallback((id) => {
    const currentImages = imagesRef.current
    persist(currentImages.filter(img => img.id !== id))
  }, [persist])

  const updateImage = useCallback((id, updates) => {
    const currentImages = imagesRef.current
    persist(currentImages.map(img => img.id === id ? { ...img, ...updates } : img))
  }, [persist])

  return (
    <GalleryContext.Provider value={{ images, addImage, removeImage, updateImage }}>
      {children}
    </GalleryContext.Provider>
  )
}