export default function ProfilePage({
  wallet
}) {
  return (
    <div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginBottom: 30
        }}
      >
        <div
          style={{
            width: 90,
            height: 90,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #22c55e, #2563eb)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 38,
            fontWeight: 'bold',
            color: 'white',
            marginBottom: 15
          }}
        >
          {wallet?.name?.charAt(0)?.toUpperCase()}
        </div>

        <h2>
          {wallet?.name}
        </h2>

        <p style={{ color: '#94a3b8' }}>
          {wallet?.email}
        </p>
      </div>

      <div
        style={{
          background: '#1e293b',
          padding: 20,
          borderRadius: 18,
          marginBottom: 20
        }}
      >
        <p>💰 Coins totais</p>

        <h1>
          {wallet?.coins || 0}
        </h1>
      </div>

      <div
        style={{
          background: '#1e293b',
          padding: 20,
          borderRadius: 18,
          marginBottom: 20
        }}
      >
        <p>🎁 Código de convite</p>

        <h2>
          {wallet?.referral_code}
        </h2>
      </div>

      <button
        style={{
          width: '100%',
          padding: 14,
          border: 'none',
          borderRadius: 12,
          background: '#dc2626',
          color: 'white',
          fontWeight: 'bold',
          cursor: 'pointer'
        }}
      >
        Sair da conta
      </button>
    </div>
  )
}