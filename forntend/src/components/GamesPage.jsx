import { useEffect, useState } from 'react'
import GameCard from './GameCard'
import TapCoinsGame from './TapCoinsGame'
import RouletteGames from './RouletteGames'
import DailyBoxGame from './DailyBoxGame'

export default function GamesPage({ earnCoins, wallet }) {
  const [showTapCoinsGame, setShowTapCoinsGame] = useState(false)
  const [showRouletteGames, setShowRouletteGames] = useState(false)
  const [showDailyBoxGame, setShowDailyBoxGame] = useState(false)

  function formatTime(seconds) {
  const totalSeconds = Math.floor(seconds)
  const minutes = Math.floor(totalSeconds / 60)
  const secs = totalSeconds % 60

  return `${minutes}:${String(secs).padStart(2, '0')}`
}

  const [tapCooldown, setTapCooldown] = useState(() => {
    const savedEnd = localStorage.getItem(
  `tapCoinsCooldownEnd_${wallet?.email}`
)
    if (!savedEnd) return 0
    return Math.max(0, Math.floor((Number(savedEnd) - Date.now()) / 1000))
  })

  const [rouletteCooldown, setRouletteCooldown] = useState(() => {
  const savedEnd = localStorage.getItem(
    `rouletteCooldownEnd_${wallet?.email}`
  )

  if (!savedEnd) return 0

  return Math.max(
    0,
    Math.floor((Number(savedEnd) - Date.now()) / 1000)
  )
})

async function handleTapReward() {
  await earnCoins(50)

  const endTime = Date.now() + 60 * 60 * 1000

  localStorage.setItem(
    `tapCoinsCooldownEnd_${wallet?.email}`,
    String(endTime)
  )

  setTapCooldown(60 * 60)
  setShowTapCoinsGame(false)
}

  const [dailyBoxCooldown, setDailyBoxCooldown] = useState(() => {
  const savedEnd = localStorage.getItem(
    `dailyBoxCooldownEnd_${wallet?.email}`
  )

  if (!savedEnd) return 0

  return Math.max(
    0,
    Math.floor((Number(savedEnd) - Date.now()) / 1000)
  )
})

  useEffect(() => {
    if (tapCooldown <= 0) return

    const interval = setInterval(() => {
      const savedEnd = localStorage.getItem(
  `tapCoinsCooldownEnd_${wallet?.email}`
)
      if (!savedEnd) {
        setTapCooldown(0)
        return
      }

      const remaining = Math.max(0, Math.floor((Number(savedEnd) - Date.now()) / 1000))

      if (remaining <= 0) {
       localStorage.removeItem(
  `tapCoinsCooldownEnd_${wallet?.email}`
)
        setTapCooldown(0)
        return
      }

      setTapCooldown(remaining)
    }, 1000)

    return () => clearInterval(interval)
}, [tapCooldown, wallet])

  useEffect(() => {
  if (rouletteCooldown <= 0) return

  const interval = setInterval(() => {
    const savedEnd = localStorage.getItem(
      `rouletteCooldownEnd_${wallet?.email}`
    )

    if (!savedEnd) {
      setRouletteCooldown(0)
      return
    }

    const remaining = Math.max(
      0,
      Math.floor((Number(savedEnd) - Date.now()) / 1000)
    )

    if (remaining <= 0) {
      localStorage.removeItem(
        `rouletteCooldownEnd_${wallet?.email}`
      )

      setRouletteCooldown(0)
      return
    }

    setRouletteCooldown(remaining)
  }, 1000)

  return () => clearInterval(interval)
}, [rouletteCooldown, wallet])

  useEffect(() => {
  if (dailyBoxCooldown <= 0) return

  const interval = setInterval(() => {
    const savedEnd = localStorage.getItem(
      `dailyBoxCooldownEnd_${wallet?.email}`
    )

    if (!savedEnd) {
      setDailyBoxCooldown(0)
      return
    }

    const remaining = Math.max(
      0,
      Math.floor((Number(savedEnd) - Date.now()) / 1000)
    )

    if (remaining <= 0) {
      localStorage.removeItem(
        `dailyBoxCooldownEnd_${wallet?.email}`
      )

      setDailyBoxCooldown(0)
      return
    }

    setDailyBoxCooldown(remaining)
  }, 1000)

  return () => clearInterval(interval)
}, [dailyBoxCooldown, wallet])

  function handleRouletteReward(amount) {
  earnCoins(amount)

  const cooldownEnd = Date.now() + 60 * 60 * 1000

  localStorage.setItem(
    `rouletteCooldownEnd_${wallet?.email}`,
    String(cooldownEnd)
  )

  setRouletteCooldown(60 * 60)

  setTimeout(() => {
    setShowRouletteGames(false)
  }, 2500)
}

  function handleDailyBoxReward(amount) {
  earnCoins(amount)

  const cooldownEnd = Date.now() + 60 * 60 * 1000

  localStorage.setItem(
    `dailyBoxCooldownEnd_${wallet?.email}`,
    String(cooldownEnd)
  )

  setDailyBoxCooldown(60 * 60)
  setShowDailyBoxGame(false)
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

        if (isDailyBox) rewardText = 'Abra sua caixa'

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