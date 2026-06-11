import AnimatedCoins from './AnimatedCoins'

export default function TopBalanceCard({ wallet }) {
  const coins = wallet?.coins || 0
  const realBalance = (coins * 0.00025).toFixed(2)

  const streak = Number(wallet?.streak_day || wallet?.streakDay || 0)
const targetDays = 7
const currentDay = Math.min(streak, targetDays)
const remainingDays = Math.max(0, targetDays - currentDay)

const progressBars = [1, 2, 3, 4, 5]
const filledBars = Math.min(5, Math.ceil((currentDay / targetDays) * 5))

 return (
  <div
    style={{
      width: '100%',
      minHeight: 50,
      background: 'transparent',
      borderRadius: 15,
      padding: '5px 8px',
      marginBottom: 15,
      display: 'grid',
      gridTemplateColumns: '1.1fr 1.8fr 1.1fr',
      alignItems: 'center',
      gap: 8,
      boxSizing: 'border-box'
    }}
  >
    <div
      style={{
        background: 'linear-gradient(135deg, rgba(15,23,42,.96), rgba(30,41,59,.96))',
        borderRadius: 16,
        padding: '10px 8px',
        textAlign: 'center',
        border: '1px solid rgba(59,130,246,.5)',
        boxShadow: '0 0 10px rgba(37,99,235,.20), 0 0 25px rgba(37,99,235,.15)',
        textShadow: '0 0 8px rgba(255,255,255,.25)'
      }}
    >
      <div style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>
        💰 Coins
      </div>

      <div style={{ fontSize: 12, fontWeight: '900', color: '#fff' }}>
        <AnimatedCoins value={coins} />
      </div>

      <div style={{ color: '#cbd5e1', fontSize: 13 }}>
        ≈ R$ {realBalance}
      </div>
    </div>

    <div
      style={{
        background: 'linear-gradient(135deg, rgba(15,23,42,.96), rgba(30,41,59,.96))',
        color: '#ffffff',
        borderRadius: 16,
        padding: '10px 14px',
        textAlign: 'center',
        fontWeight: 'bold',
        border: '1px solid rgba(59,130,246,.5)',
        boxShadow: '0 0 10px rgba(37,99,235,.20), 0 0 25px rgba(37,99,235,.15)',
        textShadow: '0 0 8px rgba(255,255,255,.25)'
      }}
    >
      <div style={{ fontSize: 11 }}>⏳ Próximo saque</div>

      <div style={{ marginTop: 4, fontSize: 16 }}>
        {remainingDays === 0
          ? 'Saque liberado'
          : `Faltam ${remainingDays} dia${remainingDays > 1 ? 's' : ''}`}
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 5,
          marginTop: 8
        }}
      >
        {[1, 2, 3, 4, 5].map((item) => (
          <div
            key={item}
            style={{
              width: 20,
              height: 7,
              borderRadius: 99,
              background: item <= filledBars ? '#fff' : 'rgba(0,0,0,.22)'
            }}
          />
        ))}
      </div>

      <div style={{ marginTop: 4, fontSize: 12 }}>
        Dia {currentDay} de {targetDays}
      </div>
    </div>

    <div
      style={{
        background: 'linear-gradient(135deg, rgba(15,23,42,.96), rgba(30,41,59,.96))',
        borderRadius: 16,
        padding: '10px 8px',
        textAlign: 'center',
        border: '1px solid rgba(59,130,246,.5)',
        boxShadow: '0 0 10px rgba(37,99,235,.20), 0 0 25px rgba(37,99,235,.15)',
        textShadow: '0 0 8px rgba(255,255,255,.25)'
      }}
    >
      <div style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>
        💵 Saldo
      </div>

      <div style={{ fontSize: 12, fontWeight: '900', color: '#4ade80' }}>
        R$ {realBalance}
      </div>

      <div style={{ color: '#cbd5e1', fontSize: 13 }}>
        Saque PIX
      </div>
    </div>
  </div>
)
}