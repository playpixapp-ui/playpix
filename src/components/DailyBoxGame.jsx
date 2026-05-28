import { useState } from 'react'

const prizes = [50, 100, 150, 200, 300, 500]

export default function DailyBoxGame({ onBack, onReward }) {
  const [opening, setOpening] = useState(false)
  const [result, setResult] = useState(null)

  function openBox() {
    if (opening) return

    setOpening(true)
    setResult(null)

    setTimeout(() => {
      const reward = prizes[Math.floor(Math.random() * prizes.length)]

      setResult(reward)
      onReward(reward)

      const audio = new Audio('/coin.mp3')
      audio.volume = 0.5
      audio.play().catch(() => {})

      setOpening(false)
    }, 2200)
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
      <h1>🎁 Caixa Diária</h1>
      <p style={{ opacity: 0.8 }}>Abra a caixa para ganhar coins</p>

      <div style={{
        marginTop: 30,
        width: 170,
        height: 170,
        borderRadius: 28,
        background: 'linear-gradient(145deg, #f59e0b, #ef4444)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 80,
        boxShadow: opening
          ? '0 0 45px rgba(245,158,11,0.8)'
          : '0 0 25px rgba(245,158,11,0.45)',
        transform: opening ? 'scale(1.08) rotate(4deg)' : 'scale(1)',
        transition: 'all 0.25s ease',
        animation: opening ? 'shakeBox 0.35s infinite' : 'none'
      }}>
        🎁
      </div>

      <button
        onClick={openBox}
        disabled={opening}
        style={{
          marginTop: 35,
          padding: '14px 38px',
          borderRadius: 14,
          border: 'none',
          background: opening ? '#64748b' : '#22c55e',
          color: 'white',
          fontWeight: 'bold',
          fontSize: 18
        }}
      >
        {opening ? 'Abrindo...' : 'ABRIR CAIXA'}
      </button>

      {result && (
        <div style={{ marginTop: 28, animation: 'floatUp 1s ease' }}>
          <h2 style={{ color: '#4ade80' }}>🎉 +{result} coins</h2>
          <div style={{ fontSize: 38 }}>🪙✨🪙✨🪙</div>
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
          fontWeight: 'bold'
        }}
      >
        Fechar
      </button>

      <style>
        {`
          @keyframes shakeBox {
            0% { transform: rotate(0deg) scale(1.08); }
            25% { transform: rotate(4deg) scale(1.08); }
            50% { transform: rotate(0deg) scale(1.08); }
            75% { transform: rotate(-4deg) scale(1.08); }
            100% { transform: rotate(0deg) scale(1.08); }
          }

          @keyframes floatUp {
            0% { opacity: 0; transform: translateY(20px); }
            100% { opacity: 1; transform: translateY(-10px); }
          }
        `}
      </style>
    </div>
  )
}