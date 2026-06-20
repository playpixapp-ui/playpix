export default function OfferCard({
  icon,
  title,
  reward,
  color,
  onClick,
  locked = false,
  lockText = '🔒 Em breve'
}) {
  const styles =
    color === '#2563eb'
      ? {
          border: '#2563eb',
          glow: 'rgba(37,99,235,0.55)',
          iconBg: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
          cardBg: 'linear-gradient(135deg, rgba(37,99,235,0.45), rgba(30,64,175,0.25), rgba(2,6,23,0.95))'
        }
      : color === '#9333ea'
      ? {
          border: '#a855f7',
          glow: 'rgba(168,85,247,0.55)',
          iconBg: 'linear-gradient(135deg, #9333ea, #6d28d9)',
          cardBg: 'linear-gradient(135deg, rgba(147,51,234,0.45), rgba(88,28,135,0.25), rgba(2,6,23,0.95))'
        }
      : color === '#f97316'
      ? {
          border: '#f97316',
          glow: 'rgba(249,115,22,0.55)',
          iconBg: 'linear-gradient(135deg, #f97316, #c2410c)',
          cardBg: 'linear-gradient(135deg, rgba(249,115,22,0.45), rgba(124,45,18,0.25), rgba(2,6,23,0.95))'
        }
      : {
          border: '#22c55e',
          glow: 'rgba(34,197,94,0.55)',
          iconBg: 'linear-gradient(135deg, #22c55e, #15803d)',
          cardBg: 'linear-gradient(135deg, rgba(34,197,94,0.45), rgba(20,83,45,0.25), rgba(2,6,23,0.95))'
        }

  return (
    <div
      onClick={() => {
        if (!locked && onClick) onClick()
      }}
      style={{
        background: styles.cardBg,
        padding: '18px 18px',
        borderRadius: 26,
        marginBottom: 18,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        border: `1px solid ${styles.border}`,
        boxShadow: `0 0 28px ${styles.glow}`,
        transition: '0.25s',
        cursor: locked ? 'default' : 'pointer'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div
          style={{
            width: 54,
            height: 54,
            borderRadius: 18,
            background: styles.iconBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 28,
            flexShrink: 0
            
          }}
        >
          {icon}
        </div>

        <div>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: '800' }}>
            {title}
          </h3>

          <p style={{ color: '#e2e8f0', margin: '6px 0 0', fontSize: 15 }}>
            Ganhe {reward} coins
          </p>
        </div>
      </div>

     <button
  onClick={(e) => {
    e.stopPropagation()
    if (!locked && onClick) onClick()
  }}
  disabled={locked}
  style={{
    marginLeft: 25,
    background: locked
      ? 'rgba(15,23,42,0.55)'
      : styles.iconBg,
    color: locked ? '#facc15' : '#ffffff',
    border: locked
      ? '1px solid rgba(250,204,21,0.35)'
      : `1px solid ${styles.border}`,
    padding: '8px 13px',
    borderRadius: 999,
    fontWeight: '900',
    fontSize: 12,
    cursor: locked ? 'default' : 'pointer',
    whiteSpace: 'nowrap',
    boxShadow: locked
      ? 'none'
      : `0 0 16px ${styles.glow}`,
    textShadow: locked
      ? 'none'
      : '0 1px 2px rgba(0,0,0,.35)',
    transition: '0.2s'
  }}
>
  {locked && lockText ? lockText : '⚡ Coletar'}
</button>
    </div>
  )
}