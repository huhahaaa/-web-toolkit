import { Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import { GalleryProvider } from './context/GalleryContext'
import { ScheduleProvider } from './context/ScheduleContext'
import Layout from './components/Layout'
import Home from './pages/Home'
import Timer from './pages/Timer'
import Schedule from './pages/Schedule'
import Gallery from './pages/Gallery'
import Sorting from './pages/Sorting'
import Pathfinding from './pages/Pathfinding'
import Team from './pages/Team'
import Auth from './pages/Auth'

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <GalleryProvider>
          <ScheduleProvider>
            <Routes>
            <Route element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="timer" element={<Timer />} />
              <Route path="schedule" element={<Schedule />} />
              <Route path="gallery" element={<Gallery />} />
              <Route path="sorting" element={<Sorting />} />
              <Route path="pathfinding" element={<Pathfinding />} />
              <Route path="team" element={<Team />} />
              <Route path="auth" element={<Auth />} />
            </Route>
          </Routes>
          </ScheduleProvider>
        </GalleryProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
