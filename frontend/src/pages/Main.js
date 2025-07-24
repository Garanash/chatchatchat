import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Paper, FormControl, InputLabel, Select, MenuItem, ListSubheader, Button, Chip } from "@mui/material";
import NavBar from "../components/NavBar";
import { modelsList } from './modelsList';

// Функция для форматирования описания с переносами строк
function formatDescription(desc) {
  return desc.replace(/([.!?])\s+/g, '$1\n');
}

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
            p: { xs: 2, sm: 3 },
            mb: 3,
            width: { xs: '98vw', sm: '80vw' },
            maxWidth: 900,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)',
            borderRadius: 5,
          }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', fontSize: { xs: 20, sm: 24 } }}>
              <img src="https://img.icons8.com/color/48/mountain.png" alt="mountain" style={{ height: 40, marginRight: 10 }} />
              Выбрать LLM для чата
            </Typography>
            <FormControl fullWidth sx={{ mb: 2, width: { xs: '100%', sm: '80%' } }}>
              <InputLabel id="model-select-label">Модель</InputLabel>
              <Select
                labelId="model-select-label"
                value={selectedModel}
                label="Модель"
                onChange={handleModelChange}
                sx={{ minWidth: { xs: 0, sm: 320 }, background: 'rgba(255,255,255,0.5)', borderRadius: 2, fontSize: { xs: 16, sm: 18 } }}
                MenuProps={{ PaperProps: { style: { maxHeight: 400, background: 'rgba(255,255,255,0.9)' } } }}
              >
                {modelsList.filter(m => !m.hidden).map(m => (
                  <MenuItem key={m.id} value={m.id}>
                    <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 420 }}>
                      <span style={{ fontWeight: 500 }}>{m.name}</span>
                      {m.description && (
                        <span style={{ fontSize: 13, color: '#666', marginTop: 2, lineHeight: 1.3, whiteSpace: 'pre-line' }}>
                          {formatDescription(m.description)}
                        </span>
                      )}
                    </div>
                  </MenuItem>
                ))}
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
              sx={{ mt: 2, width: { xs: '100%', sm: '80%' }, fontSize: { xs: '1.1rem', sm: '1.2rem' }, p: { xs: '12px 0', sm: '14px 0' }, borderRadius: 3, boxShadow: 3 }}
            >
              Перейти к чату
            </Button>
            <Typography variant="body2" sx={{ mt: 2, color: 'gray', fontSize: { xs: 12, sm: 13 }, textAlign: 'center' }}>
              Мы можем добавить любые LLM с сайта vsegpt. Список всех моделей: <a href="https://vsegpt.ru/Docs/ModelsNew" target="_blank" rel="noopener noreferrer">https://vsegpt.ru/Docs/ModelsNew</a>
            </Typography>
          </Paper>
        </Box>
      </Box>
    </>
  );
} 