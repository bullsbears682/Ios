import { Link } from 'react-router-dom'

export default function Trails() {
  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <select><option>All difficulties</option><option>Easy</option><option>Moderate</option><option>Hard</option></select>
        <select><option>Any length</option><option>&lt;5 km</option><option>5–10 km</option><option>&gt;10 km</option></select>
        <select><option>All regions</option></select>
      </div>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {Array.from({ length: 10 }).map((_, i) => (
          <li key={i} style={{ borderBottom: '1px solid #eee', padding: '12px 0' }}>
            <Link to={`/trails/${i+1}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <strong>Trail {i + 1}</strong> – Moderate – 8 km
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}