export default function RewardParticles({ show }) {
  if (!show) return null

  const particles = Array.from({ length: 14 })

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none',
      overflow: 'hidden'
    }}>
      {particles.map((_, index) => (
        <span
          key={index}
          style={{
            position: 'absolute',
            left: `${20 + Math.random() * 60}%`,
            bottom: '35%',
            fontSize: 24 + Math.random() * 14,
            animation: `particleUp ${0.8 + Math.random() * 0.8}s ease-out forwards`,
            animationDelay: `${Math.random() * 0.2}s`
          }}
        >
          {index % 3 === 0 ? '🪙' : index % 3 === 1 ? '✨' : '💥'}
        </span>
      ))}

      <style>
        {`
          @keyframes particleUp {
            0% {
              opacity: 1;
              transform: translateY(0) scale(0.7) rotate(0deg);
            }

            100% {
              opacity: 0;
              transform: translateY(-180px) scale(1.5) rotate(220deg);
            }
          }
        `}
      </style>
    </div>
  )
}