import { Routes, Route, Navigate } from 'react-router-dom'
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

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div></div>
  return user ? children : <Navigate to="/login" />
}

export default function App() {
  return (
    <>
      <ConfirmDelete />
      <Routes>
        <Route path="/login" element={<Login />} />
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
                  <Route path="/settings" element={<Settings />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Layout>
            </PrivateRoute>
          }
        />
      </Routes>
    </>
  )
}