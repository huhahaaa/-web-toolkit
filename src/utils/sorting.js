/**
 * Bubble Sort Generator
 * Yields the array state after each comparison/swap for visualization.
 */
export function* bubbleSort(arr) {
  const a = [...arr]
  const n = a.length
  let moves = 0
  let comparisons = 0

  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      comparisons++
      yield { array: [...a], comparing: [j, j + 1], swapping: [], moves, comparisons }

      if (a[j] > a[j + 1]) {
        ;[a[j], a[j + 1]] = [a[j + 1], a[j]]
        moves++
        yield { array: [...a], comparing: [], swapping: [j, j + 1], moves, comparisons }
      }
    }
  }
  yield { array: [...a], comparing: [], swapping: [], moves, comparisons, done: true }
}

/**
 * Selection Sort Generator
 */
export function* selectionSort(arr) {
  const a = [...arr]
  const n = a.length
  let moves = 0
  let comparisons = 0

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i
    for (let j = i + 1; j < n; j++) {
      comparisons++
      yield { array: [...a], comparing: [minIdx, j], swapping: [], moves, comparisons }

      if (a[j] < a[minIdx]) {
        minIdx = j
      }
    }
    if (minIdx !== i) {
      ;[a[i], a[minIdx]] = [a[minIdx], a[i]]
      moves++
      yield { array: [...a], comparing: [], swapping: [i, minIdx], moves, comparisons }
    }
  }
  yield { array: [...a], comparing: [], swapping: [], moves, comparisons, done: true }
}

/**
 * Generate a random array of n integers between min and max.
 */
export function randomArray(n = 15, min = 5, max = 100) {
  return Array.from({ length: n }, () => Math.floor(Math.random() * (max - min + 1)) + min)
}
