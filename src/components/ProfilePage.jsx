export default function ProfilePage({ wallet, setShowAdmin }) {
  const coins = wallet?.coins || 0
  const realValue = ((coins / 1000) * 0.25).toFixed(2)

  function logout() {
    localStorage.clear()
    window.location.reload()
  }

  return (
    <div style={{ padding: 20, paddingBottom: 100, color: 'white' }}>
      <div style={{ textAlign: 'center', marginBottom: 25 }}>
        <div style={{
          width: 90,
          height: 90,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #22c55e, #2563eb)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 38,
          fontWeight: 'bold',
          margin: '0 auto 15px'
        }}>
          {wallet?.name?.charAt(0)?.toUpperCase()}
        </div>

        <h2>{wallet?.name}</h2>
        <p style={{ color: '#94a3b8' }}>{wallet?.email}</p>
      </div>

      <div style={cardStyle}>
        <p>💰 Coins totais</p>
        <h1>{coins}</h1>
        <p>≈ R$ {realValue}</p>
        <small>1000 coins = R$ 0,25</small>
      </div>

      <div style={cardStyle}>
        <h2>💸 Solicitar Saque PIX</h2>

        <input placeholder="Chave PIX" style={inputStyle} />
        <input placeholder="Quantidade de coins" type="number" style={inputStyle} />

        <button style={greenButtonStyle}>
          Solicitar Saque PIX
        </button>
      </div>

      <div style={cardStyle}>
        <p>🏆 Último saque aprovado</p>
        <h3>Nenhum saque aprovado ainda</h3>
      </div>

      <div style={cardStyle}>
        <p>🎁 Código de convite</p>
        <h2>{wallet?.referral_code}</h2>
      </div>

      {wallet?.is_admin && (
        <button onClick={() => setShowAdmin(true)} style={adminButtonStyle}>
          🛠 Painel Admin
        </button>
      )}

      <button onClick={logout} style={logoutButtonStyle}>
        🚪 Sair da conta
      </button>
    </div>
  )
}

const cardStyle = {
  background: '#1e293b',
  padding: 20,
  borderRadius: 18,
  marginBottom: 20,
  textAlign: 'center'
}

const inputStyle = {
  width: '100%',
  padding: 14,
  marginTop: 12,
  borderRadius: 12,
  border: 'none',
  boxSizing: 'border-box'
}

const greenButtonStyle = {
  width: '100%',
  padding: 14,
  marginTop: 15,
  border: 'none',
  borderRadius: 12,
  background: '#22c55e',
  color: 'white',
  fontWeight: 'bold'
}

const adminButtonStyle = {
  width: '100%',
  padding: 14,
  border: 'none',
  borderRadius: 12,
  background: '#2563eb',
  color: 'white',
  fontWeight: 'bold',
  marginBottom: 15
}

const logoutButtonStyle = {
  width: '100%',
  padding: 14,
  border: 'none',
  borderRadius: 12,
  background: '#dc2626',
  color: 'white',
  fontWeight: 'bold'
}