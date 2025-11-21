// src/layout/Layout.jsx
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  Tooltip,
  Avatar,
  Stack,
  useScrollTrigger,
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
import useResponsiveGlobal from '../../hooks/useResponsiveGlobal.js' // ← Import it!

const drawerWidth = 260

// Optional: Elevate AppBar on scroll
function ElevationScroll(props) {
  const { children } = props
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 0,
  })
  return children({ elevation: trigger ? 8 : 4 })
}

export default function Layout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, logout } = useAuth()
  const { darkMode, toggleDarkMode } = useTheme()
  const { t, i18n } = useTranslation()
  const responsive = useResponsiveGlobal() // ← Use it here!

  const handleDrawerToggle = () => {
    setMobileOpen(mobileOpen)
  }

  const appBarGradient = darkMode
    ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
    : 'linear-gradient(135deg, #023F6B 0%, #025a8a 100%)'

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* App Bar */}
      <ElevationScroll>
        {(props) => (
          <AppBar
            position="fixed"
            elevation={props.elevation}
            sx={{
              zIndex: (theme) => theme.zIndex.drawer + 1,
              background: appBarGradient,
              backdropFilter: 'blur(12px)',
              borderBottom: '1px solid',
              borderColor: 'divider',
              transition: 'all 0.3s ease',
            }}
          >
            <Toolbar>
              {/* Mobile Menu Button */}
              <IconButton
                color="inherit"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2, display: { sm: 'none' } }}
              >
                <MenuIcon />
              </IconButton>

              {/* Logo / Title */}
              <Typography
                variant={responsive.isMobile ? 'h6' : 'h5'}
                sx={{
                  flexGrow: 1,
                  fontWeight: 600,
                  letterSpacing: '0.5px',
                  background: 'linear-gradient(90deg, #fff, #e0e7ff)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Rental Admin
              </Typography>

              {/* Right Side Controls */}
              <Stack direction="row" spacing={1} alignItems="center">
                {/* Avatar */}
                <Tooltip title={user?.userName || 'Admin'}>
                  <Avatar
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.18)',
                      color: 'white',
                      width: responsive.isMobile ? 34 : 38,
                      height: responsive.isMobile ? 34 : 38,
                      fontWeight: 'bold',
                      fontSize: responsive.isMobile ? '0.9rem' : '1rem',
                    }}
                  >
                    {user?.userName?.[0]?.toUpperCase() || 'A'}
                  </Avatar>
                </Tooltip>

                {/* Dark Mode */}
                <Tooltip title={darkMode ? t('light_mode') : t('dark_mode')}>
                  <IconButton color="inherit" onClick={toggleDarkMode} size={responsive.isMobile ? 'small' : 'medium'}>
                    {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
                  </IconButton>
                </Tooltip>

                {/* Language Switch */}
                <Box
                  component="select"
                  value={i18n.language}
                  onChange={(e) => i18n.changeLanguage(e.target.value)}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.15)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 3,
                    px: 1.5,
                    py: 0.8,
                    fontSize: '0.875rem',
                    outline: 'none',
                    cursor: 'pointer',
                    backdropFilter: 'blur(10px)',
                    '& option': { color: '#000' },
                  }}
                >
                  <option value="en">EN</option>
                  <option value="km">ខ្មែរ</option>
                  <option value="fr">FR</option>
                </Box>

                {/* Logout */}
                <Tooltip title={t('logout')}>
                  <IconButton color="inherit" onClick={logout} size={responsive.isMobile ? 'small' : 'medium'}>
                    <LogoutIcon />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Toolbar>
          </AppBar>
        )}
      </ElevationScroll>

      {/* Desktop Sidebar */}
      <Drawer
        variant="permanent"
        open
        sx={{
          display: { xs: 'none', sm: 'block' },
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            bgcolor: darkMode ? 'rgba(20,20,40,0.97)' : 'background.paper',
            backdropFilter: 'blur(20px)',
            borderRight: '1px solid',
            borderColor: 'divider',
            boxShadow: '4px 0 30px rgba(0,0,0,0.12)',
          },
        }}
      >
        <Toolbar />
        <Sidebar />
      </Drawer>

      {/* Mobile Sidebar */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            bgcolor: darkMode ? '#0f0f1e' : '#ffffff',
            boxShadow: '0 0 40px rgba(0,0,0,0.3)',
          },
        }}
      >
        <Toolbar />
        <Sidebar />
      </Drawer>

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { xs: '100%', sm: `calc(100% - ${drawerWidth}px)` },
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
        }}
      >
        <Toolbar /> {/* Spacer for fixed AppBar */}
        <Box sx={{ flex: 1, p: { xs: 1.5, sm: 1, md: 2 } }}>
          {children || <Outlet />}
        </Box>
      </Box>
    </Box>
  )
}