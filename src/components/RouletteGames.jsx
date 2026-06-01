import { useState } from 'react'

const PRIZES = [
  { value: 10, color: '#22c55e' },
  { value: 25, color: '#3b82f6' },
  { value: 50, color: '#eab308' },
  { value: 100, color: '#f97316' },
  { value: 250, color: '#a855f7' },
  { value: 500, color: '#ef4444' }
]

export default function RouletteGames({ onBack, onReward }) {
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState(null)
  const [rewardSent, setRewardSent] = useState(false)
  const [rotation, setRotation] = useState(0)

  function spinRoulette() {
  if (spinning || rewardSent) return

  const prizeIndex = Math.floor(Math.random() * PRIZES.length)
  const prize = PRIZES[prizeIndex].value

  const sectorSize = 360 / PRIZES.length
  const sectorCenter = prizeIndex * sectorSize + sectorSize / 2

  setSpinning(true)
  setResult(null)

  setRotation(prev => {
    const currentRotation = prev % 360
    const targetAngle = (360 - sectorCenter) % 360
    const adjustment = (targetAngle - currentRotation + 360) % 360
    const fullSpins = 360 * 5

    return prev + fullSpins + adjustment
  })

  setTimeout(() => {
    setResult(prize)
    setSpinning(false)
    setRewardSent(true)

    setTimeout(() => {
      if (onReward) onReward(prize)
    }, 2200)
  }, 2600)
}

  const wheelGradient = `conic-gradient(${PRIZES.map((prize, index) => {
    const start = (index * 360) / PRIZES.length
    const end = ((index + 1) * 360) / PRIZES.length
    return `${prize.color} ${start}deg ${end}deg`
  }).join(', ')})`

  return (
    <div style={{
      width: '100%',
      maxWidth: 430,
      margin: '0 auto',
      padding: '16px 16px 110px',
      boxSizing: 'border-box',
      color: 'white',
      textAlign: 'center'
    }}>
      <div style={{
        background: 'radial-gradient(circle at top, #334155, #020617 75%)',
        borderRadius: 24,
        padding: 16,
        boxShadow: '0 0 35px rgba(250,204,21,0.25), inset 0 0 20px rgba(255,255,255,0.05)',
        border: '1px solid rgba(250,204,21,0.25)'
      }}>
        <h2 style={{ margin: 0, fontSize: 28 }}>🎰 Roleta Bônus</h2>

        <p style={{ color: '#cbd5e1', marginTop: 8 }}>
          Gire e ganhe coins instantaneamente
        </p>

        <div style={{
          position: 'relative',
          width: 240,
          height: 250,
          margin: '12px auto 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            zIndex: 5,
            fontSize: 34,
            filter: 'drop-shadow(0 0 8px #facc15)'
          }}>
            🔻
          </div>

          <div style={{
            width: 220,
            height: 220,
            minWidth: 220,
            minHeight: 220,
            aspectRatio: '1 / 1',
            borderRadius: '50%',
            background: wheelGradient,
            border: '8px solid #facc15',
            boxShadow: '0 0 30px rgba(250,204,21,0.55), inset 0 0 20px rgba(0,0,0,0.35)',
            transform: `rotate(${rotation}deg)`,
            transition: spinning ? 'transform 2.6s cubic-bezier(0.12, 0.74, 0.18, 1)' : 'none',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {PRIZES.map((prize, index) => {
              const angle = index * 60 - 60
              const radius = 72
              const x = Math.cos((angle * Math.PI) / 180) * radius
              const y = Math.sin((angle * Math.PI) / 180) * radius

              return (
                <div
                  key={prize.value}
                  style={{
                    position: 'absolute',
                    top: `calc(50% + ${y}px)`,
                    left: `calc(50% + ${x}px)`,
                    transform: 'translate(-50%, -50%)',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: prize.value >= 250 ? 20 : 18,
                    textShadow: '0 2px 5px rgba(0,0,0,0.7)',
                    zIndex: 2
                  }}
                >
                  {prize.value}
                </div>
              )
            })}

            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: 74,
              height: 74,
              borderRadius: '50%',
              background: 'radial-gradient(circle, #facc15, #f59e0b)',
              transform: 'translate(-50%, -50%)',
              boxShadow: '0 0 22px rgba(250,204,21,0.9)',
              border: '4px solid white',
              zIndex: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#111827',
              fontWeight: 'bold'
            }}>
              <div style={{ fontSize: 22 }}>🎯</div>
              <div style={{ fontSize: 13 }}>GIRAR</div>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={spinRoulette}
          disabled={spinning || rewardSent}
          style={{
            width: '100%',
            padding: 16,
            border: 'none',
            borderRadius: 16,
            background: spinning || rewardSent
              ? '#64748b'
              : 'linear-gradient(135deg, #facc15, #f97316)',
            color: '#111827',
            fontWeight: 'bold',
            fontSize: 18
          }}
        >
          {spinning ? '🎡 Girando...' : rewardSent ? '✅ Recompensa enviada' : '🎯 Girar Roleta'}
        </button>

        {result && (
          <div style={{
            marginTop: 20,
            padding: 16,
            borderRadius: 18,
            background: 'rgba(250,204,21,0.14)',
            border: '1px solid rgba(250,204,21,0.35)'
          }}>
            <h2 style={{ color: '#facc15', margin: 0 }}>
              {result === 500 ? '🔥 JACKPOT 🔥' : result === 250 ? '💎 PRÊMIO RARO' : '🎉 PARABÉNS!'}
            </h2>

            <h1 style={{ margin: '8px 0', color: '#facc15' }}>
              +{result} COINS
            </h1>

            <p style={{ margin: 0, color: '#e2e8f0' }}>
              Prêmio creditado na sua carteira
            </p>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => {
          if (onBack) onBack()
        }}
        style={{
          background: '#ef4444',
          color: 'white',
          border: 'none',
          padding: '10px 18px',
          borderRadius: 12,
          fontWeight: 'bold',
          marginTop: 20
        }}
      >
        Voltar
      </button>
    </div>
  )
}