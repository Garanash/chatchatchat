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
          <Paper elevation={3} sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom>Настройки API-ключей</Typography>
            {Object.keys(input).map((k, idx) => (
              <TextField key={idx} label={k} name={k} value={input[k]} onChange={handleChange} fullWidth margin="normal" />
            ))}
            <TextField label="Добавить новый ключ (имя)" onBlur={e => { if (e.target.value) setInput({ ...input, [e.target.value]: "" }); e.target.value = ""; }} fullWidth margin="normal" />
            <Button variant="contained" onClick={handleSave} sx={{ mt: 2 }}>Сохранить</Button>
            {msg && <Typography color="success.main" sx={{ mt: 2 }}>{msg}</Typography>}
          </Paper>
        </Box>
      </Container>
    </>
  );
} 