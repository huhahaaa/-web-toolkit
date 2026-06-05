import { useState, useRef, useCallback, useEffect } from 'react'

export function useTimer(initialMinutes = 25) {
  const initialSeconds = initialMinutes * 60
  const [seconds, setSeconds] = useState(initialSeconds)
  const [status, setStatus] = useState('idle') // 'idle' | 'running' | 'paused'
  const intervalRef = useRef(null)

  const tick = useCallback(() => {
    setSeconds(prev => {
      if (prev <= 1) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
        setStatus('finished')
        return 0
      }
      return prev - 1
    })
  }, [])

  const start = useCallback(() => {
    if (intervalRef.current) return
    setStatus('running')
    intervalRef.current = setInterval(tick, 1000)
  }, [tick])

  const pause = useCallback(() => {
    clearInterval(intervalRef.current)
    intervalRef.current = null
    setStatus('paused')
  }, [])

  const reset = useCallback((mins = initialMinutes) => {
    clearInterval(intervalRef.current)
    intervalRef.current = null
    setSeconds(mins * 60)
    setStatus('idle')
  }, [initialMinutes])

  const skip = useCallback((mins = 5) => {
    clearInterval(intervalRef.current)
    intervalRef.current = null
    setSeconds(mins * 60)
    setStatus('idle')
  }, [])

  useEffect(() => {
    return () => clearInterval(intervalRef.current)
  }, [])

  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60

  return {
    minutes, secs, seconds, status,
    start, pause, reset, skip,
    progress: 1 - seconds / initialSeconds,
  }
}
