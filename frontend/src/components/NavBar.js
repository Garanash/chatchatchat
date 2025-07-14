import React from "react";
import { AppBar, Toolbar, Button, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function NavBar() {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };
  return (
    <AppBar position="static" sx={{ backgroundColor: '#1a1a1a' }}>
      <Toolbar sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ flex: 1 }} />
        <Box sx={{ display: 'flex', justifyContent: 'center', flex: 1 }}>
          <img src="https://almazgeobur.kz/wp-content/uploads/2021/08/agb_logo_h-2.svg" alt="logo" style={{ height: 40, maxWidth: 180, objectFit: 'contain' }} />
        </Box>
        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
          <Button color="inherit" onClick={() => navigate("/")} sx={{ color: '#ffffff', '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' } }}>Главная</Button>
          <Button color="inherit" onClick={() => navigate("/test")} sx={{ color: '#ffffff', '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' } }}>Тест моделей</Button>
          <Button color="inherit" onClick={() => navigate("/settings")} sx={{ color: '#ffffff', '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' } }}>Настройки</Button>
          <Button color="inherit" onClick={handleLogout} sx={{ color: '#ffffff', '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' } }}>Выйти</Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
} 