import { Settings, SkillFile } from './types';

const DB_NAME = 'SkillBridgeDB';
const STORE_NAME = 'handles';
const HANDLE_KEY = 'skills_root';

// Cached singleton connection — avoids reopening the database on every call
// while still allowing proper cleanup if needed.
let cachedDb: IDBDatabase | null = null;

function openDB(): Promise<IDBDatabase> {
  if (cachedDb) {
    return Promise.resolve(cachedDb);
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => {
      cachedDb = request.result;
      // If the connection is unexpectedly closed, clear the cache
      cachedDb.onclose = () => { cachedDb = null; };
      resolve(cachedDb);
    };
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
      if (local) {
        try {
          resolve({ ...DEFAULT_SETTINGS, ...JSON.parse(local) });
        } catch (_e) {
          resolve(DEFAULT_SETTINGS);
        }
      } else {
        resolve(DEFAULT_SETTINGS);
      }
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
      if (local) {
        try {
          resolve(JSON.parse(local));
        } catch (_e) {
          resolve([]);
        }
      } else {
        resolve([]);
      }
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

/**
 * Validates that an object conforms to the Settings interface shape.
 * Used to guard against malformed imported config files.
 */
export function isValidSettingsShape(obj: unknown): obj is Settings {
  if (typeof obj !== 'object' || obj === null) return false;
  const candidate = obj as Record<string, unknown>;
  
  // Must have the required top-level keys with correct types
  if (typeof candidate.targets !== 'object' || candidate.targets === null) return false;
  if (typeof candidate.siteAdapters !== 'object' || candidate.siteAdapters === null) return false;
  if (typeof candidate.autoRescanOnOpen !== 'boolean') return false;
  if (typeof candidate.privacyTelemetry !== 'boolean') return false;
  
  // Validate targets structure: each value must have { enabled: boolean }
  const targets = candidate.targets as Record<string, unknown>;
  for (const key of Object.keys(targets)) {
    const target = targets[key];
    if (typeof target !== 'object' || target === null) return false;
    if (typeof (target as Record<string, unknown>).enabled !== 'boolean') return false;
  }
  
  // Validate siteAdapters structure: each value must be boolean
  const adapters = candidate.siteAdapters as Record<string, unknown>;
  for (const key of Object.keys(adapters)) {
    if (typeof adapters[key] !== 'boolean') return false;
  }
  
  return true;
}
