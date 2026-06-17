export default function RankingPage({ ranking = [] }) {
  return (
    <div style={{
      width: '100%',
      maxWidth: 430,
      margin: '0 auto',
      paddingBottom: 110
    }}>
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
  🏆 Ranking
</h2>

      {ranking.length === 0 && (
        <p style={{ textAlign: 'center', color: '#cbd5e1' }}>
          Nenhum usuário no ranking ainda.
        </p>
      )}

      {ranking.map((user, index) => {
        const medals = ['🥇', '🥈', '🥉']
        const medal = medals[index]

        const avatarColor =
          index === 0
            ? 'linear-gradient(135deg,#facc15,#f59e0b)'
            : index === 1
            ? 'linear-gradient(135deg,#e5e7eb,#94a3b8)'
            : index === 2
            ? 'linear-gradient(135deg,#d97706,#92400e)'
            : 'linear-gradient(135deg,#22c55e,#2563eb)'

        return (
          <div
            key={`${user.name}-${index}`}
            style={{
              background:
                index === 0
                  ? 'linear-gradient(135deg,#3b2f00,#111827)'
                  : 'linear-gradient(135deg,#1e293b,#0f172a)',
              padding: 18,
              borderRadius: 20,
              marginBottom: 14,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              border:
                index < 3
                  ? '1px solid rgba(250,204,21,0.35)'
                  : '1px solid rgba(255,255,255,0.06)',
              boxShadow:
                index < 3
                  ? '0 0 18px rgba(250,204,21,0.15)'
                  : 'none'
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12
            }}>
              <div style={{
                width: 52,
                height: 52,
                borderRadius: '50%',
                background: avatarColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: 20,
                color: '#111827'
              }}>
                {user.name?.charAt(0)?.toUpperCase() || '?'}
              </div>

              <div>
                <strong style={{ fontSize: 17, color: 'white' }}>
                  {medal || `#${index + 1}`} {user.name}
                </strong>

                <p style={{
                  margin: 0,
                  color: '#94a3b8',
                  fontSize: 13
                }}>
                  Jogador SacasPIX
                </p>
              </div>
            </div>

            <div style={{
  background: 'rgba(250,204,21,0.12)',
  border: '1px solid rgba(250,204,21,0.25)',
  padding: '8px 12px',
  borderRadius: 12,
  fontWeight: 'bold',
  color: '#facc15',
  whiteSpace: 'nowrap'
}}>
  {user.coins} Coins
</div>
          </div>
        )
      })}
    </div>
  )
}