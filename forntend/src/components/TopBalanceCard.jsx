import { useEffect, useRef, useState } from 'react'

export default function AnimatedCoins({ value }) {
  const [displayValue, setDisplayValue] = useState(value || 0)

  const previousValue = useRef(value || 0)

  useEffect(() => {
    const start = previousValue.current
    const end = value || 0

    if (start === end) return

    const duration = 800
    const startTime = performance.now()

    function animate(currentTime) {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)

      const current = Math.floor(
        start + (end - start) * progress
      )

      setDisplayValue(current)

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        previousValue.current = end
      }
    }

    requestAnimationFrame(animate)
  }, [value])

  return <>{displayValue}</>
}