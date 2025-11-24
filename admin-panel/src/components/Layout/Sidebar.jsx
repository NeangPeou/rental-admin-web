// layout/Sidebar.jsx
import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography,
  Tooltip,
} from '@mui/material'
import {
  Dashboard, People, Category, Build, History, Person, Settings,
} from '@mui/icons-material'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../../context/ThemeContext.jsx'

export default function Sidebar({ collapsed = false }) {
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
      {/* Logo */}
      <Box sx={{ p: 2, textAlign: 'center', minHeight: 64, display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'center' }}>
        {collapsed ? (
          <Box sx={{ width: 40, height: 40, borderRadius: 2, background: 'linear-gradient(45deg, #667eea, #764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="h6" color="white" fontWeight={900}>A</Typography>
          </Box>
        ) : (
          <>
            <Typography variant="h6" sx={{ fontWeight: 900, background: 'linear-gradient(45deg, #667eea, #764ba2)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Admin
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>Panel</Typography>
          </>
        )}
      </Box>

      <Divider sx={{ mx: 1, opacity: 0.5 }} />

      {/* Menu Items */}
      <List sx={{ flexGrow: 1, pt: 1 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.to
          const button = (
            <ListItemButton
              component={Link}
              to={item.to}
              sx={{
                mx: 1,
                my: 0.8,
                borderRadius: 3,
                justifyContent: collapsed ? 'center' : 'flex-start',
                px: collapsed ? 0 : 2,
                background: isActive ? 'rgba(102, 126, 234, 0.25)' : 'transparent',
                color: isActive ? '#667eea' : 'text.primary',
                fontWeight: isActive ? 700 : 500,
                minHeight: 48,
                transition: 'all 0.3s ease',
                '&:hover': { background: 'rgba(102, 126, 234, 0.15)', transform: 'translateY(-2px)' },
              }}
            >
              <ListItemIcon sx={{ color: isActive ? '#667eea' : 'inherit', minWidth: collapsed ? 'auto' : 45, mr: collapsed ? 0 : 2 }}>
                {item.icon}
              </ListItemIcon>
              {!collapsed && <ListItemText primary={item.text} />}
            </ListItemButton>
          )

          return collapsed ? (
            <Tooltip key={item.text} title={item.text} placement="right">
              {button}
            </Tooltip>
          ) : (
            <Box key={item.text}>{button}</Box>
          )
        })}
      </List>

      {/* <Divider sx={{ mx: 1, opacity: 0.5 }} />

      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          © 2025 Rental Admin
        </Typography>
      </Box> */}
    </Box>
  )
}