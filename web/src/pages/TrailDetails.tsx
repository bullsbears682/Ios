import { useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

export default function TrailDetails() {
  const { id } = useParams()
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<maplibregl.Map | null>(null)

  useEffect(() => {
    if (!mapRef.current) return
    if (mapInstance.current) return
    mapInstance.current = new maplibregl.Map({
      container: mapRef.current,
      style: 'https://demotiles.maplibre.org/style.json',
      center: [11.576124, 48.137154],
      zoom: 10
    })
    return () => {
      mapInstance.current?.remove()
      mapInstance.current = null
    }
  }, [])

  return (
    <div>
      <h2>Trail {id}</h2>
      <div style={{ height: 240, borderRadius: 8, overflow: 'hidden', margin: '12px 0' }}>
        <div ref={mapRef} style={{ height: '100%' }} />
      </div>
      <div>Difficulty: Moderate • Est. time: 2h 30m</div>
      <p>A scenic loop with forests and viewpoints. Remember Leave No Trace.</p>
      <button style={{ padding: '10px 14px', background: '#0B5D4F', color: 'white', border: 'none', borderRadius: 6 }}>Download offline map</button>
      <h3 style={{ marginTop: 16 }}>Reviews</h3>
      <ul>
        <li>Great trail! – 5★</li>
        <li>Nice views. – 4★</li>
      </ul>
    </div>
  )
}