// Список моделей VseGPT: только name и id для проверки и редактирования
// Актуально на июль 2024, источник: https://vsegpt.ru/Docs/ModelsNew

export const modelsList = [
  { name: 'Grok 4', id: 'x-ai/grok-4' },
  { name: 'GPT-4o', id: 'openai/gpt-4o-2024-11-20-online-hq' },
  { name: 'GPT-4.5 (Preview)', id: 'openai/gpt-4.5-preview' , hidden: true },
  { name: 'Llama 4', id: 'meta-llama/llama-4-maverick-1m-ctx' },
  { name: 'Google: Gemini 2.5 Pro', id: 'vis-google/gemini-2.5-pro' },
  { name: 'MoonshotAI: Kimi K2 1T', id: 'moonshotai/kimi-k2' },
  { name: 'DALL-E 3', id: 'openai/dall-e-3' },
  { name: 'DeepSeek V3', id: 'deepseek/deepseek-chat-0324-alt-fast', hidden: true },
  { name: 'GPT-4.1', id: 'openai/gpt-4-1', hidden: true },
  { name: 'GPT-4 Turbo', id: 'openai/gpt-4-turbo', hidden: true },
  { name: 'Claude 3 Haiku (vision)', id: 'anthropic/claude-3-haiku', hidden: true },
  { name: 'Claude 3.5 Haiku (online)', id: 'anthropic/claude-3-5-haiku-online', hidden: true },
  { name: 'Gemini 2.5 Flash (Thinking)', id: 'google/gemini-2-5-flash-thinking', hidden: true },
  { name: 'Perplexity', id: 'perplexity/latest-large-online', hidden: true },
  { name: 'Ministral 8B', id: 'mistralai/mistral-8b', hidden: true },
  { name: 'EVA Qwen2.5 72B v0.2 (online)', id: 'eva-unit-01/eva-qwen-2-5-72b-online', hidden: true },
  { name: 'Llama 3 Lumimaid 70B', id: 'neversleep/llama-3-lumimaid-70b', hidden: true },
  { name: 'Gemma 2 27B', id: 'google/gemma-2-27b-it', hidden: true },
  { name: 'Stable Diffusion XL v1.0', id: 'img-stable/stable-diffusion-xl-1024', hidden: true }
]; 