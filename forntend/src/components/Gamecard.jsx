export default function GameCard({ title, reward, emoji = '🎮', onPlay }) {
  const rewardText = String(reward ?? '')
  const isLocked = rewardText.includes('Disponível')

  const theme = getTheme(title)

  return (
    <div style={{
      width: '100%',
      boxSizing: 'border-box',
      background: theme.background,
      borderRadius: 24,
      padding: 18,
      marginBottom: 16,
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      border: `1px solid ${theme.border}`,
      boxShadow: isLocked
        ? '0 0 18px rgba(100,116,139,0.25)'
        : theme.shadow
    }}>
      <div style={{ flex: 1 }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10
        }}>
          <div style={{
            width: 46,
            height: 46,
            borderRadius: 16,
            background: 'rgba(255,255,255,0.16)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 26
          }}>
            {emoji}
          </div>

          <div>
            <h3 style={{ margin: 0, fontSize: 18 }}>
              {title}
            </h3>

            <p style={{
              margin: '4px 0 0',
              color: isLocked ? '#cbd5e1' : theme.text,
              fontSize: 13,
              fontWeight: 'bold'
            }}>
              {isLocked ? '🔒 Disponível em' : rewardText}
            </p>
          </div>
        </div>

        {isLocked && (
          <h2 style={{
            margin: '10px 0 0',
            color: '#facc15',
            fontSize: 26,
            textShadow: '0 0 12px rgba(250,204,21,0.4)'
          }}>
            {rewardText.replace('Disponível em ', '')}
          </h2>
        )}
      </div>

      <button
        onClick={onPlay}
        disabled={isLocked}
        style={{
          background: isLocked
            ? '#475569'
            : theme.button,
          color: isLocked ? '#cbd5e1' : '#111827',
          border: 'none',
          borderRadius: 14,
          padding: '12px 16px',
          fontWeight: '900',
          fontSize: 14,
          cursor: isLocked ? 'not-allowed' : 'pointer',
          boxShadow: isLocked
            ? 'none'
            : '0 0 16px rgba(255,255,255,0.18)'
        }}
      >
        {isLocked ? 'Aguarde' : 'Jogar'}
      </button>
    </div>
  )
}

function getTheme(title) {
  if (title.includes('Roleta')) {
    return {
      background: 'linear-gradient(135deg, #1e3a8a, #020617)',
      border: 'rgba(59,130,246,0.45)',
      shadow: '0 0 28px rgba(59,130,246,0.28)',
      button: 'linear-gradient(135deg, #facc15, #f97316)',
      text: '#bfdbfe'
    }
  }

  if (title.includes('Tap')) {
    return {
      background: 'linear-gradient(135deg, #854d0e, #020617)',
      border: 'rgba(250,204,21,0.45)',
      shadow: '0 0 28px rgba(250,204,21,0.25)',
      button: 'linear-gradient(135deg, #facc15, #f97316)',
      text: '#fef3c7'
    }
  }

  if (title.includes('Caixa')) {
    return {
      background: 'linear-gradient(135deg, #7c2d12, #020617)',
      border: 'rgba(249,115,22,0.45)',
      shadow: '0 0 28px rgba(249,115,22,0.26)',
      button: 'linear-gradient(135deg, #facc15, #fb923c)',
      text: '#fed7aa'
    }
  }

  return {
    background: 'linear-gradient(135deg, #1e293b, #020617)',
    border: 'rgba(148,163,184,0.35)',
    shadow: '0 0 22px rgba(148,163,184,0.18)',
    button: '#22c55e',
    text: '#e2e8f0'
  }
}
