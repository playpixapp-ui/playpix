import { useEffect, useState } from 'react'
import { AdMob } from '@capacitor-community/admob'

const REWARD_AD_ID =
  'ca-app-pub-7126948102674899/1974018682'

const prizes = [50, 100, 150, 200, 300, 500]

export default function DailyBoxGame({ onBack, onReward, cooldown }) {
  const [opening, setOpening] = useState(false)
  const [result, setResult] = useState(null)

  const [adReady, setAdReady] = useState(false)

async function preloadAd() {
  try {
    setAdReady(false)

    await AdMob.initialize()

    await AdMob.prepareRewardVideoAd({
      adId: REWARD_AD_ID,
      isTesting: false
    })

    setAdReady(true)
  } catch (err) {
    console.log('Erro ao preparar anúncio caixa diária:', err)
    setAdReady(false)
  }
}

async function openBox() {
  if (opening || cooldown > 0) return

  setResult(null)

  const adWatched = await showRewardAd()

  if (!adWatched) {
    setOpening(false)
    return
  }

  setOpening(true)

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

async function showRewardAd() {
  try {
    await AdMob.initialize()

    await AdMob.prepareRewardVideoAd({
      adId: REWARD_AD_ID,
      isTesting: false
    })

    await AdMob.showRewardVideoAd()

    return true
  } catch (err) {
    console.log('Erro ao abrir anúncio caixa diária:', err)
    alert('Anúncio ainda não disponível. Tente novamente em instantes.')
    return false
  }
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

      <p style={{ opacity: 0.8 }}>
        {cooldown > 0
          ? `Aguarde para abrir novamente`
          : 'Abra sua caixa'}
      </p>

      <div style={{
        marginTop: 30,
        width: 170,
        height: 170,
        borderRadius: 28,
        background: 'linear-gradient(145deg, #92400e, #f59e0b)',
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
        disabled={cooldown > 0}
        style={{
          marginTop: 35,
          padding: '14px 38px',
          borderRadius: 14,
          border: 'none',
          background: opening || cooldown > 0
          ? '#64748b'
          : 'linear-gradient(135deg, #facc15, #f97316)',
        color: opening || cooldown > 0 ? 'white' : '#111827',
          color: 'white',
          fontWeight: 'bold',
          fontSize: 18
        }}
      >
        {opening
          ? 'Abrindo...'
          : cooldown > 0
            ? 'EM COOLDOWN'
            : 'ABRIR CAIXA'}
      </button>

      {result && (
        <div style={{ marginTop: 28, animation: 'floatUp 1s ease' }}>
          <h2 style={{ color: '#facc15' }}>🎉 PARABÉNS!</h2>
          <h1 style={{ color: '#facc15' }}>+{result} COINS</h1>
          <p style={{ color: '#e2e8f0' }}>💰 Prêmio creditado na sua carteira</p>
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
          fontWeight: 'bold',
          cursor: 'pointer'
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