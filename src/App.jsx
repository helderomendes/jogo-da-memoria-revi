import { Route, Routes } from 'react-router-dom'
import KioskApp from './KioskApp'
import AdminApp from './admin/AdminApp'

export default function App() {
  return (
    <Routes>
      <Route path="/admin" element={<AdminApp />} />
      <Route path="/*" element={<KioskApp />} />
    </Routes>
  )
}
