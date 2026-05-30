function WalletCard({ wallet }) {
  const xp = wallet?.xp || 0
  const level = wallet?.level || 1

  const xpNeeded = level * 1000
  const progress = Math.min((xp / xpNeeded) * 100, 100)

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
        padding: 25,
        borderRadius: 20,
        marginBottom: 20,
        boxShadow: '0 0 25px rgba(37,99,235,0.35)'
      }}
    >
      <p
        style={{
          color: '#dbeafe',
          marginBottom: 6
        }}
      >
        Saldo disponível
      </p>

      <h1
        style={{
          fontSize: 42,
          margin: 0
        }}
      >
        {wallet?.coins} Coins
      </h1>

      <p
        style={{
          color: '#e2e8f0',
          fontWeight: 'bold',
          marginTop: 6
        }}
      >
        ≈ R$ {((wallet?.coins || 0) / 100).toFixed(2)}
      </p>

      <div
        style={{
          marginTop: 22,
          background: 'rgba(255,255,255,0.12)',
          padding: 14,
          borderRadius: 14
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: 8,
            fontWeight: 'bold'
          }}
        >
          <span>🏆 Nível {level}</span>
          <span>{xp}/{xpNeeded} XP</span>
        </div>

        <div
          style={{
            width: '100%',
            height: 14,
            background: 'rgba(255,255,255,0.18)',
            borderRadius: 999,
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: '100%',
              background:
                'linear-gradient(90deg, #facc15, #f97316)',
              transition: 'width 0.4s ease'
            }}
          />
        </div>

        <p
          style={{
            marginTop: 8,
            color: '#fef3c7',
            fontSize: 13
          }}
        >
          Próximo nível: {xpNeeded - xp} XP
        </p>
      </div>
    </div>
  )
}

export default WalletCard