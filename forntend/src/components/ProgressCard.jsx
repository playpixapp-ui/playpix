export default function ProgressCard() {
  return (
    <div
      style={{
        background: '#1e293b',
        padding: 20,
        borderRadius: 18,
        marginBottom: 20
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: 10
        }}
      >
        <span>Nível 1</span>
        <span>65%</span>
      </div>

      <div
        style={{
          width: '100%',
          height: 12,
          background: '#334155',
          borderRadius: 10,
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            width: '65%',
            height: '100%',
            background: 'linear-gradient(90deg, #22c55e, #3b82f6)'
          }}
        />
      </div>

      <p
        style={{
          marginTop: 12,
          color: '#94a3b8',
          fontSize: 14
        }}
      >
        Continue assistindo anúncios para subir de nível 🚀
      </p>
    </div>
  )
}