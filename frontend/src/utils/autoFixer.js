// Автоматический исправитель - применяет все исправления напрямую к файлам
import { applyRealFixesToChatJS } from './realChatFixer.js';

// Глобальная переменная для хранения результатов тестов
let testResults = null;

export const setTestResults = (results) => {
  testResults = results;
  console.log('📊 Результаты тестов сохранены для автоматического исправления');
};

// Автоматический анализ и исправление всех проблем
export const autoFixAllIssues = async () => {
  console.log('🤖 Запускаем автоматическое исправление всех проблем...');
  
  if (!testResults) {
    console.error('❌ Нет результатов тестов для анализа');
    return { success: false, error: 'Нет результатов тестов' };
  }
  
  try {
    // Анализируем все ошибки
    const analysis = analyzeAllErrors(testResults);
    
    // Генерируем исправления
    const fixes = generateAllFixes(analysis);
    
    // Применяем исправления к Chat.js
    const chatResult = await applyFixesToChatJS(fixes);
    
    // Применяем исправления к backend
    const backendResult = await applyFixesToBackend(fixes);
    
    // Создаем отчет
    const report = createFixReport(analysis, fixes, chatResult, backendResult);
    
    console.log('✅ Автоматическое исправление завершено!');
    return { success: true, report };
    
  } catch (error) {
    console.error('❌ Ошибка при автоматическом исправлении:', error);
    return { success: false, error: error.message };
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
    const hasErrors = Object.values(tests).some(test => test.status === 'error');
    
    if (hasErrors) {
      analysis.brokenModels.push(modelId);
      
      // Анализируем каждый тип ошибки
      for (const [testType, test] of Object.entries(tests)) {
        if (test.status === 'error') {
          const error = test.error || '';
          
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

// Применение исправлений к Chat.js
const applyFixesToChatJS = async (fixes) => {
  console.log('📝 Применяем исправления к Chat.js...');
  
  try {
    const result = await applyRealFixesToChatJS(fixes);
    
    if (result.success) {
      console.log('✅ Chat.js успешно обновлен');
      return { success: true, message: 'Chat.js обновлен' };
    } else {
      console.error('❌ Ошибка при обновлении Chat.js:', result.error);
      return { success: false, error: result.error };
    }
    
  } catch (error) {
    console.error('❌ Ошибка при применении исправлений к Chat.js:', error);
    return { success: false, error: error.message };
  }
};

// Применение исправлений к backend
const applyFixesToBackend = async (fixes) => {
  console.log('🔧 Применяем исправления к backend...');
  
  try {
    // Отправляем исправления на backend для применения
    const response = await fetch('/api/apply-backend-fixes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        fixes: fixes.backendUpdates || fixes
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Backend успешно обновлен');
      return { success: true, message: 'Backend обновлен' };
    } else {
      console.error('❌ Ошибка при обновлении backend:', result.error);
      return { success: false, error: result.error };
    }
    
  } catch (error) {
    console.error('❌ Ошибка при обновлении backend:', error);
    return { success: false, error: error.message };
  }
};

// Создание отчета об исправлениях
const createFixReport = (analysis, fixes, chatResult, backendResult) => {
  const report = {
    summary: {
      totalModels: analysis.workingModels.length + analysis.brokenModels.length,
      workingModels: analysis.workingModels.length,
      brokenModels: analysis.brokenModels.length,
      fixedModels: Object.keys(fixes.modelIdMapUpdates).length + 
                   Object.keys(fixes.parameterFixes).length + 
                   Object.keys(fixes.specialHandling).length
    },
    fixes: {
      modelIdUpdates: fixes.modelIdMapUpdates,
      parameterFixes: fixes.parameterFixes,
      specialHandling: fixes.specialHandling
    },
    results: {
      chat: chatResult,
      backend: backendResult
    },
    workingModels: analysis.workingModels,
    brokenModels: analysis.brokenModels
  };
  
  console.log('📊 Отчет об исправлениях:', report);
  return report;
};

// Вспомогательные функции
const getSuggestedModelId = (currentId, error) => {
  // Логика для определения правильного ID модели
  const suggestions = {
    'midjourney': 'midjourney-v6',
    'dalle': 'dall-e-3',
    'gpt-4': 'gpt-4-turbo',
    'gpt-3.5': 'gpt-3.5-turbo'
  };
  
  return suggestions[currentId.toLowerCase()] || currentId;
};

const extractParametersFromError = (error) => {
  // Извлекаем параметры из ошибки
  const parameters = [];
  
  if (error.includes('temperature')) parameters.push('temperature');
  if (error.includes('top_p')) parameters.push('top_p');
  if (error.includes('max_tokens')) parameters.push('max_tokens');
  if (error.includes('presence_penalty')) parameters.push('presence_penalty');
  if (error.includes('frequency_penalty')) parameters.push('frequency_penalty');
  
  return parameters;
};

// Функция для запуска полного цикла тестирования и исправления
export const runFullTestAndFix = async () => {
  console.log('🚀 Запускаем полный цикл тестирования и исправления...');
  
  try {
    // 1. Запускаем тесты (если результаты еще не получены)
    if (!testResults) {
      console.log('📊 Запускаем тесты моделей...');
      // Здесь должен быть вызов функции тестирования
      // testResults = await runModelTests();
    }
    
    // 2. Автоматически исправляем все проблемы
    const result = await autoFixAllIssues();
    
    if (result.success) {
      console.log('🎉 Полный цикл завершен успешно!');
      console.log('📊 Отчет:', result.report);
    } else {
      console.error('❌ Ошибка в полном цикле:', result.error);
    }
    
    return result;
    
  } catch (error) {
    console.error('❌ Ошибка в полном цикле:', error);
    return { success: false, error: error.message };
  }
};

// Экспорт для использования в других компонентах
export const getAutoFixStatus = () => {
  return {
    hasTestResults: !!testResults,
    workingModels: testResults ? Object.keys(testResults).filter(modelId => 
      Object.values(testResults[modelId]).every(test => test.status === 'success')
    ).length : 0,
    totalModels: testResults ? Object.keys(testResults).length : 0
  };
}; 