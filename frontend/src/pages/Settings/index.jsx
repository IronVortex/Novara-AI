import { useContext, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PROVIDERS, THEMES } from "../../constants/index.js";
import { MyContext } from "../../context/MyContext.jsx";
import { useTheme } from "../../hooks/useTheme.js";
import {
  clearAllChats,
  deleteAccount,
  updatePreferences,
  updateProfile,
} from "../../services/api.js";
import { clearGuestThreads } from "../../services/guestStorage.js";
import {
  IconUser,
  IconMonitor,
  IconZap,
  IconVolumeUp,
  IconExport,
  IconTrash,
  IconArrowLeft,
  IconSettings,
  IconGlobe,
  IconBell,
} from "../../components/common/Icons.jsx";
import "./settings.css";

const NAV_ITEMS = [
  { id: "profile",  label: "Profile",    icon: <IconUser size={16} /> },
  { id: "theme",    label: "Theme",      icon: <IconMonitor size={16} /> },
  { id: "model",    label: "Model",      icon: <IconZap size={16} /> },
  { id: "speech",   label: "Speech",     icon: <IconVolumeUp size={16} /> },
  { id: "language", label: "Language",   icon: <IconGlobe size={16} /> },
  { id: "data",     label: "Data",       icon: <IconTrash size={16} /> },
];

// Toggle switch component
function Toggle({ checked, onChange, label, id }) {
  return (
    <label className="toggle-row" htmlFor={id}>
      <span className="toggle-label">{label}</span>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        className={`toggle-switch ${checked ? "toggle-switch--on" : ""}`}
        onClick={() => onChange(!checked)}
        aria-label={label}
      >
        <span className="toggle-thumb" />
      </button>
    </label>
  );
}

function SettingsPage() {
  const navigate = useNavigate();
  const {
    authUser, setAuthUser, settings, setSettings,
    isAuthenticated, setToast, logout, setAllThreads,
  } = useContext(MyContext);
  const { theme, setTheme } = useTheme();
  const [activeSection, setActiveSection] = useState("profile");
  const [name, setName] = useState(authUser?.name || "");
  const [saving, setSaving] = useState(false);

  const enabledProviders = useMemo(() => PROVIDERS.filter((p) => p.enabled), []);
  const models = enabledProviders.find((p) => p.id === settings.provider)?.models || [];

  const persist = async (patch) => {
    setSettings(patch);
    if (!isAuthenticated) return;
    try {
      const response = await updatePreferences(patch);
      setAuthUser(response.user);
    } catch (error) {
      setToast({ type: "error", message: error.message });
    }
  };

  const handleSaveProfile = async () => {
    if (!isAuthenticated) {
      setToast({ type: "error", message: "Sign in to sync profile" });
      return;
    }
    setSaving(true);
    try {
      const response = await updateProfile({ name });
      setAuthUser(response.user);
      setToast({ type: "success", message: "Profile updated" });
    } catch (error) {
      setToast({ type: "error", message: error.message });
    } finally {
      setSaving(false);
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm("Clear all chat history?")) return;
    try {
      if (isAuthenticated) await clearAllChats();
      else clearGuestThreads();
      setAllThreads([]);
      setToast({ type: "success", message: "History cleared" });
    } catch (error) {
      setToast({ type: "error", message: error.message });
    }
  };

  const handleExport = () => {
    const blob = new Blob(
      [JSON.stringify({ settings, exportedAt: new Date().toISOString() }, null, 2)],
      { type: "application/json" }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "novara-settings.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteAccount = async () => {
    if (!isAuthenticated) return;
    if (!window.confirm("Permanently delete your account and all chats?")) return;
    try {
      await deleteAccount();
      await logout();
      navigate("/");
    } catch (error) {
      setToast({ type: "error", message: error.message });
    }
  };

  return (
    <div className="settings-page">
      {/* ── Header ──────────────────────────────── */}
      <header className="settings-header">
        <Link to="/app" className="settings-back-btn" aria-label="Back to chat">
          <IconArrowLeft size={17} />
          Back to chat
        </Link>
        <div className="settings-header-title">
          <IconSettings size={20} />
          <h1>Settings</h1>
        </div>
        <div />
      </header>

      <div className="settings-layout">
        {/* ── Sidebar nav ─────────────────────── */}
        <nav className="settings-nav" aria-label="Settings sections">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`settings-nav-item ${activeSection === item.id ? "active" : ""}`}
              onClick={() => setActiveSection(item.id)}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* ── Main content ────────────────────── */}
        <div className="settings-content">
          {activeSection === "profile" && (
            <section className="settings-card">
              <div className="settings-card-header">
                <IconUser size={18} />
                <h2>Profile</h2>
              </div>
              <div className="settings-field">
                <label htmlFor="settings-name">Display name</label>
                <input
                  id="settings-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={!isAuthenticated}
                  placeholder="Your name"
                />
                <p className="hint">
                  {isAuthenticated
                    ? authUser?.email
                    : "Guest mode — sign in to sync profile across devices"}
                </p>
              </div>
              <button
                type="button"
                className="btn-settings-primary"
                onClick={handleSaveProfile}
                disabled={!isAuthenticated || saving}
              >
                {saving ? "Saving…" : "Save profile"}
              </button>
            </section>
          )}

          {activeSection === "theme" && (
            <section className="settings-card">
              <div className="settings-card-header">
                <IconMonitor size={18} />
                <h2>Theme</h2>
              </div>
              <p className="settings-card-desc">Choose your preferred visual style.</p>
              <div className="theme-options">
                {Object.values(THEMES).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`theme-option ${theme === item.id ? "active" : ""}`}
                    onClick={() => {
                      setTheme(item.id);
                      persist({ theme: item.id });
                    }}
                  >
                    <div
                      className="theme-swatch"
                      style={{ background: item.background, borderColor: item.primary }}
                    >
                      <div className="theme-swatch-bar" style={{ background: item.primary }} />
                    </div>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </section>
          )}

          {activeSection === "model" && (
            <section className="settings-card">
              <div className="settings-card-header">
                <IconZap size={18} />
                <h2>AI Model</h2>
              </div>
              <p className="settings-card-desc">Select the AI provider and model for responses.</p>
              <div className="settings-field">
                <label htmlFor="settings-provider">Provider</label>
                <select
                  id="settings-provider"
                  value={settings.provider}
                  onChange={(e) => persist({
                    provider: e.target.value,
                    model: PROVIDERS.find((p) => p.id === e.target.value)?.models[0],
                  })}
                >
                  {PROVIDERS.map((p) => (
                    <option key={p.id} value={p.id} disabled={!p.enabled}>
                      {p.label}{!p.enabled ? " (coming soon)" : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div className="settings-field">
                <label htmlFor="settings-model">Model</label>
                <select
                  id="settings-model"
                  value={settings.model}
                  onChange={(e) => persist({ model: e.target.value })}
                >
                  {models.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div className="settings-field">
                <label htmlFor="settings-temp">
                  Temperature <span className="settings-value">{settings.temperature}</span>
                </label>
                <input
                  id="settings-temp"
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={settings.temperature}
                  onChange={(e) => persist({ temperature: Number(e.target.value) })}
                  className="settings-range"
                />
                <div className="settings-range-labels">
                  <span>Precise</span>
                  <span>Creative</span>
                </div>
              </div>
              <div className="settings-field">
                <label htmlFor="settings-tokens">Max tokens</label>
                <input
                  id="settings-tokens"
                  type="number"
                  min="256"
                  max="8192"
                  value={settings.maxTokens}
                  onChange={(e) => persist({ maxTokens: Number(e.target.value) })}
                />
              </div>
            </section>
          )}

          {activeSection === "speech" && (
            <section className="settings-card">
              <div className="settings-card-header">
                <IconVolumeUp size={18} />
                <h2>Speech</h2>
              </div>
              <p className="settings-card-desc">
                Voice features use your browser's built-in APIs — no API key required.
              </p>
              <Toggle
                id="toggle-speech"
                label="Enable speech-to-text and text-to-speech"
                checked={settings.speechEnabled}
                onChange={(val) => persist({ speechEnabled: val })}
              />
            </section>
          )}

          {activeSection === "language" && (
            <section className="settings-card">
              <div className="settings-card-header">
                <IconGlobe size={18} />
                <h2>Language</h2>
              </div>
              <p className="settings-card-desc">Choose the response language.</p>
              <div className="settings-field">
                <label htmlFor="settings-lang">Language</label>
                <select
                  id="settings-lang"
                  value={settings.language}
                  onChange={(e) => persist({ language: e.target.value })}
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="hi">Hindi</option>
                </select>
              </div>
              <Toggle
                id="toggle-notif"
                label="Enable notifications"
                checked={settings.notificationsEnabled}
                onChange={(val) => persist({ notificationsEnabled: val })}
              />
            </section>
          )}

          {activeSection === "data" && (
            <section className="settings-card">
              <div className="settings-card-header">
                <IconExport size={18} />
                <h2>Data</h2>
              </div>
              <p className="settings-card-desc">Export your settings or clear your chat history.</p>
              <div className="settings-data-actions">
                <button type="button" className="btn-settings-secondary" onClick={handleExport}>
                  <IconExport size={15} />
                  Export settings
                </button>
                <button type="button" className="btn-settings-secondary" onClick={handleClearHistory}>
                  <IconTrash size={15} />
                  Clear history
                </button>
              </div>
              {isAuthenticated ? (
                <div className="danger-zone">
                  <h3>Danger zone</h3>
                  <p>This action is permanent and cannot be undone.</p>
                  <button
                    type="button"
                    className="btn-settings-danger"
                    onClick={handleDeleteAccount}
                  >
                    <IconTrash size={15} />
                    Delete account
                  </button>
                </div>
              ) : null}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
