import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Paper, FormControl, InputLabel, Select, MenuItem, ListSubheader, Button, Chip } from "@mui/material";
import NavBar from "../components/NavBar";
import { modelsList } from './modelsList';

export default function Main() {
  const navigate = useNavigate();
  const [selectedModel, setSelectedModel] = useState("");
  const [bgIndex, setBgIndex] = useState(0);
  const gifs = [
    process.env.PUBLIC_URL + '/gifs/1.gif',
    process.env.PUBLIC_URL + '/gifs/2.gif',
    process.env.PUBLIC_URL + '/gifs/3.gif',
    process.env.PUBLIC_URL + '/gifs/4.gif'
  ];
  useEffect(() => {
    const interval = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % gifs.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleModelChange = (event) => {
    setSelectedModel(event.target.value);
  };

  const handleGoToChat = () => {
    if (selectedModel) {
      navigate(`/chat/${encodeURIComponent(selectedModel)}`);
    }
  };

  return (
    <>
      <NavBar />
      <Box sx={{
        p: 0,
        m: 0,
        width: '100vw',
        height: '100vh',
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
        <Box sx={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          minWidth: '100vw',
          overflow: 'hidden',
        }}>
          <Paper sx={{
            p: 3,
            mb: 3,
            width: '80vw',
            maxWidth: 900,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: 'rgba(255,255,255,0.7)',
            backdropFilter: 'blur(8px)',
            boxShadow: 6,
            borderRadius: 4,
          }}>
            <Typography variant="h6" gutterBottom>
              Выберите модель для чата
            </Typography>
            <FormControl fullWidth sx={{ mb: 2, width: '80%' }}>
              <InputLabel id="model-select-label">Модель</InputLabel>
              <Select
                labelId="model-select-label"
                value={selectedModel}
                label="Модель"
                onChange={handleModelChange}
                sx={{ minWidth: 320, background: 'rgba(255,255,255,0.5)', borderRadius: 2 }}
                MenuProps={{ PaperProps: { style: { maxHeight: 400, background: 'rgba(255,255,255,0.9)' } } }}
              >
                {Array.from(new Set(modelsList.map(m => m.group))).flatMap(group => [
                  <ListSubheader key={group}>{group}</ListSubheader>,
                  ...modelsList.filter(m => m.group === group).map(m => (
                    <MenuItem key={m.id} value={m.id}>
                      {m.name}
                    </MenuItem>
                  ))
                ])}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              disabled={!selectedModel}
              onClick={() => {
                handleGoToChat();
                setSelectedModel("");
              }}
              sx={{ mt: 2, width: '80%' }}
            >
              Перейти к чату
            </Button>
          </Paper>
        </Box>
      </Box>
    </>
  );
} 