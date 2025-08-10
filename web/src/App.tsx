import { Link, Route, Routes, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Trails from './pages/Trails'
import TrailDetails from './pages/TrailDetails'
import Downloads from './pages/Downloads'
import Community from './pages/Community'
import Profile from './pages/Profile'
import Settings from './pages/Settings'

function NavBar() {
  const location = useLocation()
  const items = [
    { to: '/', label: 'Home' },
    { to: '/trails', label: 'Trails' },
    { to: '/downloads', label: 'Downloads' },
    { to: '/community', label: 'Community' },
    { to: '/profile', label: 'Profile' }
  ]
  return (
    <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: 56, display: 'flex', background: '#0B5D4F', color: 'white' }}>
      {items.map((item) => (
        <Link key={item.to} to={item.to} style={{ flex: 1, textAlign: 'center', alignSelf: 'center', color: location.pathname === item.to ? '#FFE082' : 'white', textDecoration: 'none' }}>
          {item.label}
        </Link>
      ))}
    </nav>
  )
}

export default function App() {
  return (
    <div style={{ minHeight: '100vh', paddingBottom: 56 }}>
      <header style={{ padding: '12px 16px', background: '#0B5D4F', color: 'white' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <strong>WanderFreund</strong>
          <Link to="/settings" style={{ color: 'white', textDecoration: 'none' }}>Settings</Link>
        </div>
      </header>
      <main style={{ padding: 16 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/trails" element={<Trails />} />
          <Route path="/trails/:id" element={<TrailDetails />} />
          <Route path="/downloads" element={<Downloads />} />
          <Route path="/community" element={<Community />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
      <NavBar />
    </div>
  )
}