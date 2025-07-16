import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  TextField, 
  Button, 
  List, 
  ListItem, 
  ListItemText, 
  IconButton,
  Drawer,
  Divider,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Tooltip,
  ListSubheader
} from "@mui/material";
import { 
  ArrowBack, 
  Add, 
  Settings, 
  Send,
  Delete,
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Edit as EditIcon,
  AttachFile as AttachFileIcon
} from '@mui/icons-material';
import axios from "../axiosConfig";
import NavBar from "../components/NavBar";
import ReactMarkdown from 'react-markdown';
import { v4 as uuidv4 } from 'uuid';
import { modelsList } from './modelsList';

export default function Chat() {
  const { model } = useParams();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState({
    temperature: 0.7,
    topP: 0.9,
    maxTokens: 1000,
    frequencyPenalty: 0.0,
    presencePenalty: 0.0
  });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");

  // Новый актуальный список моделей VseGPT (июнь 2024)
  const allModels = [
    // OpenAI
    { name: 'GPT-4o', id: 'openai/gpt-4o', group: 'OpenAI', badges: ['🔥 Топ цена/качество', '12 июля 2024', 'Новинка', 'Мультимодальность', 'tools'] },
    { name: 'GPT-4.5 (Preview)', id: 'openai/gpt-4.5-preview', group: 'OpenAI', badges: ['💎 Самый мощный', '2024', 'Медленно', 'Общие задачи'] },
    { name: 'GPT-4.1', id: 'openai/gpt-4.1', group: 'OpenAI', badges: ['2024', 'Общие задачи'] },
    { name: 'GPT-4 Turbo', id: 'openai/gpt-4-turbo', group: 'OpenAI', badges: ['2024', 'tools', 'Общие задачи'] },
    { name: 'GPT-3.5 Turbo', id: 'openai/gpt-3.5-turbo', group: 'OpenAI', badges: ['Быстро', 'Дёшево', 'Общие задачи'] },
    { name: 'DALL-E 3', id: 'openai/dall-e-3', group: 'OpenAI', badges: ['Генерация изображений', '2023'] },
    // Anthropic
    { name: 'Claude 4 Opus', id: 'anthropic/claude-opus-4', group: 'Anthropic', badges: ['2024', 'tools', 'Общие задачи', 'Медленно'] },
    { name: 'Claude 4 Sonnet', id: 'anthropic/claude-sonnet-4', group: 'Anthropic', badges: ['2024', 'Общие задачи'] },
    { name: 'Claude 3 Opus', id: 'anthropic/claude-3-opus', group: 'Anthropic', badges: ['2024', 'Общие задачи'] },
    { name: 'Claude 3 Sonnet', id: 'anthropic/claude-3-sonnet', group: 'Anthropic', badges: ['2024', 'Общие задачи'] },
    // Google
    { name: 'Gemini 2.5 Pro', id: 'google/gemini-2.5-pro', group: 'Google', badges: ['2024', 'tools', 'Общие задачи', 'Медленно'] },
    { name: 'Gemini 2.5 Flash', id: 'google/gemini-2.5-flash', group: 'Google', badges: ['2024', 'Быстро', 'Общие задачи'] },
    { name: 'Gemini 1.5 Pro', id: 'google/gemini-1.5-pro-latest', group: 'Google', badges: ['2024', 'Общие задачи'] },
    { name: 'Gemini 1.0 Pro', id: 'google/gemini-pro', group: 'Google', badges: ['2023', 'Общие задачи'] },
    { name: 'Gemini 1.0 Pro Vision', id: 'google/gemini-pro-vision', group: 'Google', badges: ['Vision', '2023'] },
    // Perplexity
    { name: 'Perplexity Sonar Pro', id: 'perplexity/sonar-pro-online', group: 'Perplexity', badges: ['2024', 'Общие задачи', 'tools'] },
    { name: 'Perplexity Sonar Reasoning Pro', id: 'perplexity/sonar-reasoning-pro-online', group: 'Perplexity', badges: ['2024', 'Общие задачи', 'Reasoning'] },
    // DeepSeek
    { name: 'DeepSeek V3', id: 'deepseek/deepseek-v3', group: 'DeepSeek', badges: ['2025', 'Программирование', 'Reasoning', 'Новинка'] },
    { name: 'DeepSeek Coder', id: 'deepseek/deepseek-coder', group: 'DeepSeek', badges: ['2024', 'Программирование', 'tools'] },
    // Mistral
    { name: 'Mistral Large', id: 'mistralai/mistral-large', group: 'Mistral', badges: ['2024', 'Общие задачи', 'tools'] },
    { name: 'Mixtral 8x7B', id: 'mistralai/mixtral-8x7b-instruct', group: 'Mistral', badges: ['2024', 'Общие задачи', 'tools'] },
    // Qwen
    { name: 'Qwen2 72B', id: 'qwen/qwen2-72b-instruct', group: 'Qwen', badges: ['2024', 'Общие задачи', 'Reasoning'] },
    // Llama
    { name: 'Llama 3 70B', id: 'meta/llama-3-70b-instruct', group: 'Llama', badges: ['2024', 'Общие задачи', 'Reasoning'] },
    // Gemma
    { name: 'Gemma 2 27B', id: 'google/gemma-2-27b-it', group: 'Gemma', badges: ['2024', 'Общие задачи'] },
    // Grok
    { name: 'Grok-4', id: 'xai/grok-4', group: 'Grok', badges: ['2024', 'tools', 'Reasoning', 'Медленно'] },
    { name: 'Grok-1', id: 'xai/grok-1', group: 'Grok', badges: ['2023', 'tools', 'Reasoning'] },
    // Stable Diffusion
    { name: 'Stable Diffusion XL', id: 'stability/stable-diffusion-xl-1-0', group: 'Stable Diffusion', badges: ['Генерация изображений', '2023'] },
    // Cohere
    { name: 'Cohere Command R+', id: 'cohere/command-r-plus', group: 'Cohere', badges: ['2024', 'Общие задачи', 'tools'] },
    // Яндекс
    { name: 'YandexGPT 3', id: 'yandex/yandexgpt-3', group: 'Yandex', badges: ['2024', 'Общие задачи', 'tools'] },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    // Загрузка истории диалогов из БД
    const loadDialogsFromDB = async () => {
      try {
        const dialogsResp = await fetch("/dialogs", {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!dialogsResp.ok) throw new Error("Ошибка загрузки диалогов");
        const dialogs = await dialogsResp.json();
        if (!dialogs || dialogs.length === 0) {
          createNewConversation();
          return;
        }
        // Для каждого диалога загружаем сообщения
        const dialogsWithMessages = await Promise.all(dialogs.map(async (d) => {
          const msgsResp = await fetch(`/dialogs/${d.id}/messages`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          let messages = [];
          if (msgsResp.ok) {
            messages = await msgsResp.json();
          }
          return {
            id: d.id,
            title: d.title || `Диалог ${d.id}`,
            model: d.model || model, // если есть поле model, иначе текущий
            messages: messages.map(m => ({ ...m, id: m.id || uuidv4() }))
          };
        }));
        // --- Ищем диалог для выбранной модели ---
        const found = dialogsWithMessages.find(d => d.model === model);
        if (found) {
          setConversations(dialogsWithMessages);
          setCurrentConversationId(found.id);
          setMessages(found.messages);
          setSelectedModelId(found.model);
        } else {
          // Нет диалога для этой модели — создаём новый
          setConversations(dialogsWithMessages);
          createNewConversation();
        }
      } catch (e) {
        createNewConversation();
      }
    };
    loadDialogsFromDB();
    // eslint-disable-next-line
  }, [navigate, model]);

  // При создании нового диалога:
  const createNewConversation = () => {
    const newId = uuidv4();
    const newConversation = {
      id: newId,
      title: `Новый диалог ${conversations.length + 1}`,
      model: model, // сохраняем model из URL
      messages: []
    };
    setConversations(prev => [...prev, newConversation]);
    setCurrentConversationId(newId);
    setMessages([]);
    setSelectedModelId(model); // явно выставляем выбранную модель
  };

  const selectConversation = (conversationId) => {
    const conversation = conversations.find(c => c.id === conversationId);
    if (conversation) {
      setCurrentConversationId(conversationId);
      setMessages(conversation.messages);
    }
  };

  const deleteConversation = (conversationId) => {
    setConversations(prev => prev.filter(c => c.id !== conversationId));
    if (currentConversationId === conversationId) {
      if (conversations.length > 1) {
        const remainingConversations = conversations.filter(c => c.id !== conversationId);
        selectConversation(remainingConversations[0].id);
      } else {
        createNewConversation();
      }
    }
  };

  const updateConversationTitle = (conversationId, newTitle) => {
    setConversations(prev => 
      prev.map(c => c.id === conversationId ? { ...c, title: newTitle } : c)
    );
  };

  // Новый актуальный modelIdMap
  const modelIdMap = {
    'GPT-4o': 'openai/gpt-4o',
    'GPT-4.5 (Preview)': 'openai/gpt-4.5-preview',
    'GPT-4.1': 'openai/gpt-4.1',
    'GPT-4 Turbo': 'openai/gpt-4-turbo',
    'GPT-3.5 Turbo': 'openai/gpt-3.5-turbo',
    'DALL-E 3': 'openai/dall-e-3',
    'Claude 4 Opus': 'anthropic/claude-opus-4',
    'Claude 4 Sonnet': 'anthropic/claude-sonnet-4',
    'Claude 3 Opus': 'anthropic/claude-3-opus',
    'Claude 3 Sonnet': 'anthropic/claude-3-sonnet',
    'Gemini 2.5 Pro': 'google/gemini-2.5-pro',
    'Gemini 2.5 Flash': 'google/gemini-2.5-flash',
    'Gemini 1.5 Pro': 'google/gemini-1.5-pro-latest',
    'Gemini 1.0 Pro': 'google/gemini-pro',
    'Gemini 1.0 Pro Vision': 'google/gemini-pro-vision',
    'Perplexity Sonar Pro': 'perplexity/sonar-pro-online',
    'Perplexity Sonar Reasoning Pro': 'perplexity/sonar-reasoning-pro-online',
    'DeepSeek V3': 'deepseek/deepseek-v3',
    'DeepSeek Coder': 'deepseek/deepseek-coder',
    'Mistral Large': 'mistralai/mistral-large',
    'Mixtral 8x7B': 'mistralai/mixtral-8x7b-instruct',
    'Qwen2 72B': 'qwen/qwen2-72b-instruct',
    'Llama 3 70B': 'meta/llama-3-70b-instruct',
    'Gemma 2 27B': 'google/gemma-2-27b-it',
    'Grok-4': 'xai/grok-4',
    'Grok-1': 'xai/grok-1',
    'Stable Diffusion XL': 'stability/stable-diffusion-xl-1-0',
    'Cohere Command R+': 'cohere/command-r-plus',
    'YandexGPT 3': 'yandex/yandexgpt-3',
  };

  const VSEGPT_API_KEY = 'sk-or-vv-e9b7383136e05472c7716cadd20fa09cec299bc80ee8607165f8fd890a4bc194';

  // Маппинг поддерживаемых параметров для каждой модели
  const modelParamsMap = {
    'deepseek/deepseek-v3': ['model', 'messages', 'temperature', 'top_p', 'top_k', 'min_p'],
    'deepseek/deepseek-coder': ['model', 'messages', 'temperature', 'top_p', 'top_k', 'min_p'],
    'xai/grok-1': ['model', 'messages'],
    'xai/grok-4': ['model', 'messages'],
    'openai/dall-e-3': ['model', 'prompt', 'n', 'size'],
    'stability/stable-diffusion-xl-1-0': ['model', 'prompt', 'steps', 'width', 'height'],
    'midjourney': ['model', 'prompt'],
    'openai/gpt-4-vision-preview': ['model', 'messages'],
    'openai/gpt-4o': ['model', 'messages'],
    'google/gemini-pro-vision': ['model', 'messages'],
    // По умолчанию для LLM
    'default': ['model', 'messages', 'temperature', 'top_p', 'max_tokens', 'frequency_penalty', 'presence_penalty']
  };

  // Получить объект модели по id
  function getModelById(modelId) {
    return modelsList.find(m => m.id === modelId);
  }

  // Универсальная функция формирования тела запроса для VseGPT
  function buildVseGptRequest({ modelId, input, messages, settings, attachedFile }) {
    return {
      fetchOptions: {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          message: input,
          settings: settings
        })
      },
      endpoint: `/chat/${modelId}`,
      isFile: false
    };
  }

  // Автоматическая коррекция параметров при ошибках 400
  function autoFixParamsOnError(modelId, params, errorText) {
    // Попробовать удалить параметры, которые часто вызывают ошибки
    const knownBadParams = ['temperature', 'top_p', 'max_tokens', 'frequency_penalty', 'presence_penalty', 'top_k', 'min_p', 'steps', 'width', 'height', 'n', 'size', 'prompt', 'messages'];
    let fixed = false;
    let newParams = { ...params };
    // Если ошибка про unsupported parameter
    knownBadParams.forEach(p => {
      if (errorText.includes(p) && newParams[p] !== undefined) {
        delete newParams[p];
        fixed = true;
      }
    });
    // Если ошибка про endpoint — предложить сменить модель
    if (errorText.includes("doesn't support endpoint")) {
      return { suggestModel: true };
    }
    // Если ошибка про messages/prompt — оставить только model+prompt или model+messages
    if (errorText.includes('messages') && newParams.messages) {
      newParams = { model: modelId, prompt: newParams.prompt };
      fixed = true;
    }
    if (errorText.includes('prompt') && newParams.prompt) {
      newParams = { model: modelId, messages: newParams.messages };
      fixed = true;
    }
    return fixed ? { params: newParams } : null;
  }

  // Универсальная функция отправки запроса с максимальной отказоустойчивостью
  async function resilientFetchVseGpt({ modelId, input, messages, settings, attachedFile, maxRetries = 3 }) {
    let attempt = 0;
    let lastError = null;
    let lastResponse = null;
    let lastBody = null;
    let delay = 1000;
    let usedParams = null;
    let autoFixLog = [];
    let params = null;
    let endpoint = `/chat/${modelId}`;
    while (attempt < maxRetries) {
      try {
        const req = buildVseGptRequest({ modelId, input, messages, settings, attachedFile });
        if (req.error) {
          return { error: true, lastError: req.message };
        }
        const { fetchOptions, isFile } = req;
        endpoint = req.endpoint || endpoint;
        lastBody = fetchOptions.body;
        usedParams = fetchOptions;
        if (!isFile) {
          params = JSON.parse(fetchOptions.body);
        }
        // Меняем адрес на свой backend
        const response = await fetch(endpoint, fetchOptions);
        lastResponse = response;
        if (response.ok) return response;
        if (response.status === 400) {
          const errorText = await response.text();
          // Попробовать автоисправление
          const fix = autoFixParamsOnError(modelId, params, errorText);
          if (fix && fix.params) {
            autoFixLog.push(`Попытка автоисправления: удалены параметры, повторная попытка...`);
            const fixedOptions = {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              },
              body: JSON.stringify(fix.params)
            };
            lastBody = fixedOptions.body;
            usedParams = fixedOptions;
            params = fix.params;
            const retryResp = await fetch(endpoint, fixedOptions);
            if (retryResp.ok) {
              autoFixLog.push('Автоисправление успешно!');
              retryResp.autoFixLog = autoFixLog;
              return retryResp;
            }
            lastResponse = retryResp;
            lastError = errorText;
          } else if (fix && fix.suggestModel) {
            autoFixLog.push('Модель не поддерживает этот endpoint. Рекомендуется выбрать другую модель.');
            break;
          } else {
            lastError = errorText;
          }
        } else if ([502, 504, 429].includes(response.status)) {
          await new Promise(res => setTimeout(res, delay));
          delay *= 2;
        } else {
          lastError = await response.text();
          break;
        }
      } catch (err) {
        lastError = err.message;
        await new Promise(res => setTimeout(res, delay));
        delay *= 2;
      }
      attempt++;
    }
    return { error: true, lastError, lastResponse, lastBody, usedParams, autoFixLog };
  }

  const sendMessage = async () => {
    console.log('=== НАЧАЛО sendMessage ===');
    console.log('input:', input);
    console.log('currentConversationId:', currentConversationId);
    console.log('Модель, в которую отправляется запрос:', selectedModelId);
    
    if (!input.trim() || !currentConversationId) return;

    let userMessage = { role: "user", content: input, timestamp: new Date(), id: uuidv4() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    setConversations(prev =>
      prev.map(c =>
        c.id === currentConversationId
          ? { ...c, messages: newMessages }
          : c
      )
    );

    try {
      const modelId = selectedModelId;
      // Используем отказоустойчивую функцию
      const response = await resilientFetchVseGpt({
        modelId,
        input,
        messages: messages.filter(m => m.content && m.content.trim() && !m.content.includes('Ошибка')).map(m => ({ role: m.role, content: m.content })),
        settings,
        attachedFile: null // Удаляем attachedFile
      });
      if (response.error) {
        let userMessage = 'Ошибка при обращении к модели.';
        let techDetails = '';
        let autoFixMsg = '';
        try {
          const errObj = typeof response.lastError === 'string' ? JSON.parse(response.lastError) : response.lastError;
          if (errObj && errObj.error && errObj.error.message) {
            userMessage = errObj.error.message;
            if (userMessage.includes("doesn't support endpoint")) {
              userMessage += '\n\nДанная модель не поддерживает чат-режим. Выберите другую модель для диалога.';
            }
          } else if (typeof response.lastError === 'string') {
            userMessage = response.lastError;
          }
          techDetails = `Технические детали запроса (для разработчика):\n${JSON.stringify(response.lastBody)}\n${response.usedParams ? JSON.stringify(response.usedParams) : ''}`;
          if (response.autoFixLog && response.autoFixLog.length) {
            autoFixMsg = response.autoFixLog.join('\n');
          }
        } catch {}
        setMessages([...messages, {
          role: "assistant",
          content: (
            <>
              <div>{userMessage}</div>
              {autoFixMsg && <div style={{color:'#1976d2',marginTop:8}}>{autoFixMsg}</div>}
              <details style={{marginTop:8}}>
                <summary>Показать детали</summary>
                <pre style={{whiteSpace:'pre-wrap',fontSize:12}}>{techDetails}</pre>
              </details>
            </>
          ),
          timestamp: new Date()
        }]);
        setIsLoading(false);
        return;
      }
      const contentType = response.headers.get('content-type') || '';
      let isStream = contentType.includes('text/event-stream') || contentType.includes('application/octet-stream');
      if (isStream && response.body && window.ReadableStream) {
        // Потоковая обработка
        let botMessage = { role: "assistant", content: "", timestamp: new Date() };
        const updatedMessages = [...newMessages, botMessage];
        setMessages(updatedMessages);
        setConversations(prev =>
          prev.map(c =>
            c.id === currentConversationId
              ? { ...c, messages: updatedMessages }
              : c
          )
        );
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let done = false;
        let fullText = "";
        while (!done) {
          const { value, done: doneReading } = await reader.read();
          done = doneReading;
          if (value) {
            const chunk = decoder.decode(value, { stream: true });
            // VseGPT может отдавать данные как event-stream ("data: ...\n\n")
            chunk.split(/\n/).forEach(line => {
              if (line.startsWith('data:')) {
                const dataStr = line.replace('data:', '').trim();
                if (dataStr && dataStr !== '[DONE]') {
                  try {
                    const json = JSON.parse(dataStr);
                    let delta = '';
                    if (json.choices && json.choices[0] && json.choices[0].delta && json.choices[0].delta.content) {
                      delta = json.choices[0].delta.content;
                    } else if (json.response) {
                      delta = json.response;
                    } else if (typeof json === 'string') {
                      delta = json;
                    }
                    fullText += delta;
                    botMessage.content = fullText;
                    setMessages([...newMessages, { ...botMessage }]);
                  } catch (e) {}
                }
              }
            });
          }
        }
        botMessage.content = fullText || 'Нет ответа от модели.';
        setMessages([...newMessages, { ...botMessage }]);
        setConversations(prev =>
          prev.map(c =>
            c.id === currentConversationId
              ? { ...c, messages: [...newMessages, { ...botMessage }] }
              : c
          )
        );
      } else {
        // Обычная обработка (не stream)
        let data;
        if (contentType.includes('application/json')) {
          data = await response.json();
          let content = '';
          let modelFromResponse = null;
          if (data.model) modelFromResponse = data.model;
          if (data.choices && data.choices[0] && data.choices[0].model) modelFromResponse = data.choices[0].model;
          if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
            content = data.choices[0].message.content;
          } else if (data.response) {
            content = data.response;
          } else if (typeof data === 'string') {
            content = data;
          }
          if (!content) content = 'Нет ответа от модели.';
          data = { response: content };
          console.log('Модель, от которой пришёл ответ:', modelFromResponse || modelId);
        } else if (contentType.startsWith('image/')) {
          const blob = await response.blob();
          data = { response: `<img src="${URL.createObjectURL(blob)}" alt="image" />` };
          console.log('Модель, от которой пришёл ответ (image):', modelId);
        } else if (contentType.startsWith('video/')) {
          const blob = await response.blob();
          data = { response: `<video controls src="${URL.createObjectURL(blob)}" style="max-width:100%"></video>` };
          console.log('Модель, от которой пришёл ответ (video):', modelId);
        } else {
          data = { response: await response.text() };
          if (!data.response) data.response = 'Нет ответа от модели.';
          console.log('Модель, от которой пришёл ответ (text):', modelId);
        }
        const botMessage = {
          role: "assistant",
          content: data.response,
          timestamp: new Date()
        };
        const updatedMessages = [...newMessages, botMessage];
        setMessages(updatedMessages);
        setConversations(prev =>
          prev.map(c =>
            c.id === currentConversationId
              ? { ...c, messages: updatedMessages }
              : c
          )
        );
      }
    } catch (error) {
      let errorMsg = "Ошибка соединения с сервером";
      if (error && error.message && error.message.includes('450')) {
        errorMsg = "Данная модель не поддерживает отправку файлов. Пожалуйста, выберите подходящую модель или отправьте текстовое сообщение.";
        setFileError(errorMsg);
      }
      const errorMessage = {
        role: "assistant",
        content: errorMsg,
        timestamp: new Date()
      };
      setMessages([...newMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const currentConversation = conversations.find(c => c.id === currentConversationId);
  
  // Более надежная инициализация selectedModelId
  const getInitialModelId = () => {
    // model — это id из URL (например, 'openai/gpt-4o')
    if (Object.values(modelIdMap).includes(model)) {
      return model;
    }
    // Если model — это ключ (например, 'GPT-4o'), вернуть id
    if (modelIdMap[model]) {
      return modelIdMap[model];
    }
    // Fallback — первая модель
    return modelsList[0].id;
  };
  
  const [selectedModelId, setSelectedModelId] = useState(getInitialModelId());
  useEffect(() => { 
    setSelectedModelId(getInitialModelId()); 
  }, [model]);

  // Исправление 1: selectedModelId всегда берём из текущего диалога
  useEffect(() => {
    if (currentConversationId) {
      const conv = conversations.find(c => c.id === currentConversationId);
      if (conv && conv.model) {
        setSelectedModelId(conv.model);
        return;
      }
    }
    setSelectedModelId(getInitialModelId());
  }, [currentConversationId, conversations, model]);

  // Исправление 2: сохраняем диалог в БД при уходе со страницы/размонтаже
  useEffect(() => {
    const saveDialog = async () => {
      const conv = conversations.find(c => c.id === currentConversationId);
      if (conv && conv.messages && conv.messages.length > 0) {
        try {
          await fetch('/api/save-dialog', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
              dialogId: conv.id,
              model: conv.model,
              title: conv.title,
              messages: conv.messages
            })
          });
        } catch (e) { /* ignore */ }
      }
    };
    const handleBeforeUnload = (e) => {
      saveDialog();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      saveDialog();
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  // eslint-disable-next-line
  }, [currentConversationId, conversations]);

  const fileSupport = false; // Удаляем поддержку файлов
  const [fileError, setFileError] = useState("");

  function isImageUrl(url) {
    if (typeof url !== 'string' || !url.startsWith('http')) return false;
    // Проверяем расширение или mime-type в ссылке или query
    const lower = url.toLowerCase();
    return (
      /\.(png|jpg|jpeg|gif)(\?|$)/.test(lower) ||
      lower.includes('image/png') ||
      lower.includes('image/jpeg') ||
      lower.includes('image/jpg') ||
      lower.includes('image/gif')
    );
  }

  return (
    <>
      <NavBar />
      <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)' }}>
        {/* Кнопка открытия боковой панели */}
        {!sidebarOpen && (
          <IconButton onClick={() => setSidebarOpen(true)} sx={{ position: 'absolute', left: 8, top: 80, zIndex: 1301 }}>
            <MenuIcon />
          </IconButton>
        )}
        {/* Боковая панель с диалогами */}
        <Drawer
          variant="persistent"
          open={sidebarOpen}
          sx={{
            width: 300,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: 300,
              boxSizing: 'border-box',
              backgroundColor: '#f5f5f5',
              transition: 'width 0.3s',
            },
          }}
        >
          <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Диалоги
            </Typography>
            <IconButton onClick={() => setSidebarOpen(false)}>
              <ChevronLeftIcon />
            </IconButton>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={createNewConversation}
            fullWidth
            sx={{ mb: 2, mx: 2 }}
          >
            Новый диалог
          </Button>
          <Divider />
          <List sx={{ flex: 1, overflow: 'auto' }}>
            {conversations.map((conversation) => (
              <ListItem
                key={conversation.id}
                selected={currentConversationId === conversation.id}
                sx={{
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' },
                  '&.Mui-selected': { backgroundColor: 'rgba(25,118,210,0.08)' }
                }}
                onClick={() => selectConversation(conversation.id)}
              >
                <ListItemText
                  primary={conversation.title}
                  secondary={`${conversation.messages.length} сообщений`}
                />
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteConversation(conversation.id);
                  }}
                >
                  <Delete />
                </IconButton>
              </ListItem>
            ))}
          </List>
        </Drawer>

        {/* Основная область чата */}
        <Box sx={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column',
          width: '100%'
        }}>
          {/* Заголовок чата */}
          <Box sx={{ 
            p: 2, 
            borderBottom: 1, 
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton onClick={() => navigate("/")} sx={{ mr: 1 }}>
                <ArrowBack />
              </IconButton>
              {isEditingTitle ? (
                <TextField
                  value={editedTitle}
                  onChange={e => setEditedTitle(e.target.value)}
                  onBlur={() => {
                    setIsEditingTitle(false);
                    if (editedTitle.trim() && currentConversation) {
                      updateConversationTitle(currentConversation.id, editedTitle.trim());
                    }
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      setIsEditingTitle(false);
                      if (editedTitle.trim() && currentConversation) {
                        updateConversationTitle(currentConversation.id, editedTitle.trim());
                      }
                    }
                  }}
                  size="small"
                  sx={{ mr: 1, width: 200 }}
                  autoFocus
                />
              ) : (
                <Typography variant="h6" sx={{ cursor: 'pointer' }} onClick={() => {
                  setIsEditingTitle(true);
                  setEditedTitle(currentConversation?.title || '');
                }}>
                  {currentConversation?.title || 'Новый диалог'}
                  <IconButton size="small" sx={{ ml: 1 }} onClick={e => {
                    e.stopPropagation();
                    setIsEditingTitle(true);
                    setEditedTitle(currentConversation?.title || '');
                  }}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Typography>
              )}
              {/* В заголовке чата вместо Select возвращаю Chip: */}
              <Chip 
                label={modelsList.find(m => m.id === selectedModelId)?.name || selectedModelId} 
                size="small" 
                sx={{ ml: 2 }}
                color="primary"
              />
            </Box>
            <IconButton onClick={() => setSettingsOpen(true)}>
              <Settings />
            </IconButton>
          </Box>

          {/* Область сообщений */}
          <Box sx={{ 
            flex: 1, 
            overflow: 'auto', 
            p: 2,
            backgroundColor: '#fafafa'
          }}>
            {messages.map((message, index) => (
              <Box
                key={message.id || (message.timestamp + '-' + index)}
                sx={{
                  display: 'flex',
                  justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                  mb: 2
                }}
              >
                <Paper
                  elevation={1}
                  sx={{
                    maxWidth: '70%',
                    p: 2,
                    backgroundColor: message.role === 'user' ? '#1976d2' : '#ffffff',
                    color: message.role === 'user' ? '#ffffff' : '#000000',
                    borderRadius: 2
                  }}
                >
                  {message.role === 'assistant' ? (
                    <Box>
                      {typeof message.content === 'string' ? (
                        isImageUrl(message.content) ? (
                          <img src={message.content} alt="Ответ ассистента (изображение)" style={{maxWidth: '400px', borderRadius: '8px'}} />
                        ) : (
                          <ReactMarkdown>{message.content || ''}</ReactMarkdown>
                        )
                      ) : (
                        message.content
                      )}
                    </Box>
                  ) : (
                    <Typography variant="body1">
                      {(message.content || '')}
                    </Typography>
                  )}
                  {message.file && (
                    <Box sx={{ mt: 1 }}>
                      <a href={message.file.url} download={message.file.name} style={{ color: '#fff', textDecoration: 'underline' }}>
                        {message.file.name}
                      </a>
                    </Box>
                  )}
                  <Typography variant="caption" sx={{ opacity: 0.7, mt: 1, display: 'block' }}>
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </Typography>
                </Paper>
              </Box>
            ))}
            {isLoading && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
                <Paper elevation={1} sx={{ p: 2, backgroundColor: '#ffffff', display: 'flex', alignItems: 'center', gap: 2 }}>
                  <CircularProgress size={24} sx={{ mr: 2 }} />
                  <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
                    Модель печатает...
                  </Typography>
                </Paper>
              </Box>
            )}
            {fileError && (
              <Typography color="error" sx={{ mt: 1 }}>{fileError}</Typography>
            )}
            <div ref={messagesEndRef} />
          </Box>

          {/* Поле ввода */}
          <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                multiline
                maxRows={4}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  console.log('=== КЛАВИША НАЖАТА ===', e.key);
                  if (e.key === 'Enter' && !e.shiftKey) {
                    console.log('=== ВЫЗЫВАЕМ sendMessage ===');
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Введите сообщение..."
                disabled={isLoading}
              />
              <Button
                variant="contained"
                onClick={() => {
                  console.log('=== КНОПКА ОТПРАВКИ НАЖАТА ===');
                  sendMessage();
                }}
                disabled={(!input.trim()) || isLoading}
                sx={{ minWidth: 56 }}
              >
                <Send />
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Диалог настроек */}
      <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Настройки модели</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography gutterBottom>Температура: {settings.temperature}</Typography>
            <Slider
              value={settings.temperature}
              onChange={(e, value) => setSettings(prev => ({ ...prev, temperature: value }))}
              min={0}
              max={2}
              step={0.1}
              marks
              valueLabelDisplay="auto"
            />
            
            <Typography gutterBottom sx={{ mt: 3 }}>Top P: {settings.topP}</Typography>
            <Slider
              value={settings.topP}
              onChange={(e, value) => setSettings(prev => ({ ...prev, topP: value }))}
              min={0}
              max={1}
              step={0.1}
              marks
              valueLabelDisplay="auto"
            />
            
            <Typography gutterBottom sx={{ mt: 3 }}>Максимум токенов: {settings.maxTokens}</Typography>
            <Slider
              value={settings.maxTokens}
              onChange={(e, value) => setSettings(prev => ({ ...prev, maxTokens: value }))}
              min={100}
              max={4000}
              step={100}
              marks
              valueLabelDisplay="auto"
            />
            
            <Typography gutterBottom sx={{ mt: 3 }}>Штраф частоты: {settings.frequencyPenalty}</Typography>
            <Slider
              value={settings.frequencyPenalty}
              onChange={(e, value) => setSettings(prev => ({ ...prev, frequencyPenalty: value }))}
              min={-2}
              max={2}
              step={0.1}
              marks
              valueLabelDisplay="auto"
            />
            
            <Typography gutterBottom sx={{ mt: 3 }}>Штраф присутствия: {settings.presencePenalty}</Typography>
            <Slider
              value={settings.presencePenalty}
              onChange={(e, value) => setSettings(prev => ({ ...prev, presencePenalty: value }))}
              min={-2}
              max={2}
              step={0.1}
              marks
              valueLabelDisplay="auto"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsOpen(false)}>Закрыть</Button>
        </DialogActions>
      </Dialog>
    </>
  );
} 