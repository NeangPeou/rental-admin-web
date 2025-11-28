import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Owners from './pages/Owners.jsx'
import Types from './pages/Types.jsx'
import UtilityTypes from './pages/UtilityTypes.jsx'
import SystemLogs from './pages/SystemLogs.jsx'
import Layout from './components/Layout/index.jsx'
import Profile from './pages/Profile.jsx'
import Settings from './pages/Settings.jsx'
import { ConfirmDelete } from './components/common/ConfirmDelete.jsx'
import ChangePassword from './pages/ChangePassword.jsx'
import LoadingScreen from './components/common/LoadingScreen.jsx'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />

  return children
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (user) return <Navigate to="/" replace />

  return children
}

export default function App() {
  const { user } = useAuth()
  return (
    <>
      <ConfirmDelete />
      <Routes>
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route
          path="/*"
          element={
            <PrivateRoute>
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/owners" element={<Owners />} />
                  <Route path="/types" element={<Types />} />
                  <Route path="/utilities" element={<UtilityTypes />} />
                  <Route path="/logs" element={<SystemLogs />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/change-password" element={<ChangePassword />} />
                  <Route path="/settings" element={<Settings />} />
                </Routes>
              </Layout>
            </PrivateRoute>
          }
        />
      </Routes>
    </>
  )
}