import styles from './SpeedControl.module.css'

const speeds = [
  { value: 'slow', label: '🐢 慢速' },
  { value: 'medium', label: '🐇 中速' },
  { value: 'fast', label: '⚡ 快速' },
]

export default function SpeedControl({ value, onChange }) {
  return (
    <div className={styles.wrap}>
      <span className={styles.label}>速度：</span>
      <div className={styles.buttons}>
        {speeds.map(s => (
          <button
            key={s.value}
            className={`${styles.btn} ${value === s.value ? styles.active : ''}`}
            onClick={() => onChange(s.value)}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  )
}
