import { Link } from 'react-router-dom'
import styles from './ToolCard.module.css'

export default function ToolCard({ to, icon, title, desc, image }) {
  return (
    <Link to={to} className={styles.card}>
      <div className={styles.imageWrap}>
        {image ? (
          <img src={image} alt={title} className={styles.image} />
        ) : (
          <div className={styles.placeholder}>{icon}</div>
        )}
      </div>
      <div className={styles.body}>
        <h3 className={styles.title}>{icon} {title}</h3>
        <p className={styles.desc}>{desc}</p>
      </div>
    </Link>
  )
}
