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
      <h2>🎯 Missões</h2>

      {missions.map((mission, index) => {
        const percent = Math.min((mission.progress / mission.total) * 100, 100)
        const completed = mission.progress >= mission.total

        return (
          <div
            key={index}
            style={{
              background: '#1e293b',
              padding: 18,
              borderRadius: 18,
              marginTop: 14,
              boxShadow: '0 0 15px rgba(0,0,0,0.25)'
            }}
          >
            <h3 style={{ margin: 0 }}>
              {mission.title}
            </h3>

            <p style={{ color: '#94a3b8' }}>
              Progresso: {mission.progress}/{mission.total}
            </p>

            <div style={{
              width: '100%',
              height: 12,
              background: '#334155',
              borderRadius: 999,
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${percent}%`,
                height: '100%',
                background: completed ? '#22c55e' : '#3b82f6',
                transition: '0.4s'
              }} />
            </div>

            <button
              disabled={!completed}
              style={{
                marginTop: 14,
                width: '100%',
                padding: 12,
                border: 'none',
                borderRadius: 12,
                fontWeight: 'bold',
                cursor: completed ? 'pointer' : 'not-allowed',
                background: completed ? '#22c55e' : '#475569',
                color: 'white'
              }}
            >
              {completed ? `Coletar ${mission.reward} coins` : `${mission.reward} coins`}
            </button>
          </div>
        )
      })}
    </div>
  )
}