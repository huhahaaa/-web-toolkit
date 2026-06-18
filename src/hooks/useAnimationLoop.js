import { useRef, useCallback, useEffect } from 'react'

const delayMap = { fast: 1, medium: 50, slow: 200 }

/**
 * Generic animation loop hook for algorithm visualization.
 * speed: 'fast' (1ms delay) | 'medium' (50ms) | 'slow' (200ms)
 */
export function useAnimationLoop(speed = 'medium') {
  const frameRef = useRef(null)
  const running = useRef(false)
  const speedRef = useRef(speed)

  useEffect(() => {
    speedRef.current = speed
  }, [speed])

  const run = useCallback(async (generator, onStep, onDone) => {
    running.current = true
    let result = generator.next()

    while (!result.done && running.current) {
      onStep?.(result.value)

      await new Promise(resolve => {
        frameRef.current = setTimeout(resolve, delayMap[speedRef.current] ?? delayMap.medium)
      })

      result = generator.next()
    }

    if (running.current) {
      onDone?.(result.value)
    }
    running.current = false
  }, [])

  const stop = useCallback(() => {
    running.current = false
    if (frameRef.current) {
      clearTimeout(frameRef.current)
      frameRef.current = null
    }
  }, [])

  const isRunning = useCallback(() => running.current, [])

  return { run, stop, isRunning }
}
