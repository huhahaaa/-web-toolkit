import { useRef } from 'react'
import { useGallery } from '../context/gallery'
import styles from './Gallery.module.css'

export default function Gallery() {
  const { images, addImage, removeImage } = useGallery()
  const fileInput = useRef(null)

  const handleUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) addImage(file)
    if (fileInput.current) fileInput.current.value = ''
  }

  return (
    <div className={styles.page}>
      <h2 className={styles.heading}>🖼️ 图片画廊</h2>
      <p className={styles.hint}>
        管理网站图片资源，其他页面会从这里加载配图。点击图片查看大图（待实现）。
      </p>

      <div className={styles.uploadArea}>
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          onChange={handleUpload}
          className={styles.fileInput}
          id="gallery-upload"
        />
        <label htmlFor="gallery-upload" className={styles.uploadLabel}>
          📤 点击上传图片
        </label>
      </div>

      {images.length === 0 ? (
        <p className={styles.empty}>还没有图片，上传第一张吧 📷</p>
      ) : (
        <div className={styles.grid}>
          {images.map(img => (
            <div key={img.id} className={styles.card}>
              <img src={img.url} alt={img.name} className={styles.img} />
              <div className={styles.info}>
                <span className={styles.name}>{img.name}</span>
                <button
                  className={styles.delBtn}
                  onClick={() => removeImage(img.id)}
                >
                  删除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
