import { useEffect, useState } from 'react'
import RewardParticles from './RewardParticles'

const prizes = [20, 50, 100, 150, 200, 500]

export default function RouletteGames({ onBack, onReward, wallet }) {
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState(null)
  const [rotation, setRotation] = useState(0)
  const [showReward, setShowReward] = useState(false)

  const [cooldown, setCooldown] = useState(() => {
    const savedEnd = localStorage.getItem(`rouletteCooldownEnd_${wallet?.email}`)
    if (!savedEnd) return 0
    return Math.max(0, Math.floor((Number(savedEnd) - Date.now()) / 1000))
  })

  useEffect(() => {
    if (cooldown <= 0) return

    const interval = setInterval(() => {
      const savedEnd = localStorage.getItem(`rouletteCooldownEnd_${wallet?.email}`)

      if (!savedEnd) {
        setCooldown(0)
        return
      }

      const remaining = Math.max(0, Math.floor((Number(savedEnd) - Date.now()) / 1000))

      if (remaining <= 0) {
        localStorage.removeItem(`rouletteCooldownEnd_${wallet?.email}`)
        setCooldown(0)
        return
      }

      setCooldown(remaining)
    }, 1000)

    return () => clearInterval(interval)
  }, [cooldown])

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  function spin() {
    if (spinning || cooldown > 0) return

    setSpinning(true)
    setResult(null)
    setShowReward(false)

    const randomIndex = Math.floor(Math.random() * prizes.length)
    const reward = prizes[randomIndex]
    const segmentAngle = 360 / prizes.length
    const finalRotation = 360 * 6 + (360 - randomIndex * segmentAngle - segmentAngle / 2)

    setRotation(finalRotation)

    setTimeout(() => {
      setResult(reward)
      setShowReward(true)
      onReward(reward)

      const audio = new Audio('/coin.mp3')
      audio.volume = 0.5
      audio.play().catch(() => {})

      const cooldownEnd = Date.now() + 60 * 60 * 1000
      localStorage.setItem(
        `rouletteCooldownEnd_${wallet?.email}`,
        String(cooldownEnd)
        )
        setCooldown(60 * 60)
        setSpinning(false)
            }, 4500)
          }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: '#0f172a',
      color: 'white',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
      padding: 20,
      boxSizing: 'border-box',
      overflow: 'hidden'
    }}>
      <RewardParticles show={showReward} />

      <h1>🎯 Roleta Bônus</h1>

      <p style={{ opacity: 0.8 }}>
        Gire para ganhar coins
      </p>

      <div style={{ position: 'relative', marginTop: 30 }}>
        <div style={{
          position: 'absolute',
          top: -22,
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: 42,
          zIndex: 10
        }}>
          🔻
        </div>

        <div style={{
          width: 260,
          height: 260,
          borderRadius: '50%',
          border: '10px solid #22c55e',
          transition: spinning
            ? 'transform 4.5s cubic-bezier(0.17, 0.67, 0.12, 0.99)'
            : 'none',
          transform: `rotate(${rotation}deg)`,
          position: 'relative',
          overflow: 'hidden',
          boxShadow: showReward
            ? '0 0 55px #22c55e'
            : '0 0 20px rgba(255,255,255,0.2)',
          background: `conic-gradient(
            #22c55e 0deg 60deg,
            #fde047 60deg 120deg,
            #38bdf8 120deg 180deg,
            #fb7185 180deg 240deg,
            #e5e7eb 240deg 300deg,
            #f59e0b 300deg 360deg
          )`
        }}>
          {prizes.map((value, index) => {
            const angle = index * 60 + 30

            return (
              <div
                key={value}
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  transform: `rotate(${angle}deg) translate(0, -92px) rotate(-${angle}deg)`,
                  transformOrigin: 'center',
                  fontWeight: 'bold',
                  fontSize: 20,
                  color: 'white',
                  textShadow: '0 2px 5px rgba(0,0,0,0.6)'
                }}
              >
                {value}
              </div>
            )
          })}

          <div style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: 92,
            height: 92,
            borderRadius: '50%',
            background: '#0f172a',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: 34,
            fontWeight: 'bold',
            border: '4px solid rgba(255,255,255,0.2)'
          }}>
            🎯
          </div>
        </div>
      </div>

      <button
        onClick={spin}
        disabled={spinning || cooldown > 0}
        style={{
          marginTop: 40,
          padding: '14px 40px',
          borderRadius: 14,
          border: 'none',
          background: cooldown > 0 ? '#64748b' : '#22c55e',
          color: 'white',
          fontWeight: 'bold',
          fontSize: 18,
          zIndex: 2
        }}
      >
        {cooldown > 0 ? `Aguarde ${formatTime(cooldown)}` : spinning ? 'Girando...' : 'GIRAR'}
      </button>

      {showReward && (
        <div style={{
          marginTop: 30,
          animation: 'floatUp 1s ease',
          zIndex: 2
        }}>
          <h2 style={{ color: '#4ade80' }}>
            🎉 +{result} coins
          </h2>

          <div style={{ fontSize: 40 }}>
            🪙✨🪙✨🪙
          </div>
        </div>
      )}

      <button
        onClick={onBack}
        style={{
          marginTop: 30,
          padding: '10px 26px',
          borderRadius: 12,
          border: 'none',
          background: '#ef4444',
          color: 'white',
          fontWeight: 'bold',
          zIndex: 2
        }}
      >
        Fechar
      </button>

      <style>
        {`
          @keyframes floatUp {
            0% {
              opacity: 0;
              transform: translateY(20px);
            }

            100% {
              opacity: 1;
              transform: translateY(-10px);
            }
          }
        `}
      </style>
    </div>
  )
}