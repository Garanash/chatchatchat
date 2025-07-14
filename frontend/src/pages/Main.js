import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Paper, FormControl, InputLabel, Select, MenuItem, ListSubheader, Button, Chip } from "@mui/material";
import NavBar from "../components/NavBar";
import { allModels } from './models';

export default function Main() {
  const navigate = useNavigate();
  const [selectedModel, setSelectedModel] = useState("");

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
      <Box sx={{ p: 3, maxWidth: 600, mx: "auto" }}>
        <Typography variant="h4" gutterBottom>
          VseGPT — универсальный чат с поддержкой популярных LLM
        </Typography>
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Выберите модель для чата
          </Typography>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="model-select-label">Модель</InputLabel>
            <Select
              labelId="model-select-label"
              value={selectedModel}
              label="Модель"
              onChange={handleModelChange}
              sx={{ minWidth: 320 }}
              MenuProps={{ PaperProps: { style: { maxHeight: 400 } } }}
            >
              {Array.from(new Set(allModels.map(m => m.group))).flatMap(group => [
                <ListSubheader key={group}>{group}</ListSubheader>,
                ...allModels.filter(m => m.group === group).map(m => (
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
              setSelectedModel(""); // сбросить выбор после перехода
            }}
          >
            Перейти к чату
          </Button>
        </Paper>
        <Typography variant="body2" color="text.secondary">
          Только самые популярные и рабочие модели. Для расширенного списка — см. документацию VseGPT.
        </Typography>
      </Box>
    </>
  );
} 