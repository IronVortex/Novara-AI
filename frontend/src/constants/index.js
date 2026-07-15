export const APP_NAME = "Novara AI";
export const APP_TAGLINE = "Your Intelligent AI Workspace";
export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
export const PLACEHOLDER_TEXT = "Ask Novara anything...";
export const GUEST_STORAGE_KEY = "novara-guest-threads";
export const SETTINGS_STORAGE_KEY = "novara-settings";
export const THEME_STORAGE_KEY = "novara-theme";

export const THEMES = {
  dark: {
    id: "dark",
    label: "Dark",
    background: "#09090B",
    surface: "#18181B",
    primary: "#6366F1",
    secondary: "#8B5CF6",
    text: "#FAFAFA",
    muted: "#A1A1AA",
  },
  light: {
    id: "light",
    label: "Light",
    background: "#FAFAFA",
    surface: "#FFFFFF",
    primary: "#4F46E5",
    secondary: "#7C3AED",
    text: "#09090B",
    muted: "#71717A",
  },
  oled: {
    id: "oled",
    label: "OLED Black",
    background: "#000000",
    surface: "#0A0A0A",
    primary: "#818CF8",
    secondary: "#A78BFA",
    text: "#FAFAFA",
    muted: "#A1A1AA",
  },
  purple: {
    id: "purple",
    label: "Purple",
    background: "#0C0A12",
    surface: "#1A1424",
    primary: "#8B5CF6",
    secondary: "#A855F7",
    text: "#FAFAFA",
    muted: "#A1A1AA",
  },
  blue: {
    id: "blue",
    label: "Blue",
    background: "#070B14",
    surface: "#111827",
    primary: "#3B82F6",
    secondary: "#6366F1",
    text: "#FAFAFA",
    muted: "#94A3B8",
  },
};

export const THEME_COLORS = {
  primary: "#6366F1",
  secondary: "#8B5CF6",
  background: "#09090B",
  surface: "#18181B",
  text: "#FAFAFA",
  muted: "#A1A1AA",
  success: "#22C55E",
  warning: "#F59E0B",
  error: "#EF4444",
  danger: "#EF4444",
};

export const DEFAULT_SETTINGS = {
  theme: "dark",
  language: "en",
  temperature: 0.7,
  maxTokens: 2048,
  speechEnabled: true,
  notificationsEnabled: true,
  provider: "groq",
  model: "llama-3.1-8b-instant",
};

export const ANIMATION_DURATION = 220;
export const EMPTY_THREAD_TITLE = "New conversation";

export const PROVIDERS = [
  { id: "groq", label: "Groq", enabled: true, models: ["llama-3.1-8b-instant", "llama-3.3-70b-versatile"] },
  { id: "openai", label: "OpenAI", enabled: false, models: ["gpt-4o", "gpt-4o-mini"] },
  { id: "gemini", label: "Gemini", enabled: false, models: ["gemini-2.0-flash"] },
  { id: "claude", label: "Claude", enabled: false, models: ["claude-3-5-sonnet"] },
  { id: "mistral", label: "Mistral", enabled: false, models: ["mistral-large"] },
  { id: "deepseek", label: "DeepSeek", enabled: false, models: ["deepseek-chat"] },
  { id: "ollama", label: "Ollama", enabled: false, models: ["llama3.2"] },
];
