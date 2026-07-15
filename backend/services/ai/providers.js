/**
 * Model provider registry — Groq is active; others are interfaces for future wiring.
 */

export const PROVIDERS = {
  groq: {
    id: "groq",
    label: "Groq",
    enabled: true,
    models: ["llama-3.1-8b-instant", "llama-3.3-70b-versatile", "mixtral-8x7b-32768"],
  },
  openai: {
    id: "openai",
    label: "OpenAI",
    enabled: false,
    models: ["gpt-4o", "gpt-4o-mini"],
  },
  gemini: {
    id: "gemini",
    label: "Gemini",
    enabled: false,
    models: ["gemini-2.0-flash", "gemini-1.5-pro"],
  },
  claude: {
    id: "claude",
    label: "Claude",
    enabled: false,
    models: ["claude-3-5-sonnet", "claude-3-haiku"],
  },
  mistral: {
    id: "mistral",
    label: "Mistral",
    enabled: false,
    models: ["mistral-large", "mistral-small"],
  },
  deepseek: {
    id: "deepseek",
    label: "DeepSeek",
    enabled: false,
    models: ["deepseek-chat", "deepseek-reasoner"],
  },
  ollama: {
    id: "ollama",
    label: "Ollama",
    enabled: false,
    models: ["llama3.2", "mistral"],
  },
};

export const getEnabledProviders = () => Object.values(PROVIDERS).filter((p) => p.enabled);

export const getDefaultModel = () => ({
  provider: "groq",
  model: process.env.GROQ_MODEL || "llama-3.1-8b-instant",
});
