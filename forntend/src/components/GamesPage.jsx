import { useEffect, useState } from 'react'
import GameCard from './GameCard'
import TapCoinsGame from './TapCoinsGame'
import RouletteGames from './RouletteGames'
import DailyBoxGame from './DailyBoxGame'

export default function GamesPage({
  earnCoins,
  wallet,
  saveGameCooldown,
  gameCooldowns,
  refreshGameCooldowns
}) {
  const [showTapCoinsGame, setShowTapCoinsGame] = useState(false)
  const [showRouletteGames, setShowRouletteGames] = useState(false)
  const [showDailyBoxGame, setShowDailyBoxGame] = useState(false)
  const [now, setNow] = useState(Date.now())

  const tapCooldownEnd = Number(gameCooldowns?.tapcoins || 0)
  const rouletteCooldownEnd = Number(gameCooldowns?.roulette || 0)
  const dailyBoxCooldownEnd = Number(gameCooldowns?.dailybox || 0)

  function formatTime(ms) {
    const totalSeconds = Math.max(0, Math.ceil(ms / 1000))
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes}:${String(seconds).padStart(2, '0')}`
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  async function handleTapReward() {
    await earnCoins(25, 10, 'play_games')

    if (saveGameCooldown) {
      await saveGameCooldown('tapcoins', 60)
    }

    await refreshGameCooldowns?.()
    setShowTapCoinsGame(false)
  }

  async function handleRouletteReward(amount) {
    await earnCoins(amount, 5, 'play_games')

    if (saveGameCooldown) {
      await saveGameCooldown('roulette', 60)
    }

    await refreshGameCooldowns?.()

    setTimeout(() => {
      setShowRouletteGames(false)
    }, 3500)
  }

  async function handleDailyBoxReward(amount) {
    await earnCoins(amount, 5, 'play_games')

    if (saveGameCooldown) {
      await saveGameCooldown('dailybox', 60)
    }

    await refreshGameCooldowns?.()
    setShowDailyBoxGame(false)
  }

  if (showRouletteGames) {
    return (
      <RouletteGames
        onBack={async () => {
          await refreshGameCooldowns?.()
          setShowRouletteGames(false)
        }}
        onReward={handleRouletteReward}
        wallet={wallet}
      />
    )
  }

  if (showTapCoinsGame) {
    return (
      <TapCoinsGame
        onBack={async () => {
          await refreshGameCooldowns?.()
          setShowTapCoinsGame(false)
        }}
        onReward={handleTapReward}
        wallet={wallet}
      />
    )
  }

  if (showDailyBoxGame) {
    return (
      <DailyBoxGame
        onBack={async () => {
          await refreshGameCooldowns?.()
          setShowDailyBoxGame(false)
        }}
        onReward={handleDailyBoxReward}
        cooldown={dailyBoxCooldownEnd > now ? Math.ceil((dailyBoxCooldownEnd - now) / 1000) : 0}
        wallet={wallet}
      />
    )
  }

  const games = [
    { name: 'Roleta Bônus', reward: 350, icon: '🎯' },
    { name: 'Tap Coins', reward: 25, icon: '⚡' },
    { name: 'Caixa Diária', reward: 200, icon: '🎁' }
  ]

  return (
    <div style={{ width: '100%', maxWidth: 900, margin: '0 auto', padding: '0 5px', boxSizing: 'border-box' }}>
      <h2 style={{ textAlign: 'center', fontSize: 34, fontWeight: '800', color: '#ffffff', marginBottom: 24 }}>
        🎮 Jogos rápidos
      </h2>

      {games.map((game, index) => {
        const isTapCoins = game.name === 'Tap Coins'
        const isRoulette = game.name === 'Roleta Bônus'
        const isDailyBox = game.name === 'Caixa Diária'

        const cooldownEnd = isTapCoins
          ? tapCooldownEnd
          : isRoulette
            ? rouletteCooldownEnd
            : dailyBoxCooldownEnd

        const isCurrentlyLocked = cooldownEnd > now

        let rewardText = isRoulette
          ? 'Ganhe até 350 coins'
          : isDailyBox
            ? 'Ganhe até 200 coins'
            : `Ganhe ${game.reward} coins`

        if (isCurrentlyLocked) {
          rewardText = `Disponível em ${formatTime(cooldownEnd - now)}`
        }

        return (
          <GameCard
            key={index}
            title={game.name}
            reward={rewardText}
            emoji={game.icon}
            locked={isCurrentlyLocked}
            onPlay={async () => {
              await refreshGameCooldowns?.()

              if (cooldownEnd > Date.now()) return

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