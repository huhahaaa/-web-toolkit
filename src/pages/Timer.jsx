import { useEffect, useState, useCallback } from 'react'
import { useTimer } from '../hooks/useTimer'
import { useSchedule } from '../context/schedule'
import { useGallery } from '../context/gallery'
import styles from './Timer.module.css'

const DEFAULT_TITLE = 'Web Toolkit'
const TODAY_KEY = 'pomodoro:completed:today'
const DATE_KEY = 'pomodoro:completed:date'

function getTodayKey() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function loadTodayCount() {
  try {
    const savedDate = localStorage.getItem(DATE_KEY)
    const today = getTodayKey()
    if (savedDate !== today) {
      localStorage.setItem(DATE_KEY, today)
      localStorage.setItem(TODAY_KEY, '0')
      return 0
    }
    const raw = localStorage.getItem(TODAY_KEY)
    const n = raw ? parseInt(raw, 10) : 0
    return Number.isFinite(n) && n >= 0 ? n : 0
  } catch {
    return 0
  }
}

export default function Timer() {
  const [breakMode, setBreakMode] = useState('short') // 'short' | 'long'
  const [completedToday, setCompletedToday] = useState(() => loadTodayCount())

  const incrementCompleted = useCallback(() => {
    setCompletedToday(prev => {
      const next = prev + 1
      try {
        localStorage.setItem(DATE_KEY, getTodayKey())
        localStorage.setItem(TODAY_KEY, String(next))
      } catch {
        // ignore
      }
      return next
    })
  }, [])

  const focusTimer = useTimer(25, incrementCompleted)
  const breakMinutes = breakMode === 'long' ? 15 : 5
  const breakTimer = useTimer(breakMinutes)

  const { activeTaskId, tasks } = useSchedule()
  const { images } = useGallery()

  const activeTask = tasks.find(t => t.id === activeTaskId)
  const bgImage = images[0] ?? null

  const format = (m, s) => `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`

  useEffect(() => {
    if (focusTimer.status === 'running') {
      document.title = `🎯 ${format(focusTimer.minutes, focusTimer.secs)} - 专注中`
    } else if (breakTimer.status === 'running') {
      document.title = `☕ ${format(breakTimer.minutes, breakTimer.secs)} - 休息中`
    } else {
      document.title = DEFAULT_TITLE
    }
  }, [
    focusTimer.status, focusTimer.minutes, focusTimer.secs,
    breakTimer.status, breakTimer.minutes, breakTimer.secs,
  ])

  const switchBreakMode = useCallback((mode) => {
    if (mode !== 'short' && mode !== 'long') return
    const mins = mode === 'long' ? 15 : 5
    setBreakMode(mode)
    breakTimer.reset(mins)
  }, [breakTimer])

  useEffect(() => {
    const mins = breakMode === 'long' ? 15 : 5
    breakTimer.reset(mins)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [breakMode])

  return (
    <div className={styles.page}>
      <h2 className={styles.heading}>🍅 番茄钟</h2>
      <p className={styles.hint}>专注25分钟，休息5分钟，保持高效节奏</p>

      <div className={styles.todayCount}>
        今日已完成番茄数：<strong>{completedToday}</strong>
      </div>

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
            <button onClick={() => breakTimer.reset(breakMinutes)}>重置</button>
          </div>
          <div className={styles.breakSwitch}>
            <button
              className={breakMode === 'short' ? styles.breakBtnActive : styles.breakBtn}
              onClick={() => switchBreakMode('short')}
            >
              短休(5分钟)
            </button>
            <button
              className={breakMode === 'long' ? styles.breakBtnActive : styles.breakBtn}
              onClick={() => switchBreakMode('long')}
            >
              长休(15分钟)
            </button>
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
