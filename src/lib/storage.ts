import { Settings, SkillFile } from './types';

const DB_NAME = 'SkillBridgeDB';
const STORE_NAME = 'handles';
const HANDLE_KEY = 'skills_root';

// Helper to open IndexedDB
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Persists the Directory Handle from the File System Access API in IndexedDB.
 * This retains access permissions across extensions reloads.
 */
export async function saveDirectoryHandle(handle: FileSystemDirectoryHandle): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.put(handle, HANDLE_KEY);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Restores the persisted Directory Handle from IndexedDB.
 */
export async function getDirectoryHandle(): Promise<FileSystemDirectoryHandle | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(HANDLE_KEY);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    console.error('Failed to get directory handle from IndexedDB:', e);
    return null;
  }
}

/**
 * Removes the directory handle from storage.
 */
export async function clearDirectoryHandle(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete(HANDLE_KEY);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Default system configurations
export const DEFAULT_SETTINGS: Settings = {
  skillsFolderChosen: false,
  skillsFolderName: '',
  autoRescanOnOpen: true,
  privacyTelemetry: false,
  targets: {
    'claude-code': { enabled: true },
    'codex-cli': { enabled: true },
    'gemini-cli': { enabled: true },
    'cursor': { enabled: true }
  },
  siteAdapters: {
    'claude.ai': true,
    'chatgpt.com': true,
    'gemini.google.com': true,
    'chat.deepseek.com': true,
    'chat.qwen.ai': true,
    'chatglm.cn': true,
    'kimi.moonshot.cn': true,
    'chat.mistral.ai': true,
    'perplexity.ai': true,
    'huggingface.co': true,
    'poe.com': true,
    'groq.com': true,
    'phind.com': true
  }
};

/**
 * Retrieves the settings from chrome.storage.local or falls back to localStorage in dev mode.
 */
export function getSettings(): Promise<Settings> {
  return new Promise((resolve) => {
    if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.local) {
      const local = localStorage.getItem('sb_settings');
      resolve(local ? JSON.parse(local) : DEFAULT_SETTINGS);
      return;
    }

    chrome.storage.local.get(['settings'], (result) => {
      if (result.settings) {
        resolve({ ...DEFAULT_SETTINGS, ...result.settings });
      } else {
        resolve(DEFAULT_SETTINGS);
      }
    });
  });
}

/**
 * Saves configuration settings.
 */
export function saveSettings(settings: Settings): Promise<void> {
  return new Promise((resolve) => {
    if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.local) {
      localStorage.setItem('sb_settings', JSON.stringify(settings));
      resolve();
      return;
    }

    chrome.storage.local.set({ settings }, () => resolve());
  });
}

/**
 * Retrieves the cached skill array for instant popup display.
 */
export function getCachedSkills(): Promise<SkillFile[]> {
  return new Promise((resolve) => {
    if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.local) {
      const local = localStorage.getItem('sb_cached_skills');
      resolve(local ? JSON.parse(local) : []);
      return;
    }

    chrome.storage.local.get(['cachedSkills'], (result) => {
      resolve(result.cachedSkills || []);
    });
  });
}

/**
 * Caches scanned skills lists.
 */
export function saveCachedSkills(skills: SkillFile[]): Promise<void> {
  return new Promise((resolve) => {
    if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.local) {
      localStorage.setItem('sb_cached_skills', JSON.stringify(skills));
      resolve();
      return;
    }

    chrome.storage.local.set({ cachedSkills: skills }, () => resolve());
  });
}
