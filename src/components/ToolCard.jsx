import { useRef } from 'react'
import { Link } from 'react-router-dom'
import styles from './ToolCard.module.css'

/**
 * MD3 Tool Card with glass morphism, hover lift, and ripple effect.
 * @param {'large' | 'small'} size - Card size variant
 */
export default function ToolCard({ to, icon, title, desc, image, size = 'small' }) {
  const rippleRef = useRef(null)

  const handleMouseDown = (e) => {
    const card = rippleRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const ripple = document.createElement('span')
    ripple.className = styles.ripple
    ripple.style.left = `${x}px`
    ripple.style.top = `${y}px`
    card.appendChild(ripple)
    ripple.addEventListener('animationend', () => ripple.remove())
  }

  return (
    <Link
      to={to}
      ref={rippleRef}
      className={`${styles.card} ${size === 'large' ? styles.cardLarge : styles.cardSmall}`}
      onMouseDown={handleMouseDown}
    >
      {size === 'large' && (
        <div className={styles.imageWrap}>
          {image ? (
            <img src={image} alt={title} className={styles.image} />
          ) : (
            <div className={styles.placeholder}>
              <span className={styles.placeholderIcon}>{icon}</span>
            </div>
          )}
          <div className={styles.imageOverlay} />
        </div>
      )}

      <div className={styles.body}>
        <div className={styles.headerRow}>
          <span className={styles.icon}>{icon}</span>
          <h3 className={styles.title}>{title}</h3>
        </div>
        <p className={styles.desc}>{desc}</p>
        <span className={styles.cta}>
          进入
          <span className={styles.ctaArrow}>→</span>
        </span>
      </div>

      <div className={styles.glowBorder} />
    </Link>
  )
}
