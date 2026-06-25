import { useState, useRef, useCallback, useEffect } from 'react'
import { bfs, astar, createGrid, generateWalls, minTheoreticalSteps } from '../utils/pathfinding'
import { useAnimationLoop } from '../hooks/useAnimationLoop'
import SpeedControl from '../components/SpeedControl'
import styles from './Pathfinding.module.css'

const algorithms = {
  bfs: { name: 'BFS（广度优先）', fn: bfs },
  astar: { name: 'A* 算法', fn: astar },
}

const PRESET_SIZES = [8, 10, 15, 20, 25]

function getCellSize(gridSize) {
  if (gridSize <= 8) return 44
  if (gridSize <= 10) return 40
  if (gridSize <= 15) return 32
  if (gridSize <= 20) return 28
  return 24
}

function roundRect(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

export default function Pathfinding() {
  const canvasRef = useRef(null)
  const [gridSize, setGridSize] = useState(15)
  const [algorithm, setAlgorithm] = useState('bfs')
  const [speed, setSpeed] = useState('medium')
  const [diagonal, setDiagonal] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [stats, setStats] = useState({ steps: 0, time: 0, optimalSteps: 0 })
  const [placingMode, setPlacingMode] = useState(null)
  const [pathFound, setPathFound] = useState(false)
  const { run, stop: stopAnim } = useAnimationLoop(speed)

  const gridRef = useRef(createGrid(gridSize, gridSize))
  const startRef = useRef({ x: 1, y: Math.floor(gridSize / 2) })
  const endRef = useRef({ x: gridSize - 2, y: Math.floor(gridSize / 2) })
  const animatingRef = useRef(false)
  const isDraggingRef = useRef(false)
  const dragModeRef = useRef(null) // 'add' | 'remove' | null
  const lastToggledRef = useRef(null) // {x, y} | null

  const cellSize = getCellSize(gridSize)

  // ---- Drawing ----
  const drawGrid = useCallback((state = null) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    const w = gridSize * cellSize
    const h = gridSize * cellSize

    canvas.width = w * dpr
    canvas.height = h * dpr
    ctx.scale(dpr, dpr)

    const grid = gridRef.current
    const start = startRef.current
    const end = endRef.current

    // Background
    ctx.fillStyle = '#0d0d22'
    ctx.fillRect(0, 0, w, h)

    const inSet = (set, x, y) => set?.some(p => p.x === x && p.y === y)

    // Compute distance map for gradient coloring
    const maxDist = diagonal
      ? Math.max(gridSize, gridSize)
      : gridSize + gridSize

    // Draw cells
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const px = x * cellSize
        const py = y * cellSize
        const inset = 1
        const size = cellSize - inset * 2

        if (grid[y][x] === 1) {
          // Wall with 3D bevel
          const grad = ctx.createLinearGradient(px, py, px + size, py + size)
          grad.addColorStop(0, '#2d2d4a')
          grad.addColorStop(0.4, '#1a1a35')
          grad.addColorStop(1, '#0a0a1e')
          ctx.fillStyle = grad
          roundRect(ctx, px + inset, py + inset, size, size, 3)
          ctx.fill()
          // Subtle top highlight
          ctx.fillStyle = 'rgba(255,255,255,0.05)'
          roundRect(ctx, px + inset + 1, py + inset + 1, size - 2, size * 0.35, 2)
          ctx.fill()
        } else if (x === start.x && y === start.y) {
          ctx.shadowColor = '#10b981'
          ctx.shadowBlur = 10
          ctx.fillStyle = '#10b981'
          roundRect(ctx, px + inset, py + inset, size, size, 5)
          ctx.fill()
          ctx.shadowBlur = 0
          // Inner highlight
          ctx.fillStyle = 'rgba(255,255,255,0.25)'
          roundRect(ctx, px + inset + 3, py + inset + 3, size - 6, size * 0.35, 3)
          ctx.fill()
        } else if (x === end.x && y === end.y) {
          ctx.shadowColor = '#ef4444'
          ctx.shadowBlur = 10
          ctx.fillStyle = '#ef4444'
          roundRect(ctx, px + inset, py + inset, size, size, 5)
          ctx.fill()
          ctx.shadowBlur = 0
          ctx.fillStyle = 'rgba(255,255,255,0.25)'
          roundRect(ctx, px + inset + 3, py + inset + 3, size - 6, size * 0.35, 3)
          ctx.fill()
        } else if (inSet(state?.path, x, y)) {
          ctx.shadowColor = '#f59e0b'
          ctx.shadowBlur = 12
          ctx.fillStyle = '#f59e0b'
          roundRect(ctx, px + inset, py + inset, size, size, 4)
          ctx.fill()
          ctx.shadowBlur = 0
          // Sparkle on path
          ctx.fillStyle = 'rgba(255,255,220,0.3)'
          roundRect(ctx, px + inset + 3, py + inset + 3, size - 6, size * 0.3, 2)
          ctx.fill()
        } else if (state?.current?.x === x && state?.current?.y === y) {
          ctx.shadowColor = '#8b5cf6'
          ctx.shadowBlur = 14
          ctx.fillStyle = '#8b5cf6'
          roundRect(ctx, px + inset, py + inset, size, size, 4)
          ctx.fill()
          ctx.shadowBlur = 0
        } else if (inSet(state?.closedSet, x, y)) {
          const idx = state.closedSet.findIndex(p => p.x === x && p.y === y)
          const ratio = Math.min(idx / Math.max(state.closedSet.length, 1), 1)
          const r = Math.round(25 + ratio * 55)
          const g = Math.round(35 + ratio * 80)
          const b = Math.round(95 + ratio * 130)
          ctx.fillStyle = `rgb(${r},${g},${b})`
          roundRect(ctx, px + inset, py + inset, size, size, 3)
          ctx.fill()
        } else if (inSet(state?.openSet, x, y)) {
          const idx = state.openSet.findIndex(p => p.x === x && p.y === y)
          const ratio = Math.min(idx / Math.max(state.openSet.length, 1), 1)
          const r = Math.round(15 + ratio * 35)
          const g = Math.round(120 + ratio * 70)
          const b = Math.round(35 + ratio * 35)
          ctx.fillStyle = `rgb(${r},${g},${b})`
          roundRect(ctx, px + inset, py + inset, size, size, 3)
          ctx.fill()
        } else {
          ctx.fillStyle = '#161630'
          roundRect(ctx, px + inset, py + inset, size, size, 3)
          ctx.fill()
        }
      }
    }

    // Draw path connecting lines (on top of cells)
    if (state?.path && state.path.length > 1) {
      ctx.shadowColor = '#f59e0b'
      ctx.shadowBlur = 8
      ctx.strokeStyle = '#fbbf24'
      ctx.lineWidth = 3
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.beginPath()
      let moved = false
      for (let i = 0; i < state.path.length - 1; i++) {
        const a = state.path[i]
        const b = state.path[i + 1]
        const ax = a.x * cellSize + cellSize / 2
        const ay = a.y * cellSize + cellSize / 2
        const bx = b.x * cellSize + cellSize / 2
        const by = b.y * cellSize + cellSize / 2
        if (Math.abs(a.x - b.x) <= 1 && Math.abs(a.y - b.y) <= 1) {
          if (!moved) { ctx.moveTo(ax, ay); moved = true }
          ctx.lineTo(bx, by)
        }
      }
      ctx.stroke()
      ctx.shadowBlur = 0

      // Path endpoints highlight
      const first = state.path[0]
      const last = state.path[state.path.length - 1]
      if (first && (first.x !== start.x || first.y !== start.y)) {
        ctx.fillStyle = '#fbbf24'
        ctx.beginPath()
        ctx.arc(first.x * cellSize + cellSize / 2, first.y * cellSize + cellSize / 2, 4, 0, Math.PI * 2)
        ctx.fill()
      }
      if (last && (last.x !== end.x || last.y !== end.y)) {
        ctx.fillStyle = '#fbbf24'
        ctx.beginPath()
        ctx.arc(last.x * cellSize + cellSize / 2, last.y * cellSize + cellSize / 2, 4, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    // Grid lines (subtle)
    ctx.strokeStyle = 'rgba(255,255,255,0.04)'
    ctx.lineWidth = 0.5
    for (let i = 0; i <= gridSize; i++) {
      ctx.beginPath()
      ctx.moveTo(i * cellSize, 0)
      ctx.lineTo(i * cellSize, gridSize * cellSize)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(0, i * cellSize)
      ctx.lineTo(gridSize * cellSize, i * cellSize)
      ctx.stroke()
    }
  }, [gridSize, cellSize, diagonal])

  // ---- Grid initialization & resize ----
  useEffect(() => {
    const size = gridSize
    const newGrid = createGrid(size, size)
    gridRef.current = newGrid
    const mid = Math.floor(size / 2)
    startRef.current = { x: Math.max(0, Math.min(size - 1, 1)), y: mid }
    endRef.current = { x: Math.max(0, Math.min(size - 1, size - 2)), y: mid }
    setStats({ steps: 0, time: 0, optimalSteps: 0 })
    setPathFound(false)
    setPlacingMode(null)
    setPlaying(false)
    stopAnim()
    animatingRef.current = false
  }, [gridSize, stopAnim])

  // Redraw when deps change
  useEffect(() => {
    drawGrid()
  }, [drawGrid])

    // ---- Interaction ----
  const getGridPos = useCallback((clientX, clientY) => {
    const rect = canvasRef.current.getBoundingClientRect()
    const scaleX = (gridSize * cellSize) / rect.width
    const scaleY = (gridSize * cellSize) / rect.height
    const x = Math.floor((clientX - rect.left) * scaleX / cellSize)
    const y = Math.floor((clientY - rect.top) * scaleY / cellSize)
    return { x, y }
  }, [gridSize, cellSize])

  const toggleWall = useCallback((x, y) => {
    const grid = gridRef.current
    if (x < 0 || x >= gridSize || y < 0 || y >= gridSize) return false
    if ((x === startRef.current.x && y === startRef.current.y) ||
        (x === endRef.current.x && y === endRef.current.y)) return false
    grid[y][x] = grid[y][x] === 1 ? 0 : 1
    setPathFound(false)
    setStats({ steps: 0, time: 0, optimalSteps: 0 })
    return true
  }, [gridSize])

  const handlePointerDown = useCallback((e) => {
    if (playing) return
    const { x, y } = getGridPos(e.clientX, e.clientY)
    if (x < 0 || x >= gridSize || y < 0 || y >= gridSize) return

    const grid = gridRef.current

    // Placing mode: set start/end
    if (placingMode === 'start') {
      if (grid[y][x] === 1 || (x === endRef.current.x && y === endRef.current.y)) return
      startRef.current = { x, y }
      setPlacingMode(null)
      setPathFound(false)
      setStats({ steps: 0, time: 0, optimalSteps: 0 })
      drawGrid()
      return
    }
    if (placingMode === 'end') {
      if (grid[y][x] === 1 || (x === startRef.current.x && y === startRef.current.y)) return
      endRef.current = { x, y }
      setPlacingMode(null)
      setPathFound(false)
      setStats({ steps: 0, time: 0, optimalSteps: 0 })
      drawGrid()
      return
    }

    // Protect start/end cells
    if ((x === startRef.current.x && y === startRef.current.y) ||
        (x === endRef.current.x && y === endRef.current.y)) return

    // Begin wall drag
    const currentVal = grid[y][x]
    const mode = currentVal === 1 ? 'remove' : 'add'
    grid[y][x] = mode === 'add' ? 1 : 0
    isDraggingRef.current = true
    dragModeRef.current = mode
    lastToggledRef.current = { x, y }
    drawGrid()
  }, [playing, drawGrid, gridSize, cellSize, placingMode, getGridPos])

  const handlePointerMove = useCallback((e) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const { x, y } = getGridPos(e.clientX, e.clientY)
    const inBounds = x >= 0 && x < gridSize && y >= 0 && y < gridSize

    // Wall drag
    if (isDraggingRef.current && dragModeRef.current && inBounds) {
      const last = lastToggledRef.current
      // Skip same cell
      if (last && x === last.x && y === last.y) {
        canvas.style.cursor = 'crosshair'
        return
      }
      // Protect start/end
      if ((x === startRef.current.x && y === startRef.current.y) ||
          (x === endRef.current.x && y === endRef.current.y)) {
        canvas.style.cursor = 'not-allowed'
        return
      }
      const grid = gridRef.current
      const mode = dragModeRef.current
      const shouldBeWall = mode === 'add'
      if (grid[y][x] !== (shouldBeWall ? 1 : 0)) {
        grid[y][x] = shouldBeWall ? 1 : 0
        lastToggledRef.current = { x, y }
        setPathFound(false)
        setStats({ steps: 0, time: 0, optimalSteps: 0 })
        drawGrid()
      }
      canvas.style.cursor = 'crosshair'
      return
    }

    // Cursor feedback
    if (placingMode && inBounds) {
      const grid = gridRef.current
      const valid = grid[y][x] === 0 &&
        !(placingMode === 'start' && x === endRef.current.x && y === endRef.current.y) &&
        !(placingMode === 'end' && x === startRef.current.x && y === startRef.current.y)
      canvas.style.cursor = valid ? 'copy' : 'not-allowed'
    } else {
      canvas.style.cursor = inBounds ? 'crosshair' : 'default'
    }
  }, [placingMode, gridSize, drawGrid, getGridPos])

  const handlePointerUp = useCallback(() => {
    isDraggingRef.current = false
    dragModeRef.current = null
    lastToggledRef.current = null
  }, [])

// ---- Animation ----
  const startAnimation = useCallback(() => {
    setPlaying(true)
    animatingRef.current = true
    setPathFound(false)
    const startTime = performance.now()
    const gen = algorithms[algorithm].fn(
      gridRef.current.map(row => [...row]),
      { ...startRef.current },
      { ...endRef.current },
      diagonal
    )

    run(gen,
      (state) => {
        if (!animatingRef.current) return
        drawGrid(state)
        setStats({
          steps: state.steps,
          time: performance.now() - startTime,
          optimalSteps: state.optimalSteps || 0,
        })
        if (state.found) {
          setPathFound(true)
        }
      },
      (finalState) => {
        if (!animatingRef.current) return
        setPlaying(false)
        animatingRef.current = false
        if (finalState && finalState.found) {
          setPathFound(true)
        }
        setStats(prev => ({
          ...prev,
          time: performance.now() - startTime,
        }))
      }
    )
  }, [algorithm, run, drawGrid, diagonal])

  const handleStop = useCallback(() => {
    animatingRef.current = false
    stopAnim()
    setPlaying(false)
  }, [stopAnim])

  const handleReset = useCallback(() => {
    stopAnim()
    animatingRef.current = false
    const size = gridSize
    const newGrid = createGrid(size, size)
    gridRef.current = newGrid
    const mid = Math.floor(size / 2)
    startRef.current = { x: Math.max(0, Math.min(size - 1, 1)), y: mid }
    endRef.current = { x: Math.max(0, Math.min(size - 1, size - 2)), y: mid }
    setStats({ steps: 0, time: 0, optimalSteps: 0 })
    setPathFound(false)
    setPlacingMode(null)
    setPlaying(false)
    drawGrid()
  }, [drawGrid, gridSize, stopAnim])

  const handleGenerateWalls = useCallback((density) => {
    if (playing) return
    const grid = gridRef.current
    generateWalls(grid, density)
    // Ensure start/end are clear
    const { x: sx, y: sy } = startRef.current
    const { x: ex, y: ey } = endRef.current
    grid[sy][sx] = 0
    grid[ey][ex] = 0
    setPathFound(false)
    setStats({ steps: 0, time: 0, optimalSteps: 0 })
    drawGrid()
  }, [playing, drawGrid])

  // ---- Render ----
  const canvasDim = gridSize * cellSize

  return (
    <div className={`${styles.page} section-ambient`}>
      <div className="ambient-blob ambient-blob--indigo" style={{ top: '-5%', right: '8%', animationDelay: '0s' }} />
      <div className="ambient-blob ambient-blob--teal" style={{ bottom: '-8%', left: '10%', animationDelay: '-4s' }} />
      <h2 className={styles.heading}>🧭 寻路可视化</h2>
      <p className={styles.hint}>
        点击网格切换墙壁 · 点击「设起点/终点」后点击格子重新定位
      </p>

      {/* Row 1: Algorithm + Diagonal + Grid size */}
      <div className={styles.controls}>
        <div className={styles.controlGroup}>
          <span className={styles.controlLabel}>算法</span>
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

        <button
          className={`${styles.toggleBtn} ${diagonal ? styles.toggleOn : ''}`}
          onClick={() => setDiagonal(d => !d)}
          disabled={playing}
          title={diagonal ? '禁用对角移动（4方向）' : '启用对角移动（8方向）'}
        >
          <span className={styles.toggleIcon}>{diagonal ? '◆' : '◇'}</span>
          <span>{diagonal ? '8方向' : '4方向'}</span>
        </button>

        <div className={styles.controlGroup}>
          <span className={styles.controlLabel}>网格</span>
          {PRESET_SIZES.map(s => (
            <button
              key={s}
              className={`${styles.btn} ${gridSize === s ? styles.btnActive : ''}`}
              onClick={() => setGridSize(s)}
              disabled={playing}
            >
              {s}×{s}
            </button>
          ))}
        </div>
      </div>

      {/* Row 2: Speed + Walls + Place */}
      <div className={styles.controls}>
        <SpeedControl value={speed} onChange={setSpeed} />

        <div className={styles.controlGroup}>
          <span className={styles.controlLabel}>随机墙</span>
          {[0.15, 0.25, 0.35].map(d => (
            <button
              key={d}
              className={styles.btn}
              onClick={() => handleGenerateWalls(d)}
              disabled={playing}
            >
              {Math.round(d * 100)}%
            </button>
          ))}
        </div>

        <div className={styles.controlGroup}>
          <button
            className={`${styles.btn} ${placingMode === 'start' ? styles.btnActive : ''}`}
            onClick={() => setPlacingMode(m => m === 'start' ? null : 'start')}
            disabled={playing}
          >
            🟢 设起点
          </button>
          <button
            className={`${styles.btn} ${placingMode === 'end' ? styles.btnActive : ''}`}
            onClick={() => setPlacingMode(m => m === 'end' ? null : 'end')}
            disabled={playing}
          >
            🔴 设终点
          </button>
        </div>
      </div>

      {/* Row 3: Actions */}
      <div className={styles.controls}>
        <div className={styles.controlGroup}>
          <button className={styles.btnPrimary} onClick={startAnimation} disabled={playing}>
            ▶ 开始寻路
          </button>
          <button className={styles.btn} onClick={handleStop} disabled={!playing}>
            ⏹ 停止
          </button>
          <button className={styles.btn} onClick={handleReset}>
            🔄 重置
          </button>
        </div>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        style={{ width: canvasDim, height: canvasDim, touchAction: 'none' }}
      />

      {/* Legend */}
      <div className={styles.legend}>
        <span className={styles.legendItem}>
          <span className={`${styles.swatch} ${styles.swatchStart}`} /> 起点
        </span>
        <span className={styles.legendItem}>
          <span className={`${styles.swatch} ${styles.swatchEnd}`} /> 终点
        </span>
        <span className={styles.legendItem}>
          <span className={`${styles.swatch} ${styles.swatchWall}`} /> 墙壁
        </span>
        <span className={styles.legendItem}>
          <span className={`${styles.swatch} ${styles.swatchOpen}`} /> 待探索
        </span>
        <span className={styles.legendItem}>
          <span className={`${styles.swatch} ${styles.swatchClosed}`} /> 已探索
        </span>
        <span className={styles.legendItem}>
          <span className={`${styles.swatch} ${styles.swatchCurrent}`} /> 当前
        </span>
        <span className={styles.legendItem}>
          <span className={`${styles.swatch} ${styles.swatchPath}`} /> 最优路径
        </span>
      </div>

      {/* Stats */}
      <div className={styles.statsPanel}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>探索节点</span>
          <span className={styles.statValue}>{stats.steps}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>最优步数</span>
          <span className={`${styles.statValue} ${stats.optimalSteps > 0 ? styles.statFound : ''}`}>
            {stats.optimalSteps > 0 ? stats.optimalSteps : '—'}
          </span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>理论最少</span>
          <span className={styles.statValue}>
            {minTheoreticalSteps(startRef.current, endRef.current, diagonal)}
          </span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>耗时</span>
          <span className={styles.statValue}>
            {stats.time > 0 ? `${Math.round(stats.time)} ms` : '—'}
          </span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>状态</span>
          <span className={`${styles.statValue} ${pathFound ? styles.statusFound : playing ? styles.statusRunning : ''}`}>
            {pathFound ? '✓ 已找到' : playing ? '⏳ 搜索中' : '⏸ 就绪'}
          </span>
        </div>
      </div>
    </div>
  )
}

