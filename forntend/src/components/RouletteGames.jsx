import { useState } from 'react'

export default function RouletteGames({ onBack, onReward }) {
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState(null)

  function spinRoulette() {
    if (spinning) return

    setSpinning(true)
    setResult(null)

    setTimeout(() => {
      const prize = 500

      setResult(prize)
      setSpinning(false)

      setTimeout(() => {
        if (onReward) onReward(prize)
      }, 2000)
    }, 1800)
  }

  return (
    <div
      style={{
        width: '100%',
        maxWidth: 430,
        margin: '0 auto',
        padding: '20px 20px 110px',
        boxSizing: 'border-box',
        color: 'white',
        textAlign: 'center'
      }}
    >
      <div
        style={{
          background: 'linear-gradient(135deg, #1e293b, #1e40af)',
          borderRadius: 22,
          padding: 22,
          boxShadow: '0 0 25px rgba(37,99,235,0.35)'
        }}
      >
        <h2
          style={{
            margin: 0,
            marginBottom: 20,
            fontSize: 28,
            color: 'white'
          }}
        >
          🎯 Roleta Bônus
        </h2>

        <div
          style={{
            width: 190,
            height: 190,
            borderRadius: '50%',
            background: spinning
              ? 'conic-gradient(#22c55e, #facc15, #ef4444, #2563eb, #22c55e)'
              : 'linear-gradient(135deg, #22c55e, #2563eb)',
            margin: '25px auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 48,
            fontWeight: 'bold',
            transform: spinning ? 'rotate(1080deg)' : 'rotate(0deg)',
            transition: '1.8s'
          }}
        >
          🎁
        </div>

        <button
          type="button"
          onClick={spinRoulette}
          disabled={spinning}
          style={{
            width: '100%',
            padding: 15,
            border: 'none',
            borderRadius: 14,
            background: spinning ? '#64748b' : '#22c55e',
            color: 'white',
            fontWeight: 'bold',
            fontSize: 17,
            cursor: 'pointer'
          }}
        >
          {spinning ? '🎡 Girando...' : '🎯 Girar Roleta'}
        </button>

        {result && (
          <h2
            style={{
              marginTop: 22,
              color: '#f97316',
              fontSize: 32
            }}
          >
            🔥 JACKPOT 🔥
            <br />
            +{result} COINS
          </h2>
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