import { List, ListItemButton, ListItemIcon, ListItemText, Divider, Box, Typography } from '@mui/material'
import {
  Dashboard, People, Category, Build, History, Person, Settings, Logout
} from '@mui/icons-material'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../../context/ThemeContext.jsx'

export default function Sidebar() {
  const { t } = useTranslation()
  const { darkMode } = useTheme()
  const location = useLocation()

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
      {/* Logo Area */}
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 900,
            background: darkMode
              ? 'linear-gradient(45deg, #667eea, #764ba2)'
              : 'linear-gradient(45deg, #667eea, #764ba2)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          Admin
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Admin Panel
        </Typography>
      </Box>

      <Divider sx={{ mx: 1, opacity: 0.5 }} />

      {/* Menu */}
      <List sx={{ flexGrow: 1, pt: 1 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.to
          return (
            <ListItemButton
              key={item.text}
              component={Link}
              to={item.to}
              sx={{
                mx: 1,
                my: 1,
                borderRadius: 3,
                background: isActive
                  ? (darkMode ? 'rgba(102, 126, 234, 0.2)' : 'rgba(102, 126, 234, 0.2)')
                  : 'transparent',
                color: isActive ? '#667eea' : 'text.primary',
                fontWeight: isActive ? 700 : 500,
                boxShadow: isActive ? '0 4px 15px rgba(102, 126, 234, 0.2)' : 'none',
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: darkMode ? 'rgba(102, 126, 234, 0.15)' : 'rgba(102, 126, 234, 0.08)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
                }
              }}
            >
              <ListItemIcon
                sx={{
                  color: isActive ? '#667eea' : 'inherit',
                  minWidth: 45
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          )
        })}
      </List>

      <Divider sx={{ mx: 1, opacity: 0.5 }} />

      {/* Footer */}
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          © 2025 Rental Admin
        </Typography>
      </Box>
    </Box>
  )
}