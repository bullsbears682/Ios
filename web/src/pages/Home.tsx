import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div>
      <input placeholder="Search trails" style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #ccc' }} />
      <h2 style={{ marginTop: 16 }}>Featured Trails</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {[1, 2, 3, 4].map((id) => (
          <Link key={id} to={`/trails/${id}`} style={{ border: '1px solid #eee', borderRadius: 8, padding: 12, textDecoration: 'none', color: 'inherit' }}>
            <div style={{ height: 80, background: '#e0f2f1', borderRadius: 6 }} />
            <div style={{ marginTop: 8 }}><strong>Trail {id}</strong></div>
            <div style={{ fontSize: 12, color: '#666' }}>Easy • 5 km</div>
          </Link>
        ))}
      </div>
    </div>
  )
}