import { useState } from 'react'

const prizes = [50, 100, 150, 200, 300, 500]

export default function DailyBoxGame({ onBack, onReward, cooldown }) {
  const [opening, setOpening] = useState(false)
  const [result, setResult] = useState(null)

  function formatTime(seconds) {
    const totalSeconds = Math.floor(seconds)
    const minutes = Math.floor(totalSeconds / 60)
    const secs = totalSeconds % 60

    return `${minutes}:${String(secs).padStart(2, '0')}`
  }

  function openBox() {
    if (opening || cooldown > 0) return

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
      background: 'radial-gradient(circle at top, #78350f, #020617 70%)',
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
      <div style={{
        width: '100%',
        maxWidth: 390,
        background: 'rgba(15,23,42,0.82)',
        borderRadius: 28,
        padding: 24,
        border: '1px solid rgba(250,204,21,0.35)',
        boxShadow: '0 0 40px rgba(250,204,21,0.22)'
      }}>
        <h1 style={{ margin: 0, fontSize: 32 }}>
          🏴‍☠️ Caixa Diária
        </h1>

        <p style={{ color: '#fef3c7', marginTop: 8 }}>
          {cooldown > 0
            ? '🔒 Baú recarregando'
            : 'Abra o baú e descubra seu prêmio'}
        </p>

        {cooldown > 0 && (
          <h2 style={{
            marginTop: 6,
            color: '#facc15',
            fontSize: 30,
            textShadow: '0 0 12px rgba(250,204,21,0.55)'
          }}>
            {formatTime(cooldown)}
          </h2>
        )}

        <div style={{
          position: 'relative',
          margin: '28px auto 20px',
          width: 210,
          height: 180,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            position: 'absolute',
            width: 230,
            height: 230,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(250,204,21,0.22), transparent 65%)',
            animation: opening ? 'treasureGlow 0.8s infinite alternate' : 'softGlow 2s infinite alternate'
          }} />

          <div style={{
            width: 180,
            height: 130,
            borderRadius: '18px 18px 28px 28px',
            background: cooldown > 0
              ? 'linear-gradient(145deg, #475569, #1e293b)'
              : 'linear-gradient(145deg, #92400e, #f59e0b)',
            border: '5px solid #facc15',
            boxShadow: opening
              ? '0 0 55px rgba(250,204,21,0.85)'
              : '0 0 28px rgba(250,204,21,0.45)',
            transform: opening ? 'scale(1.08) rotate(3deg)' : 'scale(1)',
            transition: 'all 0.25s ease',
            animation: opening ? 'shakeBox 0.35s infinite' : 'none',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 58
          }}>
            <div style={{
              position: 'absolute',
              top: -34,
              width: 150,
              height: 55,
              borderRadius: '70px 70px 12px 12px',
              background: cooldown > 0
                ? 'linear-gradient(145deg, #64748b, #334155)'
                : 'linear-gradient(145deg, #b45309, #fbbf24)',
              border: '5px solid #facc15',
              boxSizing: 'border-box'
            }} />

            <div style={{
              position: 'absolute',
              width: 48,
              height: 44,
              borderRadius: 12,
              background: 'linear-gradient(145deg, #fef3c7, #f59e0b)',
              border: '3px solid #78350f',
              top: 42,
              zIndex: 3
            }} />

            <span style={{ zIndex: 4 }}>
              {cooldown > 0 ? '🔒' : opening ? '✨' : '💰'}
            </span>
          </div>
        </div>

        <button
          onClick={openBox}
          disabled={opening || cooldown > 0}
          style={{
            width: '100%',
            padding: 16,
            borderRadius: 16,
            border: 'none',
            background: opening || cooldown > 0
              ? '#64748b'
              : 'linear-gradient(135deg, #facc15, #f97316)',
            color: opening || cooldown > 0 ? 'white' : '#111827',
            fontWeight: '900',
            fontSize: 18,
            cursor: opening || cooldown > 0 ? 'not-allowed' : 'pointer',
            boxShadow: opening || cooldown > 0
              ? 'none'
              : '0 0 22px rgba(250,204,21,0.45)'
          }}
        >
          {opening
            ? '🔓 Abrindo baú...'
            : cooldown > 0
              ? '🔒 BAÚ EM COOLDOWN'
              : '🔓 ABRIR BAÚ'}
        </button>

        {result && (
          <div style={{
            marginTop: 24,
            padding: 18,
            borderRadius: 22,
            background: 'linear-gradient(135deg, rgba(250,204,21,0.18), rgba(34,197,94,0.16))',
            border: '1px solid rgba(250,204,21,0.35)',
            boxShadow: '0 0 28px rgba(250,204,21,0.2)',
            animation: 'floatUp 0.8s ease'
          }}>
            <div style={{ fontSize: 38 }}>🎉</div>
            <h2 style={{ color: '#facc15', margin: '8px 0 4px', fontSize: 32 }}>
              +{result} COINS
            </h2>
            <p style={{ margin: 0, color: '#e2e8f0' }}>
              Tesouro adicionado à sua carteira
            </p>
          </div>
        )}

        <button
          onClick={onBack}
          style={{
            marginTop: 24,
            padding: '11px 26px',
            borderRadius: 14,
            border: 'none',
            background: '#ef4444',
            color: 'white',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          Fechar
        </button>
      </div>

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
            100% { opacity: 1; transform: translateY(-8px); }
          }

          @keyframes softGlow {
            from { opacity: 0.45; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1.08); }
          }

          @keyframes treasureGlow {
            from { opacity: 0.65; transform: scale(1); }
            to { opacity: 1; transform: scale(1.18); }
          }
        `}
      </style>
    </div>
  )
}