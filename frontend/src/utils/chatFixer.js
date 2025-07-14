// Автоматический исправитель Chat.js
// Применяет исправления на основе результатов тестирования

export const fixChatJS = async (testResults) => {
  console.log('🔧 Начинаем исправление Chat.js...');
  
  // Анализируем результаты тестов
  const problematicModels = [];
  
  for (const [modelId, results] of Object.entries(testResults)) {
    const hasErrors = Object.values(results).some(r => r && r.status === 'error');
    if (hasErrors) {
      problematicModels.push({
        id: modelId,
        errors: results
      });
    }
  }
  
  console.log('Проблемные модели:', problematicModels);
  
  // Генерируем исправления для Chat.js
  const fixes = generateChatFixes(problematicModels);
  
  return fixes;
};

const generateChatFixes = (problematicModels) => {
  const fixes = {
    modelIdMap: {},
    specialHandling: {},
    parameterFixes: {}
  };
  
  for (const model of problematicModels) {
    const { id, errors } = model;
    
    // Исправления для конкретных моделей
    switch (id) {
      case 'midjourney':
        fixes.modelIdMap[id] = 'midjourney-v6'; // Обновляем ID
        fixes.specialHandling[id] = {
          removeParameters: ['temperature', 'top_p', 'max_tokens', 'frequency_penalty', 'presence_penalty'],
          useOnly: ['model', 'messages']
        };
        break;
        
      case 'openai/dall-e-3':
        fixes.modelIdMap[id] = 'dall-e-3';
        fixes.specialHandling[id] = {
          endpoint: 'images/generations',
          addParameters: ['size', 'n', 'quality']
        };
        break;
        
      case 'stability/stable-diffusion-xl':
        fixes.modelIdMap[id] = 'stable-diffusion-xl-1024-v1-0';
        fixes.specialHandling[id] = {
          endpoint: 'generation/stable-diffusion-xl-1024-v1-0/text-to-image',
          addParameters: ['width', 'height', 'steps', 'cfg_scale']
        };
        break;
        
      case 'openai/codex':
        fixes.modelIdMap[id] = 'code-davinci-002';
        fixes.parameterFixes[id] = {
          remove: ['frequency_penalty', 'presence_penalty'],
          add: ['stop']
        };
        break;
        
      case 'deepseek/deepseek-coder':
        fixes.modelIdMap[id] = 'deepseek-coder-33b-instruct';
        fixes.parameterFixes[id] = {
          remove: ['frequency_penalty', 'presence_penalty']
        };
        break;
        
      case 'google/palm-2':
        fixes.modelIdMap[id] = 'text-bison-001';
        fixes.parameterFixes[id] = {
          remove: ['frequency_penalty', 'presence_penalty'],
          rename: { 'temperature': 'temperature', 'top_p': 'top_p' }
        };
        break;
        
      case 'google/bard':
        fixes.modelIdMap[id] = 'chat-bison-001';
        fixes.parameterFixes[id] = {
          remove: ['frequency_penalty', 'presence_penalty']
        };
        break;
        
      case 'cohere/command-r-plus':
        fixes.modelIdMap[id] = 'command-r-plus';
        fixes.parameterFixes[id] = {
          remove: ['frequency_penalty', 'presence_penalty']
        };
        break;
        
      default:
        // Общие исправления для моделей с ошибками 400
        if (Object.values(errors).some(e => e?.message?.includes('400'))) {
          fixes.parameterFixes[id] = {
            remove: ['frequency_penalty', 'presence_penalty'],
            simplify: true
          };
        }
    }
  }
  
  return fixes;
};

// Функция для применения исправлений к Chat.js
export const applyFixesToChatJS = (fixes) => {
  console.log('Применяем исправления к Chat.js:', fixes);
  
  // Здесь будет код для автоматического обновления Chat.js
  // Пока возвращаем инструкции
  
  const instructions = {
    modelIdMapUpdates: fixes.modelIdMap,
    specialHandling: fixes.specialHandling,
    parameterFixes: fixes.parameterFixes,
    nextSteps: [
      'Обновить modelIdMap с новыми ID',
      'Добавить специальную обработку для проблемных моделей',
      'Исправить параметры запросов',
      'Добавить проверки перед отправкой запросов'
    ]
  };
  
  return instructions;
}; 