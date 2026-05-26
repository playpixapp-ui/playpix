import OfferCard from './OfferCard'

export default function MissionsPage() {
  return (
    <div>
      <h2 style={{ marginBottom: 20 }}>
        🎁 Missões
      </h2>

      <OfferCard
        title="📺 Assistir anúncio"
        reward={100}
        color="#2563eb"
      />

      <OfferCard
        title="🔥 Missão diária"
        reward={50}
        color="#ea580c"
      />

      <OfferCard
        title="🎮 Oferta gamer"
        reward={250}
        color="#7c3aed"
      />

      <OfferCard
        title="💎 Oferta premium"
        reward={500}
        color="#059669"
      />
    </div>
  )
}