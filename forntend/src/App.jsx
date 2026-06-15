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
import { FaHome, FaGift, FaTrophy, FaGamepad, FaUser } from 'react-icons/fa'

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
  const [levelUpMessage, setLevelUpMessage] = useState('')
  const [isLoadingReward, setIsLoadingReward] = useState(false)
  const [missionStats, setMissionStats] = useState({
  adsWatched: 0,
  gamesPlayed: 0,
  dailyCollected: 0,
  invitedFriends: 0
})

const [claimedMissions, setClaimedMissions] = useState({})

useEffect(() => {
  if (!wallet?.email) return

  const saved = localStorage.getItem(`claimedMissions_${wallet.email}`)

  if (saved) {
    setClaimedMissions(JSON.parse(saved))
  }
}, [wallet?.email])

useEffect(() => {
  setMissionStats((prev) => ({
    ...prev,
    invitedFriends: referrals.length
  }))
}, [referrals])

function formatCooldown(ms) {
  const totalMinutes = Math.ceil(ms / 60000)

  if (totalMinutes >= 60) {
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60

    return minutes > 0
      ? `${hours}h ${minutes}min`
      : `${hours}h`
  }

  return `${totalMinutes} min`
}

function showToast(text) {
  setToast(text)

  setTimeout(() => {
    setToast('')
  }, 4000)
}

function playCoinSound() {
  const audio = new Audio('/coin.mp3')
  audio.volume = 0.35
  audio.play().catch(() => {})
}

    async function claimMission(type) {
  try {
    console.log('COLETANDO MISSÃO:', type)

    await AdMob.prepareRewardVideoAd({
      adId: 'ca-app-pub-7801244998804914/8539598471',
      isTesting: false
    })

    await AdMob.showRewardVideoAd()

    const response = await fetch(`${API_URL}/missions/claim`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ type })
    })

    const data = await response.json()

    console.log('RESPOSTA MISSÃO:', data)

if (!response.ok) {
  showToast(data.error || 'Erro ao receber missão')
  return
}

setWallet(data.wallet)
setXp(data.wallet?.xp || 0)
setLevel(data.wallet?.level || 1)

let updatedClaimedMissions = { ...claimedMissions }

if (type === 'daily_reward' || type === 'invite_friend') {
  updatedClaimedMissions[type] = true
}

setClaimedMissions(updatedClaimedMissions)

localStorage.setItem(
  `claimedMissions_${wallet?.email}`,
  JSON.stringify(updatedClaimedMissions)
)

if (type === 'watch_ads') {
  localStorage.setItem(`adsWatched_${wallet?.email}`, '0')

  setMissionStats((prev) => ({
    ...prev,
   adsWatched: 0
  }))
}

if (type === 'play_games') {
  localStorage.setItem(`gamesPlayed_${wallet?.email}`, '0')

  setMissionStats((prev) => ({
    ...prev,
    gamesPlayed: 0
  }))
}

      playSound('coin.mp3')

    showToast(`🎁 Missão concluída! +${data.reward} coins | +${data.xp} XP`)
  } catch (error) {
    console.log(error)
    showToast(error.message)
  }
}

function playSound(file, volume = 0.45) {
  const audio = new Audio(`/sounds/${file}`)
  audio.volume = volume
  audio.play().catch(() => {})
}

async function claimDailyReward() {
  try {
    const lastClaim = localStorage.getItem(
      `dailyRewardCooldown_${wallet?.email}`
    )

    if (lastClaim) {
      const diff = Date.now() - Number(lastClaim)
if (diff < 24 * 60 * 60 * 1000) {
  showToast('⏳ Recompensa já coletada hoje')
  setDailyReward(true)
  return
}
    }

    await AdMob.prepareRewardVideoAd({
      adId: 'ca-app-pub-7801244998804914/1001748176',
      isTesting: false
    })

    await AdMob.showRewardVideoAd()

    const response = await fetch(`${API_URL}/daily-login`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    const data = await response.json()

    console.log('DAILY RESPONSE:', data)
    console.log('DAILY WALLET DAILY_COLLECTED:', data.wallet?.daily_collected)
    
if (!response.ok) {
  showToast(data.error || 'Erro na recompensa diária')

  if (data.error?.includes('já coletada')) {
    setDailyReward(true)

    localStorage.setItem(
      `dailyRewardCooldown_${wallet?.email}`,
      Date.now()
    )

    setMissionStats((prev) => ({
      ...prev,
      dailyCollected: 1
    }))
  }

  return
}

playRewardSound()
showToast(`🎁 +${data.reward} coins | +${data.xp} XP`)

setDailyReward(true)

localStorage.setItem(
  `dailyRewardCooldown_${wallet?.email}`,
  Date.now()
)

setDailyDay(data.streak_day)

setMissionStats((prev) => ({
  ...prev,
  dailyCollected: 1
}))

if (data.wallet) {
  console.log('DAILY WALLET:', data.wallet)

  setWallet(data.wallet)
  setXp(data.wallet?.xp || 0)
  setLevel(data.wallet?.level || 1)
} else {
  await loadWallet(token)
}


  } catch (error) {
    console.log(error)
    showToast('Erro ao carregar anúncio')
  }
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

  const savedDailyRewardCooldown = localStorage.getItem(
    `dailyRewardCooldown_${wallet.email}`
  )

  if (savedDailyRewardCooldown) {
    const diff = Date.now() - Number(savedDailyRewardCooldown)

    if (diff < 24 * 60 * 60 * 1000) {
      setDailyReward(true)
    } else {
      setDailyReward(false)
      localStorage.removeItem(`dailyRewardCooldown_${wallet.email}`)
    }
  } else {
    setDailyReward(false)
  }

  setMissionStats({
    adsWatched: Number(wallet.ads_watched || 0),
    gamesPlayed: Number(wallet.games_played || 0),
    dailyCollected: Number(wallet.daily_collected || 0),
    invitedFriends: referrals.length
  })

  const savedClaimedMissions = localStorage.getItem(
    `claimedMissions_${wallet.email}`
  )

  const parsedMissions = savedClaimedMissions
    ? JSON.parse(savedClaimedMissions)
    : {}

 if (Number(wallet.daily_collected || 0) === 1) {
  parsedMissions.daily_reward = true
  setDailyReward(true)
}

  setClaimedMissions(parsedMissions)

  setWatchAdCooldown(Number(wallet?.watch_ad_cooldown || 0))
  setOfferCooldown(Number(wallet?.offer_cooldown || 0))
  setMissionCooldown(Number(wallet?.mission_cooldown || 0))

}, [wallet])

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

  setWatchAdCooldown(
    Number(data.wallet?.watch_ad_cooldown || 0)
  )

  setOfferCooldown(
    Number(data.wallet?.offer_cooldown || 0)
  )

  setMissionCooldown(
    Number(data.wallet?.mission_cooldown || 0)
  )
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

async function saveCooldown(type, cooldownEnd) {
  const response = await fetch(`${API_URL}/cooldown`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      type,
      cooldownEnd
    })
  })

  const data = await response.json()

  if (data.wallet) {
    setWallet(data.wallet)
  }
}

 async function earnCoins(baseAmount = 50, xpReward = 15, type = '') {
  if (isLoadingReward) return

  setIsLoadingReward(true)

  const finalAmount = baseAmount

  try {
    const response = await fetch(`${API_URL}/earn`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        amount: finalAmount,
        xpReward,
        type
      })
    })

    const data = await response.json()

    if (!response.ok) {
      console.log(data.error || 'Erro ao ganhar coins')
      return
    }

    if (data.wallet) {
      setWallet(data.wallet)
      setXp(data.wallet?.xp || 0)
      setLevel(data.wallet?.level || 1)

      setMissionStats((prev) => ({
        ...prev,
        adsWatched: Number(data.wallet.ads_watched || 0),
        gamesPlayed: Number(data.wallet.games_played || 0),
        dailyCollected: Number(data.wallet.daily_collected || 0)
      }))
    }

    await updateCoinsInSupabase(email, finalAmount)
  } catch (error) {
    console.log(error)
  }

  setIsLoadingReward(false)
}
  async function rewardUser(
  baseAmount = 50,
  xpReward = 15,
  type = '',
  showMessage = true
) {

 const audio = new Audio(rewardSound)
  audio.volume = 0.35
  audio.play().catch(() => {})

  
  await earnCoins(baseAmount, xpReward, type)

  if (showMessage) {
  showToast('✅ Coins recebidos!')
}
}

{dailyReward && (
  <div
    style={{
      background: 'rgba(34,197,94,.15)',
      border: '1px solid rgba(34,197,94,.4)',
      color: '#22c55e',
      padding: '12px 20px',
      borderRadius: 14,
      fontWeight: '800',
      display: 'inline-block',
      marginTop: 15
    }}
  >
    ✅ Já coletado
  </div>
)}

  async function watchAd() {
  if (!wallet?.email) {
    showToast('Carteira carregando, tente novamente')
    return
  }

  if (watchAdCooldown > Date.now()) {
    showToast('⏳ Aguarde o cooldown')
    return
  }

  try {
    await AdMob.initialize()

    await AdMob.prepareRewardVideoAd({
      adId: 'ca-app-pub-7801244998804914/5287085883',
      isTesting: false
    })

    await AdMob.showRewardVideoAd()

    playCoinSound()

   await earnCoins(50, 10, 'watch_ads')

    const cooldownEnd = Date.now() + 60 * 60 * 1000

    setWatchAdCooldown(cooldownEnd)

await saveCooldown('watch_ad', cooldownEnd)
  } catch (error) {
    console.log('ERRO WATCH AD:', error)
    showToast('Erro ao carregar anúncio')
  }
}

async function specialOffer() {

  if (offerCooldown > Date.now()) {
    showToast('⏳ Aguarde o cooldown')
    return
  }

  try {

    await AdMob.prepareRewardVideoAd({
      adId: 'ca-app-pub-7801244998804914/8539598471',
      isTesting: false
    })


    await AdMob.showRewardVideoAd()

    playCoinSound()

    await rewardUser(100, 15, 'watch_ads')
    

          const cooldownEnd =
        Date.now() + (6 * 60 * 60 * 1000)

      setOfferCooldown(cooldownEnd)

      await saveCooldown('offer', cooldownEnd)

        showToast('🎮 +100 coins recebidos!')

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
      adId: 'ca-app-pub-7801244998804914/8539598471',
      isTesting: false
    })

    await AdMob.showRewardVideoAd()

   await rewardUser(150, 25, 'watch_ads')

            const cooldownEnd =
          Date.now() + (24 * 60 * 60 * 1000)

        setMissionCooldown(cooldownEnd)

        await saveCooldown('mission', cooldownEnd)

    showToast('🔥 Missão diária concluída! +150 coins')

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
    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
    color: 'white',
    padding: '12px 18px',
    borderRadius: 18,
    fontWeight: '800',
    boxShadow: '0 0 18px rgba(34,197,94,0.35)',
    zIndex: 10000,
    width: 'fit-content',
    minWidth: 190,
    maxWidth: '78%',
    textAlign: 'center',
    fontSize: 18,
    lineHeight: 1.25
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
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                marginBottom: 28,
                marginTop: 10,
                position: 'relative',
                zIndex: 2
              }}
            >
              <span
                style={{
                  fontSize: 34,
                  filter: 'drop-shadow(0 0 8px rgba(59,130,246,.55))'
                }}
              >
                🎮
              </span>

              <h1
                style={{
                  margin: 0,
                  fontSize: 48,
                  fontWeight: 900,
                  color: '#ffffff',
                  letterSpacing: '-1.5px',
                  textShadow:
                    '0 0 10px rgba(255,255,255,.3), 0 0 28px rgba(37,99,235,.55)',
                  filter: 'drop-shadow(0 0 8px rgba(37,99,235,.35))'
                }}
              >
                PlayPIX
              </h1>
            </div>
         

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
                fontSize: 14,
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


            {showAd && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'rgba(248, 246, 246, 0.85)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 9999
            }}>
              <div style={{
                background: '#f2f4f7',
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

          
          <TopBalanceCard wallet={wallet} />

              <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              marginBottom: 20,
              marginTop: 6
            }}
          >
            <span
              style={{
                fontSize: 34,
                filter: 'drop-shadow(0 0 8px rgba(59,130,246,.55))'
              }}
            >
              🎮
            </span>

            <h1
              style={{
                margin: 0,
                fontSize: 20,
                fontWeight: 900,
                color: '#ffffff',
                letterSpacing: '-1.5px',
                textShadow:
                  '0 0 10px rgba(255,255,255,.3), 0 0 28px rgba(37,99,235,.55)',
                filter: 'drop-shadow(0 0 8px rgba(37,99,235,.35))'
              }}
            >
              PlayPIX
            </h1>
          </div>

       
            {(page === 'home' || page === 'profile') && (
          <div
        style={{
          width: '100%',
    maxWidth: 430,
    background:
      'linear-gradient(135deg, rgba(15,23,42,.96), rgba(6,78,59,.55))',
    border: '1px solid #22c55e',
    boxShadow: '0 0 24px rgba(34,197,94,0.28)',
    padding: 22,
    borderRadius: 24,
    marginTop: 10,
    marginBottom: 26,
    color: '#ffffff',
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16
  }}
>
  <div style={{ textAlign: 'left' }}>
    <div
      style={{
        fontSize: 17,
        fontWeight: '900',
        marginBottom: 8
      }}
    >
      👥 Convide Amigos
    </div>

    <div
      style={{
        fontSize: 14,
        fontWeight: '900',
        letterSpacing: 2,
        color: '#4ade80',
        marginBottom: 10,
        marginLeft: 40,
      }}
    >
      {wallet?.referral_code || wallet?.referralCode || '---'}
    </div>

    <div
      style={{
        color: '#cbd5e1',
        fontSize: 13,
        fontWeight: '700'
      }}
    >
      🎁 Ganhe bônus por cada indicação
                </div>
              </div>

              <div
                style={{
                  fontSize: 25,
                  color: '#4ade80',
                  filter: 'drop-shadow(0 0 10px rgba(74,222,128,.55))'
                }}
              >
                👤➕
              </div>
            </div>
            )}

          {page === 'dashboard' && (
            <>
             <div style={{
                width: '100%',
                background:
                  'linear-gradient(135deg, rgba(15,23,42,.96), rgba(30,41,59,.96))',
                border: '2px solid rgba(250,204,21,.75)',
                boxShadow: '0 0 30px rgba(250,204,21,.20)',
                borderRadius: 26,
                padding: 18,
                marginBottom: 22,
                boxSizing: 'border-box',
                position: 'relative'
              }}>
                <h2 style={{ margin: 0 }}>
                  <div
                  style={{
                    fontSize: 22,
                    fontWeight: '700',
                    color: '#fff',
                    marginLeft: -100,
                  }}
                >
                  🎁 Recompensa diária
                </div>

                </h2>

<div
  style={{
    position: 'absolute',
    top: 12,
    right: 10,
  }}
>
  {dailyReward ? (
    <div
      style={{
        background: 'rgba(34,197,94,.15)',
        border: '1px solid rgba(181, 197, 34, 0.4)',
        color: '#f0ec0c',
        padding: '8px 14px',
        borderRadius: 12,
        fontWeight: '800',
        fontSize: 10
      }}
    >
      ✅ Já coletado
    </div>
  ) : (
    <button
      onClick={claimDailyReward}
      style={{
        background: '#ecca04',
        border: 'none',
        color: '#fff',
        padding: '8px 16px',
        borderRadius: 12,
        fontWeight: '800',
        cursor: 'pointer'
      }}
    >
      🎁 Coletar
    </button>
  )}
</div>

                <div style={{
                  background:
                    'linear-gradient(135deg, rgba(15,23,42,.96), rgba(6,78,59,.35))',
                  padding: 20,
                  borderRadius: 20,
                  marginTop: 20,
                  border: '1px solid rgba(217, 231, 11, 0.25)',
                  boxShadow: '0 0 20px rgba(34,197,94,.12)'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: 10
                  }}>
                    <strong>🔥 Level {wallet?.level || 1}</strong>
                    <span style={{ color: '#94a3b8' }}>
                      {wallet?.xp || 0}/100 XP
                    </span>
                  </div>

                  <div style={{
                    width: '100%',
                    height: 14,
                    background: 'rgba(255,255,255,.10)',
                    borderRadius: 999,
                    overflow: 'hidden'
                  }}>
                    
                    <div style={{
                      width: `${(wallet?.xp || 0) / 100 * 100}%`,
                      height: '100%',
                     background: 'linear-gradient(90deg, #22c55e, #facc15)',
                      transition: '0.4s'
                    }} />
                  </div>

                  <p style={{
                    color: '#fdc200',
                    marginTop: 10,
                    fontWeight: 'bold'
                  }}>

                  </p>

                 </div>
              </div>

  <OfferCard
  icon="📺"
  title="Assistir anúncio"
  reward={50}
  color="#2563eb"
  onClick={watchAd}
  locked={watchAdCooldown > Date.now()}
  lockText={`⏳ ${Math.ceil((watchAdCooldown - Date.now()) / 60000)} min`}
/>

<OfferCard
  icon="🎮"
  title="Oferta especial"
  reward={100}
  color="#9333ea"
  onClick={specialOffer}
  locked={offerCooldown > Date.now()}
  lockText={`⏳ ${formatCooldown(offerCooldown - Date.now())}`}
/>

<OfferCard
  icon="🔥"
  title="Missão diária"
  reward={150}
  color="#f97316"
  onClick={dailyOfferMission}
  locked={missionCooldown > Date.now()}
  lockText={`⏳ ${formatCooldown(missionCooldown - Date.now())}`}
/>

              
            </>
          )}

      {page === 'missions' && (
  <MissionsPage
    missionStats={missionStats}
    claimMission={claimMission}
    claimedMissions={claimedMissions}
    dailyReward={dailyReward}
  />
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
