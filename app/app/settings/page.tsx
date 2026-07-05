'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

const STORAGE_KEY = 'cognee_settings';

interface Settings {
  llmModel: string;
  theme: 'dark' | 'light';
}

const defaults: Settings = { llmModel: 'openrouter/meta-llama/llama-3.1-8b-instruct', theme: 'dark' };

const loadSettings = (): Settings => {
  if (typeof window === 'undefined') return defaults;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? { ...defaults, ...JSON.parse(stored) } : defaults;
  } catch { return defaults; }
};

const applyTheme = (theme: 'dark' | 'light') => {
  document.documentElement.classList.toggle('light', theme === 'light');
};

const saveSettings = (s: Settings) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch { /* silent */ }
};

const LLM_MODELS = [
  { value: 'openrouter/meta-llama/llama-3.1-8b-instruct', label: 'Llama 3.1 8B (OpenRouter)' },
  { value: 'openrouter/meta-llama/llama-3.1-70b-instruct', label: 'Llama 3.1 70B (OpenRouter)' },
  { value: 'openrouter/anthropic/claude-3.5-sonnet', label: 'Claude 3.5 Sonnet' },
  { value: 'openrouter/openai/gpt-4o', label: 'GPT-4o' },
  { value: 'openrouter/google/gemini-2.0-flash-001', label: 'Gemini 2.0 Flash' },
];

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(defaults);
  const [backendHealth, setBackendHealth] = useState<any>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const s = loadSettings();
    setSettings(s);
    applyTheme(s.theme);
    api.health().then(setBackendHealth).catch(() => {});
  }, []);

  const update = (partial: Partial<Settings>) => {
    const next = { ...settings, ...partial };
    setSettings(next);
    saveSettings(next);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);

    if (partial.theme) {
      applyTheme(partial.theme);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-2xl mx-auto p-6 space-y-8">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">Settings</h2>
          <p className="text-xs text-text-muted mt-1">Configure your Cognee Chat experience</p>
        </div>

        <div className="space-y-6">
          <div className="bg-bg-secondary border border-border-primary rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-semibold text-text-primary">LLM Model</h3>
            <p className="text-xs text-text-muted">Default model for chat responses (must match backend .env)</p>
            <select
              value={settings.llmModel}
              onChange={e => update({ llmModel: e.target.value })}
              className="w-full bg-bg-tertiary border border-border-primary rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
            >
              {LLM_MODELS.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>

          <div className="bg-bg-secondary border border-border-primary rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-semibold text-text-primary">Appearance</h3>
            <div className="flex gap-3">
              <button
                onClick={() => update({ theme: 'dark' })}
                className={`flex-1 px-4 py-3 rounded-lg border text-sm font-medium transition-colors ${
                  settings.theme === 'dark'
                    ? 'bg-accent text-white border-accent'
                    : 'bg-bg-tertiary text-text-muted border-border-primary hover:bg-bg-primary'
                }`}
              >
                Dark
              </button>
              <button
                onClick={() => update({ theme: 'light' })}
                className={`flex-1 px-4 py-3 rounded-lg border text-sm font-medium transition-colors ${
                  settings.theme === 'light'
                    ? 'bg-accent text-white border-accent'
                    : 'bg-bg-tertiary text-text-muted border-border-primary hover:bg-bg-primary'
                }`}
              >
                Light
              </button>
            </div>
          </div>

          <div className="bg-bg-secondary border border-border-primary rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-semibold text-text-primary">Backend Status</h3>
            {backendHealth ? (
              <div className="space-y-1.5 text-xs">
                <p className="text-text-muted">Status: <span className="text-green-400">Connected</span></p>
                {backendHealth.llm_model && (
                  <p className="text-text-muted">LLM Model: <span className="text-text-primary">{backendHealth.llm_model}</span></p>
                )}
                {backendHealth.graph_provider && (
                  <p className="text-text-muted">Graph Provider: <span className="text-text-primary">{backendHealth.graph_provider}</span></p>
                )}
              </div>
            ) : (
              <p className="text-xs text-text-muted">Fetching backend status...</p>
            )}
          </div>
        </div>

        {saved && (
          <p className="text-xs text-green-400 text-center">Settings saved</p>
        )}
      </div>
    </div>
  );
}
