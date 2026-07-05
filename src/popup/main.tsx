import { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  FolderOpen, Search, Star, RefreshCw, Settings as SettingsIcon, AlertCircle, 
  FileText, ShieldAlert, Sparkles
} from 'lucide-react';
import { SkillFile, SyncTarget } from '../lib/types';
import { 
  getDirectoryHandle, saveDirectoryHandle, 
  getSettings, saveSettings, getCachedSkills, saveCachedSkills 
} from '../lib/storage';
import { scanSkillsFolder, prepareSkillFiles } from '../lib/scanner';
import { CommandPalette } from '../components/CommandPalette';
import '../styles/global.css';

function PopupApp() {
  const [skills, setSkills] = useState<SkillFile[]>([]);
  const [targets, setTargets] = useState<SyncTarget[]>([]);
  const [settings, setSettings] = useState<any>(null);
  
  // Library scans & handles
  const [folderName, setFolderName] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string>('');
  const [needPermission, setNeedPermission] = useState(false);
  const [dirHandle, setDirHandle] = useState<FileSystemDirectoryHandle | null>(null);

  // Selection states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [selectedSkill, setSelectedSkill] = useState<SkillFile | null>(null);
  const [selectedSkillsMap, setSelectedSkillsMap] = useState<Record<string, boolean>>({});
  
  // Active UI Tabs
  const [activeTab, setActiveTab] = useState<'library' | 'targets' | 'onboarding'>('library');
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [rawSourceOpen, setRawSourceOpen] = useState(false);

  // Command Palette Open state
  const [cmdPaletteOpen, setCmdPaletteOpen] = useState(false);

  // Load initial settings and cached skills
  useEffect(() => {
    async function loadData() {
      const storedSettings = await getSettings();
      setSettings(storedSettings);
      
      const cached = await getCachedSkills();
      setSkills(cached);

      // Attempt to load directory handle
      const handle = await getDirectoryHandle();
      if (handle) {
        setDirHandle(handle);
        setFolderName(handle.name);
        // Verify permission
        const permission = await (handle as any).queryPermission({ mode: 'read' });
        if (permission === 'granted') {
          if (storedSettings.autoRescanOnOpen) {
            triggerScan(handle);
          }
        } else {
          setNeedPermission(true);
        }
      } else {
        setActiveTab('onboarding');
      }

      // Initial targets detection
      detectTargets();
    }
    loadData();

    // Command palette global key listener
    const handleCmdK = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCmdPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleCmdK);
    return () => window.removeEventListener('keydown', handleCmdK);
  }, []);

  const detectTargets = () => {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage({ action: 'detect_targets' }, (response) => {
        if (response && response.success) {
          // Merge custom target paths from settings if any
          const mergedTargets = response.targets.map((t: SyncTarget) => {
            const configured = settings?.targets?.[t.id];
            return {
              ...t,
              customPath: configured?.customPath || '',
              detected: configured?.customPath ? true : t.detected
            };
          });
          setTargets(mergedTargets);
        }
      });
    } else {
      // Mock targets for dev testing
      setTargets([
        { id: 'claude-code', name: 'Claude Code', detected: true, defaultPath: '~/.claude/skills', syncedSkills: [] },
        { id: 'cursor', name: 'Cursor', detected: true, defaultPath: '', customPath: 'C:/mock/project', syncedSkills: [] }
      ]);
    }
  };

  const triggerScan = async (handle: FileSystemDirectoryHandle) => {
    setIsScanning(true);
    setScanError('');
    try {
      const scannedSkills = await scanSkillsFolder(handle);
      setSkills(scannedSkills);
      await saveCachedSkills(scannedSkills);
      setNeedPermission(false);
    } catch (e: any) {
      setScanError(e.message || 'Scanning folder failed.');
    } finally {
      setIsScanning(false);
    }
  };

  const selectFolder = async () => {
    try {
      const handle = await (window as any).showDirectoryPicker();
      await saveDirectoryHandle(handle);
      setDirHandle(handle);
      setFolderName(handle.name);
      setNeedPermission(false);
      
      const storedSettings = await getSettings();
      storedSettings.skillsFolderChosen = true;
      storedSettings.skillsFolderName = handle.name;
      await saveSettings(storedSettings);
      setSettings(storedSettings);
      
      await triggerScan(handle);
      
      if (activeTab === 'onboarding') {
        setOnboardingStep(2);
      }
    } catch (e: any) {
      console.error(e);
      setScanError(e.message || 'Error choosing directory');
    }
  };

  const requestFolderPermission = async () => {
    if (!dirHandle) return;
    try {
      const permission = await (dirHandle as any).requestPermission({ mode: 'read' });
      if (permission === 'granted') {
        setNeedPermission(false);
        triggerScan(dirHandle);
      }
    } catch (e) {
      setScanError('Failed to acquire directory permission.');
    }
  };

  const createSampleSkill = async () => {
    if (!dirHandle) return;
    try {
      const opts = { mode: 'readwrite' as const };
      const permission = await (dirHandle as any).requestPermission(opts);
      if (permission !== 'granted') {
        alert('Read-write permission is required to create a sample skill.');
        return;
      }
      
      const skillFolder = await dirHandle.getDirectoryHandle('brandkit', { create: true });
      const skillMdFile = await skillFolder.getFileHandle('SKILL.md', { create: true });
      const writable = await skillMdFile.createWritable();
      
      const content = `---
name: brandkit
description: Premium brand-kit image generation skill for creating high-end brand-guidelines boards.
tags:
  - design
  - assets
---
# Brand Kit Design Guidelines

Create complete, premium brand guidelines boards with minimalist grid structures. Focus on:
- 12px rounded elements
- Dark-mode accent styling
- Monochromatic actions (#111111 ink)
`;
      await writable.write(content);
      await writable.close();
      
      await triggerScan(dirHandle);
    } catch (e: any) {
      alert('Failed to create sample skill: ' + e.message);
    }
  };

  // Sync skill to target
  const syncSkillToTarget = async (skill: SkillFile, target: SyncTarget, forceOverwrite = false) => {
    if (!dirHandle) return;
    const targetPath = target.customPath || target.defaultPath;
    if (!targetPath) {
      alert('Target path is not set. Set a custom path in Settings/Options page.');
      return;
    }

    // Check conflict first
    chrome.runtime.sendMessage({
      action: 'check_conflict',
      payload: { skillId: skill.id, targetId: target.id, targetPath }
    }, async (response) => {
      if (response && response.success) {
        if (response.exists && !forceOverwrite) {
          const overwriteConfirm = confirm(
            `A skill with name "${skill.id}" already exists at the sync target. Overwrite existing files?`
          );
          if (!overwriteConfirm) return;
        }

        try {
          const filesPayload = await prepareSkillFiles(dirHandle, skill.path);
          chrome.runtime.sendMessage({
            action: 'sync_skill',
            payload: {
              skillId: skill.id,
              targetId: target.id,
              targetPath,
              files: filesPayload
            }
          }, (syncResponse) => {
            if (syncResponse && syncResponse.success) {
              // Update synced status in local lists
              setTargets(prev => prev.map(t => {
                if (t.id === target.id) {
                  return { ...t, syncedSkills: Array.from(new Set([...t.syncedSkills, skill.id])) };
                }
                return t;
              }));
              alert(`Successfully synced ${skill.name} to ${target.name}!`);
            } else {
              alert(`Sync failed: ${syncResponse?.error || 'Unknown error'}`);
            }
          });
        } catch (e: any) {
          alert(`Error reading skill files: ${e.message}`);
        }
      } else {
        alert(`Error checking targets: ${response?.error}`);
      }
    });
  };

  const removeSkillFromTarget = async (skillId: string, target: SyncTarget) => {
    const targetPath = target.customPath || target.defaultPath;
    if (!targetPath) return;

    if (!confirm(`Are you sure you want to remove skill "${skillId}" from ${target.name}?`)) {
      return;
    }

    chrome.runtime.sendMessage({
      action: 'remove_skill',
      payload: { skillId, targetId: target.id, targetPath }
    }, (response) => {
      if (response && response.success) {
        setTargets(prev => prev.map(t => {
          if (t.id === target.id) {
            return { ...t, syncedSkills: t.syncedSkills.filter(id => id !== skillId) };
          }
          return t;
        }));
        alert(`Removed ${skillId} from ${target.name}.`);
      } else {
        alert(`Uninstall failed: ${response?.error}`);
      }
    });
  };

  const bulkSyncSelected = async (target: SyncTarget) => {
    if (!dirHandle) return;
    const selectedIds = Object.keys(selectedSkillsMap).filter(k => selectedSkillsMap[k]);
    if (selectedIds.length === 0) {
      alert('No skills selected.');
      return;
    }

    const targetPath = target.customPath || target.defaultPath;
    if (!targetPath) {
      alert('Target path is missing. Set a path in settings.');
      return;
    }

    let successCount = 0;
    for (const skillId of selectedIds) {
      const skill = skills.find(s => s.id === skillId);
      if (!skill) continue;

      try {
        const filesPayload = await prepareSkillFiles(dirHandle, skill.path);
        await new Promise<void>((resolve) => {
          chrome.runtime.sendMessage({
            action: 'sync_skill',
            payload: {
              skillId: skill.id,
              targetId: target.id,
              targetPath,
              files: filesPayload
            }
          }, (res) => {
            if (res && res.success) successCount++;
            resolve();
          });
        });
      } catch (e) {
        console.error(`Failed to bulk sync ${skillId}`, e);
      }
    }

    detectTargets();
    alert(`Bulk synced ${successCount} of ${selectedIds.length} skills to ${target.name}!`);
  };

  const toggleFavorite = async (skillId: string) => {
    const updated = skills.map(s => s.id === skillId ? { ...s, isFavorite: !s.isFavorite } : s);
    setSkills(updated);
    await saveCachedSkills(updated);
  };

  const openSettingsPage = () => {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open('options.html', '_blank');
    }
  };

  // Filtering calculations
  const allTags = Array.from(new Set(skills.flatMap(s => s.tags || [])));
  const filteredSkills = skills.filter(skill => {
    const matchesSearch = 
      skill.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      skill.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skill.id.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesTag = selectedTag === 'all' || (skill.tags && skill.tags.includes(selectedTag));
    return matchesSearch && matchesTag;
  });

  const toggleSelectAll = () => {
    if (Object.keys(selectedSkillsMap).length === filteredSkills.length) {
      setSelectedSkillsMap({});
    } else {
      const newMap: Record<string, boolean> = {};
      filteredSkills.forEach(s => { newMap[s.id] = true; });
      setSelectedSkillsMap(newMap);
    }
  };

  const handleSelectSkillCheckbox = (id: string) => {
    setSelectedSkillsMap(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div className="flex flex-col h-full bg-cyber-bg-dark text-cyber-text-primary-dark select-none">
      {/* Top Banner Header */}
      <header className="flex items-center justify-between px-3.5 py-2.5 bg-cyber-bg-dark border-b border-cyber-border-dark shrink-0">
        <div className="flex items-center gap-2">
          <img src="/icons/logo.svg" className="size-5 shrink-0" alt="Skill Bridge Logo" />
          <h1 className="font-semibold text-sm tracking-tight text-cyber-text-primary-dark font-sans">Skill Bridge</h1>
          <span className="text-[9px] text-cyber-text-muted-dark border border-cyber-border-dark px-2 py-0.5 rounded-full font-sans font-medium">v1.0</span>
        </div>
        
        <div className="flex items-center gap-2.5">
          {/* Target Detection Quick Indicators */}
          <div className="flex gap-1.5">
            {targets.map(t => (
              <span 
                key={t.id} 
                title={`${t.name}: ${t.detected ? 'Active' : 'Missing'}`}
                className={`w-1.5 h-1.5 rounded-full ${t.detected ? 'bg-cyber-valid' : 'bg-cyber-border-dark'}`} 
              />
            ))}
          </div>
          <button 
            onClick={openSettingsPage}
            className="p-1.5 text-cyber-text-muted-dark hover:text-cyber-text-primary-dark hover:bg-cyber-surface-dark rounded-md transition-colors"
          >
            <SettingsIcon className="size-4" />
          </button>
        </div>
      </header>

      {/* Onboarding View */}
      {activeTab === 'onboarding' && (
        <main className="flex-1 flex flex-col justify-center items-center p-6 text-center gap-5 overflow-y-auto bg-cyber-bg-dark">
          {onboardingStep === 1 ? (
            <div className="flex flex-col gap-4 max-w-sm">
              <div className="mx-auto size-12 bg-cyber-surface-dark border border-cyber-border-dark rounded-full flex items-center justify-center">
                <FolderOpen className="size-6 text-cyber-blue" />
              </div>
              <h2 className="text-base font-semibold tracking-cal-sm font-sans text-cyber-text-primary-dark">Setup Skills Folder</h2>
              <p className="text-xs text-cyber-text-muted-dark leading-relaxed font-sans">
                Skill Bridge syncs local folders containing <code className="text-cyber-blue font-mono px-1 py-0.5 bg-cyber-surface-dark rounded text-[10px]">SKILL.md</code> templates into targets like Claude Code. Pick your root Agent Skills folder to start.
              </p>
              <button 
                onClick={selectFolder}
                className="w-full h-9 bg-cyber-blue hover:bg-[#242424] font-semibold text-xs rounded-md transition-colors flex items-center justify-center gap-1.5 text-white font-sans"
              >
                <FolderOpen className="size-4" /> Select Directory
              </button>
              {scanError && (
                <div className="p-2 border border-cyber-error/20 bg-cyber-error/5 text-cyber-error text-[11px] rounded-md font-mono text-center">
                  {scanError}
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-4 max-w-sm">
              <div className="mx-auto size-12 bg-cyber-surface-dark border border-cyber-border-dark rounded-full flex items-center justify-center">
                <Sparkles className="size-6 text-cyber-valid" />
              </div>
              <h2 className="text-base font-semibold tracking-cal-sm font-sans text-cyber-valid">Found {skills.length} Skills!</h2>
              <p className="text-xs text-cyber-text-muted-dark leading-relaxed font-sans">
                Your skills have been indexed successfully. The extension detected active local targets. You are ready to sync.
              </p>
              <div className="flex flex-col gap-2 border border-cyber-border-dark/60 rounded-lg p-3 bg-cyber-surface-dark text-left text-[11px] font-sans">
                {targets.map(t => (
                  <div key={t.id} className="flex items-center gap-2 justify-between">
                    <span className="text-cyber-text-muted-dark font-medium">{t.name}</span>
                    <span className={`font-semibold ${t.detected ? 'text-cyber-valid' : 'text-cyber-text-muted-dark'}`}>
                      {t.detected ? 'FOUND' : 'NOT INSTALLED'}
                    </span>
                  </div>
                ))}
              </div>
              <button 
                onClick={() => setActiveTab('library')}
                className="w-full h-9 bg-cyber-blue hover:bg-[#242424] font-semibold text-xs rounded-md transition-colors text-white font-sans"
              >
                Launch Library
              </button>
            </div>
          )}
        </main>
      )}

      {/* Main Library View */}
      {activeTab !== 'onboarding' && (
        <div className="flex-1 flex flex-col min-h-0 bg-cyber-bg-dark">
          
          {/* Navigation Sub-Tabs (Cal.com nav-pill-group style) */}
          <div className="p-1 bg-cyber-surface-light border border-cyber-border-dark rounded-full mx-3 my-2 flex gap-1 shrink-0">
            <button 
              onClick={() => { setActiveTab('library'); setSelectedSkill(null); }}
              className={`flex-1 py-1.5 text-xs font-sans text-center rounded-full transition-all font-semibold ${
                activeTab === 'library' 
                  ? 'bg-white text-cyber-text-primary-dark shadow-sm' 
                  : 'text-cyber-text-muted-dark hover:text-cyber-text-primary-dark'
              }`}
            >
              Skills Library ({skills.length})
            </button>
            <button 
              onClick={() => { setActiveTab('targets'); setSelectedSkill(null); }}
              className={`flex-1 py-1.5 text-xs font-sans text-center rounded-full transition-all font-semibold ${
                activeTab === 'targets' 
                  ? 'bg-white text-cyber-text-primary-dark shadow-sm' 
                  : 'text-cyber-text-muted-dark hover:text-cyber-text-primary-dark'
              }`}
            >
              Sync Targets
            </button>
          </div>

          {/* Search / Multi-Actions Row (only for library tab and if no skill is selected) */}
          {activeTab === 'library' && !selectedSkill && (
            <div className="px-3 py-2 bg-cyber-bg-dark border-b border-cyber-border-dark flex flex-col gap-2 shrink-0">
              <div className="flex items-center gap-1.5">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-cyber-text-muted-dark" />
                  <input
                    type="text"
                    placeholder="Fuzzy search (Ctrl+K)..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full h-8 pl-8 pr-2 bg-cyber-bg-dark border border-cyber-border-dark rounded-md text-xs text-cyber-text-primary-dark placeholder-cyber-text-muted-dark outline-none focus:border-cyber-blue transition-colors font-sans focus:ring-1 focus:ring-cyber-blue"
                  />
                </div>
                <button 
                  onClick={() => dirHandle && triggerScan(dirHandle)}
                  disabled={isScanning || !dirHandle}
                  className="h-8 w-8 flex items-center justify-center bg-cyber-bg-dark border border-cyber-border-dark rounded-md text-cyber-text-muted-dark hover:text-cyber-text-primary-dark disabled:opacity-50 transition-colors hover:bg-cyber-surface-dark"
                  title="Rescan Local Folder"
                >
                  <RefreshCw className={`size-3.5 ${isScanning ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {/* Tag Filters */}
              {allTags.length > 0 && (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[10px]">
                  <span className="text-cyber-text-muted-dark shrink-0 font-sans font-medium">Tags:</span>
                  <button 
                    onClick={() => setSelectedTag('all')}
                    className={`px-2.5 py-0.5 rounded-full border text-[9px] font-sans tracking-tight transition-all font-semibold ${
                      selectedTag === 'all' 
                        ? 'border-cyber-blue bg-cyber-blue text-white' 
                        : 'border-cyber-border-dark bg-cyber-surface-dark text-cyber-text-muted-dark hover:text-cyber-text-primary-dark'
                    }`}
                  >
                    All
                  </button>
                  {allTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => setSelectedTag(tag)}
                      className={`px-2.5 py-0.5 rounded-full border text-[9px] font-sans tracking-tight shrink-0 transition-all font-semibold ${
                        selectedTag === tag
                          ? 'border-cyber-blue bg-cyber-blue text-white'
                          : 'border-cyber-border-dark bg-cyber-surface-dark text-cyber-text-muted-dark hover:text-cyber-text-primary-dark'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              )}

              {/* Bulk Actions Menu */}
              {Object.keys(selectedSkillsMap).filter(k => selectedSkillsMap[k]).length > 0 && (
                <div className="flex items-center justify-between p-2 bg-cyber-surface-dark border border-cyber-border-dark rounded-md text-[10px]">
                  <span className="font-sans text-cyber-text-primary-dark font-semibold">
                    {Object.keys(selectedSkillsMap).filter(k => selectedSkillsMap[k]).length} Selected
                  </span>
                  <div className="flex gap-1.5">
                    {targets.filter(t => t.detected).map(target => (
                      <button
                        key={target.id}
                        onClick={() => bulkSyncSelected(target)}
                        className="px-2.5 py-1 bg-cyber-blue hover:bg-[#242424] text-white rounded-md font-sans font-semibold text-[9px] transition-colors"
                      >
                        → {target.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab Contents */}
          <div className="flex-1 overflow-y-auto p-3 min-h-0 bg-cyber-bg-dark">
            {needPermission && (
              <div className="mb-3 p-3 border border-cyber-border-dark bg-cyber-surface-dark rounded-lg flex flex-col gap-2.5">
                <div className="flex items-start gap-2.5">
                  <ShieldAlert className="size-4 text-cyber-text-primary-dark shrink-0 mt-0.5" />
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold font-sans text-cyber-text-primary-dark">Permissions Required</span>
                    <span className="text-[10px] text-cyber-text-muted-dark leading-relaxed font-sans">
                      Chrome sandboxes directory folders between runs. Click below to re-authorize read access to folder <code className="text-cyber-text-primary-dark font-semibold">"{folderName}"</code>.
                    </span>
                  </div>
                </div>
                <button 
                  onClick={requestFolderPermission}
                  className="h-7 bg-cyber-blue hover:bg-[#242424] font-semibold text-[10px] rounded-md transition-colors text-white font-sans self-start px-3"
                >
                  Grant Read Permission
                </button>
              </div>
            )}

            {/* Library Grid */}
            {activeTab === 'library' && !selectedSkill && (
              <div className="flex flex-col gap-2 h-full">
                {skills.length === 0 ? (
                  <div className="flex flex-col justify-center items-center py-8 px-4 text-center gap-4 bg-cyber-bg-dark h-full">
                    <div className="size-10 bg-cyber-surface-dark border border-cyber-border-dark rounded-lg flex items-center justify-center shrink-0 shadow-sm">
                      <Sparkles className="size-5 text-cyber-text-primary-dark" />
                    </div>
                    
                    <div className="flex flex-col gap-1 max-w-xs">
                      <h3 className="text-sm font-semibold tracking-cal-sm font-sans text-cyber-text-primary-dark">Your Skills Library is Empty</h3>
                      <p className="text-[10px] text-cyber-text-muted-dark leading-relaxed font-sans">
                        Skills are defined by placing a <code className="bg-cyber-surface-dark px-1 py-0.5 rounded font-mono text-[9px]">SKILL.md</code> file in any subfolder inside your selected directory.
                      </p>
                    </div>

                    {/* How-to Card */}
                    <div className="w-full max-w-sm border border-cyber-border-dark/60 rounded-lg p-3 bg-cyber-surface-dark text-left flex flex-col gap-2 select-text">
                      <div className="flex justify-between items-center border-b border-cyber-border-dark pb-1.5 mb-0.5">
                        <span className="text-[8px] font-sans font-bold uppercase text-cyber-text-muted-dark tracking-wider">Example Directory Tree</span>
                        <span className="text-[8px] font-sans font-bold uppercase text-cyber-text-muted-dark tracking-wider">SKILL.md</span>
                      </div>
                      <pre className="text-[9px] font-mono text-cyber-text-primary-dark/80 leading-relaxed overflow-x-auto select-all bg-white p-2 border border-cyber-border-dark/60 rounded-md">
{`my-skills/
  └── brandkit/
      ├── SKILL.md      <-- Required
      └── references/   <-- Optional`}
                      </pre>
                    </div>

                    <div className="flex gap-2 w-full max-w-xs mt-1">
                      <button 
                        onClick={createSampleSkill}
                        className="flex-1 h-8 bg-cyber-blue hover:bg-[#242424] text-white font-semibold text-[10px] rounded-md transition-colors font-sans"
                      >
                        Create Sample Skill
                      </button>
                    </div>
                  </div>
                ) : filteredSkills.length === 0 ? (
                  <div className="py-12 text-center text-xs text-cyber-text-muted-dark flex flex-col items-center gap-2">
                    <AlertCircle className="size-6 text-cyber-text-muted-dark" />
                    <span>No skills found matching filter.</span>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between px-1.5 text-[10px] text-cyber-text-muted-dark font-sans font-semibold mb-1 border-b border-cyber-border-dark pb-1.5">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={Object.keys(selectedSkillsMap).length === filteredSkills.length && filteredSkills.length > 0}
                          onChange={toggleSelectAll}
                          className="rounded border-cyber-border-dark bg-cyber-bg-dark text-cyber-blue size-3.5 cursor-pointer focus:ring-0"
                        />
                        <span>Sync Library List</span>
                      </div>
                      <span>Validity</span>
                    </div>

                    {filteredSkills.map(skill => {
                      const isSelected = !!selectedSkillsMap[skill.id];
                      return (
                        <div 
                          key={skill.id}
                          className={`flex items-center justify-between p-3 bg-cyber-surface-dark border rounded-lg transition-all ${
                            isSelected 
                              ? 'border-cyber-blue bg-white shadow-sm' 
                              : 'border-transparent hover:border-cyber-border-dark/60 hover:bg-white hover:shadow-sm'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 overflow-hidden flex-1">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleSelectSkillCheckbox(skill.id)}
                              className="rounded border-cyber-border-dark bg-cyber-bg-dark text-cyber-blue size-3.5 cursor-pointer focus:ring-0"
                            />
                            
                            <button
                              onClick={() => toggleFavorite(skill.id)}
                              className="text-cyber-text-muted-dark hover:text-cyber-badgeOrange transition-colors"
                            >
                              <Star className={`size-3.5 ${skill.isFavorite ? 'fill-cyber-badgeOrange text-cyber-badgeOrange' : ''}`} />
                            </button>
                            
                            <div 
                              onClick={() => setSelectedSkill(skill)}
                              className="flex flex-col text-left overflow-hidden cursor-pointer flex-1"
                            >
                              <span className="font-semibold text-xs font-sans text-cyber-text-primary-dark">{skill.name}</span>
                              <span className="text-[10px] text-cyber-text-muted-dark truncate mt-0.5">{skill.description}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 ml-2">
                            {/* Validation status badge */}
                            <span 
                              title={skill.validation.errors.join('\n') || 'Parser Valid'}
                              className={`px-2 py-0.5 rounded-full text-[8px] font-sans font-semibold uppercase ${
                                skill.validation.isValid 
                                  ? 'bg-cyber-valid/15 text-cyber-valid border border-cyber-valid/25' 
                                  : 'bg-cyber-error/15 text-cyber-error border border-cyber-error/25'
                              }`}
                            >
                              {skill.validation.isValid ? 'Valid' : 'Errors'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            )}

            {/* Target Sync Status Tab */}
            {activeTab === 'targets' && (
              <div className="flex flex-col gap-3">
                {targets.map(target => (
                  <div key={target.id} className="p-3.5 bg-cyber-surface-dark border border-cyber-border-dark/60 rounded-lg flex flex-col gap-3">
                    <div className="flex items-start justify-between">
                      <div className="flex flex-col overflow-hidden">
                        <span className="font-semibold text-xs font-sans text-cyber-text-primary-dark flex items-center gap-1.5">
                          {target.name}
                          <span className={`w-1.5 h-1.5 rounded-full ${target.detected ? 'bg-cyber-valid' : 'bg-cyber-border-dark'}`} />
                        </span>
                        <span className="text-[10px] text-cyber-text-muted-dark font-sans truncate mt-0.5" title={target.customPath || target.defaultPath || 'Not configured'}>
                          Path: {target.customPath || target.defaultPath || 'Configure custom path in settings'}
                        </span>
                      </div>
                      
                      <div className="flex gap-1.5 shrink-0">
                        {target.detected && (
                          <button 
                            onClick={() => {
                              const selected = Object.keys(selectedSkillsMap).filter(k => selectedSkillsMap[k]);
                              if (selected.length > 0) {
                                bulkSyncSelected(target);
                              } else {
                                alert('Select skills in the library tab first.');
                              }
                            }}
                            className="px-2.5 py-1 bg-cyber-blue hover:bg-[#242424] text-white rounded-md text-[10px] font-sans font-semibold transition-colors"
                          >
                            Sync Selected
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="border-t border-cyber-border-dark/60 pt-2.5">
                      <span className="text-[9px] text-cyber-text-muted-dark font-sans font-semibold uppercase block mb-1.5">Synced plugins:</span>
                      {target.syncedSkills.length === 0 ? (
                        <span className="text-[10px] text-cyber-text-muted-dark italic block">No skills synced yet.</span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {target.syncedSkills.map(skillId => (
                            <div key={skillId} className="flex items-center gap-1 px-2 py-0.5 bg-white border border-cyber-border-dark rounded-md text-[9px] font-sans">
                              <span className="text-cyber-text-primary-dark">{skillId}</span>
                              <button 
                                onClick={() => removeSkillFromTarget(skillId, target)}
                                className="text-cyber-text-muted-dark hover:text-cyber-error ml-1 font-semibold"
                              >
                                &times;
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Individual Detailed View */}
            {selectedSkill && (
              <div className="flex flex-col h-full bg-cyber-bg-dark">
                {/* Back link */}
                <div className="flex items-center justify-between border-b border-cyber-border-dark pb-2 mb-3 shrink-0">
                  <button 
                    onClick={() => { setSelectedSkill(null); setRawSourceOpen(false); }}
                    className="text-xs text-cyber-text-primary-dark hover:underline font-sans font-semibold flex items-center gap-1"
                  >
                    &larr; Back to Library
                  </button>
                  
                  <span className="text-[10px] text-cyber-text-muted-dark font-sans">
                    Size: {(selectedSkill.size / 1024).toFixed(1)} KB
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3">
                  <div className="flex flex-col bg-cyber-surface-dark border border-cyber-border-dark/60 rounded-lg p-3">
                    <h3 className="font-semibold text-sm font-sans text-cyber-text-primary-dark tracking-tight">{selectedSkill.name}</h3>
                    <p className="text-[10px] text-cyber-text-muted-dark leading-relaxed mt-1">{selectedSkill.description}</p>
                    
                    {selectedSkill.tags && selectedSkill.tags.length > 0 && (
                      <div className="flex gap-1 mt-2.5 flex-wrap">
                        {selectedSkill.tags.map(t => (
                          <span key={t} className="px-2 py-0.5 bg-white border border-cyber-border-dark rounded-full text-[8px] font-sans font-semibold text-cyber-text-muted-dark">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Validation Alerts */}
                  {!selectedSkill.validation.isValid && (
                    <div className="p-3 border border-cyber-error/25 bg-cyber-error/10 text-cyber-error rounded-md text-[10px] flex flex-col gap-1.5">
                      <div className="flex items-center gap-1.5 font-bold font-sans">
                        <AlertCircle className="size-3.5" />
                        <span>Validations Failed:</span>
                      </div>
                      <ul className="list-disc pl-4 text-cyber-text-primary-dark/80 flex flex-col gap-0.5 leading-snug font-sans">
                        {selectedSkill.validation.errors.map((err, i) => (
                          <li key={i}>{err}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Sync Action Area */}
                  <div className="bg-cyber-surface-dark border border-cyber-border-dark/60 rounded-lg p-3 flex flex-col gap-2">
                    <span className="text-[9px] font-sans font-semibold uppercase text-cyber-text-muted-dark block">Local Tool Install Sync:</span>
                    <div className="flex flex-col gap-1.5">
                      {targets.map(target => (
                        <div key={target.id} className="flex items-center justify-between p-2 bg-white border border-cyber-border-dark/60 rounded-md text-[10px]">
                          <span className="font-sans font-medium text-cyber-text-primary-dark">{target.name}</span>
                          <div className="flex gap-1.5">
                            {target.syncedSkills.includes(selectedSkill.id) ? (
                              <button
                                onClick={() => removeSkillFromTarget(selectedSkill.id, target)}
                                className="px-2 py-0.5 border border-cyber-error/40 hover:bg-cyber-error/10 text-cyber-error rounded-md font-sans text-[9px] font-semibold transition-colors"
                              >
                                Uninstall
                              </button>
                            ) : null}
                            <button
                              disabled={!target.detected}
                              onClick={() => syncSkillToTarget(selectedSkill, target, false)}
                              className="px-2 py-0.5 bg-cyber-blue hover:bg-[#242424] text-white rounded-md font-sans text-[9px] font-semibold disabled:opacity-50 transition-colors"
                            >
                              Sync
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* In-Chat Injection explainer */}
                  <div className="p-3 bg-cyber-surface-dark border border-cyber-border-dark/60 rounded-lg text-[10px] leading-relaxed">
                    <div className="flex items-center gap-1.5 text-cyber-text-primary-dark font-semibold font-sans mb-1">
                      <Sparkles className="size-3.5 text-cyber-badgeOrange" />
                      <span>Tier 2: Web Chat Injection</span>
                    </div>
                    <p className="text-[10px] text-cyber-text-muted-dark leading-relaxed font-sans">
                      To run this skill in Claude, ChatGPT or Gemini web chat, open their page and click the floating <strong>Skill Bridge</strong> icon beside the prompt box. The skill gets injected directly into your chat context.
                    </p>
                  </div>

                  {/* Auxiliary File List */}
                  {selectedSkill.files.length > 0 && (
                    <div className="bg-cyber-surface-dark border border-cyber-border-dark/60 rounded-lg p-3">
                      <span className="text-[9px] font-sans font-semibold uppercase text-cyber-text-muted-dark block mb-1.5">Scripts & References:</span>
                      <div className="flex flex-col gap-1">
                        {selectedSkill.files.map(f => (
                          <div key={f.path} className="flex justify-between text-[10px] font-mono text-cyber-text-muted-dark">
                            <span className="truncate">{f.path}</span>
                            <span className="shrink-0 pl-2">{(f.size / 1024).toFixed(1)} KB</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Raw Toggle & Markdown source code */}
                  <div className="border border-cyber-border-dark/60 rounded-md overflow-hidden">
                    <button
                      onClick={() => setRawSourceOpen(!rawSourceOpen)}
                      className="w-full px-2.5 py-2 bg-cyber-surface-dark hover:bg-cyber-surface-dark/95 text-[10px] font-sans font-semibold text-left text-cyber-text-muted-dark border-b border-cyber-border-dark/60 flex justify-between items-center transition-colors"
                    >
                      <span>{rawSourceOpen ? 'Hide' : 'Show'} Raw Source (SKILL.md)</span>
                      <FileText className="size-3" />
                    </button>
                    {rawSourceOpen && (
                      <pre className="p-2.5 bg-white text-[10px] font-mono text-cyber-text-primary-dark/80 overflow-x-auto whitespace-pre leading-relaxed max-h-[140px] border-t-0">
                        {selectedSkill.rawSource}
                      </pre>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Quick Cmd+K floating help footer (Cal.com Dark Surface Theme) */}
          <footer className="px-3.5 py-2 bg-cyber-dark border-t border-cyber-darkElevated shrink-0 flex items-center justify-between text-[9px] text-cyber-onDarkSoft font-sans">
            <span className="flex items-center gap-1">
              <span className="border border-[#333333] bg-cyber-darkElevated text-white rounded px-1 text-[8px] font-mono font-bold">Ctrl</span>
              <span>+</span>
              <span className="border border-[#333333] bg-cyber-darkElevated text-white rounded px-1 text-[8px] font-mono font-bold">K</span>
              <span className="ml-1">to open Switcher</span>
            </span>
            {folderName && (
              <span className="truncate max-w-[180px]" title={folderName}>
                Library: {folderName}
              </span>
            )}
          </footer>
        </div>
      )}

      {/* Command Palette Modal */}
      <CommandPalette
        isOpen={cmdPaletteOpen}
        onClose={() => setCmdPaletteOpen(false)}
        skills={skills}
        onSelectSkill={(skill) => {
          setSelectedSkill(skill);
          setActiveTab('library');
        }}
        onRescan={() => dirHandle && triggerScan(dirHandle)}
        onGoToSettings={openSettingsPage}
      />
    </div>
  );
}

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<PopupApp />);
}
