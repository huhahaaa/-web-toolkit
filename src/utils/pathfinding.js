/**
 * BFS Pathfinding Generator
 * Yields each step: { openSet, closedSet, current, path, steps, found, optimalSteps }
 * Grid: 0=empty, 1=wall. Start/End: {x, y}.
 * @param {boolean} diagonal - enable 8-directional movement
 */
export function* bfs(grid, start, end, diagonal = false) {
  const rows = grid.length
  const cols = grid[0].length
  const queue = [start]
  const visited = new Set()
  const parent = {}
  const closedSet = []
  let steps = 0
  const key = (p) => `${p.x},${p.y}`

  visited.add(key(start))
  parent[key(start)] = null

  const dirs = diagonal
    ? [[0,-1],[1,-1],[1,0],[1,1],[0,1],[-1,1],[-1,0],[-1,-1]]
    : [[0,-1],[1,0],[0,1],[-1,0]]

  while (queue.length > 0) {
    const current = queue.shift()
    closedSet.push(current)
    steps++

    yield {
      openSet: [...queue],
      closedSet: [...closedSet],
      current,
      path: null,
      steps,
      found: false,
      optimalSteps: 0,
    }

    if (current.x === end.x && current.y === end.y) {
      const path = reconstructPath(parent, end)
      yield {
        openSet: [...queue],
        closedSet: [...closedSet],
        current,
        path,
        steps,
        found: true,
        optimalSteps: path.length - 1,
      }
      return
    }

    for (const [dx, dy] of dirs) {
      const nx = current.x + dx
      const ny = current.y + dy
      const nKey = key({ x: nx, y: ny })

      if (
        nx >= 0 && nx < cols && ny >= 0 && ny < rows &&
        grid[ny][nx] === 0 && !visited.has(nKey)
      ) {
        visited.add(nKey)
        parent[nKey] = current
        queue.push({ x: nx, y: ny })
      }
    }
  }

  yield { openSet: [], closedSet, current: null, path: null, steps, found: false, optimalSteps: 0 }
}

/**
 * A* Pathfinding Generator
 * @param {boolean} diagonal - enable 8-directional movement
 */
export function* astar(grid, start, end, diagonal = false) {
  const rows = grid.length
  const cols = grid[0].length
  const openSet = [start]
  const closedSet = []
  const parent = {}
  const gScore = {}
  const fScore = {}
  let steps = 0
  const key = (p) => `${p.x},${p.y}`

  const heuristic = diagonal
    ? (a, b) => Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y))
    : (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y)

  const dirs = diagonal
    ? [[0,-1],[1,-1],[1,0],[1,1],[0,1],[-1,1],[-1,0],[-1,-1]]
    : [[0,-1],[1,0],[0,1],[-1,0]]

  gScore[key(start)] = 0
  fScore[key(start)] = heuristic(start, end)
  parent[key(start)] = null

  while (openSet.length > 0) {
    let currentIdx = 0
    for (let i = 1; i < openSet.length; i++) {
      if (fScore[key(openSet[i])] < fScore[key(openSet[currentIdx])]) {
        currentIdx = i
      }
    }

    const current = openSet.splice(currentIdx, 1)[0]
    closedSet.push(current)
    steps++

    yield {
      openSet: [...openSet],
      closedSet: [...closedSet],
      current,
      path: null,
      steps,
      found: false,
      optimalSteps: 0,
    }

    if (current.x === end.x && current.y === end.y) {
      const path = reconstructPath(parent, end)
      yield {
        openSet: [...openSet],
        closedSet: [...closedSet],
        current,
        path,
        steps,
        found: true,
        optimalSteps: path.length - 1,
      }
      return
    }

    for (const [dx, dy] of dirs) {
      const nx = current.x + dx
      const ny = current.y + dy
      const nKey = key({ x: nx, y: ny })

      if (nx < 0 || nx >= cols || ny < 0 || ny >= rows || grid[ny][nx] === 1) continue

      const tentG = gScore[key(current)] + 1
      if (tentG < (gScore[nKey] ?? Infinity)) {
        parent[nKey] = current
        gScore[nKey] = tentG
        fScore[nKey] = tentG + heuristic({ x: nx, y: ny }, end)
        if (!openSet.find(p => key(p) === nKey)) {
          openSet.push({ x: nx, y: ny })
        }
      }
    }
  }

  yield { openSet: [], closedSet, current: null, path: null, steps, found: false, optimalSteps: 0 }
}

function reconstructPath(parent, end) {
  const path = []
  let current = end
  const key = (p) => `${p.x},${p.y}`
  while (current) {
    path.unshift(current)
    current = parent[key(current)]
  }
  return path
}

/**
 * Create an empty grid.
 */
export function createGrid(rows = 15, cols = 15) {
  return Array.from({ length: rows }, () => Array(cols).fill(0))
}

/**
 * Generate random walls on the grid.
 * @param {number} density - 0~1 wall probability
 */
export function generateWalls(grid, density = 0.25) {
  const rows = grid.length
  const cols = grid[0].length
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      grid[y][x] = Math.random() < density ? 1 : 0
    }
  }
}

/**
 * Theoretical minimum steps between start and end (Manhattan or Chebyshev).
 */
export function minTheoreticalSteps(start, end, diagonal) {
  const dx = Math.abs(start.x - end.x)
  const dy = Math.abs(start.y - end.y)
  return diagonal ? Math.max(dx, dy) : dx + dy
}
