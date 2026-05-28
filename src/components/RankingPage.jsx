export default function RankingPage({ ranking }) {
  return (
    <div>
      <h2 style={{ marginBottom: 20 }}>
        🏆 Ranking
      </h2>

      {ranking.map((user, index) => (
        <div
          key={user.id}
          style={{
            background: '#1e293b',
            padding: 15,
            borderRadius: 16,
            marginBottom: 12,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12
          }}>
            <div style={{
              width: 42,
              height: 42,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #22c55e, #2563eb)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold'
            }}>
              {user.name.charAt(0).toUpperCase()}
            </div>

            <div>
              <strong>#{index + 1} {user.name}</strong>
              <p style={{ margin: 0, color: '#94a3b8' }}>
                {user.email}
              </p>
            </div>
          </div>

          <strong>{user.coins} Coins</strong>
        </div>
      ))}
    </div>
  )
}