export default function MissionsPage({ missionStats }) {

const missions = [
  {
    title: '📺 Assistir 5 anúncios',
    progress: missionStats.adsWatched,
    total: 5,
    reward: 200
  },
  {
    title: '🎮 Jogar 3 partidas',
    progress: missionStats.gamesPlayed,
    total: 3,
    reward: 150
  },
  {
    title: '🎁 Coletar recompensa diária',
    progress: missionStats.dailyCollected,
    total: 1,
    reward: 100
  },
  {
    title: '👥 Convidar 1 amigo',
    progress: missionStats.invitedFriends,
    total: 1,
    reward: 1000
  }
]

  return (
    <div style={{ marginTop: 20 }}>
      <h2
        style={{
          textAlign: 'center',
          fontSize: 32,
          marginBottom: 20
        }}
      >
        🎯 Missões
      </h2>

      {missions.map((mission, index) => {
        const percent = Math.min((mission.progress / mission.total) * 100, 100)
        const completed = mission.progress >= mission.total

        return (
          <div

            key={index}
            style={{
            background:
              index === 0
                ? 'linear-gradient(135deg, #2563eb, #3b82f6)'
                : index === 1
                ? 'linear-gradient(135deg, #7c3aed, #9333ea)'
                : index === 2
                ? 'linear-gradient(135deg, #ea580c, #f97316)'
                : 'linear-gradient(135deg, #059669, #10b981)',

               maxWidth: 270,
              marginLeft: 'auto',
              marginRight: 'auto',

            padding: 30,
            borderRadius: 24,
            marginTop: 18,

           boxShadow: '0 10px 35px rgba(0,0,0,0.35)',
          color: 'white'
          }}
          >
            <h3
            style={{
              margin: 0,
              fontSize: 26,
              fontWeight: '800'
            }}
          >
              {mission.title}
            </h3>

            <p
                style={{
                  color: 'rgba(255,255,255,0.85)',
                  fontSize: 18
                }}
              >
              Progresso: {mission.progress}/{mission.total}
            </p>

            <div style={{
              width: '100%',
              height: 12,
              background: 'rgba(15,23,42,0.35)',
              borderRadius: 999,
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${percent}%`,
                height: '100%',
                background: completed
              ? 'linear-gradient(90deg, #22c55e, #4ade80)'
              : 'linear-gradient(90deg, #38bdf8, #2563eb)',
                transition: '0.4s'
              }} />
            </div>

             {index >= 2 ? (
  <div
    style={{
      marginTop: 14,
      width: '100%',
      padding: 12,
      borderRadius: 12,
      fontWeight: 'bold',
      color: '#facc15',
      textAlign: 'center'
    }}
  >
    🔒 Em breve
  </div>
) : (
  <button
  disabled={!completed}
  style={{
    marginTop: 18,
    width: '72%',
    padding: '14px 18px',
    border: 'none',
    borderRadius: 18,
    fontWeight: '900',
    fontSize: 17,
    cursor: completed ? 'pointer' : 'default',
    display: 'block',
    marginLeft: 'auto',
    marginRight: 'auto',
    background: completed
      ? '#ffffff'
      : 'rgba(15,23,42,0.45)',
    color: completed
      ? '#111827'
      : '#ffffff',
    boxShadow: completed
      ? '0 0 18px rgba(255,255,255,0.35)'
      : 'inset 0 0 12px rgba(0,0,0,0.18)'
  }}
>
  {completed
    ? `🚀 COLETAR ${mission.reward} COINS`
    : `🏆 ${mission.reward} COINS`}
</button>
)}
          </div>
        )
      })}
    </div>
  )
}