import { useEffect, useMemo, useRef, useState } from 'react'
import styles from './Sorting.module.css'

const algorithms = {
  bubble: {
    title: '冒泡排序 Bubble Sort',
    badge: '冒泡排序',
    noteTitle: '相邻比较，逐轮沉底',
    noteBody: '冒泡排序每次比较相邻两个元素，较大的元素会逐步移动到数组末尾。',
    complexity: '时间 O(n²) · 空间 O(1)',
  },
  selection: {
    title: '选择排序 Selection Sort',
    badge: '选择排序',
    noteTitle: '寻找最小，放入前缀',
    noteBody: '选择排序会在未排序区间内寻找最小值，并把它交换到当前起始位置。',
    complexity: '时间 O(n²) · 空间 O(1)',
  },
}

const speedDurations = {
  slow: 780,
  medium: 390,
  fast: 150,
}

const speedLabels = {
  slow: '慢速',
  medium: '中速',
  fast: '快速',
}

const palette = [
  ['#4f8bf7', '#2364d2'],
  ['#31c2a6', '#138f7a'],
  ['#f5c24b', '#da8f0d'],
  ['#ef7c68', '#d94f4f'],
  ['#8e72dd', '#684abb'],
  ['#4aa0ad', '#267b88'],
  ['#ec6fa8', '#c34783'],
  ['#6bbf59', '#3c973f'],
]

class RunAborted extends Error {
  constructor() {
    super('run aborted')
    this.name = 'RunAborted'
  }
}

function readPreferences() {
  try {
    const raw = localStorage.getItem('sort-visualizer-preferences')
    if (!raw) {
      return { count: 15, algorithm: 'bubble', speed: 'medium' }
    }

    const prefs = JSON.parse(raw)
    return {
      count: Number.isInteger(prefs.count) && prefs.count >= 10 && prefs.count <= 20 ? prefs.count : 15,
      algorithm: algorithms[prefs.algorithm] ? prefs.algorithm : 'bubble',
      speed: speedDurations[prefs.speed] ? prefs.speed : 'medium',
    }
  } catch {
    localStorage.removeItem('sort-visualizer-preferences')
    return { count: 15, algorithm: 'bubble', speed: 'medium' }
  }
}

function createId(index) {
  if (globalThis.crypto && typeof globalThis.crypto.randomUUID === 'function') {
    return globalThis.crypto.randomUUID()
  }
  return `bar-${Date.now()}-${index}-${Math.random().toString(16).slice(2)}`
}

function randomValue() {
  return Math.floor(Math.random() * 90) + 10
}

function createItems(count) {
  return Array.from({ length: count }, (_, index) => ({
    id: createId(index),
    value: randomValue(),
    color: palette[index % palette.length],
  }))
}

function createTrace(message) {
  const time = new Date().toLocaleTimeString('zh-CN', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
  return { time, message }
}

function sortedRange(start, end) {
  const result = []
  for (let index = start; index < end; index += 1) {
    result.push(index)
  }
  return result
}

function positionSet(indices, items) {
  return new Set((indices || []).map((index) => items[index]?.id).filter(Boolean))
}

function sleep(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

export default function Sorting() {
  const [prefs] = useState(readPreferences)
  const [count, setCount] = useState(prefs.count)
  const [algorithm, setAlgorithm] = useState(prefs.algorithm)
  const [speed, setSpeed] = useState(prefs.speed)
  const [items, setItems] = useState(() => createItems(prefs.count))
  const [comparisons, setComparisons] = useState(0)
  const [moves, setMoves] = useState(0)
  const [running, setRunning] = useState(false)
  const [paused, setPaused] = useState(false)
  const [statusText, setStatusText] = useState('已生成随机数组，选择算法后开始演示。')
  const [runMode, setRunMode] = useState('idle')
  const [trace, setTrace] = useState(() => [createTrace(`生成 ${prefs.count} 个随机数字`)])
  const [highlights, setHighlights] = useState({})

  const tokenRef = useRef(0)
  const itemsRef = useRef(items)
  const countRef = useRef(count)
  const algorithmRef = useRef(algorithm)
  const speedRef = useRef(speed)
  const comparisonsRef = useRef(comparisons)
  const movesRef = useRef(moves)
  const runningRef = useRef(running)
  const pausedRef = useRef(paused)

  const meta = algorithms[algorithm]

  useEffect(() => {
    itemsRef.current = items
  }, [items])

  useEffect(() => {
    countRef.current = count
  }, [count])

  useEffect(() => {
    algorithmRef.current = algorithm
  }, [algorithm])

  useEffect(() => {
    speedRef.current = speed
  }, [speed])

  useEffect(() => {
    comparisonsRef.current = comparisons
  }, [comparisons])

  useEffect(() => {
    movesRef.current = moves
  }, [moves])

  useEffect(() => {
    runningRef.current = running
  }, [running])

  useEffect(() => {
    pausedRef.current = paused
  }, [paused])

  useEffect(() => {
    document.title = `${meta.badge} · 排序算法可视化演算`
  }, [meta.badge])

  useEffect(() => {
    localStorage.setItem('sort-visualizer-preferences', JSON.stringify({ count, algorithm, speed }))
  }, [count, algorithm, speed])

  const css = (...names) => names.filter(Boolean).map((name) => styles[name]).join(' ')

  function setStatus(text, mode) {
    setStatusText(text)
    setRunMode(mode)
  }

  function addTrace(message) {
    setTrace((current) => [createTrace(message), ...current].slice(0, 7))
  }

  function setRunningState(value) {
    runningRef.current = value
    setRunning(value)
  }

  function setPausedState(value) {
    pausedRef.current = value
    setPaused(value)
  }

  function setItemsState(nextItems) {
    itemsRef.current = nextItems
    setItems(nextItems)
  }

  function setCountState(nextCount) {
    countRef.current = nextCount
    setCount(nextCount)
  }

  function setComparisonsState(nextComparisons) {
    comparisonsRef.current = nextComparisons
    setComparisons(nextComparisons)
  }

  function setMovesState(nextMoves) {
    movesRef.current = nextMoves
    setMoves(nextMoves)
  }

  function assertActive(token) {
    if (token !== tokenRef.current) {
      throw new RunAborted()
    }
  }

  async function stepDelay(token, factor = 1) {
    let remaining = speedDurations[speedRef.current] * factor
    while (remaining > 0) {
      assertActive(token)
      if (pausedRef.current) {
        setStatus('演算已暂停，速度和当前状态会保留。', 'paused')
        await sleep(80)
        continue
      }

      const frame = Math.min(35, remaining)
      await sleep(frame)
      remaining -= frame
    }
  }

  async function comparePositions(token, first, second, sorted = [], candidate = []) {
    assertActive(token)
    const nextComparisons = comparisonsRef.current + 1
    const currentItems = itemsRef.current
    const firstValue = currentItems[first].value
    const secondValue = currentItems[second].value

    setComparisonsState(nextComparisons)
    setStatus(`比较第 ${first + 1} 位 ${firstValue} 与第 ${second + 1} 位 ${secondValue}`, 'running')
    addTrace(`比较 ${firstValue} 与 ${secondValue}`)
    setHighlights({ comparing: [first, second], sorted, candidate })
    await stepDelay(token)
  }

  async function swapPositions(token, first, second, sorted = [], candidate = []) {
    assertActive(token)
    const currentItems = itemsRef.current
    const firstValue = currentItems[first].value
    const secondValue = currentItems[second].value
    const nextMoves = movesRef.current + 1

    setMovesState(nextMoves)
    setStatus(`交换第 ${first + 1} 位 ${firstValue} 与第 ${second + 1} 位 ${secondValue}`, 'running')
    addTrace(`交换 ${firstValue} 和 ${secondValue}`)
    setHighlights({ swapping: [first, second], sorted, candidate })
    await stepDelay(token, 0.78)

    const nextItems = [...itemsRef.current]
    ;[nextItems[first], nextItems[second]] = [nextItems[second], nextItems[first]]
    setItemsState(nextItems)
    setHighlights({ swapping: [first, second], sorted, candidate })
    await stepDelay(token, 0.92)
  }

  async function runBubbleSort(token) {
    const itemCount = itemsRef.current.length

    for (let pass = 0; pass < itemCount - 1; pass += 1) {
      const sorted = sortedRange(itemCount - pass, itemCount)
      for (let index = 0; index < itemCount - pass - 1; index += 1) {
        await comparePositions(token, index, index + 1, sorted)
        if (itemsRef.current[index].value > itemsRef.current[index + 1].value) {
          await swapPositions(token, index, index + 1, sorted)
        }
      }

      setHighlights({ sorted: sortedRange(itemCount - pass - 1, itemCount) })
      addTrace(`第 ${pass + 1} 轮完成，最大值归位`)
      await stepDelay(token, 0.62)
    }
  }

  async function runSelectionSort(token) {
    const itemCount = itemsRef.current.length

    for (let start = 0; start < itemCount - 1; start += 1) {
      let minIndex = start
      setHighlights({ candidate: [minIndex], sorted: sortedRange(0, start) })
      setStatus(`从第 ${start + 1} 位开始寻找未排序区间最小值`, 'running')
      addTrace(`假定 ${itemsRef.current[minIndex].value} 为当前最小值`)
      await stepDelay(token, 0.7)

      for (let scan = start + 1; scan < itemCount; scan += 1) {
        await comparePositions(token, minIndex, scan, sortedRange(0, start), [minIndex])
        if (itemsRef.current[scan].value < itemsRef.current[minIndex].value) {
          minIndex = scan
          setStatus(`更新当前最小值为 ${itemsRef.current[minIndex].value}`, 'running')
          addTrace(`当前最小值更新为 ${itemsRef.current[minIndex].value}`)
          setHighlights({ candidate: [minIndex], sorted: sortedRange(0, start) })
          await stepDelay(token, 0.72)
        }
      }

      if (minIndex !== start) {
        await swapPositions(token, start, minIndex, sortedRange(0, start), [minIndex])
      } else {
        addTrace(`${itemsRef.current[start].value} 已在正确位置`)
        setHighlights({ candidate: [start], sorted: sortedRange(0, start) })
        await stepDelay(token, 0.62)
      }

      setHighlights({ sorted: sortedRange(0, start + 1) })
      await stepDelay(token, 0.55)
    }
  }

  function generateArray(nextCount = countRef.current) {
    tokenRef.current += 1
    setRunningState(false)
    setPausedState(false)
    setComparisonsState(0)
    setMovesState(0)
    setCountState(nextCount)
    setItemsState(createItems(nextCount))
    setTrace([createTrace(`生成 ${nextCount} 个随机数字`)])
    setHighlights({})
    setStatus('已生成随机数组，选择算法后开始演示。', 'idle')
  }

  async function startSort() {
    if (runningRef.current && pausedRef.current) {
      setPausedState(false)
      setStatus('继续演算。', 'running')
      return
    }

    if (runningRef.current) return

    setRunningState(true)
    setPausedState(false)
    setComparisonsState(0)
    setMovesState(0)
    setHighlights({})
    const token = tokenRef.current
    addTrace(`开始${algorithms[algorithmRef.current].badge}`)

    try {
      if (algorithmRef.current === 'bubble') {
        await runBubbleSort(token)
      } else {
        await runSelectionSort(token)
      }

      assertActive(token)
      setHighlights({ sorted: sortedRange(0, itemsRef.current.length) })
      setStatus(`演算完成：共比较 ${comparisonsRef.current} 次，交换 ${movesRef.current} 次。`, 'done')
      addTrace('排序完成')
    } catch (error) {
      if (!(error instanceof RunAborted)) {
        console.error(error)
        setStatus('演算中断，请重新生成数组后再试。', 'idle')
      }
    } finally {
      if (token === tokenRef.current) {
        setRunningState(false)
        setPausedState(false)
      }
    }
  }

  function togglePause() {
    if (!runningRef.current) return
    const nextPaused = !pausedRef.current
    setPausedState(nextPaused)
    setStatus(nextPaused ? '演算已暂停，速度和当前状态会保留。' : '继续演算。', nextPaused ? 'paused' : 'running')
  }

  function handleAlgorithmChange(event) {
    const nextAlgorithm = event.target.value
    setAlgorithm(nextAlgorithm)
    algorithmRef.current = nextAlgorithm
    setStatus(`已切换为${algorithms[nextAlgorithm].badge}。`, 'idle')
  }

  function handleSpeedChange(event) {
    const nextSpeed = event.target.value
    setSpeed(nextSpeed)
    speedRef.current = nextSpeed
    addTrace(`速度切换为${speedLabels[nextSpeed]}`)
  }

  function handleCountChange(event) {
    generateArray(Number(event.target.value))
  }

  const barMetrics = useMemo(() => {
    const values = items.map((item) => item.value)
    const min = Math.min(...values)
    const max = Math.max(...values)
    const range = Math.max(1, max - min)
    const itemCount = Math.max(1, items.length)
    const slot = 100 / itemCount
    const width = Math.max(2.2, slot * 0.72)
    const compareIds = positionSet(highlights.comparing, items)
    const swapIds = positionSet(highlights.swapping, items)
    const candidateIds = positionSet(highlights.candidate, items)
    const sortedIds = positionSet(highlights.sorted, items)

    return { min, range, slot, width, compareIds, swapIds, candidateIds, sortedIds }
  }, [items, highlights])

  function getBarClassName(item) {
    return css(
      'bar',
      items.length > 16 && 'compact',
      barMetrics.compareIds.has(item.id) && 'comparing',
      barMetrics.swapIds.has(item.id) && 'swapping',
      barMetrics.candidateIds.has(item.id) && 'candidate',
      barMetrics.sortedIds.has(item.id) && 'sorted',
    )
  }

  function getStripClassName(item) {
    return css(
      barMetrics.compareIds.has(item.id) && 'compare',
      barMetrics.swapIds.has(item.id) && 'swap',
      barMetrics.candidateIds.has(item.id) && 'candidate',
      barMetrics.sortedIds.has(item.id) && 'sorted',
    )
  }

  return (
    <div className={css('app-shell')}>
      <header className={css('topbar')}>
        <div>
          <p className={css('eyebrow')}>Web 技术及应用开发 · 第四题</p>
          <h1>排序算法可视化演算</h1>
        </div>
        <div className={css('run-badge', runMode === 'running' && 'running', runMode === 'paused' && 'paused')}>
          {runMode === 'running' && '演算中'}
          {runMode === 'paused' && '已暂停'}
          {runMode === 'done' && '已完成'}
          {runMode === 'idle' && '待开始'}
        </div>
      </header>

      <main className={css('workspace')}>
        <section className={css('visual-panel')} aria-label="排序动画区域">
          <div className={css('panel-heading')}>
            <div>
              <h2>{meta.title}</h2>
              <p>{statusText}</p>
            </div>
            <div className={css('stats-row')} aria-label="统计信息">
              <div className={css('stat-block')}>
                <strong>{comparisons}</strong>
                <span>比较次数</span>
              </div>
              <div className={css('stat-block')}>
                <strong>{moves}</strong>
                <span>Moves</span>
              </div>
              <div className={css('stat-block')}>
                <strong>{count}</strong>
                <span>盘块数</span>
              </div>
            </div>
          </div>

          <div className={css('bars-stage')}>
            <div className={css('axis-label', 'high')}>高</div>
            <div className={css('axis-label', 'low')}>低</div>
            <div className={css('bars')} aria-live="polite">
              {items.map((item, index) => {
                const left = index * barMetrics.slot + (barMetrics.slot - barMetrics.width) / 2
                const height = 16 + ((item.value - barMetrics.min) / barMetrics.range) * 80

                return (
                  <div
                    key={item.id}
                    className={getBarClassName(item)}
                    title={`第 ${index + 1} 位，数值 ${item.value}`}
                    data-id={item.id}
                    style={{
                      left: `${left}%`,
                      width: `${barMetrics.width}%`,
                      height: `${height}%`,
                      '--bar-light': item.color[0],
                      '--bar-base': item.color[1],
                    }}
                  >
                    <span className={css('bar-value')}>{item.value}</span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className={css('legend')} aria-label="颜色图例">
            <span><i className={css('legend-chip', 'normal')} />普通</span>
            <span><i className={css('legend-chip', 'compare')} />比较</span>
            <span><i className={css('legend-chip', 'swap')} />交换</span>
            <span><i className={css('legend-chip', 'candidate')} />当前最小</span>
            <span><i className={css('legend-chip', 'sorted')} />已排序</span>
          </div>
          <div className={css('array-strip')} aria-label="当前数组">
            {items.map((item) => (
              <span key={item.id} className={getStripClassName(item)}>
                {item.value}
              </span>
            ))}
          </div>
        </section>

        <aside className={css('control-panel')} aria-label="排序控制台">
          <section className={css('control-group')}>
            <div className={css('group-title')}>
              <span>算法</span>
              <small>{meta.complexity}</small>
            </div>
            <div className={css('segmented')} role="radiogroup" aria-label="选择排序算法">
              <label>
                <input
                  type="radio"
                  name="algorithm"
                  value="bubble"
                  checked={algorithm === 'bubble'}
                  onChange={handleAlgorithmChange}
                  disabled={running}
                />
                <span>冒泡排序</span>
              </label>
              <label>
                <input
                  type="radio"
                  name="algorithm"
                  value="selection"
                  checked={algorithm === 'selection'}
                  onChange={handleAlgorithmChange}
                  disabled={running}
                />
                <span>选择排序</span>
              </label>
            </div>
          </section>

          <section className={css('control-group')}>
            <div className={css('group-title')}>
              <span>数字盘块</span>
              <output htmlFor="countRange">{count}</output>
            </div>
            <input
              id="countRange"
              className={css('range-control')}
              type="range"
              min="10"
              max="20"
              value={count}
              onChange={handleCountChange}
              disabled={running}
            />
          </section>

          <section className={css('control-group')}>
            <div className={css('group-title')}>
              <span>动画速度</span>
              <small>运行中可调节</small>
            </div>
            <div className={css('segmented', 'speed-grid')} role="radiogroup" aria-label="选择动画速度">
              {Object.entries(speedLabels).map(([value, label]) => (
                <label key={value}>
                  <input
                    type="radio"
                    name="speed"
                    value={value}
                    checked={speed === value}
                    onChange={handleSpeedChange}
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </section>

          <section className={css('button-grid')} aria-label="演示操作">
            <button className={css('primary-action')} type="button" onClick={startSort} disabled={running && !paused}>
              开始演示
            </button>
            <button type="button" onClick={togglePause} disabled={!running}>
              {paused ? '继续' : '暂停'}
            </button>
            <button type="button" onClick={() => generateArray()}>
              新数组
            </button>
          </section>

          <section className={css('algorithm-note')}>
            <h3>{meta.noteTitle}</h3>
            <p>{meta.noteBody}</p>
          </section>
        </aside>

        <section className={css('trace-panel')} aria-label="运行步骤记录">
          <div className={css('panel-heading', 'compact')}>
            <div>
              <h2>当前演算记录</h2>
              <p>展示最近的比较、交换和确认步骤。</p>
            </div>
            <button type="button" onClick={() => generateArray()} disabled={running}>
              重新打乱
            </button>
          </div>
          <ol className={css('trace-list')}>
            {trace.map((entry) => (
              <li key={`${entry.time}-${entry.message}`}>
                <time>{entry.time}</time>
                <span title={entry.message}>{entry.message}</span>
              </li>
            ))}
          </ol>
        </section>
      </main>
    </div>
  )
}
