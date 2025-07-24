import React, { useState } from "react";
import { AppBar, Toolbar, Button, Box, IconButton, Menu, MenuItem } from "@mui/material";
import { useNavigate } from "react-router-dom";
import MenuIcon from '@mui/icons-material/Menu';

export default function NavBar() {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  return (
    <AppBar position="static" sx={{ backgroundColor: '#1a1a1a', boxShadow: '0 4px 24px 0 rgba(31, 38, 135, 0.12)' }}>
      <Toolbar sx={{ justifyContent: 'space-between', alignItems: 'center', minHeight: { xs: 56, sm: 64 } }}>
        <Box sx={{ flex: 1 }} />
        <Box sx={{ display: 'flex', justifyContent: 'center', flex: 1 }}>
          <img
            src="https://almazgeobur.kz/wp-content/uploads/2021/08/agb_logo_h-2.svg"
            alt="logo"
            style={{ height: '40px', maxWidth: '180px', objectFit: 'contain', cursor: 'pointer', width: 'auto' }}
            onClick={() => { window.location.href = 'https://almazgeobur.ru'; }}
          />
        </Box>
        {/* Desktop buttons */}
        <Box sx={{
          flex: 1,
          display: { xs: 'none', sm: 'flex' },
          justifyContent: 'flex-end',
          flexWrap: 'wrap',
          gap: { xs: 1, sm: 2 }
        }}>
          <Button color="inherit" onClick={() => navigate("/")} sx={{ color: '#ffffff', fontSize: { xs: '1rem', sm: '1.1rem' }, px: { xs: 1, sm: 2 }, my: { xs: 0.5, sm: 0 }, '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' } }}>Главная</Button>
          <Button color="inherit" onClick={handleLogout} sx={{ color: '#ffffff', fontSize: { xs: '1rem', sm: '1.1rem' }, px: { xs: 1, sm: 2 }, my: { xs: 0.5, sm: 0 }, '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' } }}>Выйти</Button>
        </Box>
        {/* Mobile burger menu */}
        <Box sx={{ flex: 1, display: { xs: 'flex', sm: 'none' }, justifyContent: 'flex-end' }}>
          <IconButton
            color="inherit"
            aria-label="menu"
            onClick={handleMenuOpen}
            sx={{ color: '#fff' }}
          >
            <MenuIcon fontSize="large" />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleMenuClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <MenuItem onClick={() => { handleMenuClose(); navigate("/"); }}>Главная</MenuItem>
            <MenuItem onClick={() => { handleMenuClose(); handleLogout(); }}>Выйти</MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
} 