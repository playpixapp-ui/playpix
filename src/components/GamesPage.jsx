import { useEffect, useState } from 'react'
import GameCard from './GameCard'
import TapCoinsGame from './TapCoinsGame'
import RouletteGames from './RouletteGames'

export default function GamesPage({ earnCoins }) {
  const [showTapCoinsGame, setShowTapCoinsGame] = useState(false)
  const [showRouletteGames, setShowRouletteGames] = useState(false)

  const [tapCooldown, setTapCooldown] = useState(() => {
    const savedEnd = localStorage.getItem('tapCoinsCooldownEnd')
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
        alert('⚡ Tap Coins disponível novamente!')
        return
      }

      setTapCooldown(remaining)
    }, 1000)

    return () => clearInterval(interval)
  }, [tapCooldown])

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
        const isLocked = isTapCoins && tapCooldown > 0

        return (
          <GameCard
            key={index}
            title={game.name}
            reward={
              isLocked
                ? `Disponível em ${formatTime(tapCooldown)}`
                : `Ganhe ${game.reward} coins`
            }
            emoji={game.icon}
            onPlay={() => {
              if (isLocked) return

              if (game.name === 'Roleta Bônus') {
                setShowRouletteGames(true)
              } else if (isTapCoins) {
                setShowTapCoinsGame(true)
              } else {
                alert('🚀 Em breve')
              }
            }}
          />
        )
      })}
    </div>
  )
}