import { useEffect, useState } from 'react'
import API_URL from '../services/api'

export default function ProfilePage({
  wallet,
  showToast,
  setShowAdmin
}) {
  const [pixKey, setPixKey] = useState('')
  const [selectedWithdraw, setSelectedWithdraw] = useState(null)

const streak = wallet?.streak_day || 1

const withdrawOptions = [
  { label: 'R$ 1,50', value: 1.5, coins: 10000, days: 1 },
  { label: 'R$ 5,00', value: 5, coins: 35000, days: 7 },
  { label: 'R$ 10,00', value: 10, coins: 70000, days: 15 },
  { label: 'R$ 15,00', value: 15, coins: 150000, days: 29 }
]
  const [withdrawals, setWithdrawals] = useState([])
  const coins = wallet?.coins || 0
  const realValue = (coins * 0.00015).toFixed(2)

  function logout() {
    localStorage.clear()
    window.location.reload()
  }
  useEffect(() => {
  loadWithdrawals()
}, [])

async function loadWithdrawals() {
  const token = localStorage.getItem('playpix_token')

  try {
    const response = await fetch(`${API_URL}/withdrawals`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    const data = await response.json()

    if (response.ok) {
      setWithdrawals(data.withdrawals || [])
    }
  } catch (error) {
    console.log('Erro ao buscar saques:', error)
  }
}

 async function handleWithdraw() {
  if (!selectedWithdraw) {
  showToast('⚠️ Escolha um valor de saque')
  return
}

if (coins < selectedWithdraw.coins) {
  showToast('❌ Coins insuficientes')
  return
}

if (streak < selectedWithdraw.days) {
  showToast(`🔒 Faça login por ${selectedWithdraw.days} dias`)
  return
}

  if (!pixKey.trim()) {
    showToast('⚠️ Digite sua chave PIX')
    return
  }

  const token = localStorage.getItem('playpix_token')

  try {
    const response = await fetch(`${API_URL}/withdraw`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },

      body: JSON.stringify({
        pixKey,
        pix_key: pixKey,
        pixType: 'PIX',
        amount: selectedWithdraw.coins
      })
    })

    const data = await response.json()
    console.log('WITHDRAW RESPONSE:', data)

   if (!response.ok) {
  console.log('ERRO BACKEND:', data.error)

  showToast(`❌ ${data.error}`)

  return
}

    showToast('💸 Saque enviado para análise')

    setPixKey('')

    await loadWithdrawals()

  } catch (err) {
    console.error(err)
    showToast('❌ Erro de conexão com o servidor')
  }
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
          {(wallet?.name || wallet?.email)?.charAt(0)?.toUpperCase()}
        </div>

        <h2>{wallet?.name}</h2>
        <p style={{ color: '#94a3b8' }}>{wallet?.email}</p>
      </div>

      <div style={cardStyle}>
        <p>💰 Coins totais</p>
        <h1>{coins}</h1>
        <p>≈ R$ {realValue}</p>
        <small>1000 coins = R$ 0,15</small>
      </div>

      <div style={cardStyle}>
  <h2>💸 Solicitar Saque PIX</h2>

  <p style={{ color: '#cbd5e1', marginBottom: 12 }}>
    🔥 Login consecutivo: <strong>{streak} dia(s)</strong>
  </p>

  <div
    style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 12,
      marginBottom: 18
    }}
  >
    {withdrawOptions.map((option) => {
      const unlocked = streak >= option.days
      const hasCoins = coins >= option.coins
      const selected = selectedWithdraw?.value === option.value
      const daysLeft = Math.max(option.days - streak, 0)

      return (
        <button
          key={option.value}
          onClick={() => setSelectedWithdraw(option)}
          style={{
            padding: 8,
            borderRadius: 16,
            border: selected
              ? '3px solid #22c55e'
              : unlocked
                ? '2px solid rgba(34,197,94,0.75)'
                : '2px solid rgba(148,163,184,0.25)',
            background: unlocked
              ? 'linear-gradient(135deg, #052e16, #16a34a)'
              : 'rgba(148,163,184,0.14)',
            color: 'white',
            opacity: unlocked ? 1 : 0.62,
            cursor: 'pointer',
            textAlign: 'center',
            boxShadow: unlocked
              ? '0 0 18px rgba(34,197,94,0.45)'
              : 'none',
            minHeight: 90
          }}
        >
          <h3 style={{ margin: 0, fontSize: 19 }}>
            {option.label}
          </h3>

          <p style={{ margin: '5px 0', fontSize: 13 }}>
            {option.coins} coins
          </p>

          <small style={{ fontSize: 12, lineHeight: 1.3 }}>
            {unlocked
              ? hasCoins
                ? '🟢 Disponível para saque'
                : '💰 Coins insuficientes'
              : `🔒 Faltam ${daysLeft} dia(s)`}
          </small>
        </button>
      )
    })}
  </div>

  <input
    placeholder="Chave PIX"
    value={pixKey}
    onChange={(e) => setPixKey(e.target.value)}
    style={inputStyle}
  />

  <button
    style={{
      ...greenButtonStyle,
      opacity: selectedWithdraw ? 1 : 0.6
    }}
    onClick={handleWithdraw}
  >
    💸 Solicitar Saque
  </button>
</div>

      <div style={cardStyle}>
        <p>🏆 Último saque aprovado</p>
        <h3>Nenhum saque aprovado ainda</h3>
      </div>
      <div style={cardStyle}>
  <h2>💸 Histórico de Saques</h2>

{withdrawals.length === 0 ? (
  <p style={{ color: '#cbd5e1' }}>
    Nenhum saque solicitado ainda.
  </p>
) : (
  withdrawals.map((item) => {
    const statusInfo = getStatusInfo(item.status)
    const date = new Date(item.created_at).toLocaleDateString('pt-BR')

    return (
      <div
        key={item.id}
        style={{
          background: statusInfo.bg,
          border: `1px solid ${statusInfo.border}`,
          padding: 16,
          borderRadius: 16,
          marginTop: 12,
          textAlign: 'left'
        }}
      >
        <strong style={{ color: statusInfo.color }}>
          {statusInfo.icon} {statusInfo.label}
        </strong>

        <h3 style={{ margin: '8px 0', color: 'white' }}>
          R$ 1,50
        </h3>

        <p style={{ margin: 0, color: '#cbd5e1' }}>
          {date}
        </p>
      </div>
    )
  })
)}
      </div>

      {wallet?.is_admin && (
          <button
          onClick={() => setShowAdmin(true)}
          style={adminButtonStyle}
        >
          🛠 Painel Admin
        </button>
)}

      <button onClick={logout} style={logoutButtonStyle}>
        🚪 Sair da conta
      </button>
    </div>
  )
}

function getStatusInfo(status) {
  if (status === 'approved') {
    return {
      icon: '🟢',
      label: 'Aprovado',
      bg: 'rgba(34,197,94,0.12)',
      border: 'rgba(34,197,94,0.35)',
      color: '#86efac'
    }
  }

  if (status === 'rejected') {
    return {
      icon: '🔴',
      label: 'Recusado',
      bg: 'rgba(239,68,68,0.12)',
      border: 'rgba(239,68,68,0.35)',
      color: '#fca5a5'
    }
  }

  return {
    icon: '🟡',
    label: 'Em análise',
    bg: 'rgba(250,204,21,0.12)',
    border: 'rgba(250,204,21,0.35)',
    color: '#fde68a'
  }
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