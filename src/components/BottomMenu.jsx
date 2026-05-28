export default function BottomMenu({
  setPage
}) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        width: '100%',
        background: '#111827',
        borderTop: '1px solid #1e293b',
        display: 'flex',
        justifyContent: 'space-around',
        padding: '14px 0',
        zIndex: 999
      }}
    >
      <button
        onClick={() => setPage('dashboard')}
        style={buttonStyle}
      >
        🏠
        <span>Início</span>
      </button>

      <button
        onClick={() => setPage('missions')}
        style={buttonStyle}
      >
        🎁
        <span>Missões</span>
      </button>

      <button
        onClick={() => setPage('ranking')}
        style={buttonStyle}
      >
        🏆
        <span>Ranking</span>
      </button>

      <button
            onClick={() => setPage('games')}
            style={buttonStyle}
            >
            🎮
            <br />
            Jogos
            </button>

      <button
        onClick={() => setPage('profile')}
        style={buttonStyle}
      >
        👤
        <span>Perfil</span>
      </button>
    </div>
  )
}

const buttonStyle = {
  background: 'transparent',
  border: 'none',
  color: 'white',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 4,
  fontSize: 14,
  cursor: 'pointer'
}