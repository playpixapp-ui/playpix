function ProfileCard({ wallet }) {
  return (
    <>
      <div style={{
        width: 80,
        height: 80,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #22c55e, #2563eb)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 36,
        fontWeight: 'bold',
        margin: '0 auto 15px auto',
        color: 'white'
      }}>
        {wallet?.name?.charAt(0)?.toUpperCase()}
      </div>

      <h2>{wallet?.name}</h2>
      <p>{wallet?.email}</p>

      <div style={{
        background: '#1e293b',
        padding: 15,
        borderRadius: 12,
        marginBottom: 20
      }}>
        <p>Seu código de convite:</p>
        <strong>{wallet?.referral_code || 'Sem código ainda'}</strong>
      </div>
    </>
  )
}

export default ProfileCard