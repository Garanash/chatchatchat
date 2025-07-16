// Список моделей VseGPT: только name и id для проверки и редактирования
// Актуально на июль 2024, источник: https://vsegpt.ru/Docs/ModelsNew

export const modelsList = [
  {
    name: 'Grok 4',
    id: 'x-ai/grok-4',
    description: 'Grok 4 — это последняя модель рассуждений от xAI с контекстным окном в 256 тысяч токенов. Согласно результатам бенчмарков, она опережает другие топовые сети — как OpenAI o3, Opus 4.'
  },
  {
    name: 'GPT-4o',
    id: 'openai/gpt-4o-2024-11-20-online-hq',
    description: 'Версия GPT-4o от 20.11.2024 предлагает улучшенные возможности креативного письма с более естественным, увлекательным и индивидуальным подходом для повышения актуальности и удобства чтения. Модель выступает несколько хуже на логических задачах, но лучше — на задачах, требующих креативности.'
  },
  {
    name: 'GPT-4.5 (Preview)',
    id: 'openai/gpt-4.5-preview',
    hidden: true,
    description: 'GPT-4.5 (Preview) — экспериментальная версия GPT-4 с улучшенной скоростью и качеством генерации, предназначенная для тестирования новых возможностей.'
  },
  {
    name: 'Llama 4',
    id: 'meta-llama/llama-4-maverick-1m-ctx',
    description: 'Llama 4 Maverick 17B Instruct (128E) — это мультимодальная языковая модель высокой ёмкости от Meta, построенная на архитектуре смеси экспертов (MoE) со 128 экспертами и 17 миллиардами активных параметров за один прямой проход (400 миллиардов всего). Модель последний раз обучалась на данных до августа 2024 года и была публично запущена 5 апреля 2025 года.'
  },
  {
    name: 'Google: Gemini 2.5 Pro',
    id: 'vis-google/gemini-2.5-pro',
    description: 'Gemini 2.5 Pro — это передовая ИИ-модель Google, разработанная для решения сложных задач в области рассуждений, программирования, математики и науки. Она использует возможности "мышления", что позволяет ей формулировать ответы с повышенной точностью и учетом нюансов контекста.'
  },
  {
    name: 'MoonshotAI: Kimi K2 1T',
    id: 'moonshotai/kimi-k2',
    description: 'Kimi K2 — это крупномасштабная языковая модель типа Mixture-of-Experts (MoE), разработанная компанией Moonshot AI, содержащая 1 триллион параметров с 32 миллиардами активных параметров на один прямой проход. Она оптимизирована для агентных возможностей, включая продвинутое использование инструментов, рассуждения и синтез кода. Kimi K2 превосходно справляется с широким спектром тестов, особенно в области программирования (LiveCodeBench, SWE-bench), рассуждений (ZebraLogic, GPQA) и использования инструментов (Tau2, AceBench).'
  },
  {
    name: 'DALL-E 3',
    id: 'openai/dall-e-3',
    description: 'Флагманская модель для генерации изображений от OpenAI.'
  },
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