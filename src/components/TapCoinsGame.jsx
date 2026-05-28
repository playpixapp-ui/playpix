import { useEffect, useState } from 'react'
import { AdMob } from '@capacitor-community/admob'

export default function TapCoinsGame({ onBack, onReward }) {
  const [taps, setTaps] = useState(0)
  const [finished, setFinished] = useState(false)
  const [loadingAd, setLoadingAd] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [pressed, setPressed] = useState(false)
  const [particles, setParticles] = useState([])
  const [showRewardText, setShowRewardText] = useState(false)

  useEffect(() => {

    const savedEnd = localStorage.getItem('tapCoinsCooldownEnd')

    if (savedEnd) {
      const remaining = Math.max(0, Math.floor((Number(savedEnd) - Date.now()) / 1000))
      if (remaining > 0) {
        setCooldown(remaining)
        setFinished(true)
      }
    }
  }, [])

  useEffect(() => {
    if (cooldown <= 0) return

    const timer = setInterval(() => {
      setCooldown(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          localStorage.removeItem('tapCoinsCooldownEnd')
          setFinished(false)
          setTaps(0)
          return 0
        }

        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [cooldown])

  function startRespawnTimer() {
    const endTime = Date.now() + 60 * 60 * 1000
    localStorage.setItem('tapCoinsCooldownEnd', String(endTime))
    setCooldown(60*60)
    setFinished(true)
  }

  function formatTime(seconds) {
    const min = Math.floor(seconds / 60)
    const sec = seconds % 60

    return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }

  async function showReward() {
    try {
      setLoadingAd(true)

      await AdMob.initialize()

      await AdMob.prepareRewardVideoAd({
        adId: 'ca-app-pub-3940256099942544/5224354917',
        isTesting: true
      })

      await AdMob.showRewardVideoAd()

      await onReward()

      startRespawnTimer()
    } catch (err) {
      console.log(err)
      alert('Erro ao abrir anúncio')
      setFinished(false)
    } finally {
      setLoadingAd(false)
    }
  }

  async function tapCoin() {
    if (finished || loadingAd || cooldown > 0) return

    setPressed(true)
setTimeout(() => setPressed(false), 120)

setParticles(prev => [
  ...prev,
  { id: Date.now(), left: Math.random() * 80 + 10 }
])

setTimeout(() => {
  setParticles(prev => prev.slice(1))
}, 900)

const audio = new Audio('/coin.mp3')
audio.play().catch(() => {})
setShowRewardText(true)

setTimeout(() => {
  setShowRewardText(false)
}, 600)

const id = Date.now()

setParticles((prev) => [
  ...prev,
  {
    id,
    left: Math.random() * 120 - 60
  }
])

setTimeout(() => {
  setParticles((prev) =>
    prev.filter((p) => p.id !== id)
  )
}, 1000)
    const newTaps = taps + 1
    setTaps(newTaps)

    if (newTaps >= 20) {
      setFinished(true)
      await showReward()
    }
  }

  return (
    <div style={{
      transform: pressed ? 'scale(0.95)' : 'scale(1)',
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
      textAlign: 'center'
    }}>
      <h1>⚡ Tap Coins</h1>

      {showRewardText && (
  <div
    style={{
      position: 'absolute',
      marginTop: -140,
      fontSize: 32,
      fontWeight: 'bold',
      color: '#4ade80',
      animation: 'floatUp 0.6s ease-out'
    }}
  >
    +50
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
      animation: 'coinFloat 1s linear forwards'
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
          <p>Toque 20 vezes para ganhar coins</p>
          <h2>{taps}/20</h2>
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

      <button
  onClick={onBack}
  style={{
    marginTop: 30,
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

    {particles.map((p) => (
      <div
        key={p.id}
        style={{
          position: 'absolute',
          marginLeft: p.left,
          marginTop: -20,
          fontSize: 24,
          animation: 'coinFloat 1s linear forwards'
        }}
      >
        🪙
      </div>
    ))}
        <div>
    <style>
      {`
      @keyframes coinFloat {
        0% {
          opacity: 1;
          transform: translateY(0px);
        }

        100% {
          opacity: 0;
          transform: translateY(-120px);
        }
      }

      @keyframes floatUp {
        0% {
          opacity: 0;
          transform: translateY(20px);
        }

        100% {
          opacity: 1;
          transform: translateY(-40px);
        }
      }
      `}
    </style>

  </div>

    </div>
  )
}