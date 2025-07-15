import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TextField, Button, Container, Typography, Box, Paper } from "@mui/material";
import axios from "../axiosConfig";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [bgIndex, setBgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % gifs.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const gifs = [
    process.env.PUBLIC_URL + '/gifs/1.gif',
    process.env.PUBLIC_URL + '/gifs/2.gif',
    process.env.PUBLIC_URL + '/gifs/3.gif',
    process.env.PUBLIC_URL + '/gifs/4.gif'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await axios.post("/token", new URLSearchParams({ username, password }), {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      localStorage.setItem("token", res.data.access_token);
      navigate("/");
    } catch (err) {
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError("Неверный логин или пароль");
      }
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      minWidth: '100vw',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 0,
      overflow: 'hidden',
    }}>
      <img
        src={gifs[bgIndex]}
        alt="background gif"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          objectFit: 'cover',
          zIndex: 0,
          transition: 'opacity 1s',
          opacity: 1
        }}
      />
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0,0,0,0.45)',
        zIndex: 1
      }} />
      <Container maxWidth="xs" sx={{
        position: 'relative',
        zIndex: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
      }}>
        <Box mt={10} sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Paper elevation={6} sx={{ p: 4, borderRadius: 4, background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)' }}>
            <Typography variant="h5" align="center" gutterBottom>Вход</Typography>
            <form onSubmit={handleSubmit}>
              <TextField label="Логин" fullWidth margin="normal" value={username} onChange={e => setUsername(e.target.value)} required />
              <TextField label="Пароль" type="password" fullWidth margin="normal" value={password} onChange={e => setPassword(e.target.value)} required />
              {error && <Typography color="error">{error}</Typography>}
              <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>Войти</Button>
            </form>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
} 