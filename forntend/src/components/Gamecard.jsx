export default function GameCard({ title, reward, emoji = '🎮', onPlay }) {
  const rewardText = String(reward ?? '')
  const isLocked = rewardText.includes('Disponível')

  return (
    <div style={{
      width: '100%',
      boxSizing: 'border-box',
      background: 'rgba(255,255,255,0.12)',
      borderRadius: 18,
      padding: 16,
      marginBottom: 12,
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      <div>
        <h3 style={{ margin: 0 }}>{emoji} {title}</h3>
        <p style={{ margin: '6px 0 0', opacity: 0.8 }}>{rewardText}</p>
      </div>

      <button
        onClick={onPlay}
        disabled={isLocked}
        style={{
          background: isLocked ? '#64748b' : '#22c55e',
          color: 'white',
          border: 'none',
          borderRadius: 12,
          padding: '10px 14px',
          fontWeight: 'bold'
        }}
      >
        {isLocked ? 'Aguarde' : 'Jogar'}
      </button>
    </div>
  )
}