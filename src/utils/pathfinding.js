/**
 * BFS Pathfinding Generator
 * Yields each step: { openSet, closedSet, current, path?, found }
 *
 * Grid: 15x15, 0=empty, 1=wall
 * Start and End are {x, y} coordinates.
 */
export function* bfs(grid, start, end) {
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
      }
      return
    }

    for (const [dx, dy] of [[0, -1], [1, 0], [0, 1], [-1, 0]]) {
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

  yield { openSet: [], closedSet, current: null, path: null, steps, found: false }
}

/**
 * A* Pathfinding Generator
 */
export function* astar(grid, start, end) {
  const rows = grid.length
  const cols = grid[0].length
  const openSet = [start]
  const closedSet = []
  const parent = {}
  const gScore = {}
  const fScore = {}
  let steps = 0
  const key = (p) => `${p.x},${p.y}`

  const heuristic = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y)

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
      }
      return
    }

    for (const [dx, dy] of [[0, -1], [1, 0], [0, 1], [-1, 0]]) {
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

  yield { openSet: [], closedSet, current: null, path: null, steps, found: false }
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
 * Create an empty 15x15 grid.
 */
export function createGrid(rows = 15, cols = 15) {
  return Array.from({ length: rows }, () => Array(cols).fill(0))
}
