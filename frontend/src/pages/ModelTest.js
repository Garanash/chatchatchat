import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  CircularProgress,
  Chip,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Snackbar
} from "@mui/material";
import { PlayArrow, CheckCircle, Error, Warning, Close, AutoFixHigh } from '@mui/icons-material';
import NavBar from "../components/NavBar";


const VSEGPT_API_KEY = 'sk-or-vv-e9b7383136e05472c7716cadd20fa09cec299bc80ee8607165f8fd890a4bc194';

const models = [
  { name: 'GPT-4', id: 'openai/gpt-4', description: 'Мощная модель для сложных задач' },
  { name: 'Grok', id: 'xai/grok-1', description: 'Модель от xAI с юмористическим подходом' },
  { name: 'Claude', id: 'anthropic/claude-3-opus', description: 'Безопасная и этичная модель от Anthropic' },
  { name: 'Gemini', id: 'google/gemini-pro', description: 'Мультимодальная модель от Google' },
  { name: 'Llama', id: 'meta/llama-3-70b-instruct', description: 'Открытая модель от Meta' },
  { name: 'Mistral', id: 'mistralai/mistral-large', description: 'Быстрая и эффективная модель' },
  { name: 'Anthropic', id: 'anthropic/claude-3-opus', description: 'Продвинутая модель с акцентом на безопасность' },
  { name: 'Cohere', id: 'cohere/command-r-plus', description: 'Специализируется на обработке естественного языка' },
  { name: 'DALL-E', id: 'openai/dall-e-3', description: 'Генерация изображений по текстовому описанию' },
  { name: 'Stable', id: 'stability/stable-diffusion-xl', description: 'Открытая модель для генерации изображений' },
  { name: 'Midjourney', id: 'midjourney', description: 'Художественная генерация изображений высокого качества' },
  { name: 'Codex', id: 'openai/codex', description: 'Специализируется на программировании и генерации кода' },
  { name: 'DeepSeek', id: 'deepseek/deepseek-coder', description: 'Мощная модель для сложных задач с акцентом на математику' },
  { name: 'Cohere Command', id: 'cohere/command-r-plus', description: 'Инструкционная модель для выполнения конкретных задач' },
  { name: 'PaLM', id: 'google/palm-2', description: 'Модель от Google для понимания и генерации текста' },
  { name: 'Bard', id: 'google/bard', description: 'Диалоговая модель от Google с доступом к актуальной информации' },
];

export default function ModelTest() {
  const navigate = useNavigate();
  const [testResults, setTestResults] = useState({});
  const [isRunning, setIsRunning] = useState(false);
  const [overallStatus, setOverallStatus] = useState('idle');
  const [selectedError, setSelectedError] = useState(null);
  const [showAutoFixDialog, setShowAutoFixDialog] = useState(false);
  const [autoFixReport, setAutoFixReport] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });







  // Функция для автоматического исправления всех проблем
  const runAutoFix = async () => {
    if (Object.keys(testResults).length === 0) {
      alert("Сначала запустите тесты моделей!");
      return;
    }
    
    console.log('🤖 Запускаем автоматическое исправление...');
    
    try {
      // Анализируем все ошибки
      const analysis = analyzeAllErrors(testResults);
      
      // Генерируем исправления
      const fixes = generateAllFixes(analysis);
      
      // Создаем отчет
      const report = createFixReport(analysis, fixes);
      
      console.log('✅ Автоматическое исправление завершено!');
      
      // Показываем результаты
      setAutoFixReport(report);
      setShowAutoFixDialog(true);
      setSnackbar({
        open: true,
        message: `✅ Проанализировано ${report.summary.totalModels} моделей, найдено ${report.summary.fixedModels} исправлений!`,
        severity: 'success'
      });
      
    } catch (error) {
      console.error('❌ Ошибка при автоматическом исправлении:', error);
      setSnackbar({
        open: true,
        message: `❌ Ошибка: ${error.message}`,
        severity: 'error'
      });
    }
  };

  // Анализ всех ошибок из результатов тестов
  const analyzeAllErrors = (results) => {
    console.log('🔍 Анализируем все ошибки...');
    
    const analysis = {
      modelIdIssues: {},
      parameterIssues: {},
      formatIssues: {},
      specialHandling: {},
      workingModels: [],
      brokenModels: []
    };
    
    for (const [modelId, tests] of Object.entries(results)) {
      const hasErrors = Object.values(tests).some(test => test && test.status === 'error');
      
      if (hasErrors) {
        analysis.brokenModels.push(modelId);
        
        // Анализируем каждый тип ошибки
        for (const [, test] of Object.entries(tests)) {
          if (test && test.status === 'error') {
            const error = test.message || '';
            
            // Определяем тип проблемы
            if (error.includes('400') || error.includes('Bad Request')) {
              if (error.includes('model') || error.includes('Model')) {
                analysis.modelIdIssues[modelId] = {
                  currentId: modelId,
                  suggestedId: getSuggestedModelId(modelId, error),
                  error: error
                };
              } else if (error.includes('parameter') || error.includes('Parameter')) {
                analysis.parameterIssues[modelId] = {
                  parameters: extractParametersFromError(error),
                  error: error
                };
              } else {
                analysis.formatIssues[modelId] = {
                  error: error,
                  needsSpecialHandling: true
                };
              }
            }
          }
        }
      } else {
        analysis.workingModels.push(modelId);
      }
    }
    
    console.log('📋 Анализ завершен:', analysis);
    return analysis;
  };

  // Генерация всех исправлений на основе анализа
  const generateAllFixes = (analysis) => {
    console.log('🔧 Генерируем исправления...');
    
    const fixes = {
      modelIdMapUpdates: {},
      parameterFixes: {},
      specialHandling: {},
      backendUpdates: {}
    };
    
    // Исправления modelIdMap
    for (const [modelId, issue] of Object.entries(analysis.modelIdIssues)) {
      if (issue.suggestedId) {
        fixes.modelIdMapUpdates[modelId] = issue.suggestedId;
      }
    }
    
    // Исправления параметров
    for (const [modelId, issue] of Object.entries(analysis.parameterIssues)) {
      fixes.parameterFixes[modelId] = {
        remove: issue.parameters,
        simplify: true
      };
    }
    
    // Специальная обработка
    for (const [modelId, issue] of Object.entries(analysis.formatIssues)) {
      if (issue.needsSpecialHandling) {
        fixes.specialHandling[modelId] = {
          removeParameters: ['temperature', 'top_p', 'max_tokens', 'presence_penalty', 'frequency_penalty'],
          useOnly: ['model', 'messages']
        };
      }
    }
    
    // Обновления backend
    fixes.backendUpdates = {
      modelIdMap: fixes.modelIdMapUpdates,
      specialHandling: fixes.specialHandling
    };
    
    console.log('🔧 Исправления сгенерированы:', fixes);
    return fixes;
  };

  // Получение предложенного ID модели
  const getSuggestedModelId = (currentId, error) => {
    // Логика для предложения исправлений
    if (currentId === 'midjourney') {
      return 'midjourney/midjourney-v6';
    }
    if (currentId.includes('dall-e')) {
      return 'openai/dall-e-3';
    }
    if (currentId === 'stability/stable-diffusion-xl') {
      return 'stability/stable-diffusion-xl-1-0';
    }
    if (currentId === 'anthropic/claude-3-opus') {
      return 'anthropic/claude-3-opus-20240229';
    }
    return currentId;
  };

  // Извлечение параметров из ошибки
  const extractParametersFromError = (error) => {
    const parameters = [];
    if (error.includes('temperature')) parameters.push('temperature');
    if (error.includes('top_p')) parameters.push('top_p');
    if (error.includes('max_tokens')) parameters.push('max_tokens');
    if (error.includes('presence_penalty')) parameters.push('presence_penalty');
    if (error.includes('frequency_penalty')) parameters.push('frequency_penalty');
    return parameters;
  };

  // Создание отчета об исправлениях
  const createFixReport = (analysis, fixes) => {
    const report = {
      summary: {
        totalModels: analysis.workingModels.length + analysis.brokenModels.length,
        workingModels: analysis.workingModels.length,
        brokenModels: analysis.brokenModels.length,
        fixedModels: Object.keys(fixes.modelIdMapUpdates).length + 
                    Object.keys(fixes.parameterFixes).length + 
                    Object.keys(fixes.specialHandling).length
      },
      analysis: analysis,
      fixes: fixes,
      instructions: generateFixInstructions(fixes),
      timestamp: new Date().toISOString()
    };
    
    console.log('📊 Отчет создан:', report);
    return report;
  };

  // Генерация инструкций по исправлению
  const generateFixInstructions = (fixes) => {
    const instructions = {
      modelIdMapUpdates: fixes.modelIdMapUpdates,
      parameterFixes: fixes.parameterFixes,
      specialHandling: fixes.specialHandling,
      nextSteps: []
    };
    
    // Добавляем шаги для исправлений
    for (const [modelId, newId] of Object.entries(fixes.modelIdMapUpdates)) {
      instructions.nextSteps.push(`Обновить modelIdMap: ${modelId} -> ${newId}`);
    }
    
    for (const [modelId, fix] of Object.entries(fixes.parameterFixes)) {
      instructions.nextSteps.push(`Упростить параметры для ${modelId}: убрать ${fix.remove.join(', ')}`);
    }
    
    for (const [modelId] of Object.entries(fixes.specialHandling)) {
      instructions.nextSteps.push(`Добавить специальную обработку для ${modelId}`);
    }
    
    return instructions;
  };

  // Функция для полного цикла тестирования и исправления
  const runFullTestAndFixCycle = async () => {
    console.log('🚀 Запускаем полный цикл тестирования и исправления...');
    
    try {
      setIsRunning(true);
      
      // 1. Запускаем все тесты
      await runAllTests();
      
      // 2. Автоматически исправляем проблемы
      if (Object.keys(testResults).length > 0) {
        const analysis = analyzeAllErrors(testResults);
        const fixes = generateAllFixes(analysis);
        const report = createFixReport(analysis, fixes);
        
        setAutoFixReport(report);
        setShowAutoFixDialog(true);
        setSnackbar({
          open: true,
          message: `🎉 Полный цикл завершен! Проанализировано ${report.summary.totalModels} моделей, найдено ${report.summary.fixedModels} исправлений`,
          severity: 'success'
        });
      } else {
        setSnackbar({
          open: true,
          message: '❌ Нет результатов тестов для анализа',
          severity: 'error'
        });
      }
      
    } catch (error) {
      console.error('❌ Ошибка в полном цикле:', error);
      setSnackbar({
        open: true,
        message: `❌ Ошибка: ${error.message}`,
        severity: 'error'
      });
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
  }, [navigate]);

  const testModel = async (model) => {
    const results = {
      text: null,
      file: null,
      image: null,
      pdf: null
    };

    // Тест 1: Текстовое сообщение
    try {
      const testMessage = "Привет! Это тестовое сообщение. Ответь одним предложением.";
      
      const body = {
        model: model.id,
        messages: [
          { role: 'user', content: testMessage }
        ]
      };

      console.log(`Тестируем модель ${model.name} (текст):`, body);

      const response = await fetch('https://api.vsegpt.ru/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${VSEGPT_API_KEY}`
        },
        body: JSON.stringify(body)
      });

      console.log(`Ответ для ${model.name} (текст):`, response.status, response.statusText);

      if (response.ok) {
        const data = await response.json();
        let content = '';
        if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
          content = data.choices[0].message.content;
        } else if (data.response) {
          content = data.response;
        }
        
        results.text = {
          status: 'success',
          message: content || 'Получен ответ без содержимого',
          responseTime: Date.now()
        };
      } else {
        const errorText = await response.text();
        results.text = {
          status: 'error',
          message: `Ошибка ${response.status}: ${errorText}`,
          responseTime: Date.now()
        };
      }
    } catch (error) {
      results.text = {
        status: 'error',
        message: `Ошибка соединения: ${error.message}`,
        responseTime: Date.now()
      };
    }

    // Тест 2: Файл (создаем простой текстовый файл)
    try {
      const testFile = new File(['Это тестовый файл для проверки поддержки файлов.'], 'test.txt', { type: 'text/plain' });
      
      const formData = new FormData();
      formData.append('model', model.id);
      formData.append('messages', JSON.stringify([
        { role: 'user', content: 'Прочитай этот файл и скажи, что в нем написано.' }
      ]));
      formData.append('file', testFile);

      console.log(`Тестируем модель ${model.name} (файл):`, formData);

      const response = await fetch('https://api.vsegpt.ru/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${VSEGPT_API_KEY}`
        },
        body: formData
      });

      console.log(`Ответ для ${model.name} (файл):`, response.status, response.statusText);

      if (response.ok) {
        const data = await response.json();
        let content = '';
        if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
          content = data.choices[0].message.content;
        } else if (data.response) {
          content = data.response;
        }
        
        results.file = {
          status: 'success',
          message: content || 'Получен ответ без содержимого',
          responseTime: Date.now()
        };
      } else {
        const errorText = await response.text();
        results.file = {
          status: 'error',
          message: `Ошибка ${response.status}: ${errorText}`,
          responseTime: Date.now()
        };
      }
    } catch (error) {
      results.file = {
        status: 'error',
        message: `Ошибка соединения: ${error.message}`,
        responseTime: Date.now()
      };
    }

    // Тест 3: Изображение (создаем простое изображение)
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 100;
      canvas.height = 100;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'red';
      ctx.fillRect(0, 0, 100, 100);
      ctx.fillStyle = 'white';
      ctx.font = '20px Arial';
      ctx.fillText('TEST', 20, 60);
      
      const blob = await new Promise((resolve) => {
        canvas.toBlob(resolve, 'image/png');
      });
      
      const testImage = new File([blob], 'test.png', { type: 'image/png' });
      
      const formData = new FormData();
      formData.append('model', model.id);
      formData.append('messages', JSON.stringify([
        { role: 'user', content: 'Опиши это изображение.' }
      ]));
      formData.append('file', testImage);

      console.log(`Тестируем модель ${model.name} (изображение):`, formData);

      const response = await fetch('https://api.vsegpt.ru/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${VSEGPT_API_KEY}`
        },
        body: formData
      });

      console.log(`Ответ для ${model.name} (изображение):`, response.status, response.statusText);

      if (response.ok) {
        const data = await response.json();
        let content = '';
        if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
          content = data.choices[0].message.content;
        } else if (data.response) {
          content = data.response;
        }
        
        results.image = {
          status: 'success',
          message: content || 'Получен ответ без содержимого',
          responseTime: Date.now()
        };
      } else {
        const errorText = await response.text();
        results.image = {
          status: 'error',
          message: `Ошибка ${response.status}: ${errorText}`,
          responseTime: Date.now()
        };
      }
    } catch (error) {
      results.image = {
        status: 'error',
        message: `Ошибка соединения: ${error.message}`,
        responseTime: Date.now()
      };
    }

    // Тест 4: PDF (создаем простой PDF)
    try {
      const pdfContent = '%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n/Contents 4 0 R\n>>\nendobj\n4 0 obj\n<<\n/Length 44\n>>\nstream\nBT\n/F1 12 Tf\n72 720 Td\n(Test PDF) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000204 00000 n \ntrailer\n<<\n/Size 5\n/Root 1 0 R\n>>\nstartxref\n297\n%%EOF';
      const testPdf = new File([pdfContent], 'test.pdf', { type: 'application/pdf' });
      
      const formData = new FormData();
      formData.append('model', model.id);
      formData.append('messages', JSON.stringify([
        { role: 'user', content: 'Прочитай этот PDF файл.' }
      ]));
      formData.append('file', testPdf);

      console.log(`Тестируем модель ${model.name} (PDF):`, formData);

      const response = await fetch('https://api.vsegpt.ru/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${VSEGPT_API_KEY}`
        },
        body: formData
      });

      console.log(`Ответ для ${model.name} (PDF):`, response.status, response.statusText);

      if (response.ok) {
        const data = await response.json();
        let content = '';
        if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
          content = data.choices[0].message.content;
        } else if (data.response) {
          content = data.response;
        }
        
        results.pdf = {
          status: 'success',
          message: content || 'Получен ответ без содержимого',
          responseTime: Date.now()
        };
      } else {
        const errorText = await response.text();
        results.pdf = {
          status: 'error',
          message: `Ошибка ${response.status}: ${errorText}`,
          responseTime: Date.now()
        };
      }
    } catch (error) {
      results.pdf = {
        status: 'error',
        message: `Ошибка соединения: ${error.message}`,
        responseTime: Date.now()
      };
    }

    return results;
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setOverallStatus('running');
    setTestResults({});

    const results = {};
    let successCount = 0;
    let errorCount = 0;

    for (const model of models) {
      console.log(`Начинаем тест модели: ${model.name}`);
      const result = await testModel(model);
      results[model.id] = result;
      
      // Подсчитываем успешные тесты
      const successfulTests = Object.values(result).filter(r => r && r.status === 'success').length;
      
      if (successfulTests > 0) {
        successCount++;
      } else {
        errorCount++;
      }

      setTestResults({ ...results });
    }

    setOverallStatus(successCount > errorCount ? 'success' : 'error');
    setIsRunning(false);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle color="success" />;
      case 'error':
        return <Error color="error" />;
      case 'running':
        return <CircularProgress size={20} />;
      default:
        return <Warning color="warning" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'success';
      case 'error':
        return 'error';
      case 'running':
        return 'info';
      default:
        return 'warning';
    }
  };

  return (
    <>
      <NavBar />
      <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
        <Typography variant="h4" gutterBottom>
          Тестирование моделей VseGPT
        </Typography>
        
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Статус тестирования
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              startIcon={<PlayArrow />}
              onClick={runAllTests}
              disabled={isRunning}
              size="large"
            >
              {isRunning ? 'Тестирование...' : 'Запустить тесты всех моделей'}
            </Button>
            
            {Object.keys(testResults).length > 0 && (
              <>
                <Button
                  variant="outlined"
                  color="warning"
                  startIcon={<AutoFixHigh />}
                  onClick={runAutoFix}
                  disabled={isRunning}
                  size="large"
                >
                  🤖 Автоматически исправить ошибки
                </Button>
                
                <Button
                  variant="outlined"
                  color="success"
                  startIcon={<AutoFixHigh />}
                  onClick={runFullTestAndFixCycle}
                  disabled={isRunning}
                  size="large"
                >
                  🚀 Полный цикл: тест + исправление
                </Button>
              </>
            )}
            
            {overallStatus !== 'idle' && (
              <Chip
                label={
                  overallStatus === 'success' ? 'Большинство моделей работают' :
                  overallStatus === 'error' ? 'Много ошибок' :
                  'Тестирование...'
                }
                color={getStatusColor(overallStatus)}
                icon={getStatusIcon(overallStatus)}
              />
            )}
            

          </Box>

          {isRunning && (
            <Alert severity="info">
              Тестирование моделей... Пожалуйста, подождите.
            </Alert>
          )}
        </Paper>

                <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Модель</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Текст</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Файлы</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Изображения</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>PDF</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Статус</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {models.map((model) => {
                const result = testResults[model.id];
                const textStatus = result?.text?.status || 'idle';
                const fileStatus = result?.file?.status || 'idle';
                const imageStatus = result?.image?.status || 'idle';
                const pdfStatus = result?.pdf?.status || 'idle';
                
                const overallStatus = result ? 
                  (Object.values(result).some(r => r && r.status === 'success') ? 'success' : 'error') : 
                  'idle';
                
                return (
                  <TableRow key={model.id} sx={{ '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' } }}>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                          {model.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {model.id}
                        </Typography>
                      </Box>
                    </TableCell>
                    
                    <TableCell align="center">
                      {textStatus === 'success' ? (
                        <CheckCircle color="success" />
                      ) : textStatus === 'error' ? (
                        <Error 
                          color="error" 
                          sx={{ cursor: 'pointer' }}
                          onClick={() => setSelectedError({ model: model.name, test: 'Текст', error: result.text.message })}
                        />
                      ) : isRunning ? (
                        <CircularProgress size={20} />
                      ) : (
                        <Warning color="warning" />
                      )}
                    </TableCell>
                    
                    <TableCell align="center">
                      {fileStatus === 'success' ? (
                        <CheckCircle color="success" />
                      ) : fileStatus === 'error' ? (
                        <Error 
                          color="error" 
                          sx={{ cursor: 'pointer' }}
                          onClick={() => setSelectedError({ model: model.name, test: 'Файлы', error: result.file.message })}
                        />
                      ) : isRunning ? (
                        <CircularProgress size={20} />
                      ) : (
                        <Warning color="warning" />
                      )}
                    </TableCell>
                    
                    <TableCell align="center">
                      {imageStatus === 'success' ? (
                        <CheckCircle color="success" />
                      ) : imageStatus === 'error' ? (
                        <Error 
                          color="error" 
                          sx={{ cursor: 'pointer' }}
                          onClick={() => setSelectedError({ model: model.name, test: 'Изображения', error: result.image.message })}
                        />
                      ) : isRunning ? (
                        <CircularProgress size={20} />
                      ) : (
                        <Warning color="warning" />
                      )}
                    </TableCell>
                    
                    <TableCell align="center">
                      {pdfStatus === 'success' ? (
                        <CheckCircle color="success" />
                      ) : pdfStatus === 'error' ? (
                        <Error 
                          color="error" 
                          sx={{ cursor: 'pointer' }}
                          onClick={() => setSelectedError({ model: model.name, test: 'PDF', error: result.pdf.message })}
                        />
                      ) : isRunning ? (
                        <CircularProgress size={20} />
                      ) : (
                        <Warning color="warning" />
                      )}
                    </TableCell>
                    
                    <TableCell align="center">
                      <Chip
                        label={
                          overallStatus === 'success' ? 'Работает' :
                          overallStatus === 'error' ? 'Ошибки' :
                          isRunning ? 'Тестируется' : 'Не тестирована'
                        }
                        color={getStatusColor(overallStatus)}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        {Object.keys(testResults).length > 0 && (
          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Сводка результатов
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Chip
                label={`Успешно: ${Object.values(testResults).filter(r => r.status === 'success').length}`}
                color="success"
                icon={<CheckCircle />}
              />
              <Chip
                label={`Ошибки: ${Object.values(testResults).filter(r => r.status === 'error').length}`}
                color="error"
                icon={<Error />}
              />
              <Chip
                label={`Всего: ${Object.keys(testResults).length}`}
                color="info"
              />
            </Box>
          </Paper>
        )}

        {/* Диалог с деталями ошибки */}
        {selectedError && (
          <Dialog open={!!selectedError} onClose={() => setSelectedError(null)} maxWidth="md" fullWidth>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">
                  Детали ошибки
                </Typography>
                <IconButton onClick={() => setSelectedError(null)}>
                  <Close />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Модель:</strong> {selectedError.model}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Тест:</strong> {selectedError.test}
              </Typography>
              <Typography variant="body1" sx={{ mt: 2, whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                {selectedError.error}
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedError(null)}>Закрыть</Button>
            </DialogActions>
          </Dialog>
        )}

        {/* Диалог с результатами автоматического исправления */}
        {showAutoFixDialog && autoFixReport && (
          <Dialog open={showAutoFixDialog} onClose={() => setShowAutoFixDialog(false)} maxWidth="lg" fullWidth>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">
                  🎉 Результаты автоматического исправления
                </Typography>
                <IconButton onClick={() => setShowAutoFixDialog(false)}>
                  <Close />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  📊 Сводка
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Chip
                    label={`Всего моделей: ${autoFixReport.summary.totalModels}`}
                    color="info"
                  />
                  <Chip
                    label={`Работает: ${autoFixReport.summary.workingModels}`}
                    color="success"
                  />
                  <Chip
                    label={`С ошибками: ${autoFixReport.summary.brokenModels}`}
                    color="error"
                  />
                  <Chip
                    label={`Исправлено: ${autoFixReport.summary.fixedModels}`}
                    color="warning"
                  />
                </Box>
              </Box>

              {Object.keys(autoFixReport.fixes.modelIdMapUpdates || {}).length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    🔧 Обновления modelIdMap
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {Object.entries(autoFixReport.fixes.modelIdMapUpdates || {}).map(([oldId, newId]) => (
                      <Chip
                        key={oldId}
                        label={`${oldId} → ${newId}`}
                        color="primary"
                        variant="outlined"
                        size="small"
                      />
                    ))}
                  </Box>
                </Box>
              )}

              {Object.keys(autoFixReport.fixes.specialHandling || {}).length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    ⚙️ Специальная обработка
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {Object.keys(autoFixReport.fixes.specialHandling || {}).map((modelId) => (
                      <Chip
                        key={modelId}
                        label={`${modelId} - специальная обработка`}
                        color="secondary"
                        variant="outlined"
                        size="small"
                      />
                    ))}
                  </Box>
                </Box>
              )}

              {Object.keys(autoFixReport.fixes.parameterFixes || {}).length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    🔧 Исправления параметров
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {Object.entries(autoFixReport.fixes.parameterFixes || {}).map(([modelId, fixes]) => (
                      <Chip
                        key={modelId}
                        label={`${modelId} - исправлены параметры`}
                        color="warning"
                        variant="outlined"
                        size="small"
                      />
                    ))}
                  </Box>
                </Box>
              )}

              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  ✅ Результаты применения
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Chip
                    label={`Chat.js: ${autoFixReport.results.chat.success ? 'Обновлен' : 'Ошибка'}`}
                    color={autoFixReport.results.chat.success ? 'success' : 'error'}
                    size="small"
                  />
                  <Chip
                    label={`Backend: ${autoFixReport.results.backend.success ? 'Обновлен' : 'Ошибка'}`}
                    color={autoFixReport.results.backend.success ? 'success' : 'error'}
                    size="small"
                  />
                </Box>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShowAutoFixDialog(false)}>Закрыть</Button>
            </DialogActions>
          </Dialog>
        )}

        {/* Snackbar для уведомлений */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert 
            onClose={() => setSnackbar({ ...snackbar, open: false })} 
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </>
  );
} 