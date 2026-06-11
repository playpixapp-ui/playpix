export default function MissionsPage({
  missionStats,
  claimMission,
  claimedMissions
}) {

const missions = [
  {
    type: 'watch_ads',
    title: '📺 Assistir 15 anúncios',
    progress: missionStats.adsWatched || 0,
    total: 15,
    reward: 150
  },
  {
    type: 'play_games',
    title: '🎮 Jogar 10 partidas',
    progress: missionStats.gamesPlayed || 0,
    total: 10,
    reward: 100
  },
  {
    type: 'daily_reward',
    title: '🎁 Coletar recompensa diária',
    progress: missionStats.dailyCollected || 0,
    total: 1,
    reward: 50,
  },
  {
    type: 'invite_friend',
    title: '👥 Convidar 1 amigo',
    progress: missionStats.invitedFriends || 0,
    total: 1,
    reward: 500,
  }
]

 return (
  <div style={{ marginTop: 20 }}>
   <h2
  style={{
    textAlign: 'center',
    fontSize: 34,
    fontWeight: '800',
    color: '#ffffff',
    WebkitTextFillColor: '#ffffff',
    marginBottom: 24
  }}
>
  🎯 Missões
</h2>

    {missions.map((mission, index) => {

      const percent = Math.min((mission.progress / mission.total) * 100, 100)

      const completed = mission.progress >= mission.total

      const colors =
        index === 0
          ? {
              border: '#2563eb',
              glow: 'rgba(37,99,235,0.55)',
              iconBg: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              cardBg: 'linear-gradient(135deg, rgba(37,99,235,0.45), rgba(30,64,175,0.25), rgba(2,6,23,0.95))',
              bar: 'linear-gradient(90deg, #38bdf8, #2563eb)',
              button: 'linear-gradient(135deg, #3b82f6, #2563eb)'
            }
          : index === 1
          ? {
              border: '#a855f7',
              glow: 'rgba(168,85,247,0.55)',
              iconBg: 'linear-gradient(135deg, #9333ea, #6d28d9)',
              cardBg: 'linear-gradient(135deg, rgba(147,51,234,0.45), rgba(88,28,135,0.25), rgba(2,6,23,0.95))',
              bar: 'linear-gradient(90deg, #c084fc, #7c3aed)',
              button: 'linear-gradient(135deg, #a855f7, #7c3aed)',
            }
          : index === 2
          ? {
              border: '#f97316',
              glow: 'rgba(249,115,22,0.55)',
              iconBg: 'linear-gradient(135deg, #f97316, #c2410c)',
              cardBg: 'linear-gradient(135deg, rgba(249,115,22,0.45), rgba(124,45,18,0.25), rgba(2,6,23,0.95))',
              bar: 'linear-gradient(90deg, #fb923c, #ea580c)',
              button: 'linear-gradient(135deg, #fb923c, #ea580c)',
            }
          : {
              border: '#22c55e',
              glow: 'rgba(34,197,94,0.55)',
              iconBg: 'linear-gradient(135deg, #22c55e, #15803d)',
              cardBg: 'linear-gradient(135deg, rgba(34,197,94,0.45), rgba(20,83,45,0.25), rgba(2,6,23,0.95))',
              bar: 'linear-gradient(90deg, #4ade80, #16a34a)',
              button: 'linear-gradient(135deg, #4ade80, #16a34a)',
            }
            

      return (
        <div
          key={index}
          style={{
            maxWidth: 380,
            margin: '18px auto',
            padding: '18px 18px',
            borderRadius: 26,
            color: '#f8fafc',
            background: colors.cardBg,
            border: `1px solid ${colors.border}`,
            boxShadow: `0 0 28px ${colors.glow}`
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 54,
                height: 54,
                borderRadius: 18,
                background: colors.iconBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 28,
                flexShrink: 0
              }}
            >
              {mission.title.includes('anúncios')
                ? '📺'
                : mission.title.includes('partidas')
                ? '🎮'
                : mission.title.includes('Convidar')
                ? '♟️'
                : '🎁'}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: '900' }}>
                  {mission.title}
                </h3>

                <div
                  style={{
                    padding: '5px 8px',
                    borderRadius: 999,
                    background: 'rgba(15,23,42,0.55)',
                    color: '#faecec',
                    fontWeight: '900',
                    fontSize: 10,
                    whiteSpace: 'nowrap'
                  }}
                >
                  🏆 {mission.reward} COINS
                </div>
              </div>

              <p
  style={{
    margin: '2px 0 6px',
    color: '#f8fafc',
    fontSize: 10,
  }}
>
  Progresso: {mission.progress}/{mission.total}
</p>

<div
  style={{
    width: '100%',
    height: 8,
    background: 'rgba(148,163,184,0.25)',
    borderRadius: 999,
    overflow: 'hidden'
  }}
>
  <div
    style={{
      width: `${percent}%`,
      height: '100%',
      borderRadius: 999,
      background: colors.bar,
      transition: '0.4s'
    }}
  />
</div>

<button
  onClick={() => claimMission(mission.type)}
disabled={!completed || claimedMissions?.[mission.type]}  style={{
    marginTop: 14,
    width: '100%',
    padding: '12px 16px',
    borderRadius: 14,
    border: 'none',
   background: completed
  ? colors.button
  : '#475569',
    color: 'white',
    fontWeight: '900',
    cursor: completed ? 'pointer' : 'not-allowed'
  }}
>
  {
  claimedMissions?.[mission.type]
    ? '🏆 Recebida'
    : completed
      ? '🎁 Receber'
      : '🔒 Incompleta'
}
</button>
            </div>
          </div>
        </div>
      )
    })}
  </div>
 )
}