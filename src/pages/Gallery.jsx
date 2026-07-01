import { useState, useRef, useCallback, useEffect } from 'react'
import { useGallery } from '../context/gallery'
import styles from './Gallery.module.css'

export default function Gallery() {
  const { images, addImage, removeImage, updateImage } = useGallery()
  const fileInput = useRef(null)
  const [previewImg, setPreviewImg] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editValue, setEditValue] = useState('')
  const [zoom, setZoom] = useState(100)
  const [offsetX, setOffsetX] = useState(0)
  const [offsetY, setOffsetY] = useState(0)
  const [isDraggingImage, setIsDraggingImage] = useState(false)
  const lastPos = useRef({ x: 0, y: 0 })
  const clickTimer = useRef(null)

  const handleUpload = useCallback((file) => {
    if (file && file.type.startsWith('image/')) {
      addImage(file)
    }
  }, [addImage])

  const handleFileChange = useCallback((e) => {
    const file = e.target.files?.[0]
    if (file) handleUpload(file)
    if (fileInput.current) fileInput.current.value = ''
  }, [handleUpload])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleUpload(file)
  }, [handleUpload])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleCardClick = useCallback((img) => {
    if (clickTimer.current) {
      clearTimeout(clickTimer.current)
      clickTimer.current = null
    }
    clickTimer.current = setTimeout(() => {
      setPreviewImg(img)
    }, 200)
  }, [])

  const cancelPreview = useCallback(() => {
    if (clickTimer.current) {
      clearTimeout(clickTimer.current)
      clickTimer.current = null
    }
  }, [])

  const handleClosePreview = useCallback(() => {
    setPreviewImg(null)
    setZoom(100)
    setOffsetX(0)
    setOffsetY(0)
    setIsDraggingImage(false)
  }, [])

  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev + 25, 300))
  }, [])

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev - 25, 50))
  }, [])

  const handleZoomReset = useCallback(() => {
    setZoom(100)
    setOffsetX(0)
    setOffsetY(0)
  }, [])

  const handleZoomSlider = useCallback((e) => {
    setZoom(Number(e.target.value))
  }, [])

  const handleMouseDown = useCallback((e) => {
    e.preventDefault()
    if (zoom > 100) {
      setIsDraggingImage(true)
      lastPos.current = { x: e.clientX, y: e.clientY }
    }
  }, [zoom])

  const handleMouseMove = useCallback((e) => {
    if (!isDraggingImage) return
    const deltaX = e.clientX - lastPos.current.x
    const deltaY = e.clientY - lastPos.current.y
    setOffsetX(prev => prev + deltaX)
    setOffsetY(prev => prev + deltaY)
    lastPos.current = { x: e.clientX, y: e.clientY }
  }, [isDraggingImage])

  const handleMouseUp = useCallback(() => {
    setIsDraggingImage(false)
  }, [])

  const handleWheel = useCallback((e) => {
    e.preventDefault()
    if (e.deltaY < 0) {
      handleZoomIn()
    } else {
      handleZoomOut()
    }
  }, [handleZoomIn, handleZoomOut])

  useEffect(() => {
    if (previewImg) {
      document.body.style.overflow = 'hidden'
      document.body.style.touchAction = 'none'
    } else {
      document.body.style.overflow = ''
      document.body.style.touchAction = ''
    }
    return () => {
      document.body.style.overflow = ''
      document.body.style.touchAction = ''
    }
  }, [previewImg])

  useEffect(() => {
    if (isDraggingImage) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'grabbing'
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
    }
  }, [isDraggingImage, handleMouseMove, handleMouseUp])

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape' && previewImg) {
      handleClosePreview()
    }
    if (e.key === 'Enter' && editingId) {
      e.preventDefault()
      updateImage(editingId, { desc: editValue })
      setEditingId(null)
      setEditValue('')
    }
    if (e.key === 'Escape' && editingId) {
      setEditingId(null)
      setEditValue('')
    }
    if (previewImg && e.key === '+') {
      e.preventDefault()
      handleZoomIn()
    }
    if (previewImg && e.key === '-') {
      e.preventDefault()
      handleZoomOut()
    }
    if (previewImg && e.key === '0') {
      e.preventDefault()
      handleZoomReset()
    }
  }, [previewImg, editingId, editValue, updateImage, handleClosePreview, handleZoomIn, handleZoomOut, handleZoomReset])

  const handleDoubleClick = useCallback((img) => {
    setEditingId(img.id)
    setEditValue(img.desc || '')
  }, [])

  const handleBlur = useCallback(() => {
    if (editingId) {
      updateImage(editingId, { desc: editValue })
      setEditingId(null)
      setEditValue('')
    }
  }, [editingId, editValue, updateImage])

  const getStorageSize = useCallback(() => {
    const total = images.reduce((acc, img) => {
      const size = img.url.length * 0.75
      return acc + size
    }, 0)
    if (total < 1024) return `${total.toFixed(0)} B`
    if (total < 1024 * 1024) return `${(total / 1024).toFixed(1)} KB`
    return `${(total / (1024 * 1024)).toFixed(2)} MB`
  }, [images])

  return (
    <div className={`${styles.page} section-ambient`}>
      <div className="ambient-blob ambient-blob--violet" style={{ top: '-5%', right: '12%', animationDelay: '0s' }} />
      <div className="ambient-blob ambient-blob--purple" style={{ bottom: '-10%', left: '8%', animationDelay: '-4s' }} />

      <div className={styles.header}>
        <h2 className={styles.heading}>🖼️ 图片画廊</h2>
        <p className={styles.hint}>
          管理网站图片资源，其他页面会从这里加载配图。点击图片查看大图，双击图片描述可编辑。
        </p>
        <div className={styles.stats}>
          <span className={styles.statItem}>📷 {images.length} 张图片</span>
          <span className={styles.statDivider}>|</span>
          <span className={styles.statItem}>💾 {getStorageSize()}</span>
        </div>
      </div>

      <div
        className={`${styles.uploadArea} ${isDragging ? styles.uploadAreaDragging : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className={styles.fileInput}
          id="gallery-upload"
        />
        <label htmlFor="gallery-upload" className={styles.uploadLabel}>
          {isDragging ? (
            <>
              <span className={styles.uploadIcon}>✨</span>
              <span>松开以上传图片</span>
            </>
          ) : (
            <>
              <span className={styles.uploadIcon}>📤</span>
              <span>点击或拖拽上传图片</span>
            </>
          )}
        </label>
        <p className={styles.uploadHint}>支持 JPG、PNG、GIF 等格式</p>
      </div>

      {images.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🖼️</div>
          <p className={styles.emptyText}>还没有图片，上传第一张吧 📷</p>
          <p className={styles.emptySubText}>拖拽图片到上方区域或点击上传按钮</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {images.map((img, index) => (
            <div
              key={img.id}
              className={`${styles.card} animate-in`}
              style={{ animationDelay: `${index * 0.05}s` }}
              onClick={() => handleCardClick(img)}
            >
              <div className={styles.imgWrapper}>
                <img src={img.url} alt={img.name} className={styles.img} />
                <div className={styles.cardOverlay}>
                  <span className={styles.zoomIcon}>🔍</span>
                </div>
              </div>
              <div className={styles.info}>
                <div className={styles.infoLeft}>
                  <span className={styles.name} onClick={() => handleCardClick(img)}>{img.name}</span>
                  {editingId === img.id ? (
                    <input
                      type="text"
                      className={styles.editInput}
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={handleBlur}
                      onKeyDown={handleKeyDown}
                      autoFocus
                      placeholder="添加描述..."
                    />
                  ) : (
                    <span
                      className={styles.desc}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleCardClick(img)
                      }}
                      onDoubleClick={(e) => {
                        e.stopPropagation()
                        cancelPreview()
                        handleDoubleClick(img)
                      }}
                    >
                      {img.desc || '双击添加描述'}
                    </span>
                  )}
                </div>
                <button
                  className={styles.delBtn}
                  onClick={(e) => {
                    e.stopPropagation()
                    removeImage(img.id)
                  }}
                >
                  <span className={styles.delIcon}>🗑️</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {previewImg && (
        <div className={styles.lightbox} onClick={handleClosePreview} onKeyDown={handleKeyDown} onWheel={handleWheel} tabIndex={0}>
          <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.lightboxClose} onClick={handleClosePreview}>
              ✕
            </button>
            <div className={styles.lightboxZoomControls}>
              <button className={styles.zoomBtn} onClick={handleZoomOut} title="缩小">
                −
              </button>
              <span className={styles.zoomValue}>{zoom}%</span>
              <button className={styles.zoomBtn} onClick={handleZoomIn} title="放大">
                +
              </button>
              <button className={styles.zoomBtn} onClick={handleZoomReset} title="重置">
                ⟲
              </button>
            </div>
            <input
              type="range"
              min="50"
              max="300"
              value={zoom}
              onChange={handleZoomSlider}
              className={styles.zoomSlider}
            />
            <img
              src={previewImg.url}
              alt={previewImg.name}
              className={styles.lightboxImg}
              style={{ transform: `translate(${offsetX}px, ${offsetY}px) scale(${zoom / 100})` }}
              onMouseDown={handleMouseDown}
              draggable={false}
            />
          </div>
        </div>
      )}
    </div>
  )
}