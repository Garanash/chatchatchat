import React, { useEffect, useState } from "react";
import { Container, Typography, Box, Paper, TextField, Button } from "@mui/material";
import axios from "../axiosConfig";
import NavBar from "../components/NavBar";

export default function Settings() {
  const [keys, setKeys] = useState({});
  const [input, setInput] = useState({});
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios.get("/api-keys", { headers: { Authorization: `Bearer ${token}` } })
      .then(res => { setKeys(res.data.keys); setInput(res.data.keys); });
  }, []);

  const handleChange = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    await axios.post("/api-keys", { keys: input }, { headers: { Authorization: `Bearer ${token}` } });
    setMsg("Сохранено!");
    setKeys(input);
    setTimeout(() => setMsg(""), 2000);
  };

  return (
    <>
      <NavBar />
      <Container maxWidth="sm">
        <Box mt={6}>
          <Paper elevation={8} sx={{
            p: { xs: 2, sm: 4 },
            borderRadius: 5,
            background: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(10px)',
            width: { xs: '98vw', sm: 500 },
            maxWidth: 520,
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)',
            display: 'flex', flexDirection: 'column', alignItems: 'center'
          }}>
            <Typography variant="h5" gutterBottom>Настройки API-ключей</Typography>
            {Object.keys(input).map((k, idx) => (
              <TextField key={idx} label={k} name={k} value={input[k]} onChange={handleChange} fullWidth margin="normal" sx={{ fontSize: { xs: '1.1rem', sm: '1.2rem' } }} inputProps={{ style: { fontSize: 18, padding: 14 } }} />
            ))}
            <TextField label="Добавить новый ключ (имя)" onBlur={e => { if (e.target.value) setInput({ ...input, [e.target.value]: "" }); e.target.value = ""; }} fullWidth margin="normal" sx={{ fontSize: { xs: '1.1rem', sm: '1.2rem' } }} inputProps={{ style: { fontSize: 18, padding: 14 } }} />
            <Button variant="contained" onClick={handleSave} sx={{ mt: 2, fontSize: { xs: '1.1rem', sm: '1.2rem' }, p: { xs: '12px 0', sm: '14px 0' }, borderRadius: 3, boxShadow: 3 }}>Сохранить</Button>
            {msg && <Typography color="success.main" sx={{ mt: 2, fontSize: 16 }}>{msg}</Typography>}
          </Paper>
        </Box>
      </Container>
    </>
  );
} 