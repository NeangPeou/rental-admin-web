// layout/Layout.jsx
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  Tooltip,
  Avatar,
} from '@mui/material'
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Logout as LogoutIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
} from '@mui/icons-material'
import Sidebar from './Sidebar.jsx'
import { Outlet } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import { useTheme as useAppTheme } from '../../context/ThemeContext.jsx'
import { useTranslation } from 'react-i18next'
import useResponsiveGlobal from '../../hooks/useResponsiveGlobal.js'
import ConfirmLogout from '../common/ConfirmLogout.jsx'

const SIDEBAR_FULL = 235
const SIDEBAR_COLLAPSED = 65

export default function Layout({ children }) {
  const responsive = useResponsiveGlobal()
  const { isMobile } = responsive

  const { logout } = useAuth()
  const { darkMode, toggleDarkMode } = useAppTheme()
  const { t, i18n } = useTranslation()

  const [mobileOpen, setMobileOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  const toggleSidebar = () => setSidebarCollapsed(prev => !prev)
  const handleMobileDrawerToggle = () => setMobileOpen(prev => !prev)

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await logout()  // Your AuthContext logout (clears tokens, etc.)
      setLogoutDialogOpen(false)
    } catch (err) {
      console.error("Logout failed", err)
    } finally {
      setLoggingOut(false)
    }
  }

  const drawerWidth = sidebarCollapsed ? SIDEBAR_COLLAPSED : SIDEBAR_FULL

  return (
    <> 
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        {/* AppBar */}
        <AppBar
          position="fixed"
          sx={{
            zIndex: theme => theme.zIndex.drawer + 1,
            background: darkMode
              ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
              : 'linear-gradient(135deg, #023F6B 0%, #023F6B 100%)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              edge="start"
              onClick={isMobile ? handleMobileDrawerToggle : toggleSidebar}
            >
              {isMobile ? (
                <MenuIcon />
              ) : sidebarCollapsed ? (
                <MenuIcon />
              ) : (
                <MenuIcon />
              )}
            </IconButton>

            <Typography
              variant="h6"
              sx={{
                flexGrow: 1,
                fontWeight: 500,
                background: 'linear-gradient(90deg, #fff, #e0e7ff)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Admin
            </Typography>

            <Tooltip title={darkMode ? t('light_mode') : t('dark_mode')}>
              <IconButton color="inherit" onClick={toggleDarkMode}>
                {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </Tooltip>

            <select
              value={i18n.language}
              onChange={(e) => i18n.changeLanguage(e.target.value)}
              style={{
                margin: '0 12px',
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '14px',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="en">English</option>
              <option value="km">Khmer</option>
              <option value="fr">Français</option>
            </select>

            <Tooltip title={t('logout')}>
              <IconButton 
                color="inherit" 
                onClick={() => setLogoutDialogOpen(true)}
              >
                <LogoutIcon />
              </IconButton>
            </Tooltip>
          </Toolbar>
        </AppBar>

        {/* Desktop Permanent Sidebar (Collapsible) */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              background: darkMode ? 'rgba(20,20,40,0.95)' : 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(20px)',
              borderRight: 'none',
              boxShadow: '4px 0 30px rgba(0,0,0,0.1)',
              transition: 'width 300ms cubic-bezier(0.4, 0, 0.2, 1)',
              overflow: 'hidden',
            },
          }}
        >
          <Toolbar />
          <Sidebar collapsed={sidebarCollapsed} />
        </Drawer>

        {/* Mobile Temporary Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleMobileDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              width: SIDEBAR_FULL,
              background: darkMode ? '#121526' : '#ffffff',
              boxShadow: '0 0 30px rgba(0,0,0,0.3)',
            },
          }}
        >
          <Toolbar />
          <Sidebar collapsed={false} />
        </Drawer>

        {/* Main Content – 100% Responsive on Mobile */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            width: { xs: '100%', sm: `calc(100% - ${drawerWidth}px)` },
            position: 'relative',
            minHeight: '100vh',
          }}
        >
          <Toolbar />
          <Box sx={{ p: { xs: 2, sm: 2 }, flex: 1 }}>
            {children || <Outlet />}
          </Box>
        </Box>
      </Box>
      <ConfirmLogout
        open={logoutDialogOpen}
        onClose={() => setLogoutDialogOpen(false)}
        onConfirm={handleLogout}
        loading={loggingOut}
      />
    </>
  )
}