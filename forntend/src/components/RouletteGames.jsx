import { useState } from 'react'

export default function RouletteGames({ onBack, onReward }) {
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState(null)
  const [rewardSent, setRewardSent] = useState(false)
  const [rotation, setRotation] = useState(0)

  function spinRoulette() {
    if (spinning || rewardSent) return

    const prizes = [10, 25, 50, 100, 250, 500]
    const prize = prizes[Math.floor(Math.random() * prizes.length)]
    const extraSpin = 1440 + Math.floor(Math.random() * 1440)

    setSpinning(true)
    setResult(null)
    setRotation(prev => prev + extraSpin)

    setTimeout(() => {
      setResult(prize)
      setSpinning(false)
      setRewardSent(true)

      setTimeout(() => {
        if (onReward) onReward(prize)
      }, 2200)
    }, 2600)
  }

  return (
    <div style={{
      width: '100%',
      maxWidth: 430,
      margin: '0 auto',
      padding: '20px 20px 110px',
      boxSizing: 'border-box',
      color: 'white',
      textAlign: 'center'
    }}>
      <div style={{
        background: 'radial-gradient(circle at top, #334155, #020617 75%)',
        borderRadius: 26,
        padding: 24,
        boxShadow: '0 0 35px rgba(250,204,21,0.25), inset 0 0 20px rgba(255,255,255,0.05)',
        border: '1px solid rgba(250,204,21,0.25)'
      }}>
        <h2 style={{ margin: 0, fontSize: 30 }}>
          🎰 Roleta Bônus
        </h2>

        <p style={{ color: '#cbd5e1', marginTop: 8 }}>
          Gire e ganhe coins instantaneamente
        </p>

        <div style={{
          position: 'relative',
          width: 260,
          height: 290,
          margin: '20px auto 10px',
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
            width: 230,
            height: 230,
            borderRadius: '50%',
            background: `
              conic-gradient(
                #facc15 0deg 60deg,
                #ef4444 60deg 120deg,
                #22c55e 120deg 180deg,
                #3b82f6 180deg 240deg,
                #a855f7 240deg 300deg,
                #f97316 300deg 360deg
              )
            `,
            border: '8px solid #f8fafc',
            boxShadow: `
              0 0 30px rgba(250,204,21,0.45),
              inset 0 0 20px rgba(0,0,0,0.35)
            `,
            transform: `rotate(${rotation}deg)`,
            transition: spinning
              ? 'transform 2.6s cubic-bezier(0.12, 0.74, 0.18, 1)'
              : 'none',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: 76,
              height: 76,
              borderRadius: '50%',
              background: 'radial-gradient(circle, #facc15, #f59e0b)',
              transform: 'translate(-50%, -50%)',
              boxShadow: '0 0 20px rgba(250,204,21,0.8)',
              border: '4px solid white',
              zIndex: 3
            }} />
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 10,
          marginBottom: 20,
          marginTop: -8
        }}>
          <div style={legendStyle('#22c55e')}>🟢 10 Coins</div>
          <div style={legendStyle('#3b82f6')}>🔵 25 Coins</div>
          <div style={legendStyle('#a855f7')}>🟣 50 Coins</div>
          <div style={legendStyle('#f97316')}>🟠 100 Coins</div>
          <div style={legendStyle('#facc15')}>🟡 250 Coins</div>
          <div style={legendStyle('#ef4444')}>🔴 500 Coins</div>
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
            fontSize: 18,
            cursor: spinning || rewardSent ? 'not-allowed' : 'pointer',
            boxShadow: spinning || rewardSent
              ? 'none'
              : '0 0 20px rgba(250,204,21,0.45)'
          }}
        >
          {spinning ? '🎡 Girando...' : rewardSent ? '✅ Recompensa enviada' : '🎯 Girar Roleta'}
        </button>

        {result && (
          <div style={{
            marginTop: 24,
            padding: 18,
            borderRadius: 20,
            background: 'linear-gradient(135deg, rgba(250,204,21,0.18), rgba(249,115,22,0.18))',
            border: '1px solid rgba(250,204,21,0.35)',
            boxShadow: '0 0 25px rgba(250,204,21,0.18)'
          }}>
            <div style={{ fontSize: 34 }}>🎉</div>
            <h2 style={{ margin: '8px 0 4px', color: '#facc15', fontSize: 32 }}>
              +{result} COINS
            </h2>
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

function legendStyle(color) {
  return {
    background: 'rgba(255,255,255,0.06)',
    border: `1px solid ${color}`,
    borderRadius: 12,
    padding: '8px 10px',
    fontSize: 13,
    fontWeight: 'bold',
    color: 'white'
  }
}