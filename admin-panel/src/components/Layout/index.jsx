import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  Tooltip,
  Avatar
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import LogoutIcon from '@mui/icons-material/Logout'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'
import Sidebar from './Sidebar.jsx'
import { Outlet } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import { useTheme } from '../../context/ThemeContext.jsx'
import { useTranslation } from 'react-i18next'

const drawerWidth = 250

export default function Layout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, logout } = useAuth()
  const { darkMode, toggleDarkMode } = useTheme()
  const { t, i18n } = useTranslation()

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          background: darkMode
            ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setMobileOpen(!mobileOpen)}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Typography
            variant="h5"
            sx={{
              flex: 1,
              fontWeight: 800,
              letterSpacing: '0.5px',
              background: 'linear-gradient(90deg, #fff, #e0e7ff)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Rental Admin
          </Typography>

          {/* User Avatar */}
          <Tooltip title={user?.userName || 'Admin'}>
            <Avatar
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                color: 'white',
                mr: 2,
                width: 38,
                height: 38,
                fontWeight: 'bold'
              }}
            >
              {user?.userName?.[0]?.toUpperCase() || 'A'}
            </Avatar>
          </Tooltip>

          {/* Dark Mode Toggle */}
          <Tooltip title={darkMode ? t('light_mode') : t('dark_mode')}>
            <IconButton color="inherit" onClick={toggleDarkMode}>
              {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>

          {/* Language Switch */}
          <select
            value={i18n.language}
            onChange={(e) => i18n.changeLanguage(e.target.value)}
            style={{
              margin: '0 12px',
              padding: '6px 12px',
              borderRadius: '20px',
              border: 'none',
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              fontSize: '14px',
              outline: 'none',
              backdropFilter: 'blur(10px)'
            }}
          >
            <option value="en" style={{ color: '#000' }}>EN</option>
            <option value="km" style={{ color: '#000' }}>ខ្មែរ</option>
          </select>

          {/* Logout */}
          <Tooltip title={t('logout')}>
            <IconButton color="inherit" onClick={logout}>
              <LogoutIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      {/* Desktop Sidebar */}
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
            borderRadius: '0 20px 20px 0',
            overflow: 'hidden'
          }
        }}
      >
        <Toolbar />
        <Sidebar />
      </Drawer>

      {/* Mobile Sidebar */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            background: darkMode ? '#121526' : '#ffffff',
            boxShadow: '0 0 30px rgba(0,0,0,0.3)'
          }
        }}
      >
        <Toolbar />
        <Sidebar />
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          width: { xs: '100%', sm: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          p: { xs: 2, sm: 2 },
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Toolbar />
        <Box sx={{ flex: 1 }}>{children || <Outlet />}</Box>
      </Box>
    </Box>
  )
}
