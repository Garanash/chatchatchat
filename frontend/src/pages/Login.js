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
          <Paper elevation={8} sx={{
            p: { xs: 2, sm: 4 },
            borderRadius: 5,
            background: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(10px)',
            width: { xs: '98vw', sm: 400 },
            maxWidth: 420,
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)',
            display: 'flex', flexDirection: 'column', alignItems: 'center'
          }}>
            <Typography variant="h5" align="center" gutterBottom>Вход</Typography>
            <form onSubmit={handleSubmit} style={{ width: '100%' }}>
              <TextField label="Логин" fullWidth margin="normal" value={username} onChange={e => setUsername(e.target.value)} required sx={{ fontSize: { xs: '1.1rem', sm: '1.2rem' } }} inputProps={{ style: { fontSize: 18, padding: 14 } }} />
              <TextField label="Пароль" type="password" fullWidth margin="normal" value={password} onChange={e => setPassword(e.target.value)} required sx={{ fontSize: { xs: '1.1rem', sm: '1.2rem' } }} inputProps={{ style: { fontSize: 18, padding: 14 } }} />
              {error && <Typography color="error" sx={{ fontSize: 16, mt: 1 }}>{error}</Typography>}
              <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2, fontSize: { xs: '1.1rem', sm: '1.2rem' }, p: { xs: '12px 0', sm: '14px 0' }, borderRadius: 3, boxShadow: 3 }}>
                Войти
              </Button>
            </form>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
} 