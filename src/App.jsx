import { useState, useEffect } from 'react'
import TopBalanceCard from './components/TopBalanceCard'
import ProgressCard from './components/ProgressCard'
import OfferCard from './components/OfferCard'
import BottomMenu from './components/BottomMenu'
import MissionsPage from './components/MissionsPage'
import ProfilePage from './components/ProfilePage'
import RankingPage from './components/RankingPage'
import GamesPage from './components/GamesPage'
import { supabase } from './lib/supabase'

import { AdMob, RewardAdPluginEvents, BannerAdPosition, BannerAdSize } from '@capacitor-community/admob'

const rewardSound = '/coin.mp3'
const API_URL = 'https://playpix-backend.onrender.com'

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
  const [adCooldown, setAdCooldown] = useState(false)

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
  const [isLoadingReward, setIsLoadingReward] = useState(false)
  const [missionStats, setMissionStats] = useState({
  adsWatched: 0,
  gamesPlayed: 0,
  dailyCollected: 0,
  invitedFriends: 0
})

  async function testSupabase() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')

    console.log('SUPABASE DATA:', data)
    console.log('SUPABASE ERROR:', error)
  }

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
    useEffect(() => {

      AdMob.initialize({
        testingDevices: [],
        initializeForTesting: true
      })

      testSupabase()

    }, [])

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
    const response = await fetch(`${API_URL}/referrals`, {
      headers: {
        Authorization: `Bearer ${userToken}`
      }
    })

    const data = await response.json()
    setReferrals(data.referrals || [])
  }

  async function loadWallet(userToken) {
  const response = await fetch(`${API_URL}/wallet`, {
    headers: {
      Authorization: `Bearer ${userToken}`
    }
  })

  const data = await response.json()

  if (response.ok) {
    setWallet(data.wallet)
    setXp(data.wallet?.xp || 0)
    setLevel(data.wallet?.level || 1)
  }
}

    async function saveProfileToSupabase(userEmail) {
  const { data: existing } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', userEmail)
    .maybeSingle()

  if (existing) return

  const { error } = await supabase
    .from('profiles')
    .insert([
      {
        email: userEmail,
        coins: 0
      }
    ])

  if (error) {
    console.log('ERRO AO SALVAR PROFILE:', error)
  } else {
    console.log('✅ PROFILE SALVO NO SUPABASE')
  }
}
async function updateCoinsInSupabase(userEmail, coinsToAdd) {
  const { data: profile, error: selectError } = await supabase
    .from('profiles')
    .select('coins')
    .eq('email', userEmail)
    .maybeSingle()

  if (selectError) {
    console.log('ERRO AO BUSCAR COINS:', selectError)
    return
  }

  const currentCoins = Number(profile?.coins || 0)
  const newCoins = currentCoins + Number(coinsToAdd)

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ coins: newCoins })
    .eq('email', userEmail)

  if (updateError) {
    console.log('ERRO AO ATUALIZAR COINS:', updateError)
  } else {
    console.log(`✅ COINS ATUALIZADOS NO SUPABASE: ${newCoins}`)
  }
}

   async function register() {
  const response = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name,
      email,
      password,
      referralCode
    })
  })

  const data = await response.json()

  if (response.ok) {
    await saveProfileToSupabase(email)

    setMessage('Conta criada com sucesso! 🚀')
    setIsRegister(false)
  } else {
    setMessage(data.error || 'Erro ao cadastrar')
  }
}

  async function login() {
    const response = await fetch(`${API_URL}/login`, {
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
  const response = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name,
      email,
      password,
      referralCode
    })
  })

  const data = await response.json()

  if (response.ok) {
    await saveProfileToSupabase(email)

    setMessage('Conta criada com sucesso! 🚀')
    setIsRegister(false)
  } else {
    setMessage(data.error || 'Erro ao cadastrar')
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

  setWallet(prev => {

    const currentXP = prev.xp || 0
    const currentLevel = prev.level || 1

    let newXP = currentXP + amount
    let newLevel = currentLevel
    let newMultiplier = prev.multiplier || 1

    while (newXP >= 100) {
      newXP -= 100
      newLevel += 1
      newMultiplier += 0.2

      showToast(`🚀 Level ${newLevel} alcançado!`)
    }

    async function showRewardAd() {
  try {

    await AdMob.initialize()

    const options = {
      adId: 'ca-app-pub-3940256099942544/5224354917',
      isTesting: true
    }

    await AdMob.prepareRewardVideoAd(options)
    await AdMob.showRewardVideoAd()

    const response = await fetch(`${API_URL}/earn`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        amount: 10
      })
    })

    const data = await response.json()

    if (response.ok) {
      showToast('🎉 +10 coins')
      await loadWallet(token)
    }

  } catch (err) {
    console.log(err)
    showToast('Erro ao abrir anúncio')
  }
}

    return {
      ...prev,
      xp: newXP,
      level: newLevel,
      multiplier: Number(newMultiplier.toFixed(1))
    }
  })
}
  async function earnCoins(baseAmount = 50) {
  if (isLoadingReward) return

  setIsLoadingReward(true)

  const finalAmount = Math.floor(baseAmount * multiplier)

  try {
    await fetch(`${API_URL}/earn`, {
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
    await updateCoinsInSupabase(email, finalAmount)

    setMissionStats((prev) => ({
      ...prev,
      gamesPlayed: prev.gamesPlayed + 1
    }))

    setRewardAnimation(true)

    setTimeout(() => {
      setRewardAnimation(false)
    }, 1500)

  } catch (error) {
    console.log(error)
  }

  setIsLoadingReward(false)
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
    const lastClaim = localStorage.getItem(
  `dailyRewardCooldown_${wallet?.email}`
)

if (lastClaim) {
  const diff = Date.now() - Number(lastClaim)

  if (diff < 60000) {
    showToast('⏳ Aguarde 1 minuto para coletar novamente')
    return
  }
}

    const response = await fetch(`${API_URL}/login`, {
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
    localStorage.setItem(`dailyRewardCooldown_${wallet?.email}`, Date.now())
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

  try {

    await AdMob.prepareRewardVideoAd({
      adId: 'ca-app-pub-3940256099942544/5224354917',
      isTesting: true
    })

    await AdMob.showRewardVideoAd()

    rewardUser(100)

  } catch (error) {

    console.log(error)

    showToast('Erro ao carregar anúncio')

  }
}
  async function dailyLoginMission() {
    const response = await fetch(`${API_URL}/daily-login`, {
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
    alert('Informe uma chave PIX válida')
    return
  }

  const response = await fetch(`${API_URL}/withdraw`, {
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

    setPixKey('')
    setAmount('')

    await loadWallet(token)
  } else {
    alert(data.error || 'Erro ao sacar')
  }
}

  async function loadAdminWithdrawals() {
    const response = await fetch(`${API_URL}/admin/withdrawals`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    const data = await response.json()
    setAdminWithdrawals(data.withdrawals || [])
  }

  async function approveWithdrawal(id) {
    await fetch(`${API_URL}/admin/approve-withdrawal/${id}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    await loadAdminWithdrawals()
    await loadWallet(token)
  }

  async function loadRanking() {
  const response = await fetch(`${API_URL}/ranking`)

  const data = await response.json()

  if (response.ok) {
    setRanking(data.ranking || [])
    setPage('ranking')
  }
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
        minHeight: '100dvh',
        background: '#0f172a',
        color: 'white',
        fontFamily: 'Arial',
        padding: token ? 16 : 0,
        boxSizing: 'border-box'
      }}>
      {!token ? (
        <div style={{
          minHeight: '100dvh',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
          boxSizing: 'border-box'
        }}>
          <div style={{
            textAlign: 'center',
            width: '100%',
            maxWidth: 320,
            background: 'transparent',
            padding: '20px',
            borderRadius: 20,
            boxShadow: '0 0 25px rgba(0,0,0,0.4)',
            boxSizing: 'border-box'
          }}>
          <h1>🎮 PlayPIX</h1>
         

          <input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
            width: '100%',
            height: 46,
            padding: '0 14px',
            marginBottom: 12,
            borderRadius: 8,
            border: '1px solid #cbd5e1',
            fontSize: 16,
            boxSizing: 'border-box'
          }}
          />

          <input
            placeholder="Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
            width: '100%',
            height: 46,
            padding: '0 14px',
            marginBottom: 12,
            borderRadius: 8,
            border: '1px solid #cbd5e1',
            fontSize: 16,
            boxSizing: 'border-box'
          }}
          />

          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
            width: '100%',
            height: 46,
            padding: '0 14px',
            marginBottom: 12,
            borderRadius: 8,
            border: '1px solid #cbd5e1',
            fontSize: 16,
            boxSizing: 'border-box'
          }}
          />

          {isRegister && (
            <input
              type="text"
              placeholder="Código de convite (opcional)"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
              style={{
                width: '100%',
                height: 46,
                padding: '0 14px',
                marginBottom: 12,
                borderRadius: 8,
                border: '1px solid #cbd5e1',
                fontSize: 16,
                boxSizing: 'border-box'
              }}
            />
          )}

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
        </div>
      ) : (

        <div style={{
          textAlign: 'center',
          width: '100%',
          maxWidth: 430,
          margin: '0 auto',
          paddingBottom: 90,
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
       
          <h1>Dashboard 🚀</h1>

          <p>💰 Coins totais: {wallet?.coins || 0}</p>

        <p>
          ≈ R$ {(((wallet?.coins || 0) / 1000) * 0.25).toFixed(2)}
        </p>

        <small>1000 coins = R$ 0,25</small>

          <p>Usuário logado com sucesso</p>

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
            <strong>{wallet?.referral_code || wallet?.referralCode || 'Sem código ainda'}</strong>
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
            <GamesPage earnCoins={rewardUser} wallet={wallet} />
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
