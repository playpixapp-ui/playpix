import { useState } from 'react'

export default function TapCoinsGame({ onClose, onReward }) {
  const [taps, setTaps] = useState(0)
  const [finished, setFinished] = useState(false)

  function tapCoin() {
    if (finished) return

    const newTaps = taps + 1
    setTaps(newTaps)

    if (newTaps >= 20) {
      setFinished(true)
      onReward()
    }
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.9)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    }}>
      <div style={{
        background: '#111827',
        padding: 25,
        borderRadius: 24,
        width: 340,
        textAlign: 'center'
      }}>
        <h2>⚡ Tap Coins</h2>

        <p style={{ color: '#94a3b8' }}>
          Toque 20 vezes para ganhar coins
        </p>

        <button
          onClick={tapCoin}
          style={{
            width: 150,
            height: 150,
            borderRadius: '50%',
            border: 'none',
            background: 'linear-gradient(135deg, gold, #f97316)',
            fontSize: 48,
            cursor: 'pointer',
            margin: '20px auto',
            boxShadow: '0 0 30px rgba(250,204,21,0.6)'
          }}
        >
          💰
        </button>

        <h1>{taps}/20</h1>

        {finished && (
          <p style={{
            color: '#22c55e',
            fontWeight: 'bold'
          }}>
            Recompensa liberada! +50 coins 🎉
          </p>
        )}

        <button
          onClick={onClose}
          style={{
            marginTop: 15,
            background: 'transparent',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer'
          }}
        >
          Fechar
        </button>
      </div>
    </div>
  )
}