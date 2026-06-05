import { useState, useCallback, useMemo } from 'react'
import { ScheduleContext } from './schedule'

const sampleTasks = [
  { id: '1', title: '完成Web课程作业', tag: '学习', priority: 'P0', status: 'doing', createdAt: Date.now() - 86400000 },
  { id: '2', title: '复习算法与数据结构', tag: '学习', priority: 'P1', status: 'todo', createdAt: Date.now() - 172800000 },
  { id: '3', title: '运动健身30分钟', tag: '生活', priority: 'P2', status: 'done', createdAt: Date.now() - 259200000 },
]

export function ScheduleProvider({ children }) {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('toolkit_tasks')
    return saved ? JSON.parse(saved) : sampleTasks
  })
  const [activeTaskId, setActiveTaskId] = useState(null)
  const [timerMode, setTimerMode] = useState('focus') // 'focus' | 'break'

  const persist = useCallback((newTasks) => {
    setTasks(newTasks)
    localStorage.setItem('toolkit_tasks', JSON.stringify(newTasks))
  }, [])

  const addTask = useCallback((task) => {
    const newTask = {
      id: Date.now().toString(),
      title: task.title,
      tag: task.tag || '其他',
      priority: task.priority || 'P2',
      status: 'todo',
      createdAt: Date.now(),
    }
    persist([newTask, ...tasks])
  }, [tasks, persist])

  const updateTask = useCallback((id, updates) => {
    persist(tasks.map(t => t.id === id ? { ...t, ...updates } : t))
  }, [tasks, persist])

  const removeTask = useCallback((id) => {
    persist(tasks.filter(t => t.id !== id))
  }, [tasks, persist])

  const value = useMemo(() => ({
    tasks, addTask, updateTask, removeTask,
    activeTaskId, setActiveTaskId,
    timerMode, setTimerMode,
  }), [tasks, addTask, updateTask, removeTask, activeTaskId, timerMode])

  return (
    <ScheduleContext.Provider value={value}>
      {children}
    </ScheduleContext.Provider>
  )
}
