import {
  FaHome,
  FaGift,
  FaTrophy,
  FaGamepad,
  FaUser
} from 'react-icons/fa'

export default function BottomMenu({
  setPage,
  loadRanking
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
      <button onClick={() => setPage('dashboard')} style={buttonStyle}>
      <FaHome style={iconStyle} />
      <span>Início</span>
    </button>

    <button onClick={() => setPage('missions')} style={buttonStyle}>
      <FaGift style={iconStyle} />
      <span>Missões</span>
    </button>

    <button onClick={() => {
      setPage('ranking')
      loadRanking()
    }} style={buttonStyle}>
      <FaTrophy style={iconStyle} />
      <span>Ranking</span>
    </button>

    <button onClick={() => setPage('games')} style={buttonStyle}>
      <FaGamepad style={iconStyle} />
      <span>Jogos</span>
    </button>

    <button onClick={() => setPage('profile')} style={buttonStyle}>
      <FaUser style={iconStyle} />
      <span>Perfil</span>
    </button>
        </div>
      )
    }

const buttonStyle = {
  
  background: 'transparent',
  border: 'none',
  color: '#ffffff',

  textShadow:
    '0 0 5px rgba(255,255,255,.18), 0 0 10px rgba(59,130,246,.18)',

  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 4,

  fontSize: 12,
  fontWeight: 700,

  cursor: 'pointer',
  transition: '0.2s ease'
}

const iconStyle = {
  fontSize: 14,
  color: '#e2e8f0',

  filter:
    'drop-shadow(0 0 4px rgba(255,255,255,.25)) drop-shadow(0 0 10px rgba(59,130,246,.35))'
}