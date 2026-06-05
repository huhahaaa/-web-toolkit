import { useTimer } from '../hooks/useTimer'
import { useSchedule } from '../context/schedule'
import { useGallery } from '../context/gallery'
import styles from './Timer.module.css'

export default function Timer() {
  const focusTimer = useTimer(25)
  const breakTimer = useTimer(5)
  const { activeTaskId, tasks } = useSchedule()
  const { images } = useGallery()

  const activeTask = tasks.find(t => t.id === activeTaskId)

  const bgImage = images[0] ?? null

  const format = (m, s) => `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`

  return (
    <div className={styles.page}>
      <h2 className={styles.heading}>🍅 番茄钟</h2>
      <p className={styles.hint}>专注25分钟，休息5分钟，保持高效节奏</p>

      <div className={styles.timerSection}>
        <div className={styles.timerBox}>
          <div className={styles.label}>🎯 专注时间</div>
          <div className={styles.time}>{format(focusTimer.minutes, focusTimer.secs)}</div>
          <div className={styles.controls}>
            <button onClick={focusTimer.start} disabled={focusTimer.status === 'running'}>开始</button>
            <button onClick={focusTimer.pause} disabled={focusTimer.status !== 'running'}>暂停</button>
            <button onClick={() => focusTimer.reset(25)}>重置</button>
          </div>
        </div>

        <div className={styles.timerBox}>
          <div className={styles.label}>☕ 休息时间</div>
          <div className={styles.time}>{format(breakTimer.minutes, breakTimer.secs)}</div>
          <div className={styles.controls}>
            <button onClick={breakTimer.start} disabled={breakTimer.status === 'running'}>开始</button>
            <button onClick={breakTimer.pause} disabled={breakTimer.status !== 'running'}>暂停</button>
            <button onClick={() => breakTimer.reset(5)}>重置</button>
          </div>
        </div>
      </div>

      {activeTask && (
        <div className={styles.currentTask}>
          当前任务：<strong>{activeTask.title}</strong>
          <span className={`${styles.priority} ${styles[`p${activeTask.priority.slice(1)}`]}`}>
            {activeTask.priority}
          </span>
        </div>
      )}

      {bgImage && (
        <div className={styles.bgHint}>
          背景图片：{bgImage.name}
        </div>
      )}
    </div>
  )
}
