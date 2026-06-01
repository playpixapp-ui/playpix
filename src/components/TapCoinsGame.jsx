import { useEffect, useState } from 'react'
import { AdMob } from '@capacitor-community/admob'

const REWARD_AD_ID = 'ca-app-pub-3940256099942544/5224354917'
const TAP_LIMIT = 20
const COOLDOWN_SECONDS = 60 * 60

  export default function TapCoinsGame({ onBack, onClose, onReward, wallet }) {
  const [taps, setTaps] = useState(0)
  const [finished, setFinished] = useState(false)
  const [loadingAd, setLoadingAd] = useState(false)
  const [adReady, setAdReady] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [pressed, setPressed] = useState(false)
  const [particles, setParticles] = useState([])
  const [showTapText, setShowTapText] = useState(false)
  const [rewardCoins, setRewardCoins] = useState([])

  useEffect(() => {
    const savedEnd = localStorage.getItem(`tapCoinsCooldownEnd_${wallet?.email}`)

    if (savedEnd) {
      const remaining = Math.max(0, Math.floor((Number(savedEnd) - Date.now()) / 1000))

      if (remaining > 0) {
        setCooldown(remaining)
        setFinished(true)
      }
    }
    if (window.Capacitor) {
    preloadAd()
  } else {
    setAdReady(true)
  }

    preloadAd()
  }, [])

  useEffect(() => {
    if (cooldown <= 0) return

    const timer = setInterval(() => {
      setCooldown(prev => {
        if (prev <= 1) {
          localStorage.removeItem(`tapCoinsCooldownEnd_${wallet?.email}`)
          setFinished(false)
          setTaps(0)
          return 0
        }

        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [cooldown])
async function preloadAd() {
  try {
    setAdReady(false)

    await AdMob.initialize()

    await AdMob.prepareRewardVideoAd({
      adId: REWARD_AD_ID,
      isTesting: true
    })

    setAdReady(true)
  } catch (err) {
    console.log('Erro ao preparar anúncio:', err)
    setAdReady(false)
  }
}

 function startRespawnTimer() {
  const endTime = Date.now() + COOLDOWN_SECONDS * 1000

  localStorage.setItem(
    `tapCoinsCooldownEnd_${wallet?.email}`,
    String(endTime)
  )

  setCooldown(COOLDOWN_SECONDS)
  setFinished(true)
}

  function formatTime(seconds) {
    const min = Math.floor(seconds / 60)
    const sec = seconds % 60
    return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }

  function playCoinSound() {
    const audio = new Audio('/coin.mp3')
    audio.volume = 0.35
    audio.play().catch(() => {})
  }

  function spawnTapEffect() {
    const id = Date.now() + Math.random()

    setPressed(true)
    setShowTapText(true)

    setParticles(prev => [
      ...prev,
      {
        id,
        left: Math.random() * 120 - 60
      }
    ])

    setTimeout(() => setPressed(false), 120)
    setTimeout(() => setShowTapText(false), 600)
    setTimeout(() => {
      setParticles(prev => prev.filter(p => p.id !== id))
    }, 1000)
  }

  function spawnRewardCoins() {
  const coins = Array.from({ length: 22 }).map((_, index) => ({
    id: Date.now() + index,
    left: Math.random() * 90 + 5,
    delay: Math.random() * 0.5,
    size: Math.random() * 16 + 24
  }))

  setRewardCoins(coins)

  setTimeout(() => {
    setRewardCoins([])
  }, 1800)
}

  async function showReward() {
  try {
    setLoadingAd(true)

    const isNative = window.Capacitor?.isNativePlatform?.()

    if (isNative) {
      if (!adReady) {
        await preloadAd()
      }

      await AdMob.showRewardVideoAd()
    }

    await onReward()
    spawnRewardCoins()

    startRespawnTimer()
    preloadAd()
  } catch (err) {
    console.log(err)
    alert('Erro ao abrir anúncio')
    setFinished(false)
    setTaps(0)
    preloadAd()
  } finally {
    setLoadingAd(false)
  }
}

  async function tapCoin() {
  if (finished || loadingAd || cooldown > 0) return

  const newTaps = taps + 1

  if (newTaps > TAP_LIMIT) return

  playCoinSound()
  spawnTapEffect()
  setTaps(newTaps)

  if (newTaps === TAP_LIMIT) {
    setFinished(true)
    await showReward()
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
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    textAlign: 'center',
    overflow: 'hidden'
  }}>
    {loadingAd && (
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(15,23,42,0.92)',
        zIndex: 20,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20
      }}>
        <div style={{
          width: 86,
          height: 86,
          borderRadius: '50%',
          border: '8px solid rgba(255,255,255,0.15)',
          borderTopColor: '#22c55e',
          animation: 'spinLoader 1s linear infinite'
        }} />

        <h2 style={{ marginTop: 24 }}>
          Preparando anúncio...
        </h2>

        <p style={{
          color: '#cbd5e1',
          maxWidth: 280,
          lineHeight: 1.5
        }}>
          Aguarde um instante para liberar sua recompensa.
        </p>
      </div>
    )}

      {rewardCoins.map((coin) => (
  <div
    key={coin.id}
    style={{
      position: 'absolute',
      left: `${coin.left}%`,
      bottom: -40,
      fontSize: coin.size,
      animation: `rewardCoinFly 1.6s ease-out ${coin.delay}s forwards`,
      zIndex: 30,
      pointerEvents: 'none'
    }}
  >
    🪙
  </div>
))}

    <div style={{
      background: 'rgba(255,255,255,0.08)',
      padding: 24,
      borderRadius: 24,
      width: '100%',
      maxWidth: 360,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      boxSizing: 'border-box'
    }}>
      <h1>⚡ Tap Coins</h1>

      {showTapText && (
        <div style={{
          position: 'absolute',
          marginTop: -170,
          fontSize: 30,
          fontWeight: 'bold',
          color: '#4ade80',
          animation: 'floatUp 0.6s ease-out',
          pointerEvents: 'none'
        }}>
          +1
        </div>
      )}

      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            marginLeft: p.left,
            marginTop: -20,
            fontSize: 24,
            animation: 'coinFloat 1s linear forwards',
            pointerEvents: 'none'
          }}
        >
          🪙
        </div>
      ))}

      {cooldown > 0 ? (
        <>
          <p>Moeda em respawn</p>
          <h2>{formatTime(cooldown)}</h2>
        </>
      ) : (
        <>
          <p>Toque {TAP_LIMIT} vezes para ganhar coins</p>
          <h2>{taps}/{TAP_LIMIT}</h2>

          <div style={{
            width: '100%',
            maxWidth: 260,
            height: 12,
            background: 'rgba(255,255,255,0.14)',
            borderRadius: 999,
            overflow: 'hidden',
            marginBottom: 8
          }}>
            <div style={{
              width: `${(taps / TAP_LIMIT) * 100}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #22c55e, #4ade80)',
              transition: 'width 0.2s ease'
            }} />
          </div>
        </>
      )}

      <div
        onClick={tapCoin}
        style={{
          width: 150,
          height: 150,
          borderRadius: '50%',
          background: 'linear-gradient(145deg, #746733, #a5782a)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 64,
          color: '#fff',
          fontWeight: 'bold',

          outline: 'none',
          WebkitTapHighlightColor: 'transparent',

          cursor: cooldown > 0 ? 'not-allowed' : 'pointer',
          userSelect: 'none',
          boxShadow: `
            0 0 25px rgba(250,204,21,0.5),
            inset 0 4px 12px rgba(255,255,255,0.3)
          `,
          transition: 'all 0.12s ease',
          transform: pressed ? 'scale(0.95)' : 'scale(1)',
          animation: 'pulse 1.8s infinite',
          opacity: cooldown > 0 ? 0.5 : 1,
          pointerEvents: cooldown > 0 ? 'none' : 'auto',
          marginTop: 20,
          border: '4px solid rgba(255,255,255,0.15)'
        }}
      >
        ⚡
      </div>

           <p style={{
        marginTop: 14,
        color: adReady ? '#4ade80' : '#facc15',
        fontSize: 13,
        fontWeight: 'bold'
      }}>
        {adReady ? 'Anúncio pronto ✅' : 'Preparando anúncio...'}
      </p>

      <button
        onClick={onBack}
        style={{
          marginTop: 24,
          padding: '12px 24px',
          borderRadius: 10,
          border: 'none',
          background: '#ef4444',
          color: 'white',
          fontWeight: 'bold'
        }}
      >
        Fechar
      </button>
    </div>
  </div>
)
}