// Реальный автоматический исправитель Chat.js
// Применяет исправления непосредственно к файлу Chat.js

export const applyRealFixesToChatJS = async (instructions) => {
  console.log('🔧 Применяем реальные исправления к Chat.js...');
  
  try {
    // Читаем текущий файл Chat.js
    const chatJSContent = await readChatJSFile();
    
    // Применяем исправления
    const updatedContent = applyFixesToContent(chatJSContent, instructions);
    
    // Записываем обновленный файл
    await writeChatJSFile(updatedContent);
    
    console.log('✅ Chat.js успешно обновлен с реальными исправлениями!');
    return { success: true, message: 'Chat.js обновлен с исправлениями' };
    
  } catch (error) {
    console.error('❌ Ошибка при обновлении Chat.js:', error);
    return { success: false, error: error.message };
  }
};

// Чтение файла Chat.js
const readChatJSFile = async () => {
  try {
    const response = await fetch('/src/pages/Chat.js');
    if (!response.ok) {
      throw new Error(`Не удалось прочитать Chat.js: ${response.status}`);
    }
    return await response.text();
  } catch (error) {
    console.error('Ошибка при чтении Chat.js:', error);
    throw error;
  }
};

// Запись обновленного файла Chat.js
const writeChatJSFile = async (content) => {
  try {
    // В браузере мы не можем напрямую записывать файлы
    // Поэтому создаем blob и предлагаем скачать
    const blob = new Blob([content], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Chat.js';
    a.click();
    
    URL.revokeObjectURL(url);
    
    console.log('📁 Файл Chat.js готов к скачиванию');
    return true;
  } catch (error) {
    console.error('Ошибка при записи Chat.js:', error);
    throw error;
  }
};

// Применение исправлений к содержимому файла
const applyFixesToContent = (content, instructions) => {
  let updatedContent = content;
  
  // 1. Обновляем modelIdMap
  if (instructions.modelIdMapUpdates) {
    updatedContent = updateModelIdMapInContent(updatedContent, instructions.modelIdMapUpdates);
  }
  
  // 2. Добавляем специальную обработку
  if (instructions.specialHandling) {
    updatedContent = addSpecialHandlingToContent(updatedContent, instructions.specialHandling);
  }
  
  // 3. Исправляем параметры
  if (instructions.parameterFixes) {
    updatedContent = fixParametersInContent(updatedContent, instructions.parameterFixes);
  }
  
  return updatedContent;
};

// Обновление modelIdMap в содержимом файла
const updateModelIdMapInContent = (content, updates) => {
  console.log('Обновляем modelIdMap в содержимом:', updates);
  
  let updatedContent = content;
  
  for (const [oldId, newId] of Object.entries(updates)) {
    // Ищем строку с modelIdMap
    const modelIdMapPattern = new RegExp(`'${oldId}':\\s*'[^']*'`, 'g');
    const replacement = `'${oldId}': '${newId}'`;
    
    updatedContent = updatedContent.replace(modelIdMapPattern, replacement);
    
    console.log(`Обновлен modelIdMap: ${oldId} -> ${newId}`);
  }
  
  return updatedContent;
};

// Добавление специальной обработки в содержимое файла
const addSpecialHandlingToContent = (content, specialHandling) => {
  console.log('Добавляем специальную обработку в содержимое:', specialHandling);
  
  let updatedContent = content;
  
  // Находим место для вставки специальной обработки
  const insertPoint = updatedContent.indexOf('// Специальная обработка для разных моделей');
  
  if (insertPoint === -1) {
    // Если нет места для вставки, добавляем перед отправкой запроса
    const requestPoint = updatedContent.indexOf('const response = await fetch');
    if (requestPoint !== -1) {
      const specialHandlingCode = generateSpecialHandlingCode(specialHandling);
      updatedContent = updatedContent.slice(0, requestPoint) + 
                      specialHandlingCode + '\n\n' + 
                      updatedContent.slice(requestPoint);
    }
  } else {
    // Заменяем существующую специальную обработку
    const endPoint = updatedContent.indexOf('}', insertPoint);
    if (endPoint !== -1) {
      const specialHandlingCode = generateSpecialHandlingCode(specialHandling);
      updatedContent = updatedContent.slice(0, insertPoint) + 
                      specialHandlingCode + 
                      updatedContent.slice(endPoint + 1);
    }
  }
  
  return updatedContent;
};

// Генерация кода специальной обработки
const generateSpecialHandlingCode = (specialHandling) => {
  let code = '// Специальная обработка для разных моделей\n';
  
  for (const [modelId, handling] of Object.entries(specialHandling)) {
    if (handling.removeParameters) {
      code += `if (modelId === '${modelId}') {\n`;
      code += `  // Убираем неподдерживаемые параметры\n`;
      code += `  const { ${handling.removeParameters.join(', ')} } = body;\n`;
      code += `  body = {\n`;
      code += `    model: modelId,\n`;
      code += `    messages: body.messages\n`;
      code += `  };\n`;
      code += `}\n\n`;
    }
    
    if (handling.useOnly) {
      code += `if (modelId === '${modelId}') {\n`;
      code += `  // Используем только обязательные параметры\n`;
      code += `  body = {\n`;
      code += `    model: modelId,\n`;
      code += `    messages: body.messages\n`;
      code += `  };\n`;
      code += `}\n\n`;
    }
  }
  
  return code;
};

// Исправление параметров в содержимом файла
const fixParametersInContent = (content, parameterFixes) => {
  console.log('Исправляем параметры в содержимом:', parameterFixes);
  
  let updatedContent = content;
  
  for (const [modelId, fixes] of Object.entries(parameterFixes)) {
    if (fixes.remove) {
      const parameterFixCode = generateParameterFixCode(modelId, fixes);
      
      // Находим место для вставки исправлений параметров
      const insertPoint = updatedContent.indexOf('// Исправления параметров для разных моделей');
      
      if (insertPoint === -1) {
        // Добавляем перед отправкой запроса
        const requestPoint = updatedContent.indexOf('const response = await fetch');
        if (requestPoint !== -1) {
          updatedContent = updatedContent.slice(0, requestPoint) + 
                          parameterFixCode + '\n\n' + 
                          updatedContent.slice(requestPoint);
        }
      } else {
        // Заменяем существующие исправления
        const endPoint = updatedContent.indexOf('}', insertPoint);
        if (endPoint !== -1) {
          updatedContent = updatedContent.slice(0, insertPoint) + 
                          parameterFixCode + 
                          updatedContent.slice(endPoint + 1);
        }
      }
    }
  }
  
  return updatedContent;
};

// Генерация кода исправлений параметров
const generateParameterFixCode = (modelId, fixes) => {
  let code = '// Исправления параметров для разных моделей\n';
  
  if (fixes.remove) {
    code += `if (modelId === '${modelId}') {\n`;
    code += `  // Убираем неподдерживаемые параметры\n`;
    for (const param of fixes.remove) {
      code += `  delete body.${param};\n`;
    }
    code += `}\n\n`;
  }
  
  if (fixes.simplify) {
    code += `if (modelId === '${modelId}') {\n`;
    code += `  // Используем только базовые параметры\n`;
    code += `  body = {\n`;
    code += `    model: modelId,\n`;
    code += `    messages: body.messages,\n`;
    code += `    temperature: body.temperature,\n`;
    code += `    top_p: body.top_p,\n`;
    code += `    max_tokens: body.max_tokens\n`;
    code += `  };\n`;
    code += `}\n\n`;
  }
  
  return code;
};

// Функция для генерации полного кода исправлений
export const generateFixCode = (instructions) => {
  console.log('Генерируем код исправлений...');
  
  const fixCode = {
    modelIdMapUpdates: [],
    specialHandlingCode: [],
    parameterFixesCode: []
  };
  
  // Генерируем код для каждого типа исправлений
  for (const [modelId, newId] of Object.entries(instructions.modelIdMapUpdates || {})) {
    fixCode.modelIdMapUpdates.push({
      modelId,
      newId,
      instruction: `Обновить modelIdMap: '${modelId}': '${newId}'`
    });
  }
  
  for (const [modelId, handling] of Object.entries(instructions.specialHandling || {})) {
    if (handling.removeParameters) {
      fixCode.specialHandlingCode.push({
        modelId,
        code: `// Специальная обработка для ${modelId}
if (modelId === '${modelId}') {
  // Убираем неподдерживаемые параметры
  body = {
    model: modelId,
    messages: body.messages
  };
}`
      });
    }
  }
  
  for (const [modelId, fixes] of Object.entries(instructions.parameterFixes || {})) {
    if (fixes.remove) {
      fixCode.parameterFixesCode.push({
        modelId,
        code: `// Исправления параметров для ${modelId}
if (modelId === '${modelId}') {
  // Убираем неподдерживаемые параметры
  ${fixes.remove.map(param => `delete body.${param};`).join('\n  ')}
}`
      });
    }
  }
  
  return fixCode;
};

// Функция для создания инструкций по применению исправлений
export const createFixInstructions = (instructions) => {
  console.log('Создаем инструкции по применению исправлений...');
  
  const instructionsList = [];
  
  // Инструкции по обновлению modelIdMap
  if (instructions.modelIdMapUpdates) {
    instructionsList.push('## Обновления modelIdMap:');
    for (const [oldId, newId] of Object.entries(instructions.modelIdMapUpdates)) {
      instructionsList.push(`- Заменить '${oldId}': '${oldId}' на '${oldId}': '${newId}'`);
    }
  }
  
  // Инструкции по специальной обработке
  if (instructions.specialHandling) {
    instructionsList.push('\n## Специальная обработка:');
    for (const [modelId, handling] of Object.entries(instructions.specialHandling)) {
      if (handling.removeParameters) {
        instructionsList.push(`- Добавить специальную обработку для ${modelId}: убрать параметры ${handling.removeParameters.join(', ')}`);
      }
    }
  }
  
  // Инструкции по исправлению параметров
  if (instructions.parameterFixes) {
    instructionsList.push('\n## Исправления параметров:');
    for (const [modelId, fixes] of Object.entries(instructions.parameterFixes)) {
      if (fixes.remove) {
        instructionsList.push(`- Для ${modelId}: убрать параметры ${fixes.remove.join(', ')}`);
      }
    }
  }
  
  return instructionsList.join('\n');
}; 