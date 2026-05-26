import { useState, useEffect } from 'react'
import TopBalanceCard from './components/TopBalanceCard'
import ProgressCard from './components/ProgressCard'
import OfferCard from './components/OfferCard'
import BottomMenu from './components/BottomMenu'
import MissionsPage from './components/MissionsPage'
import ProfilePage from './components/ProfilePage'
import RankingPage from './components/RankingPage'
import GamesPage from './components/GamesPage'
import rewardSound from './assets/reward.mp3'

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

  const [referrals, setReferrals] = useState([])
  const [loading, setLoading] = useState(true)
  const monetagLink = 'https://omg10.com/4/11062330'

  const [rewardAnimation, setRewardAnimation] = useState(false)
  const [showAd, setShowAd] = useState(false)
  const [adLoading, setAdLoading] = useState(false)
  const [adProgress, setAdProgress] = useState(0)
  const [adTimeLeft, setAdTimeLeft] = useState(5)
  const [referralCode, setReferralCode] = useState('')
  const [dailyReward, setDailyReward] = useState(false)
  const [dailyDay, setDailyDay] = useState(1)
  const [xp, setXp] = useState(0)
  const [level, setLevel] = useState(1)
  const [toast, setToast] = useState('')
  const [floatingReward, setFloatingReward] = useState(null)
  const [showLevelUp, setShowLevelUp] = useState(false)
  const [levelUpMessage, setLevelUpMessage] = useState('')
  const [missionStats, setMissionStats] = useState({
  adsWatched: 0,
  gamesPlayed: 0,
  dailyCollected: 0,
  invitedFriends: 0
})

 function showToast(text, reward = null) {
  setToast(text)

  if (reward) {
    setFloatingReward(reward)

    setTimeout(() => {
      setFloatingReward(null)
    }, 1200)
  }

  setTimeout(() => {
    setToast('')
  }, 2500)
}

  const multiplier =
    level >= 20 ? 2 :
    level >= 10 ? 1.5 :
    level >= 5 ? 1.2 :
    1

  const isAdmin = wallet?.is_admin === true

  useEffect(() => {
    setTimeout(() => {
      setLoading(false)
    }, 2000)
  }, [])

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
    setXp(walletData.wallet?.xp || 0)
    setLevel(walletData.wallet?.level || 1)
    console.log('WALLET RECEBIDA:', walletData.wallet)

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
      setPage('dashboard')
      await loadWallet(data.token)
      await loadReferrals(data.token)
    } else {
      showToast(data.error || 'Erro no login')
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

  function gainXP(amount = 10) {
    const newXP = xp + amount

    if (newXP >= 100) {
      setLevel(level + 1)
      setXp(newXP - 100)
      setLevelUpMessage(`🔥 LEVEL UP! Você chegou no nível ${level + 1}`)
      setShowLevelUp(true)

      setTimeout(() => {
        setShowLevelUp(false)
      }, 3000)
    } else {
      setXp(newXP)
    }
  }

  async function earnCoins(baseAmount = 50) {
    const finalAmount = Math.floor(baseAmount * multiplier)

    setRewardAnimation(true)

    await fetch('http://localhost:3000/earn-coins', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        amount: finalAmount
      })
    })

    await loadWallet(token)

    setMissionStats((prev) => ({
  ...prev,
  gamesPlayed: prev.gamesPlayed + 1
}))

    setTimeout(() => {
      setRewardAnimation(false)
    }, 1500)
  }

  async function rewardUser(baseAmount = 50) {
  const audio = new Audio(rewardSound)
  audio.play()

  gainXP(15)

  showToast('✅ Coins recebidos!', baseAmount)

  await earnCoins(baseAmount)
}

async function claimDailyReward() {
  try {
    console.log('CLICOU NA RECOMPENSA DIÁRIA')

    const response = await fetch('http://localhost:3000/daily-login', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    const data = await response.json()

    if (!response.ok) {
      showToast(data.error || 'Erro na recompensa diária')
      return
    }

    showToast(`🎁 +${data.reward} coins`, data.reward)
    setDailyReward(true)

    setDailyDay(data.streak_day)

    await loadWallet(token)

    setMissionStats((prev) => ({
  ...prev,
  dailyCollected: 1
}))

  } catch (error) {

    console.log(error)

    showToast('Erro na recompensa diária')

  }
}

  async function watchAd() {
  setShowAd(true)
  setAdLoading(true)
  setAdProgress(0)
  setAdTimeLeft(5)

  let progress = 0

  const interval = setInterval(() => {
    progress += 20

    setAdProgress(progress)
    setAdTimeLeft((prev) => prev - 1)

    if (progress >= 100) {
      clearInterval(interval)

      setAdLoading(false)

      rewardUser(100)

      setMissionStats((prev) => ({
        ...prev,
        adsWatched: prev.adsWatched + 1
      }))

      setTimeout(() => {
        setShowAd(false)
      }, 1500)
    }
  }, 1000)
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
    const response = await fetch('http://localhost:3000/admin/withdrawals', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    const data = await response.json()
    setAdminWithdrawals(data.withdrawals || [])
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

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a, #1e3a8a)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        color: 'white',
        fontFamily: 'Arial'
      }}>
        <div style={{
          width: 110,
          height: 110,
          borderRadius: 30,
          background: 'linear-gradient(135deg, #22c55e, #2563eb)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontSize: 48,
          boxShadow: '0 0 30px rgba(37,99,235,0.6)'
        }}>
          🎮
        </div>

        <h1 style={{ marginTop: 20, fontSize: 38 }}>
          PlayPIX
        </h1>

        {(toast || showLevelUp) && (
  <div style={{
    position: 'fixed',
    top: 20,
    left: '50%',
    transform: 'translateX(-50%)',
    background: '#22c55e',
    color: 'white',
    padding: '14px 22px',
    borderRadius: 14,
    fontWeight: 'bold',
    boxShadow: '0 0 25px rgba(34,197,94,0.45)',
    zIndex: 10000
  }}>
   {showLevelUp ? levelUpMessage : toast}
  </div>
)}

        <p style={{ color: '#cbd5e1' }}>
          Carregando...
        </p>
      </div>
    )
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
              style={{ width: '100%', padding: 12, marginBottom: 10 }}
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

          <input
            type="text"
            placeholder="Código de convite (opcional)"
            value={referralCode}
            onChange={(e) => setReferralCode(e.target.value)}
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
        <div style={{
          textAlign: 'center',
          width: 380,
          paddingBottom: 90
        }}>
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

          {showAd && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'rgba(0,0,0,0.85)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 9999
            }}>
              <div style={{
                background: '#111827',
                padding: 30,
                borderRadius: 20,
                textAlign: 'center',
                width: 320
              }}>
                {adLoading ? (
                  <>
                    <h2>📺 Anúncio</h2>

                    <p style={{ color: '#94a3b8', marginTop: 10 }}>
                      Assistindo anúncio...
                    </p>

                    <p style={{ color: '#22c55e', fontWeight: 'bold' }}>
                      {adTimeLeft}s restantes
                    </p>

                    <div style={{
                      marginTop: 20,
                      height: 10,
                      borderRadius: 999,
                      background: '#334155',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${adProgress}%`,
                        height: '100%',
                        background: '#22c55e',
                        transition: '0.5s'
                      }} />
                    </div>
                  </>
                ) : (
                  <>
                    <h2>✅ Recompensa recebida!</h2>

                    <p style={{
                      marginTop: 10,
                      color: '#22c55e',
                      fontWeight: 'bold'
                    }}>
                      +50 Coins adicionadas
                    </p>
                  </>
                )}
              </div>
            </div>
          )}

          {rewardAnimation && (
            <div style={{
              position: 'fixed',
              top: 100,
              right: 30,
              background: '#22c55e',
              color: 'white',
              padding: '14px 20px',
              borderRadius: 14,
              fontWeight: 'bold',
              boxShadow: '0 0 20px rgba(34,197,94,0.5)',
              zIndex: 9999
            }}>
              + Coins 🚀
            </div>
          )}

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
            {(wallet?.name || wallet?.email || 'U').charAt(0).toUpperCase()}
          </div>

          <h2 style={{ marginBottom: 5 }}>
            {wallet?.name || 'Usuário'}
          </h2>
          <p style={{ color: '#e2e8f0', fontWeight: 'bold' }}>
            {wallet?.email}
          </p>

          <div style={{
            background: '#1e293b',
            padding: 15,
            borderRadius: 12,
            marginBottom: 20
          }}>
            <p>Seu código de convite:</p>
            <strong>{wallet?.referral_code || 'Sem código ainda'}</strong>
          </div>

          {page === 'dashboard' && (
            <>
              <div style={{
                background: 'linear-gradient(135deg, #f59e0b, #f97316)',
                padding: 20,
                borderRadius: 20,
                marginBottom: 20,
                boxShadow: '0 0 20px rgba(249,115,22,0.35)'
              }}>
                <h2 style={{ margin: 0 }}>
                  🎁 Recompensa diária
                </h2>

                <p>Dia atual: {dailyDay}</p>

                <button
                  onClick={() => {
                window.open('https://omg10.com/4/11062330', '_blank')
                claimDailyReward()
              }}
                  disabled={dailyReward}
                  style={{
                    background: dailyReward ? '#475569' : '#111827',
                    color: 'white',
                    border: 'none',
                    padding: '12px 18px',
                    borderRadius: 12,
                    fontWeight: 'bold',
                    cursor: dailyReward ? 'not-allowed' : 'pointer',
                    marginTop: 10
                  }}
                >
                 {dailyReward ? 'Já coletado' : '🎁 Coletar + assistir anúncio'}
                </button>

                <div style={{
                  background: '#111827',
                  padding: 20,
                  borderRadius: 20,
                  marginTop: 20
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: 10
                  }}>
                    <strong>🔥 Level {level}</strong>

                    <span style={{ color: '#94a3b8' }}>
                      {xp}/100 XP
                    </span>
                  </div>

                  <div style={{
                    width: '100%',
                    height: 14,
                    background: '#1e293b',
                    borderRadius: 999,
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${xp}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #22c55e, #2563eb)',
                      transition: '0.4s'
                    }} />
                  </div>

                  <p style={{
                    color: '#22c55e',
                    marginTop: 10,
                    fontWeight: 'bold'
                  }}>
                    🚀 Multiplicador atual: x{multiplier}
                  </p>
                </div>
              </div>

              <TopBalanceCard wallet={wallet} />

            

              <OfferCard
                icon="📺"
                title="Assistir anúncio"
                reward={100}
                color="#2563eb"
                onClick={watchAd}
              />

              <OfferCard
                icon="🎮"
                title="Oferta especial"
                reward={250}
                color="#7c3aed"
              />

              <OfferCard
                icon="🔥"
                title="Missão diária"
                reward={50}
                color="#ea580c"
              />

              <div style={{
                background: '#1e293b',
                padding: 20,
                borderRadius: 12,
                marginTop: 20
              }}>
                <h2>Saque PIX</h2>

                <input
                  placeholder="Chave PIX"
                  value={pixKey}
                  onChange={(e) => setPixKey(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    marginBottom: 12,
                    borderRadius: 12,
                    border: 'none',
                    outline: 'none',
                    fontSize: 16,
                    boxSizing: 'border-box'
                  }}
                />

                <input
                  placeholder="Valor em coins"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    marginBottom: 12,
                    borderRadius: 12,
                    border: 'none',
                    outline: 'none',
                    fontSize: 16,
                    boxSizing: 'border-box'
                  }}
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

                <div
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    padding: 18,
                    borderRadius: 18,
                    marginTop: 18,
                    textAlign: 'center'
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      color: '#cbd5e1',
                      fontSize: 14
                    }}
                  >
                    💸 Último saque aprovado
                  </p>

                  <h3
                    style={{
                      marginTop: 10,
                      marginBottom: 0,
                      color: '#22c55e'
                    }}
                  >
                    R$ 32,00 via PIX
                  </h3>
                </div>
              </div>

              {isAdmin && (
                <button
                  onClick={() => {
                    setShowAdmin(!showAdmin)
                    loadAdminWithdrawals()
                  }}
                  style={{
                    padding: 12,
                    marginTop: 15,
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
                  <div key={item.id}>
                    <p>💸 {item.amount} Coins</p>
                    <p>Status: {item.status}</p>
                  </div>
                ))}
              </div>
            </>
          )}

          {page === 'missions' && (
            <MissionsPage missionStats={missionStats} />
          )}

          {page === 'profile' && (
            <ProfilePage wallet={wallet} />
          )}

          {page === 'games' && (
            <GamesPage earnCoins={rewardUser} />
          )}

          {page === 'ranking' && (
            <RankingPage
              ranking={ranking}
              referrals={referrals}
              setPage={setPage}
            />
          )}
        </div>
      )}

      {token && (
        <BottomMenu setPage={setPage} />
      )}
    </div>
  )
}


export default App 
