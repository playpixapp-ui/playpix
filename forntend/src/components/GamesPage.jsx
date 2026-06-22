import { useEffect, useState } from 'react'
import GameCard from './GameCard'
import TapCoinsGame from './TapCoinsGame'
import RouletteGames from './RouletteGames'
import DailyBoxGame from './DailyBoxGame'

export default function GamesPage({
  earnCoins,
  wallet,
  checkGameCooldown,
  saveGameCooldown
}) {

  const [showTapCoinsGame, setShowTapCoinsGame] = useState(false)
  const [showRouletteGames, setShowRouletteGames] = useState(false)
  const [showDailyBoxGame, setShowDailyBoxGame] = useState(false)

  // BLINDAGEM DO FLASH: O estado inicia lendo direto do LocalStorage de forma síncrona!
  const [tapCooldown, setTapCooldown] = useState(() => {
    if (!wallet?.email) return 0
    const saved = localStorage.getItem(`tapCoinsCooldownEnd_${wallet.email}`)
    return saved ? Math.max(0, Math.floor((Number(saved) - Date.now()) / 1000)) : 0
  })

  const [rouletteCooldown, setRouletteCooldown] = useState(() => {
    if (!wallet?.email) return 0
    const saved = localStorage.getItem(`rouletteCooldownEnd_${wallet.email}`)
    return saved ? Math.max(0, Math.floor((Number(saved) - Date.now()) / 1000)) : 0
  })

  const [dailyBoxCooldown, setDailyBoxCooldown] = useState(() => {
    if (!wallet?.email) return 0
    const saved = localStorage.getItem(`dailyBoxCooldownEnd_${wallet.email}`)
    return saved ? Math.max(0, Math.floor((Number(saved) - Date.now()) / 1000)) : 0
  })

  const [cooldownsLoaded, setCooldownsLoaded] = useState(false)

  function formatTime(seconds) {
    const totalSeconds = Math.floor(seconds)
    const minutes = Math.floor(totalSeconds / 60)
    const secs = totalSeconds % 60
    return `${minutes}:${String(secs).padStart(2, '0')}`
  }

  // REVALIDAÇÃO COM O BANCO DE DADOS (Roda em background sem dar flash na tela)
  useEffect(() => {
    async function syncWithBackend() {
      if (!wallet?.email || !checkGameCooldown) return

      try {
        // Atualiza Tap Coins via banco
        const dataTap = await checkGameCooldown('tapcoins')
        if (dataTap?.locked && dataTap?.cooldownUntil) {
          const endTime = new Date(dataTap.cooldownUntil).getTime()
          const diff = Math.max(0, Math.ceil((endTime - Date.now()) / 1000))
          if (diff > 0) {
            localStorage.setItem(`tapCoinsCooldownEnd_${wallet.email}`, String(endTime))
            setTapCooldown(diff)
          }
        }

        // Atualiza Roleta via banco
        const dataRoulette = await checkGameCooldown('roulette')
        if (dataRoulette?.locked && dataRoulette?.cooldownUntil) {
          const endTime = new Date(dataRoulette.cooldownUntil).getTime()
          const diff = Math.max(0, Math.ceil((endTime - Date.now()) / 1000))
          if (diff > 0) {
            localStorage.setItem(`rouletteCooldownEnd_${wallet.email}`, String(endTime))
            setRouletteCooldown(diff)
          }
        }

        // Atualiza Caixa Diária via banco
        const dataDaily = await checkGameCooldown('dailybox')
        if (dataDaily?.locked && dataDaily?.cooldownUntil) {
          const endTime = new Date(dataDaily.cooldownUntil).getTime()
          const diff = Math.max(0, Math.ceil((endTime - Date.now()) / 1000))
          if (diff > 0) {
            localStorage.setItem(`dailyBoxCooldownEnd_${wallet.email}`, String(endTime))
            setDailyBoxCooldown(diff)
          }
        }
      } catch (error) {
        console.log('Erro ao sincronizar dados com o backend:', error)
      }
    }

    syncWithBackend().finally(() => {
      setCooldownsLoaded(true)
    })
  }, [wallet?.email, checkGameCooldown])

  // TIMERS REGRESSIVOS INDEPENDENTES
  useEffect(() => {
    if (tapCooldown <= 0) return
    const interval = setInterval(() => {
      const savedEnd = localStorage.getItem(`tapCoinsCooldownEnd_${wallet?.email}`)
      if (!savedEnd) { setTapCooldown(0); return }
      const remaining = Math.max(0, Math.floor((Number(savedEnd) - Date.now()) / 1000))
      if (remaining <= 0) {
        localStorage.removeItem(`tapCoinsCooldownEnd_${wallet?.email}`)
        setTapCooldown(0)
        return
      }
      setTapCooldown(remaining)
    }, 1000)
    return () => clearInterval(interval)
  }, [tapCooldown, wallet?.email])

  useEffect(() => {
    if (rouletteCooldown <= 0) return
    const interval = setInterval(() => {
      const savedEnd = localStorage.getItem(`rouletteCooldownEnd_${wallet?.email}`)
      if (!savedEnd) { setRouletteCooldown(0); return }
      const remaining = Math.max(0, Math.floor((Number(savedEnd) - Date.now()) / 1000))
      if (remaining <= 0) {
        localStorage.removeItem(`rouletteCooldownEnd_${wallet?.email}`)
        setRouletteCooldown(0)
        return
      }
      setRouletteCooldown(remaining)
    }, 1000)
    return () => clearInterval(interval)
  }, [rouletteCooldown, wallet?.email])

  useEffect(() => {
    if (dailyBoxCooldown <= 0) return
    const interval = setInterval(() => {
      const savedEnd = localStorage.getItem(`dailyBoxCooldownEnd_${wallet?.email}`)
      if (!savedEnd) { setDailyBoxCooldown(0); return }
      const remaining = Math.max(0, Math.floor((Number(savedEnd) - Date.now()) / 1000))
      if (remaining <= 0) {
        localStorage.removeItem(`dailyBoxCooldownEnd_${wallet?.email}`)
        setDailyBoxCooldown(0)
        return
      }
      setDailyBoxCooldown(remaining)
    }, 1000)
    return () => clearInterval(interval)
  }, [dailyBoxCooldown, wallet?.email])


  // HANDLERS DE PREMIAÇÃO
  async function handleTapReward() {
    await earnCoins(25, 10, 'play_games')
    if (saveGameCooldown) await saveGameCooldown('tapcoins', 60) 
    const endTime = Date.now() + 60 * 60 * 1000
    localStorage.setItem(`tapCoinsCooldownEnd_${wallet?.email}`, String(endTime))
    setTapCooldown(60 * 60)
    setShowTapCoinsGame(false)
  }

  async function handleRouletteReward(amount) {
    await earnCoins(amount, 5, 'play_games')
    if (saveGameCooldown) await saveGameCooldown('roulette', 60)
    const cooldownEnd = Date.now() + 60 * 60 * 1000
    localStorage.setItem(`rouletteCooldownEnd_${wallet?.email}`, String(cooldownEnd))
    setRouletteCooldown(60 * 60)
    setTimeout(() => { setShowRouletteGames(false) }, 3500)
  }

  async function handleDailyBoxReward(amount) {
    await earnCoins(amount, 5, 'play_games')
    if (saveGameCooldown) await saveGameCooldown('dailybox', 60)
    const cooldownEnd = Date.now() + 60 * 60 * 1000
    localStorage.setItem(`dailyBoxCooldownEnd_${wallet?.email}`, String(cooldownEnd))
    setDailyBoxCooldown(60 * 60)
    setShowDailyBoxGame(false)
  }

  const games = [
    { name: 'Roleta Bônus', reward: 350, icon: '🎯' },
    { name: 'Tap Coins', reward: 25, icon: '⚡' },
    { name: 'Caixa Diária', reward: 200, icon: '🎁' }
  ]

  if (showRouletteGames) return <RouletteGames onBack={() => setShowRouletteGames(false)} onReward={handleRouletteReward} wallet={wallet} />
  if (showTapCoinsGame) return <TapCoinsGame onBack={() => setShowTapCoinsGame(false)} onReward={handleTapReward} wallet={wallet} />
  if (showDailyBoxGame) return <DailyBoxGame onBack={() => setShowDailyBoxGame(false)} onReward={handleDailyBoxReward} cooldown={dailyBoxCooldown} wallet={wallet} />

  return (
    <div style={{ width: '100%', maxWidth: 900, margin: '0 auto', padding: '0 5px', boxSizing: 'border-box' }}>
      <h2 style={{ textAlign: 'center', fontSize: 34, fontWeight: '800', color: '#ffffff', marginBottom: 24 }}>
        🎮 Jogos rápidos
      </h2>

      {games.map((game, index) => {
        const isTapCoins = game.name === 'Tap Coins'
        const isRoulette = game.name === 'Roleta Bônus'
        const isDailyBox = game.name === 'Caixa Diária'

        const isTapLocked = isTapCoins && tapCooldown > 0
        const isRouletteLocked = isRoulette && rouletteCooldown > 0
        const isDailyBoxLocked = isDailyBox && dailyBoxCooldown > 0

        const isCurrentlyLocked = isTapLocked || isRouletteLocked || isDailyBoxLocked

        let rewardText = game.name === 'Roleta Bônus' ? 'Ganhe até 350 coins' : `Ganhe ${game.reward} coins`
        if (isDailyBox) rewardText = 'Ganhe até 200 coins'

        if (isTapLocked) rewardText = `Disponível em ${formatTime(tapCooldown)}`
        if (isRouletteLocked) rewardText = `Disponível em ${formatTime(rouletteCooldown)}`
        if (isDailyBoxLocked) rewardText = `Disponível em ${formatTime(dailyBoxCooldown)}`

        return (
          <GameCard
            key={index}
            title={game.name}
            reward={rewardText}
            emoji={game.icon}
            locked={isCurrentlyLocked} 
            onPlay={() => {
              if (isCurrentlyLocked) return
              if (isRoulette) setShowRouletteGames(true)
              else if (isTapCoins) setShowTapCoinsGame(true)
              else if (isDailyBox) setShowDailyBoxGame(true)
            }}
          />
        )
      })}
    </div>
  )
}