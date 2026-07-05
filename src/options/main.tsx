import { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  ShieldCheck, Server, Download, Upload, 
  CheckCircle, AlertCircle, Copy 
} from 'lucide-react';
import { getSettings, saveSettings } from '../lib/storage';
import { Settings as SettingsType } from '../lib/types';
import '../styles/global.css';

function OptionsApp() {
  const [settings, setSettings] = useState<SettingsType | null>(null);
  const [extensionId, setExtensionId] = useState('');
  const [hostStatus, setHostStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [hostError, setHostError] = useState('');
  const [copiedId, setCopiedId] = useState(false);

  // Load settings & diagnostics on mount
  useEffect(() => {
    async function loadData() {
      const stored = await getSettings();
      setSettings(stored);

      if (typeof chrome !== 'undefined' && chrome.runtime) {
        setExtensionId(chrome.runtime.id);
        checkHost();
      } else {
        setExtensionId('abcd1234mockid5678');
        setHostStatus('connected');
      }
    }
    loadData();
  }, []);

  const checkHost = () => {
    setHostStatus('checking');
    setHostError('');
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage({ action: 'ping_host' }, (response) => {
        if (response && response.success) {
          setHostStatus('connected');
        } else {
          setHostStatus('error');
          setHostError(response?.error || 'Native Sync Companion not found. Make sure the manifest is registered.');
        }
      });
    } else {
      setHostStatus('connected');
    }
  };

  const updateSetting = async (key: keyof SettingsType, value: any) => {
    if (!settings) return;
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    await saveSettings(updated);
  };

  const updateTargetCustomPath = async (targetId: string, path: string) => {
    if (!settings) return;
    const updatedTargets = {
      ...settings.targets,
      [targetId]: {
        ...settings.targets[targetId],
        customPath: path
      }
    };
    const updated = { ...settings, targets: updatedTargets };
    setSettings(updated);
    await saveSettings(updated);
  };

  // Optional permissions flow for Tier 2 Injection
  const toggleSiteAdapter = async (domain: string, enabled: boolean) => {
    if (!settings) return;

    if (enabled) {
      // Request optional host permission
      const origin = `https://${domain}/*`;
      if (typeof chrome !== 'undefined' && chrome.permissions) {
        chrome.permissions.request({
          origins: [origin]
        }, async (granted) => {
          if (granted) {
            const updatedAdapters = { ...settings.siteAdapters, [domain]: true };
            const updated = { ...settings, siteAdapters: updatedAdapters };
            setSettings(updated);
            await saveSettings(updated);
          } else {
            alert(`Permission for ${domain} was denied. Injection cannot be enabled.`);
          }
        });
      } else {
        // Mock fallback
        const updatedAdapters = { ...settings.siteAdapters, [domain]: true };
        setSettings({ ...settings, siteAdapters: updatedAdapters });
      }
    } else {
      // Disable the adapter and optionally remove permission (optional, keeping host is usually fine)
      const updatedAdapters = { ...settings.siteAdapters, [domain]: false };
      const updated = { ...settings, siteAdapters: updatedAdapters };
      setSettings(updated);
      await saveSettings(updated);
    }
  };

  const copyIdToClipboard = () => {
    navigator.clipboard.writeText(extensionId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  // Import/Export Settings Config
  const exportConfig = () => {
    if (!settings) return;
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `skill-bridge-config-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importConfig = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        // Basic validation
        if (parsed.targets && parsed.siteAdapters) {
          setSettings(parsed);
          await saveSettings(parsed);
          alert('Configuration imported successfully.');
        } else {
          alert('Invalid configuration file structure.');
        }
      } catch (err: any) {
        alert('Failed to parse configuration file: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  if (!settings) {
    return <div className="p-8 text-center text-cyber-text-muted-dark">Loading Settings...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6 flex flex-col gap-6 select-none bg-cyber-bg-dark text-cyber-text-primary-dark">
      
      {/* Settings Header */}
      <header className="flex items-center justify-between border-b border-cyber-border-dark pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyber-surface-dark border border-cyber-border-dark/60 rounded-lg shrink-0">
            <img src="/icons/logo.svg" className="size-7" alt="Skill Bridge Logo" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight font-sans text-cyber-text-primary-dark">Skill Bridge Settings</h1>
            <p className="text-xs text-cyber-text-muted-dark font-sans mt-0.5">Configure target paths, native hosts, and site permissions</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={exportConfig}
            className="h-8 px-3.5 bg-white border border-cyber-border-dark rounded-md text-xs font-sans font-semibold text-cyber-text-primary-dark hover:bg-cyber-surface-dark transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Download className="size-3.5" /> Export JSON
          </button>
          <label className="h-8 px-3.5 bg-white border border-cyber-border-dark rounded-md text-xs font-sans font-semibold text-cyber-text-primary-dark hover:bg-cyber-surface-dark transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm">
            <Upload className="size-3.5" /> Import JSON
            <input type="file" accept=".json" onChange={importConfig} className="hidden" />
          </label>
        </div>
      </header>

      {/* Main Configurations Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Side: Native Host Diagnostics */}
        <div className="md:col-span-2 flex flex-col gap-6">
          
          {/* Target CLI Synchronization Paths */}
          <section className="bg-cyber-surface-dark border border-cyber-border-dark/60 rounded-lg p-5 flex flex-col gap-4">
            <h2 className="text-sm font-semibold font-sans border-b border-cyber-border-dark pb-2 text-cyber-text-primary-dark tracking-tight">
              Tier 1: Local Tool Sync Paths
            </h2>
            <p className="text-xs text-cyber-text-muted-dark leading-relaxed font-sans">
              Sync copy files into these tool directories. If you have custom configurations, configure workspace or tool overrides:
            </p>
            
            <div className="flex flex-col gap-4">
              {Object.keys(settings.targets).map(id => {
                const target = settings.targets[id];
                const displayName = id === 'claude-code' ? 'Claude Code' : id === 'codex-cli' ? 'Codex CLI' : id === 'gemini-cli' ? 'Gemini CLI' : 'Cursor Rules (Workspace)';
                const placeholder = id === 'cursor' ? 'e.g. C:/my-project (files synced to .cursor/rules)' : `e.g. override path for ${displayName}`;
                
                return (
                  <div key={id} className="flex flex-col gap-2 border-b border-cyber-border-dark/30 pb-4 last:border-b-0 last:pb-0">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold font-sans text-cyber-text-primary-dark">{displayName}</label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={target.enabled}
                          onChange={e => {
                            const updatedTargets = {
                              ...settings.targets,
                              [id]: { ...target, enabled: e.target.checked }
                            };
                            updateSetting('targets', updatedTargets);
                          }}
                          className="rounded border-cyber-border-dark bg-white text-cyber-blue size-4 focus:ring-0"
                        />
                        <span className="text-[10px] text-cyber-text-muted-dark font-sans font-semibold uppercase">Sync Enabled</span>
                      </label>
                    </div>
                    
                    <input
                      type="text"
                      placeholder={placeholder}
                      value={target.customPath || ''}
                      onChange={e => updateTargetCustomPath(id, e.target.value)}
                      className="w-full h-9 px-3 bg-white border border-cyber-border-dark rounded-md text-xs text-cyber-text-primary-dark placeholder-cyber-text-muted-dark focus:border-cyber-blue focus:ring-1 focus:ring-cyber-blue outline-none font-sans"
                    />
                  </div>
                );
              })}
            </div>
          </section>

          {/* Native Messaging Host Status */}
          <section className="bg-cyber-surface-dark border border-cyber-border-dark/60 rounded-lg p-5 flex flex-col gap-4">
            <h2 className="text-sm font-semibold font-sans border-b border-cyber-border-dark pb-2 flex items-center justify-between text-cyber-text-primary-dark tracking-tight">
              <span>Native Messaging Sync Companion</span>
              <button 
                onClick={checkHost}
                className="text-[10px] text-cyber-brandAccent hover:underline font-sans font-semibold"
              >
                Re-check Diagnostics
              </button>
            </h2>

            {/* Diagnostic Status Indicator */}
            <div className={`p-3.5 border rounded-md flex items-center gap-3 ${
              hostStatus === 'connected' 
                ? 'border-transparent bg-cyber-valid/10 text-cyber-valid' 
                : hostStatus === 'checking'
                  ? 'border-transparent bg-cyber-warning/10 text-cyber-warning'
                  : 'border-transparent bg-cyber-error/10 text-cyber-error'
            }`}>
              {hostStatus === 'connected' ? (
                <>
                  <CheckCircle className="size-5 shrink-0 text-cyber-valid" />
                  <div className="flex flex-col font-sans">
                    <span className="text-xs font-semibold">Sync Companion Connected</span>
                    <span className="text-[10px] text-cyber-text-muted-dark mt-0.5">Host is successfully communicating via stdio JSON.</span>
                  </div>
                </>
              ) : hostStatus === 'checking' ? (
                <>
                  <Server className="size-5 shrink-0 animate-pulse text-cyber-warning" />
                  <div className="flex flex-col font-sans">
                    <span className="text-xs font-semibold">Checking Connection...</span>
                    <span className="text-[10px] text-cyber-text-muted-dark mt-0.5">Querying native registry port.</span>
                  </div>
                </>
              ) : (
                <>
                  <AlertCircle className="size-5 shrink-0 text-cyber-error" />
                  <div className="flex flex-col font-sans">
                    <span className="text-xs font-semibold">Sync Companion Not Detected</span>
                    <span className="text-[10px] text-cyber-text-muted-dark leading-relaxed mt-0.5">
                      Error: {hostError}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Platform instructions to register host */}
            {hostStatus === 'error' && (
              <div className="flex flex-col gap-3.5 text-xs leading-relaxed font-sans">
                <span className="font-semibold text-cyber-text-primary-dark">Host Setup Instructions:</span>
                
                <div className="flex flex-col gap-1.5 text-[11px] text-cyber-text-muted-dark font-sans bg-white border border-cyber-border-dark p-3.5 rounded-md">
                  <div className="flex items-center justify-between border-b border-cyber-border-dark pb-2 mb-2 font-sans font-semibold">
                    <span>Copy Extension ID for Installation:</span>
                    <button 
                      onClick={copyIdToClipboard}
                      className="text-cyber-brandAccent flex items-center gap-1 hover:underline"
                    >
                      <Copy className="size-3" /> {copiedId ? 'Copied!' : 'Copy ID'}
                    </button>
                  </div>
                  <span className="text-cyber-text-primary-dark font-mono select-all text-xs bg-cyber-surface-dark px-2 py-1 rounded border border-cyber-border-dark/60 block">{extensionId}</span>
                </div>

                <ol className="list-decimal pl-4 flex flex-col gap-2 text-cyber-text-muted-dark">
                  <li>
                    Open terminal in directory <code className="text-cyber-text-primary-dark bg-white border border-cyber-border-dark px-1 rounded font-mono">/native-host</code>.
                  </li>
                  <li>
                    Run installer scripts:
                    <ul className="list-disc pl-4 mt-1 flex flex-col gap-1 text-[11px]">
                      <li>Windows: <code className="text-cyber-text-primary-dark bg-white border border-cyber-border-dark px-1 rounded font-mono">powershell ./install.ps1</code></li>
                      <li>macOS/Linux: <code className="text-cyber-text-primary-dark bg-white border border-cyber-border-dark px-1 rounded font-mono">chmod +x install.sh && ./install.sh</code></li>
                    </ul>
                  </li>
                  <li>Paste the Extension ID copied above when prompted.</li>
                  <li>Reload your browser and refresh this diagnostic check.</li>
                </ol>
              </div>
            )}
          </section>
        </div>

        {/* Right Side: Tier 2 Site permissions & Privacy */}
        <div className="flex flex-col gap-6">
          
          {/* Tier 2 Chat Injection Config */}
          <section className="bg-cyber-surface-dark border border-cyber-border-dark/60 rounded-lg p-5 flex flex-col gap-4">
            <h2 className="text-sm font-semibold font-sans border-b border-cyber-border-dark pb-2 text-cyber-text-primary-dark tracking-tight">
              Tier 2: Web Chat Injection
            </h2>
            <p className="text-xs text-cyber-text-muted-dark leading-relaxed font-sans">
              Dynamically request browser site permissions to insert skill prompts into chat editors:
            </p>
            
            <div className="flex flex-col gap-2.5">
              {[
                { domain: 'claude.ai', label: 'Claude.ai' },
                { domain: 'chatgpt.com', label: 'ChatGPT' },
                { domain: 'gemini.google.com', label: 'Gemini Chat' },
                { domain: 'chat.deepseek.com', label: 'DeepSeek' },
                { domain: 'chat.qwen.ai', label: 'Qwen' },
                { domain: 'chatglm.cn', label: 'Z-AI (Zhipu)' },
                { domain: 'kimi.moonshot.cn', label: 'Kimi' },
                { domain: 'chat.mistral.ai', label: 'Mistral' },
                { domain: 'perplexity.ai', label: 'Perplexity' },
                { domain: 'huggingface.co', label: 'HuggingChat' },
                { domain: 'poe.com', label: 'Poe' },
                { domain: 'groq.com', label: 'Groq' },
                { domain: 'phind.com', label: 'Phind' }
              ].map(({ domain, label }) => (
                <div key={domain} className="flex items-center justify-between p-2.5 bg-white border border-cyber-border-dark/60 rounded-md shadow-sm">
                  <div className="flex flex-col font-sans">
                    <span className="text-xs font-semibold text-cyber-text-primary-dark">{label}</span>
                    <span className="text-[9px] text-cyber-text-muted-dark font-sans mt-0.5">{domain}</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!settings.siteAdapters[domain]}
                      onChange={e => toggleSiteAdapter(domain, e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-8 h-4 bg-cyber-border-dark peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-cyber-text-muted-dark peer-checked:after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3.5 after:transition-all peer-checked:bg-cyber-blue"></div>
                  </label>
                </div>
              ))}
            </div>
          </section>

          {/* Privacy & Settings */}
          <section className="bg-cyber-surface-dark border border-cyber-border-dark/60 rounded-lg p-5 flex flex-col gap-4">
            <h2 className="text-sm font-semibold font-sans border-b border-cyber-border-dark pb-2 text-cyber-text-primary-dark tracking-tight flex items-center gap-1.5">
              <ShieldCheck className="size-4 text-cyber-valid" />
              <span>Trust & Privacy</span>
            </h2>
            <div className="text-[11px] text-cyber-text-muted-dark leading-relaxed flex flex-col gap-2 font-sans">
              <p>
                <strong>No Remote APIs:</strong> The extension is completely self-contained. It only reads files you choose.
              </p>
              <p>
                <strong>Zero Telemetry:</strong> We do not track, collect, or upload your folder contents. All synced files are handled locally by your machine.
              </p>
            </div>
            
            <div className="border-t border-cyber-border-dark pt-4 flex flex-col gap-3 font-sans">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={settings.autoRescanOnOpen}
                  onChange={e => updateSetting('autoRescanOnOpen', e.target.checked)}
                  className="rounded border-cyber-border-dark bg-white text-cyber-blue size-4 mt-0.5 focus:ring-0"
                />
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-cyber-text-primary-dark">Rescan on Startup</span>
                  <span className="text-[10px] text-cyber-text-muted-dark leading-snug mt-0.5">Auto-poll local directory files when popup opens</span>
                </div>
              </label>
              
              <label className="flex items-start gap-2.5 cursor-pointer mt-1">
                <input 
                  type="checkbox" 
                  checked={settings.privacyTelemetry}
                  onChange={e => updateSetting('privacyTelemetry', e.target.checked)}
                  className="rounded border-cyber-border-dark bg-white text-cyber-blue size-4 mt-0.5 focus:ring-0"
                />
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-cyber-text-primary-dark">Anonymous Telemetry</span>
                  <span className="text-[10px] text-cyber-text-muted-dark leading-snug mt-0.5">Opt-in to share structural validation metrics</span>
                </div>
              </label>
            </div>
          </section>
        </div>
      </div>
      
      {/* Settings Footer */}
      <footer className="text-center text-[10px] text-cyber-onDarkSoft font-sans py-8 bg-cyber-dark border-t border-cyber-darkElevated rounded-lg mt-8 shadow-inner">
        <div className="font-semibold text-white tracking-wide uppercase text-[9px] mb-2 font-sans">Skill Bridge &bull; Extension Config Panel</div>
        <div>Secure Local Agent Skill Integration &bull; Sandboxed browser storage runtime</div>
      </footer>
    </div>
  );
}

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<OptionsApp />);
}
