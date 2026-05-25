import { useState } from 'react'
import WalletCard from './components/WalletCard'
import ProfileCard from './components/ProfileCard'

function App() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [token, setToken] = useState('')
  const [wallet, setWallet] = useState(null)
  const [message, setMessage] = useState('')
  const [pixKey, setPixKey] = useState('')
  const [amount, setAmount] = useState('')
  const [withdrawals, setWithdrawals] = useState([])
  const [adminWithdrawals, setAdminWithdrawals] = useState([])
  const [showAdmin, setShowAdmin] = useState(false)
  const [name, setName] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const [ranking, setRanking] = useState([])
  const [page, setPage] = useState('dashboard')
  const [referralCode, setReferralCode] = useState('')
  const [referrals, setReferrals] = useState([])

  const isAdmin = wallet?.is_admin === true

  async function loadReferrals(userToken) {

  const response = await fetch('http://localhost:3000/referrals', {
    headers: {
      Authorization: `Bearer ${userToken}`
    }
  })

  const data = await response.json()

  setReferrals(data.referrals || [])
}
  async function loadWallet(userToken) {
    const walletResponse = await fetch('http://localhost:3000/wallet', {
      headers: {
        Authorization: `Bearer ${userToken}`
      }
    })

    const walletData = await walletResponse.json()
    setWallet(walletData.wallet)

    const withdrawalsResponse = await fetch('http://localhost:3000/withdrawals', {
      headers: {
        Authorization: `Bearer ${userToken}`
      }
    })

    const withdrawalsData = await withdrawalsResponse.json()
    setWithdrawals(withdrawalsData.withdrawals || [])
  }

  async function login() {
    const response = await fetch('http://localhost:3000/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })

    const data = await response.json()

    if (data.token) {
      setToken(data.token)
      localStorage.setItem('playpix_token', data.token)
      setMessage('Login realizado com sucesso 🚀')
      await loadWallet(data.token)
      
    } else {
      setMessage(data.error || 'Erro no login')
    }
  }

  async function register() {
    const response = await fetch('http://localhost:3000/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name,
    email,
    password,
    referralCode
  })
})
    const data = await response.json()

    if (response.ok) {
      setMessage('Conta criada com sucesso! Agora faça login 🚀')
      setIsRegister(false)
    } else {
      setMessage(data.error || 'Erro ao cadastrar usuário')
    }
  }

  function logout() {
    localStorage.removeItem('playpix_token')
    setToken('')
    setWallet(null)
    setMessage('')
    setShowAdmin(false)
    setRanking([])
    setPage('dashboard')
  }

  async function earnCoins() {
    await fetch('http://localhost:3000/earn-coins', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ amount: 50 })
    })

    await loadWallet(token)
  }

  async function dailyLoginMission() {
    const response = await fetch('http://localhost:3000/daily-login', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    const data = await response.json()

    if (response.ok) {
      alert('Missão concluída! +10 coins 🎯')
      await loadWallet(token)
    } else {
      alert(data.error || 'Erro na missão diária')
    }
  }

  async function withdrawPix() {
    const value = Number(amount)

    if (!pixKey || value <= 0) {
      alert('Informe uma chave PIX e um valor maior que zero.')
      return
    }

    const response = await fetch('http://localhost:3000/withdraw', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        pix_key: pixKey,
        amount: value
      })
    })

    const data = await response.json()

    if (response.ok) {
      alert('Saque solicitado com sucesso 💸')
      await loadWallet(token)
      setPixKey('')
      setAmount('')
    } else {
      alert(data.error || 'Erro ao solicitar saque')
    }
  }

  async function loadAdminWithdrawals() {
    try {
      const response = await fetch('http://localhost:3000/admin/withdrawals', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const data = await response.json()
      setAdminWithdrawals(data.withdrawals || [])
    } catch (error) {
      console.log(error)
      alert('Erro ao carregar painel admin')
    }
  }

  async function approveWithdrawal(id) {
    await fetch(`http://localhost:3000/admin/approve-withdrawal/${id}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    await loadAdminWithdrawals()
    await loadWallet(token)
  }

  async function loadRanking() {
    const response = await fetch('http://localhost:3000/ranking', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    const data = await response.json()
    setRanking(data.ranking || [])
    setPage('ranking')
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0f172a',
      color: 'white',
      fontFamily: 'Arial',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20
    }}>
      {!token ? (
        <div style={{
          textAlign: 'center',
          width: 380,
          background: '#111827',
          padding: 30,
          borderRadius: 20,
          boxShadow: '0 0 25px rgba(0,0,0,0.4)'
        }}>
          <h1>🎮 PlayPIX</h1>

          {isRegister && (
        <input
          placeholder="Código de convite (opcional)"
          value={referralCode}
          onChange={(e) => setReferralCode(e.target.value)}
          style={{
          width: '100%',
          padding: 12,
          marginBottom: 10
    }}
  />
)}

          <input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: 12, marginBottom: 10 }}
          />
          <input
            placeholder="Nome"
            value={name}
           onChange={(e) => setName(e.target.value)}
           style={{ width: '100%', padding: 12, marginBottom: 10 }}
          />

          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: 12, marginBottom: 10 }}
          />

          <button
            onClick={isRegister ? register : login}
            style={{
              padding: 12,
              width: '100%',
              border: 'none',
              borderRadius: 10,
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            {isRegister ? 'Criar Conta' : 'Entrar'}
          </button>

          <button
            onClick={() => setIsRegister(!isRegister)}
            style={{
              marginTop: 10,
              background: 'transparent',
              color: 'white',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            {isRegister ? 'Já tenho conta' : 'Criar nova conta'}
          </button>

          <p>{message}</p>
        </div>
      ) : (
        <div style={{ textAlign: 'center', width: 380 }}>
          <button
            onClick={logout}
            style={{
              position: 'fixed',
              top: 20,
              right: 20,
              background: '#ef4444',
              color: 'white',
              border: 'none',
              padding: '10px 16px',
              borderRadius: 8,
              cursor: 'pointer'
            }}
          >
            Sair
          </button>

          <h1>🎮 PlayPIX</h1>

          <p style={{ color: '#94a3b8' }}>
            Ganhe coins, acompanhe seu saldo e solicite saques PIX.
          </p>

          <div style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #22c55e, #2563eb)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 36,
            fontWeight: 'bold',
            margin: '0 auto 15px auto',
            color: 'white'
          }}>
            {wallet?.name?.charAt(0)?.toUpperCase()}
          </div>

          <h2>{wallet?.name}</h2>
          <p>{wallet?.email}</p>

          <div style={{
            background: '#1e293b',
            padding: 15,
            borderRadius: 12,
            marginBottom: 20
          }}>
            <p>Seu código de convite:</p>
            <strong>{wallet?.referral_code || 'Sem código ainda'}</strong>
          </div>

          <WalletCard wallet={wallet} />

          <button
            onClick={earnCoins}
            style={{
              padding: 14,
              width: '100%',
              borderRadius: 10,
              border: 'none',
              background: '#22c55e',
              color: 'white',
              fontWeight: 'bold',
              cursor: 'pointer',
              marginBottom: 15
            }}
          >
            Ganhar 50 Coins
          </button>

          <button
            onClick={dailyLoginMission}
            style={{
              padding: 10,
              marginBottom: 15,
              width: '100%',
              background: '#f97316',
              color: 'white',
              border: 'none',
              borderRadius: 10,
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            🎯 Resgatar Login Diário
          </button>

          {isAdmin && (
            <button
              onClick={() => {
                setShowAdmin(!showAdmin)
                loadAdminWithdrawals()
              }}
              style={{
                padding: 12,
                marginBottom: 15,
                width: '100%',
                background: '#7c3aed',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Painel Admin
            </button>
          )}

          <div style={{
            background: '#1e293b',
            padding: 20,
            borderRadius: 12
          }}>
            <h2>Saque PIX</h2>

            <input
              placeholder="Chave PIX"
              value={pixKey}
              onChange={(e) => setPixKey(e.target.value)}
              style={{ width: '100%', padding: 10, marginBottom: 10 }}
            />

            <input
              placeholder="Valor em coins"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              style={{ width: '100%', padding: 10, marginBottom: 10 }}
            />

            <button
              onClick={withdrawPix}
              style={{
                padding: 12,
                width: '100%',
                background: '#f59e0b',
                border: 'none',
                borderRadius: 10,
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Solicitar Saque PIX
            </button>

            <button
              onClick={loadRanking}
              style={{
                padding: 10,
                marginTop: 15,
                width: '100%',
                background: '#0ea5e9',
                color: 'white',
                border: 'none',
                borderRadius: 10,
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: 16
              }}
            >
              🏆 Ver Ranking
            </button>
            
          </div>
            
          {showAdmin && isAdmin && (
            <div style={{
              background: '#1e293b',
              padding: 20,
              borderRadius: 12,
              marginTop: 20
            }}>
              <h2>Painel Admin</h2>

              {adminWithdrawals.map((item) => (
                <div
                  key={item.id}
                  style={{
                    background: '#334155',
                    padding: 15,
                    borderRadius: 8,
                    marginTop: 10
                  }}
                >
                  <p>Usuário ID: {item.user_id}</p>
                  <p>💸 {item.amount} Coins</p>
                  <p>PIX: {item.pix_key}</p>
                  <p>Status: {item.status}</p>

                  {item.status === 'pending' && (
                    <button
                      onClick={() => approveWithdrawal(item.id)}
                      style={{
                        padding: 10,
                        marginTop: 10,
                        background: '#22c55e',
                        color: 'white',
                        border: 'none',
                        borderRadius: 8,
                        cursor: 'pointer'
                      }}
                    >
                      Aprovar Saque
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          <div style={{
            background: '#1e293b',
            padding: 20,
            borderRadius: 12,
            marginTop: 20
          }}>
            <h2>Histórico de Saques</h2>

            {withdrawals.map((item) => (
              <div
                key={item.id}
                style={{
                  background: '#334155',
                  padding: 10,
                  borderRadius: 8,
                  marginTop: 10
                }}
              >
                <p>💸 {item.amount} Coins</p>
                <p>PIX: {item.pix_key}</p>
                <p>Status: {item.status}</p>
              </div>
            ))}
          </div>

          {page === 'ranking' && (
            <div style={{
              background: '#1e293b',
              padding: 20,
              borderRadius: 12,
              marginTop: 20
            }}>

            <div style={{
              background: '#1e293b',
              padding: 20,
              borderRadius: 12,
              marginTop: 20
            }}>

  <h2>👥 Meus Convidados</h2>

  <p>
    Total: {referrals.length}
  </p>

  {referrals.map((user) => (
    <div
      key={user.id}
      style={{
        background: '#334155',
        padding: 10,
        borderRadius: 8,
        marginTop: 10
      }}
    >
      <p>👤 {user.name}</p>
      <p>📧 {user.email}</p>
    </div>
  ))}

</div>
              <h2>🏆 Ranking</h2>

              <button
                onClick={() => setPage('dashboard')}
                style={{
                  padding: 10,
                  marginBottom: 15,
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer'
                }}
              >
                Voltar
              </button>

              {ranking.map((user, index) => (
                <div
                  key={user.id}
                  style={{
                    background: '#334155',
                    padding: 12,
                    borderRadius: 8,
                    marginTop: 10,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10
                  }}>
                    <div style={{
                      width: 35,
                      height: 35,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #22c55e, #2563eb)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      color: 'white'
                    }}>
                      {user.name.charAt(0).toUpperCase()}
                    </div>

                    <span>
                      #{index + 1} — {user.name}
                    </span>
                  </div>

                  <strong>
                    {user.coins} Coins
                  </strong>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default App
