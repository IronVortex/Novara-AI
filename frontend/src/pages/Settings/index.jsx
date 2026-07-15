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
import "./settings.css";

function SettingsPage() {
  const navigate = useNavigate();
  const { authUser, setAuthUser, settings, setSettings, isAuthenticated, setToast, logout, setAllThreads } =
    useContext(MyContext);
  const { theme, setTheme } = useTheme();
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
    const blob = new Blob([JSON.stringify({ settings, exportedAt: new Date().toISOString() }, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "novara-settings.json";
    anchor.click();
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
      <header className="settings-header">
        <div>
          <p className="eyebrow">Workspace</p>
          <h1>Settings</h1>
        </div>
        <Link to="/app" className="btn-ghost">
          Back to chat
        </Link>
      </header>

      <div className="settings-grid">
        <section className="settings-card">
          <h2>Profile</h2>
          <label>
            Display name
            <input value={name} onChange={(e) => setName(e.target.value)} disabled={!isAuthenticated} />
          </label>
          <p className="hint">{isAuthenticated ? authUser?.email : "Guest mode — sign in to sync profile"}</p>
          <button type="button" className="btn-primary" onClick={handleSaveProfile} disabled={!isAuthenticated || saving}>
            Save profile
          </button>
        </section>

        <section className="settings-card">
          <h2>Theme</h2>
          <div className="theme-options">
            {Object.values(THEMES).map((item) => (
              <button
                key={item.id}
                type="button"
                className={`theme-chip ${theme === item.id ? "active" : ""}`}
                onClick={() => {
                  setTheme(item.id);
                  persist({ theme: item.id });
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </section>

        <section className="settings-card">
          <h2>Model</h2>
          <label>
            Provider
            <select
              value={settings.provider}
              onChange={(e) => persist({ provider: e.target.value, model: PROVIDERS.find((p) => p.id === e.target.value)?.models[0] })}
            >
              {PROVIDERS.map((provider) => (
                <option key={provider.id} value={provider.id} disabled={!provider.enabled}>
                  {provider.label}
                  {!provider.enabled ? " (soon)" : ""}
                </option>
              ))}
            </select>
          </label>
          <label>
            Model
            <select value={settings.model} onChange={(e) => persist({ model: e.target.value })}>
              {models.map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>
          </label>
        </section>

        <section className="settings-card">
          <h2>Generation</h2>
          <label>
            Temperature ({settings.temperature})
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={settings.temperature}
              onChange={(e) => persist({ temperature: Number(e.target.value) })}
            />
          </label>
          <label>
            Max tokens
            <input
              type="number"
              min="256"
              max="8192"
              value={settings.maxTokens}
              onChange={(e) => persist({ maxTokens: Number(e.target.value) })}
            />
          </label>
          <label>
            Language
            <select value={settings.language} onChange={(e) => persist({ language: e.target.value })}>
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="hi">Hindi</option>
            </select>
          </label>
        </section>

        <section className="settings-card">
          <h2>Speech & notifications</h2>
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={settings.speechEnabled}
              onChange={(e) => persist({ speechEnabled: e.target.checked })}
            />
            Enable speech features
          </label>
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={settings.notificationsEnabled}
              onChange={(e) => persist({ notificationsEnabled: e.target.checked })}
            />
            Enable notifications
          </label>
        </section>

        <section className="settings-card danger-zone">
          <h2>Data</h2>
          <button type="button" onClick={handleExport}>
            Export settings
          </button>
          <button type="button" onClick={handleClearHistory}>
            Clear history
          </button>
          {isAuthenticated ? (
            <button type="button" className="danger" onClick={handleDeleteAccount}>
              Delete account
            </button>
          ) : null}
        </section>
      </div>
    </div>
  );
}

export default SettingsPage;
