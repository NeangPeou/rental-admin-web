// src/layout/Sidebar.jsx
import { List, ListItemButton, ListItemIcon, ListItemText, Divider, Box, Typography } from '@mui/material'
import {
  Dashboard, People, Category, Build, History, Person, Settings
} from '@mui/icons-material'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../../context/ThemeContext.jsx'
import useResponsiveGlobal from '../../hooks/useResponsiveGlobal.js' // ← Add this!

export default function Sidebar() {
  const { t } = useTranslation()
  const { darkMode } = useTheme()
  const location = useLocation()
  const responsive = useResponsiveGlobal() // ← Use it!

  const menuItems = [
    { text: t('dashboard'), icon: <Dashboard />, to: '/' },
    { text: t('owners'), icon: <People />, to: '/owners' },
    { text: t('types'), icon: <Category />, to: '/types' },
    { text: t('utilities'), icon: <Build />, to: '/utilities' },
    { text: t('logs'), icon: <History />, to: '/logs' },
    { text: t('profile'), icon: <Person />, to: '/profile' },
    { text: t('settings'), icon: <Settings />, to: '/settings' },
  ]

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo */}
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography
          variant={responsive.isMobile ? 'h6' : 'h5'}
          sx={{
            fontWeight: 900,
            background: 'linear-gradient(45deg, #667eea, #764ba2)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '1px',
          }}
        >
          Rental
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ opacity: 0.8 }}>
          Admin Panel
        </Typography>
      </Box>

      <Divider sx={{ mx: 2, opacity: 0.6 }} />

      {/* Menu */}
      <List sx={{ flexGrow: 1, px: 1, pt: 2 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.to
          return (
            <ListItemButton
              key={item.text}
              component={Link}
              to={item.to}
              selected={isActive}
              sx={{
                borderRadius: 3,
                mb: 1,
                mx: 1,
                py: 1.2,
                bgcolor: isActive ? 'rgba(102,126,234,0.15)' : 'transparent',
                color: isActive ? 'primary.main' : 'text.primary',
                fontWeight: isActive ? 700 : 500,
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: 'white',
                  '& .MuiListItemIcon-root': { color: 'white' },
                  '&:hover': { bgcolor: 'primary.dark' },
                },
                '&:hover': {
                  bgcolor: darkMode ? 'rgba(102,126,234,0.12)' : 'rgba(102,126,234,0.08)',
                },
                transition: 'all 0.25s ease',
              }}
            >
              <ListItemIcon sx={{ minWidth: 46, color: isActive ? 'inherit' : 'text.secondary' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontSize: responsive.isMobile ? '0.95rem' : '1rem',
                  fontWeight: 'inherit',
                }}
              />
            </ListItemButton>
          )
        })}
      </List>

      <Divider sx={{ mx: 2, opacity: 0.6 }} />

      {/* Footer */}
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          © 2025 Rental Admin
        </Typography>
      </Box>
    </Box>
  )
}