import { useEffect, useState } from 'react'
import GameCard from './GameCard'
import TapCoinsGame from './TapCoinsGame'
import RouletteGames from './RouletteGames'
import DailyBoxGame from './DailyBoxGame'

export default function GamesPage({ earnCoins, wallet }) {
  const userKey = wallet?.email || wallet?.id || null

  const [showTapCoinsGame, setShowTapCoinsGame] = useState(false)
  const [showRouletteGames, setShowRouletteGames] = useState(false)
  const [showDailyBoxGame, setShowDailyBoxGame] = useState(false)

  const [tapCooldown, setTapCooldown] = useState(0)
  const [rouletteCooldown, setRouletteCooldown] = useState(0)
  const [dailyBoxCooldown, setDailyBoxCooldown] = useState(0)

  function getRemaining(key) {
    if (!key) return 0

    const savedEnd = localStorage.getItem(key)

    if (!savedEnd) return 0

    return Math.max(
      0,
      Math.floor((Number(savedEnd) - Date.now()) / 1000)
    )
  }

  useEffect(() => {
    if (!userKey) return

    setTapCooldown(getRemaining(`tapCoinsCooldownEnd_${userKey}`))
    setRouletteCooldown(getRemaining(`rouletteCooldownEnd_${userKey}`))
    setDailyBoxCooldown(getRemaining(`dailyBoxCooldownEnd_${userKey}`))
  }, [userKey])

  useEffect(() => {
    if (!userKey) return
    if (tapCooldown <= 0) return

    const interval = setInterval(() => {
      const key = `tapCoinsCooldownEnd_${userKey}`
      const remaining = getRemaining(key)

      if (remaining <= 0) {
        localStorage.removeItem(key)
        setTapCooldown(0)
        return
      }

      setTapCooldown(remaining)
    }, 1000)

    return () => clearInterval(interval)
  }, [tapCooldown, userKey])

  useEffect(() => {
    if (!userKey) return
    if (rouletteCooldown <= 0) return

    const interval = setInterval(() => {
      const key = `rouletteCooldownEnd_${userKey}`
      const remaining = getRemaining(key)

      if (remaining <= 0) {
        localStorage.removeItem(key)
        setRouletteCooldown(0)
        return
      }

      setRouletteCooldown(remaining)
    }, 1000)

    return () => clearInterval(interval)
  }, [rouletteCooldown, userKey])

  useEffect(() => {
    if (!userKey) return
    if (dailyBoxCooldown <= 0) return

    const interval = setInterval(() => {
      const key = `dailyBoxCooldownEnd_${userKey}`
      const remaining = getRemaining(key)

      if (remaining <= 0) {
        localStorage.removeItem(key)
        setDailyBoxCooldown(0)
        return
      }

      setDailyBoxCooldown(remaining)
    }, 1000)

    return () => clearInterval(interval)
  }, [dailyBoxCooldown, userKey])

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  function handleTapReward() {
    if (!userKey) return

    earnCoins(50)

    const cooldownEnd = Date.now() + 60 * 60 * 1000
    localStorage.setItem(
      `tapCoinsCooldownEnd_${userKey}`,
      String(cooldownEnd)
    )

    setTapCooldown(60 * 60)
    setShowTapCoinsGame(false)
  }

  function handleRouletteReward(amount) {
    if (!userKey) return

    earnCoins(amount)

    const cooldownEnd = Date.now() + 60 * 60 * 1000
    localStorage.setItem(
      `rouletteCooldownEnd_${userKey}`,
      String(cooldownEnd)
    )

    setRouletteCooldown(60 * 60)
  }

  function handleDailyBoxReward(amount) {
    if (!userKey) return

    earnCoins(amount)

    const cooldownEnd = Date.now() + 60 * 60 * 1000
    localStorage.setItem(
      `dailyBoxCooldownEnd_${userKey}`,
      String(cooldownEnd)
    )

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
        wallet={wallet}
      />
    )
  }

  if (showTapCoinsGame) {
    return (
      <TapCoinsGame
        onBack={() => setShowTapCoinsGame(false)}
        onReward={handleTapReward}
        wallet={wallet}
      />
    )
  }

  if (showDailyBoxGame) {
    return (
      <DailyBoxGame
        onBack={() => setShowDailyBoxGame(false)}
        onReward={handleDailyBoxReward}
        cooldown={dailyBoxCooldown}
        wallet={wallet}
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