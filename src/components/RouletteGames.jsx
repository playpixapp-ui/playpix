import { useState } from 'react'

const prizes = [20, 50, 100, 150, 200, 500]

export default function RouletteGame({ onBack, onReward }) {
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState(null)

  function spin() {
    if (spinning) return

    setSpinning(true)
    setResult(null)

    setTimeout(() => {
      const reward = prizes[Math.floor(Math.random() * prizes.length)]

      setResult(reward)
      onReward(reward)
      setSpinning(false)
    }, 2500)
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
      boxSizing: 'border-box'
    }}>
      <h1>🎯 Roleta Bônus</h1>

      <div style={{
        width: 220,
        height: 220,
        borderRadius: '50%',
        border: '10px solid #22c55e',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: 42,
        fontWeight: 'bold',
        marginTop: 30,
        animation: spinning ? 'spin 0.8s linear infinite' : 'none',
        background: 'radial-gradient(circle, #1e293b, #0f172a)'
      }}>
        🎯
      </div>

      <button
        onClick={spin}
        disabled={spinning}
        style={{
          marginTop: 40,
          padding: '14px 40px',
          borderRadius: 14,
          border: 'none',
          background: spinning ? '#64748b' : '#22c55e',
          color: 'white',
          fontWeight: 'bold',
          fontSize: 18
        }}
      >
        {spinning ? 'Girando...' : 'GIRAR'}
      </button>

      {result && (
        <h2 style={{ marginTop: 30, color: '#4ade80' }}>
          +{result} coins
        </h2>
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
          fontWeight: 'bold'
        }}
      >
        Fechar
      </button>

      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  )
}