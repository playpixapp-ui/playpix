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
  const [withdrawals, setWithdrawals] = useState([])
  const [adminWithdrawals, setAdminWithdrawals] = useState([])
  const [showAdmin, setShowAdmin] = useState(false)
  const [name, setName] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const [ranking, setRanking] = useState([])
  const [page, setPage] = useState('dashboard')
  const [watchAdCooldown, setWatchAdCooldown] = useState(0)
  const [offerCooldown, setOfferCooldown] = useState(0)
  const [missionCooldown, setMissionCooldown] = useState(0)


  const [referrals, setReferrals] = useState([])
  const [loading, setLoading] = useState(true)
  const monetagLink = 'https://omg10.com/4/11062330'
  const [adCooldown, setAdCooldown] = useState(false)

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

  const [showLevelUp, setShowLevelUp] = useState(false)
  const [recoveringXP, setRecoveringXP] = useState(false)
  const [levelUpMessage, setLevelUpMessage] = useState('')
  const [isLoadingReward, setIsLoadingReward] = useState(false)
  const [missionStats, setMissionStats] = useState({
  adsWatched: 0,
  gamesPlayed: 0,
  dailyCollected: 0,
  invitedFriends: 0
})

function showToast(text) {
  setToast(text)

  setTimeout(() => {
    setToast('')
  }, 4000)
}

  async function testSupabase() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')

    console.log('SUPABASE DATA:', data)
    console.log('SUPABASE ERROR:', error)
  }

     useEffect(() => {

      AdMob.initialize({
        testingDevices: [],
        initializeForTesting: false,
      })

      testSupabase()

    }, [])

    useEffect(() => {
  if (!wallet?.email) return

  const savedWatchAdCooldown = localStorage.getItem(
    `watchAdCooldown_${wallet.email}`
  )

  setWatchAdCooldown(
    savedWatchAdCooldown ? Number(savedWatchAdCooldown) : 0
  )

  const savedOfferCooldown = localStorage.getItem(
    `offerCooldown_${wallet.email}`
  )

  setOfferCooldown(
    savedOfferCooldown ? Number(savedOfferCooldown) : 0
  )

  const savedMissionCooldown = localStorage.getItem(
    `missionCooldown_${wallet.email}`
  )

  setMissionCooldown(
    savedMissionCooldown ? Number(savedMissionCooldown) : 0
  )
}, [wallet?.email])

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
  console.log('WALLET RECEBIDA:', data.wallet)

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

async function checkGameCooldown(gameName) {
  const response = await fetch(`${API_URL}/game-cooldown/${gameName}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  return await response.json()
}

async function saveGameCooldown(gameName, minutes = 60) {
  const response = await fetch(`${API_URL}/game-cooldown`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      gameName,
      minutes
    })
  })

  return await response.json()
}

  async function earnCoins(baseAmount = 50, xpReward = 15) {
  if (isLoadingReward) return

  setIsLoadingReward(true)

  const finalAmount = Math.floor(baseAmount * multiplier)

  try {
        const response = await fetch(`${API_URL}/earn`, {
      method: 'POST',  
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        amount: finalAmount,
        xpReward: xpReward
      })
    })

    const data = await response.json()

    if (!response.ok) {
      console.log(data.error || 'Erro ao ganhar coins')
      return
    }

    if (data.wallet) {
      setWallet(data.wallet)
    }

    await updateCoinsInSupabase(email, finalAmount)

    setMissionStats((prev) => ({
      ...prev,
      gamesPlayed: prev.gamesPlayed + 1
    }))

    
  } catch (error) {
    console.log(error)
  }

  setIsLoadingReward(false)
}

  async function rewardUser(baseAmount = 50, xpReward = 15) {

  const audio = new Audio(rewardSound)
  audio.play()

  
  await earnCoins(baseAmount, xpReward)
  showToast('✅ Coins recebidos!')
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

    const response = await fetch(`${API_URL}/daily-login`, {
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

  if (watchAdCooldown > Date.now()) {
    showToast('⏳ Aguarde o cooldown')
    return
  }

  try {

    await AdMob.prepareRewardVideoAd({
      adId: 'ca-app-pub-7126948102674899/6186090810',
      isTesting: false
    })

    await AdMob.showRewardVideoAd()

    await earnCoins(100, 15)

    const cooldownEnd = Date.now() + (60 * 60 * 1000)

    setWatchAdCooldown(cooldownEnd)

    localStorage.setItem(
      `watchAdCooldown_${wallet?.email}`,
      cooldownEnd
    )

  } catch (error) {

    console.log(error)

    showToast('Erro ao carregar anúncio')

  }
}

async function recoverXP() {
  if (recoveringXP) return

  if ((wallet?.xp || 0) < 100) {
    showToast('🔒 Encha a barra de XP primeiro')
    return
  }

  try {
    setRecoveringXP(true)

    await AdMob.prepareRewardVideoAd({
      adId: 'ca-app-pub-7126948102674899/6186090810',
      isTesting: false
    })

    await AdMob.showRewardVideoAd()

    const response = await fetch(`${API_URL}/recover-xp`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    const data = await response.json()

    console.log('RECOVER XP RESPONSE:', data)

    if (!response.ok) {
      showToast(data.error || 'Erro ao recuperar XP')
      return
    }

    if (data.wallet) {
      setWallet(data.wallet)
    }

    showToast('🚀 Level aumentado!')

  } catch (error) {
    console.log(error)
    showToast('Erro ao carregar anúncio')
  } finally {
    setRecoveringXP(false)
  }
}

async function specialOffer() {

  if (offerCooldown > Date.now()) {
    showToast('⏳ Aguarde o cooldown')
    return
  }

  try {

    await AdMob.prepareRewardVideoAd({
      adId: 'ca-app-pub-7126948102674899/6186090810',
      isTesting: false
    })

    await AdMob.showRewardVideoAd()

    await rewardUser(250, 25)
    

    const cooldownEnd =
      Date.now() + (6 * 60 * 60 * 1000)

    setOfferCooldown(cooldownEnd)

    localStorage.setItem(
      `offerCooldown_${wallet?.email}`,
      cooldownEnd
    )

    showToast('🎮 +250 coins recebidos!')

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

  async function dailyOfferMission() {
  if (missionCooldown > Date.now()) {
    showToast('⏳ Aguarde o cooldown')
    return
  }

  try {
    await AdMob.prepareRewardVideoAd({
      adId: 'ca-app-pub-7126948102674899/6186090810',
      isTesting: false
    })

    await AdMob.showRewardVideoAd()

    await rewardUser(50, 10)

    const cooldownEnd = Date.now() + (24 * 60 * 60 * 1000)

    setMissionCooldown(cooldownEnd)

    localStorage.setItem(
      `missionCooldown_${wallet?.email}`,
      cooldownEnd
    )

    showToast('🔥 Missão diária concluída! +50 coins')
  } catch (error) {
    console.log(error)
    showToast('Erro ao carregar anúncio')
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
  await loadWithdrawals(token)
}

  async function loadRanking() {
  try {
    const response = await fetch(`${API_URL}/ranking`)
    const data = await response.json()

    console.log('RANKING RECEBIDO:', data)

    const rankingList = Array.isArray(data)
      ? data
      : data.ranking || []

    setRanking(rankingList)
    setPage('ranking')
  } catch (error) {
    console.log('Erro ao carregar ranking:', error)
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
            maxWidth: 430,
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

          
          <p style={{ color: '#94a3b8' }}>
            Ganhe coins, acompanhe seu saldo e solicite saques PIX.
          </p>


          <div
            style={{
              width: '100%',
              maxWidth: 200,
              background:
                'linear-gradient(135deg, rgba(34,197,94,0.45), rgba(20,83,45,0.25), rgba(2,6,23,0.95))',
              border: '1px solid #22c55e',
              boxShadow: '0 0 28px rgba(34,197,94,0.45)',
              padding: 20,
              borderRadius: 18,
              marginBottom: 22,
              textAlign: 'center',
              color: '#ffffff'
            }}
          >
              <div
                style={{
                  fontSize: 16,
                  fontWeight: '800',
                  marginBottom: 5
                }}
              >
                👥 Convide Amigos
              </div>

              <div
                style={{
                  fontSize: 20,
                  fontWeight: '700',
                  letterSpacing: 2,
                  marginBottom: 10,
                  color: '#4ade80'
                }}
              >
                {wallet?.referral_code || wallet?.referralCode || '---'}
              </div>

              <div
                style={{
                  color: '#cbd5e1',
                  fontSize: 12
                }}
              >
                🎁 Ganhe bônus por cada indicação
              </div>
            </div>

          {page === 'dashboard' && (
            <>
              <div style={{
                background: 'linear-gradient(135deg, #f59e0b, #f97316)',
                padding: 15,
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
                    <strong>🔥 Level {wallet?.level || 1}</strong>
                    <span style={{ color: '#94a3b8' }}>
                      XP: {wallet?.xp} | Tipo: {typeof wallet?.xp}
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
                      width: `${(wallet?.xp || 0) / 100 * 100}%`,
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

                    🚀 Multiplicador atual: x{wallet?.multiplier || 1}

                   <button
  onClick={recoverXP}
  disabled={recoveringXP || Number(wallet?.xp || 0) < 100}
  style={{
    marginTop: 12,
    width: '100%',
    padding: 12,
    border: 'none',
    borderRadius: 12,
    background:
      Number(wallet?.xp || 0) >= 100
        ? '#22c55e'
        : '#64748b',
    color: 'white',
    fontWeight: 'bold',
    cursor:
      Number(wallet?.xp || 0) >= 100
        ? 'pointer'
        : 'not-allowed'
  }}
>
  {recoveringXP
    ? 'Carregando...'
    : Number(wallet?.xp || 0) >= 100
      ? '⚡ Recuperar XP'
      : '🔒 Encha a barra de XP'}
</button>
                  </p>

                 </div>
              </div>

  <OfferCard
  icon="📺"
  title="Assistir anúncio"
  reward={100}
  color="#2563eb"
  onClick={watchAd}
  locked={watchAdCooldown > Date.now()}
  lockText={`⏳ ${Math.ceil((watchAdCooldown - Date.now()) / 60000)} min`}
/>

<OfferCard
  icon="🎮"
  title="Oferta especial"
  reward={250}
  color="#9333ea"
  onClick={specialOffer}
  locked={offerCooldown > Date.now()}
  lockText={`⏳ ${Math.ceil((offerCooldown - Date.now()) / 60000)} min`}
/>

<OfferCard
  icon="🔥"
  title="Missão diária"
  reward={50}
  color="#f97316"
  onClick={dailyOfferMission}
  locked={missionCooldown > Date.now()}
  lockText={`⏳ ${Math.ceil((missionCooldown - Date.now()) / 60000)} min`}
/>

              
            </>
          )}

          {page === 'missions' && (
            <MissionsPage missionStats={missionStats} />
          )}

          {page === 'profile' && (
            <>
              <ProfilePage
  wallet={wallet}
  showToast={showToast}
  setShowAdmin={(value) => {
    setShowAdmin(value)

    if (value) {
      loadAdminWithdrawals()
    }
  }}
/>
              {showAdmin && wallet?.is_admin && (
                <div
                  style={{
                    background: '#1e293b',
                    padding: 20,
                    borderRadius: 12,
                    marginTop: 20,
                    width: '100%'
                  }}
                >
                  <h2>Painel Admin</h2>

                  {adminWithdrawals.length === 0 ? (
                    <p>Nenhum saque pendente.</p>
                  ) : (
                    adminWithdrawals.map((item) => (
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
                    ))
                  )}
                </div>
              )}
            </>
          )}

          {page === 'games' && (
  <GamesPage
    earnCoins={rewardUser}
    wallet={wallet}
    checkGameCooldown={checkGameCooldown}
    saveGameCooldown={saveGameCooldown}
  />
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
        <BottomMenu
  setPage={setPage}
  loadRanking={loadRanking}
/>
      )}
    </div>
  )
}


export default App 
