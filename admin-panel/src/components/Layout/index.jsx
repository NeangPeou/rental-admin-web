import { Box, AppBar, Toolbar, Typography, IconButton, Drawer } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import Sidebar from './Sidebar.jsx'
import { Outlet } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import { useTranslation } from 'react-i18next'

const drawerWidth = 240

export default function Layout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { logout } = useAuth()
  const { t, i18n } = useTranslation()

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen)

  return (
    <Box sx={{ display: 'flex', fontFamily: '"Noto Sans Khmer", sans-serif' }}>
      <AppBar position="fixed" sx={{ zIndex: theme => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton color="inherit" onClick={handleDrawerToggle} sx={{ mr: 2, display: { sm: 'none' } }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>Rental Admin</Typography>
          <select
            onChange={e => i18n.changeLanguage(e.target.value)}
            defaultValue={i18n.language}
            style={{ marginRight: 10, padding: 5 }}
          >
            <option value="en">EN</option>
            <option value="km">ខ្មែរ</option>
          </select>
          <button onClick={logout} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
            {t('logout')}
          </button>
        </Toolbar>
      </AppBar>

      <Drawer variant="permanent" sx={{ display: { xs: 'none', sm: 'block' }, width: drawerWidth, '& .MuiDrawer-paper': { width: drawerWidth } }}>
        <Toolbar />
        <Sidebar />
      </Drawer>

      <Drawer variant="temporary" open={mobileOpen} onClose={handleDrawerToggle} sx={{ display: { xs: 'block', sm: 'none' }, '& .MuiDrawer-paper': { width: drawerWidth } }}>
        <Toolbar />
        <Sidebar />
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        {children || <Outlet />}
      </Box>
    </Box>
  )
}