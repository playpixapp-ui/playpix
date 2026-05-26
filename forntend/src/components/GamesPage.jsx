import { useState } from 'react'
import TapCoinsGame from './TapCoinsGame'

export default function GamesPage({ earnCoins }) {
  const [selectedOffer, setSelectedOffer] = useState(null)
  const [showTapCoinsGame, setShowTapCoinsGame] = useState(false)

  const internalGames = [
    { name: 'Roleta Bônus', reward: 100, icon: '🎯' },
    { name: 'Tap Coins', reward: 50, icon: '⚡' },
    { name: 'Caixa Diária', reward: 200, icon: '🎁' }
  ]

  const offers = [
    { name: 'Oferta Gamer', reward: 250, icon: '🎮' },
    { name: 'Instale App', reward: 500, icon: '🔥' },
    { name: 'Missão VIP', reward: 1000, icon: '💎' }
  ]

  return (
    <div style={{ marginTop: 20 }}>
      <h2>🎮 Jogos rápidos</h2>

      {internalGames.map((game, index) => (
        <GameCard
          key={index}
          item={game}
          button="Jogar"
          onClick={() => {
            if (game.name === 'Tap Coins') {
              setShowTapCoinsGame(true)
            }
          }}
        />
      ))}

      <h2 style={{ marginTop: 30 }}>
        🔥 Ofertas patrocinadas
      </h2>

      {offers.map((offer, index) => (
        <GameCard
          key={index}
          item={offer}
          button="Ver oferta"
          onClick={() => setSelectedOffer(offer)}
        />
      ))}

      {selectedOffer && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            background: '#111827',
            padding: 25,
            borderRadius: 20,
            width: 330,
            textAlign: 'center'
          }}>
            <h2>
              {selectedOffer.icon} {selectedOffer.name}
            </h2>

            <p style={{ color: '#94a3b8' }}>
              Complete esta oferta para ganhar:
            </p>

            <h1 style={{ color: '#22c55e' }}>
              {selectedOffer.reward} Coins
            </h1>

            <button
              style={{
                width: '100%',
                padding: 14,
                border: 'none',
                borderRadius: 12,
                background: 'linear-gradient(135deg, #22c55e, #2563eb)',
                color: 'white',
                fontWeight: 'bold',
                cursor: 'pointer',
                marginTop: 10
              }}
            >
              Começar oferta
            </button>

            <button
              onClick={() => setSelectedOffer(null)}
              style={{
                marginTop: 12,
                background: 'transparent',
                color: '#94a3b8',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {showTapCoinsGame && (
        <TapCoinsGame
          onClose={() => setShowTapCoinsGame(false)}
          onReward={earnCoins}
        />
      )}
    </div>
  )
}

function GameCard({ item, button, onClick }) {
  return (
    <div style={{
      background: '#1e293b',
      padding: 18,
      borderRadius: 18,
      marginTop: 14,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: '0 0 15px rgba(0,0,0,0.25)'
    }}>
      <div>
        <h3 style={{ margin: 0 }}>
          {item.icon} {item.name}
        </h3>

        <p style={{
          color: '#94a3b8',
          marginTop: 6
        }}>
          Ganhe até {item.reward} coins
        </p>
      </div>

      <button
        onClick={onClick}
        style={{
          background: 'linear-gradient(135deg, #22c55e, #2563eb)',
          border: 'none',
          padding: '12px 18px',
          borderRadius: 12,
          color: 'white',
          fontWeight: 'bold',
          cursor: 'pointer'
        }}
      >
        {button}
      </button>
    </div>
  )
}