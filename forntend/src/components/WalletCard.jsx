function WalletCard({ wallet }) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
      padding: 25,
      borderRadius: 12,
      marginBottom: 20
    }}>
      <p style={{ color: '#dbeafe' }}>
        Saldo disponível
      </p>

      <h1 style={{ fontSize: 42 }}>
        {wallet?.coins} Coins
      </h1>

      <p style={{
        color: '#e2e8f0',
        fontWeight: 'bold'
      }}>
        ≈ R$ {((wallet?.coins || 0) / 100).toFixed(2)}
      </p>
    </div>
  )
}

export default WalletCard