export default function Community() {
  return (
    <div>
      <h2>Community</h2>
      <div style={{ display: 'grid', gap: 12 }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} style={{ border: '1px solid #eee', borderRadius: 8, padding: 12 }}>
            <strong>User {i + 1}</strong>
            <p>Just completed Trail {i + 2}! Stunning views and well marked paths.</p>
            <div style={{ fontSize: 12, color: '#666' }}>12 likes • 3 comments</div>
          </div>
        ))}
      </div>
    </div>
  )
}