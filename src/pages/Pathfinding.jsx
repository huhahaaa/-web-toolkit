import { useState, useRef, useCallback } from 'react'
import { bfs, astar, createGrid } from '../utils/pathfinding'
import { useAnimationLoop } from '../hooks/useAnimationLoop'
import SpeedControl from '../components/SpeedControl'
import styles from './Pathfinding.module.css'

const algorithms = {
  bfs: { name: 'BFS（广度优先）', fn: bfs },
  astar: { name: 'A* 算法', fn: astar },
}

const CELL = 30
const ROWS = 15
const COLS = 15

export default function Pathfinding() {
  const canvasRef = useRef(null)
  const [algorithm, setAlgorithm] = useState('bfs')
  const [speed, setSpeed] = useState('medium')
  const [playing, setPlaying] = useState(false)
  const [stats, setStats] = useState({ steps: 0, time: 0 })
  const { run, stop } = useAnimationLoop(speed)

  const gridRef = useRef(createGrid(ROWS, COLS))
  const startRef = useRef({ x: 1, y: 7 })
  const endRef = useRef({ x: 13, y: 7 })

  const drawGrid = useCallback((state = null) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const grid = gridRef.current
    const start = startRef.current
    const end = endRef.current

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw cells
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        if (grid[y][x] === 1) {
          ctx.fillStyle = '#374151' // wall
        } else if (x === start.x && y === start.y) {
          ctx.fillStyle = '#10b981' // start
        } else if (x === end.x && y === end.y) {
          ctx.fillStyle = '#ef4444' // end
        } else if (state?.path?.some(p => p.x === x && p.y === y)) {
          ctx.fillStyle = '#f59e0b' // path
        } else if (state?.closedSet?.some(p => p.x === x && p.y === y)) {
          ctx.fillStyle = '#93c5fd' // closed
        } else if (state?.openSet?.some(p => p.x === x && p.y === y)) {
          ctx.fillStyle = '#86efac' // open
        } else if (state?.current?.x === x && state?.current?.y === y) {
          ctx.fillStyle = '#6366f1' // current
        } else {
          ctx.fillStyle = '#f9fafb' // empty
        }
        ctx.fillRect(x * CELL, y * CELL, CELL - 1, CELL - 1)
      }
    }

    // Grid lines
    ctx.strokeStyle = '#e5e7eb'
    for (let i = 0; i <= COLS; i++) {
      ctx.beginPath()
      ctx.moveTo(i * CELL, 0)
      ctx.lineTo(i * CELL, ROWS * CELL)
      ctx.stroke()
    }
    for (let i = 0; i <= ROWS; i++) {
      ctx.beginPath()
      ctx.moveTo(0, i * CELL)
      ctx.lineTo(COLS * CELL, i * CELL)
      ctx.stroke()
    }
  }, [])

  const handleCanvasClick = useCallback((e) => {
    if (playing) return
    const rect = canvasRef.current.getBoundingClientRect()
    const scaleX = canvasRef.current.width / rect.width
    const scaleY = canvasRef.current.height / rect.height
    const x = Math.floor((e.clientX - rect.left) * scaleX / CELL)
    const y = Math.floor((e.clientY - rect.top) * scaleY / CELL)
    if (x < 0 || x >= COLS || y < 0 || y >= ROWS) return
    if ((x === startRef.current.x && y === startRef.current.y) ||
        (x === endRef.current.x && y === endRef.current.y)) return

    gridRef.current[y][x] = gridRef.current[y][x] === 1 ? 0 : 1
    drawGrid()
  }, [playing, drawGrid])

  const startAnimation = useCallback(() => {
    setPlaying(true)
    const startTime = performance.now()
    const gen = algorithms[algorithm].fn(gridRef.current, startRef.current, endRef.current)

    run(gen,
      (state) => {
        drawGrid(state)
        setStats({ steps: state.steps, time: ((performance.now() - startTime) / 1000).toFixed(2) })
      },
      () => {
        setPlaying(false)
        setStats(prev => ({ ...prev, time: ((performance.now() - startTime) / 1000).toFixed(2) }))
      }
    )
  }, [algorithm, run, drawGrid])

  const handleReset = () => {
    stop()
    gridRef.current = createGrid(ROWS, COLS)
    setPlaying(false)
    setStats({ steps: 0, time: 0 })
    drawGrid()
  }

  const handleCanvasReady = useCallback((node) => {
    canvasRef.current = node
    if (node) drawGrid()
  }, [drawGrid])

  return (
    <div className={styles.page}>
      <h2 className={styles.heading}>🧭 寻路可视化</h2>
      <p className={styles.hint}>点击网格添加/移除墙壁，绿色起点→红色终点</p>

      <div className={styles.controls}>
        <div className={styles.controlGroup}>
          <span className={styles.controlLabel}>算法：</span>
          {Object.entries(algorithms).map(([key, { name }]) => (
            <button
              key={key}
              className={`${styles.btn} ${algorithm === key ? styles.btnActive : ''}`}
              onClick={() => setAlgorithm(key)}
              disabled={playing}
            >
              {name}
            </button>
          ))}
        </div>
        <SpeedControl value={speed} onChange={setSpeed} />
        <div className={styles.controlGroup}>
          <button className={styles.btnPrimary} onClick={startAnimation} disabled={playing}>
            ▶ 开始寻路
          </button>
          <button className={styles.btn} onClick={() => { stop(); setPlaying(false) }} disabled={!playing}>
            ⏸ 暂停
          </button>
          <button className={styles.btn} onClick={handleReset}>
            🔄 重置
          </button>
        </div>
      </div>

      <canvas
        ref={handleCanvasReady}
        width={CELL * COLS}
        height={CELL * ROWS}
        className={styles.canvas}
        onClick={handleCanvasClick}
      />

      <div className={styles.legend}>
        <span>🟩 起点</span>
        <span>🟥 终点</span>
        <span>⬛ 墙壁</span>
        <span>🟩 开放集</span>
        <span>🟦 关闭集</span>
        <span>🟨 路径</span>
        <span>🟪 当前</span>
      </div>

      <div className={styles.stats}>
        <span>探索步数：<strong>{stats.steps}</strong></span>
        <span>耗时：<strong>{stats.time}s</strong></span>
      </div>
    </div>
  )
}
