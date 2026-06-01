        export default function OfferCard({
        icon,
        title,
        reward,
        color,
        onClick,
        locked = false
        }) {

  return (
    <div
      style={{
  background: color,
  padding: '10px 20px',
  minHeight: 68,
  borderRadius: 24,
  marginBottom: 14,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  boxShadow: '0 8px 25px rgba(0,0,0,0.25)',
  transition: '0.25s',
  cursor: 'pointer',
  transform: 'scale(1)'
}}
onMouseEnter={(e) => {
  e.currentTarget.style.transform = 'scale(1.02)'
  e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.35)'
}}

onMouseLeave={(e) => {
  e.currentTarget.style.transform = 'scale(1)'
  e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.25)'
}}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 44,
          height: 44,
          borderRadius: 16,
          background: 'rgba(255,255,255,0.18)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 24
        }}>
          {icon}
        </div>

        <div>
          <h3 style={{ margin: 0, fontSize: 18 }}>
            {title}
          </h3>

          <p style={{ color: '#e2e8f0', marginTop: 8, fontSize: 15 }}>
            Ganhe {reward} coins
          </p>
        </div>
      </div>

           <button
  onClick={(e) => {
    e.stopPropagation()

    if (!locked && onClick) {
      onClick()
    }
  }}
  style={{
    background: locked
      ? 'rgba(0,0,0,0.25)'
      : 'white',

    color: locked
      ? 'white'
      : '#0f172a',

    border: 'none',
    padding: '12px 18px',
    borderRadius: 12,
    fontWeight: 'bold',

    cursor: locked
      ? 'default'
      : 'pointer',

    transition: '0.2s ease',
    boxShadow: '0 4px 12px rgba(0,0,0,0.18)'
  }}
>
  {locked ? '🔒 Em breve' : '🚀 Receber'}
</button>
    </div>
  )
}