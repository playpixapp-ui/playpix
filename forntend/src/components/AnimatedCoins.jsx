import { useEffect, useState } from 'react'

export default function AnimatedCoins({ value }) {
  const [displayValue, setDisplayValue] = useState(value || 0)

  useEffect(() => {
    const start = displayValue
    const end = value || 0
    const duration = 600
    const steps = 20
    const increment = (end - start) / steps

    let currentStep = 0

    const interval = setInterval(() => {
      currentStep++

      setDisplayValue(Math.round(start + increment * currentStep))

      if (currentStep >= steps) {
        clearInterval(interval)
        setDisplayValue(end)
      }
    }, duration / steps)

    return () => clearInterval(interval)
  }, [value])

  return <>{displayValue}</>
}