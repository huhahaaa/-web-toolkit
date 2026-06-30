import { useState, useMemo } from 'react'
import { useSchedule } from '../context/schedule'
import styles from './Schedule.module.css'

const tags = ['全部', '学习', '工作', '生活', '其他']
const priorityColors = { P0: 'p0', P1: 'p1', P2: 'p2' }
const statusLabels = { todo: '未开始', doing: '进行中', done: '已完成' }

export default function Schedule() {
  const { tasks, addTask, updateTask, removeTask, setActiveTaskId, activeTaskId } = useSchedule()
  const [filterTag, setFilterTag] = useState('全部')
  const [newTitle, setNewTitle] = useState('')
  const [newTag, setNewTag] = useState('学习')
  const [newPriority, setNewPriority] = useState('P2')
  const [editingId, setEditingId] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [editTag, setEditTag] = useState('学习')
  const [editPriority, setEditPriority] = useState('P2')

  const filtered = useMemo(() => {
    const result = filterTag === '全部' ? [...tasks] : tasks.filter(t => t.tag === filterTag)
    return result.sort((a, b) => a.priority.localeCompare(b.priority))
  }, [tasks, filterTag])

  const handleAdd = (e) => {
    e.preventDefault()
    if (!newTitle.trim()) return
    addTask({ title: newTitle.trim(), tag: newTag, priority: newPriority })
    setNewTitle('')
  }

  const handleDoubleClick = (task) => {
    setEditingId(task.id)
    setEditTitle(task.title)
    setEditTag(task.tag)
    setEditPriority(task.priority)
  }

  const handleSaveEdit = () => {
    if (!editTitle.trim() || !editingId) return
    updateTask(editingId, { title: editTitle.trim(), tag: editTag, priority: editPriority })
    setEditingId(null)
  }

  const handleCancelEdit = () => {
    setEditingId(null)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSaveEdit()
    } else if (e.key === 'Escape') {
      handleCancelEdit()
    }
  }

  return (
    <div className={`${styles.page} section-ambient`}>
      <div className="ambient-blob ambient-blob--indigo" style={{ top: '-5%', left: '10%', animationDelay: '0s' }} />
      <div className="ambient-blob ambient-blob--violet" style={{ bottom: '-8%', right: '8%', animationDelay: '-5s' }} />
      <h2 className={styles.heading}>📋 日程看板</h2>

      {/* Add Task Form */}
      <form className={styles.addForm} onSubmit={handleAdd}>
        <input
          type="text"
          placeholder="输入新任务..."
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
          className={styles.input}
        />
        <select value={newTag} onChange={e => setNewTag(e.target.value)} className={styles.select}>
          {tags.filter(t => t !== '全部').map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={newPriority} onChange={e => setNewPriority(e.target.value)} className={styles.select}>
          <option value="P0">P0</option>
          <option value="P1">P1</option>
          <option value="P2">P2</option>
        </select>
        <button type="submit" className={styles.addBtn}>添加</button>
      </form>

      {/* Filter Tags */}
      <div className={styles.filters}>
        {tags.map(tag => (
          <button
            key={tag}
            className={`${styles.filterBtn} ${filterTag === tag ? styles.filterActive : ''}`}
            onClick={() => setFilterTag(tag)}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className={styles.list}>
        {filtered.length === 0 ? (
          <p className={styles.empty}>暂无任务，快去添加吧 ✨</p>
        ) : (
          filtered.map(task => (
            <div
              key={task.id}
              className={`${styles.task} ${activeTaskId === task.id ? styles.taskActive : ''} ${editingId === task.id ? styles.taskEditing : ''}`}
              onClick={() => !editingId && setActiveTaskId(task.id)}
              onDoubleClick={() => handleDoubleClick(task)}
            >
              {editingId === task.id ? (
                <div className={styles.editMode}>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className={styles.editInput}
                    autoFocus
                  />
                  <select
                    value={editTag}
                    onChange={e => setEditTag(e.target.value)}
                    className={styles.editSelect}
                  >
                    {tags.filter(t => t !== '全部').map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <select
                    value={editPriority}
                    onChange={e => setEditPriority(e.target.value)}
                    className={styles.editSelect}
                  >
                    <option value="P0">P0</option>
                    <option value="P1">P1</option>
                    <option value="P2">P2</option>
                  </select>
                  <div className={styles.editActions}>
                    <button className={styles.saveBtn} onClick={handleSaveEdit}>保存</button>
                    <button className={styles.cancelBtn} onClick={handleCancelEdit}>取消</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className={styles.taskHeader}>
                    <span className={styles.taskTitle}>{task.title}</span>
                    <span className={`${styles.tag} ${styles[`tag${task.tag}`]}`}>{task.tag}</span>
                    <span className={`${styles.priority} ${styles[priorityColors[task.priority]]}`}>
                      {task.priority}
                    </span>
                  </div>
                  <div className={styles.taskActions}>
                    <select
                      value={task.status}
                      onChange={e => updateTask(task.id, { status: e.target.value })}
                      className={styles.statusSelect}
                      onClick={e => e.stopPropagation()}
                    >
                      {Object.entries(statusLabels).map(([k, v]) => (
                        <option key={k} value={k}>{v}</option>
                      ))}
                    </select>
                    <button
                      className={styles.delBtn}
                      onClick={e => { e.stopPropagation(); removeTask(task.id) }}
                    >
                      删除
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
