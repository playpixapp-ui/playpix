import { useEffect, useState } from 'react'
import GameCard from './GameCard'
import TapCoinsGame from './TapCoinsGame'
import RouletteGames from './RouletteGames'
import DailyBoxGame from './DailyBoxGame'

export default function GamesPage({ earnCoins }) {
  const [showTapCoinsGame, setShowTapCoinsGame] = useState(false)
  const [showRouletteGames, setShowRouletteGames] = useState(false)
  const [showDailyBoxGame, setShowDailyBoxGame] = useState(false)

  const [tapCooldown, setTapCooldown] = useState(() => {
    const savedEnd = localStorage.getItem('tapCoinsCooldownEnd')
    if (!savedEnd) return 0
    return Math.max(0, Math.floor((Number(savedEnd) - Date.now()) / 1000))
  })

  const [rouletteCooldown, setRouletteCooldown] = useState(() => {
    const savedEnd = localStorage.getItem('rouletteCooldownEnd')
    if (!savedEnd) return 0
    return Math.max(0, Math.floor((Number(savedEnd) - Date.now()) / 1000))
  })

  const [dailyBoxCooldown, setDailyBoxCooldown] = useState(() => {
    const savedEnd = localStorage.getItem('dailyBoxCooldownEnd')
    if (!savedEnd) return 0
    return Math.max(0, Math.floor((Number(savedEnd) - Date.now()) / 1000))
  })

  useEffect(() => {
    if (tapCooldown <= 0) return

    const interval = setInterval(() => {
      const savedEnd = localStorage.getItem('tapCoinsCooldownEnd')
      if (!savedEnd) {
        setTapCooldown(0)
        return
      }

      const remaining = Math.max(0, Math.floor((Number(savedEnd) - Date.now()) / 1000))

      if (remaining <= 0) {
        localStorage.removeItem('tapCoinsCooldownEnd')
        setTapCooldown(0)
        return
      }

      setTapCooldown(remaining)
    }, 1000)

    return () => clearInterval(interval)
  }, [tapCooldown])

  useEffect(() => {
    if (rouletteCooldown <= 0) return

    const interval = setInterval(() => {
      const savedEnd = localStorage.getItem('rouletteCooldownEnd')
      if (!savedEnd) {
        setRouletteCooldown(0)
        return
      }

      const remaining = Math.max(0, Math.floor((Number(savedEnd) - Date.now()) / 1000))

      if (remaining <= 0) {
        localStorage.removeItem('rouletteCooldownEnd')
        setRouletteCooldown(0)
        return
      }

      setRouletteCooldown(remaining)
    }, 1000)

    return () => clearInterval(interval)
  }, [rouletteCooldown])

  useEffect(() => {
    if (dailyBoxCooldown <= 0) return

    const interval = setInterval(() => {
      const savedEnd = localStorage.getItem('dailyBoxCooldownEnd')
      if (!savedEnd) {
        setDailyBoxCooldown(0)
        return
      }

      const remaining = Math.max(0, Math.floor((Number(savedEnd) - Date.now()) / 1000))

      if (remaining <= 0) {
        localStorage.removeItem('dailyBoxCooldownEnd')
        setDailyBoxCooldown(0)
        return
      }

      setDailyBoxCooldown(remaining)
    }, 1000)

    return () => clearInterval(interval)
  }, [dailyBoxCooldown])

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  function handleTapReward() {
    earnCoins(50)

    const cooldownEnd = Date.now() + 60 * 60 * 1000
    localStorage.setItem('tapCoinsCooldownEnd', String(cooldownEnd))

    setTapCooldown(60 * 60)
    setShowTapCoinsGame(false)
  }

  function handleRouletteReward(amount) {
    earnCoins(amount)

    const cooldownEnd = Date.now() + 60 * 60 * 1000
    localStorage.setItem('rouletteCooldownEnd', String(cooldownEnd))

    setRouletteCooldown(60 * 60)
  }

  function handleDailyBoxReward(amount) {
    earnCoins(amount)

    const cooldownEnd = Date.now() + 60 * 60 * 1000
    localStorage.setItem('dailyBoxCooldownEnd', String(cooldownEnd))

    setDailyBoxCooldown(60 * 60)
  }

  const games = [
    { name: 'Roleta Bônus', reward: 100, icon: '🎯' },
    { name: 'Tap Coins', reward: 50, icon: '⚡' },
    { name: 'Caixa Diária', reward: 200, icon: '🎁' }
  ]

  if (showRouletteGames) {
    return (
      <RouletteGames
        onBack={() => setShowRouletteGames(false)}
        onReward={handleRouletteReward}
      />
    )
  }

  if (showTapCoinsGame) {
    return (
      <TapCoinsGame
        onBack={() => setShowTapCoinsGame(false)}
        onReward={handleTapReward}
      />
    )
  }

  if (showDailyBoxGame) {
    return (
      <DailyBoxGame
        onBack={() => setShowDailyBoxGame(false)}
        onReward={handleDailyBoxReward}
      />
    )
  }

  return (
    <div style={{
      marginTop: 20,
      width: '100%',
      maxWidth: 430,
      marginLeft: 'auto',
      marginRight: 'auto',
      boxSizing: 'border-box'
    }}>
      <h2>🎮 Jogos rápidos</h2>

      {games.map((game, index) => {
        const isTapCoins = game.name === 'Tap Coins'
        const isRoulette = game.name === 'Roleta Bônus'
        const isDailyBox = game.name === 'Caixa Diária'

        const isTapLocked = isTapCoins && tapCooldown > 0
        const isRouletteLocked = isRoulette && rouletteCooldown > 0
        const isDailyBoxLocked = isDailyBox && dailyBoxCooldown > 0

        const isLocked = isTapLocked || isRouletteLocked || isDailyBoxLocked

        let rewardText = `Ganhe ${game.reward} coins`

        if (isTapLocked) rewardText = `Disponível em ${formatTime(tapCooldown)}`
        if (isRouletteLocked) rewardText = `Disponível em ${formatTime(rouletteCooldown)}`
        if (isDailyBoxLocked) rewardText = `Disponível em ${formatTime(dailyBoxCooldown)}`

        return (
          <GameCard
            key={index}
            title={game.name}
            reward={rewardText}
            emoji={game.icon}
            onPlay={() => {
              if (isLocked) return

              if (isRoulette) {
                setShowRouletteGames(true)
              } else if (isTapCoins) {
                setShowTapCoinsGame(true)
              } else if (isDailyBox) {
                setShowDailyBoxGame(true)
              }
            }}
          />
        )
      })}
    </div>
  )
}