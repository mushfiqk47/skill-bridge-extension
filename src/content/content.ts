// Skill Bridge Content Script (Tier 2 Chat Injection)

// ────────────────────────────────────────────────────────────
// Utilities
// ────────────────────────────────────────────────────────────

/** Escapes HTML special characters to prevent XSS when inserting into innerHTML. */
function escapeHtml(str: string): string {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

/** Shared brain icon SVG paths — used in both trigger button and overlay header. */
const BRAIN_SVG_PATHS = `
  <path d="M259.456,15.895c-8.995-2.828-18.385-4.259-27.892-4.259c-28.125,0-54.54,12.684-72.145,34.281
    c-5.818-1.14-11.66-1.699-17.455-1.699c-41.484,0-77.3,26.927-89.065,66.188C20.573,125.812,0,158.138,0,194.327
    c0,6.435,5.213,11.636,11.636,11.636s11.636-5.201,11.636-11.636c0-28.637,17.187-54.051,43.776-64.733
    c3.526-1.42,6.132-4.468,6.993-8.157c7.389-31.767,35.316-53.946,67.921-53.946c6.272,0,12.672,0.908,19.025,2.7
    c4.829,1.361,9.972-0.512,12.8-4.643c13.033-19.188,34.641-30.638,57.775-30.638c7.145,0,14.173,1.07,20.911,3.188
    c6.109,1.932,12.66-1.478,14.592-7.61C268.998,24.367,265.588,17.827,259.456,15.895z"/>
  <path d="M121.6,353.745c-54.214,0-98.327-34.967-98.327-77.964c0-11.683,3.316-23.028,9.844-33.722
    c16.652-27.287,50.56-44.241,88.483-44.241c6.423,0,11.636-5.201,11.636-11.636s-5.213-11.636-11.636-11.636
    c-45.975,0-87.494,21.213-108.346,55.377C4.457,244.329,0,259.747,0,275.782c0,55.82,54.551,101.236,121.6,101.236
    c6.423,0,11.636-5.201,11.636-11.636C133.236,358.947,128.023,353.745,121.6,353.745z"/>
  <path d="M434.409,81.617c-18.199-32.791-54.074-53.69-92.881-53.69c-18.735,0-37.248,4.887-53.527,14.138
    c-31.942,18.176-51.782,51.549-51.782,87.098c0,4.515-11.043,12.812-29.091,12.812c-6.423,0-11.636,5.201-11.636,11.636
    c0,6.435,5.213,11.636,11.636,11.636c16.721,0,31.209-5.248,40.727-13.417c9.519,8.169,24.006,13.417,40.727,13.417
    c6.423,0,11.636-5.201,11.636-11.636c0-6.435-5.213-11.636-11.636-11.636c-18.048,0-29.091-8.297-29.091-12.812
    c0-27.613,14.964-52.608,40.017-66.863C312.285,55.04,326.807,51.2,341.527,51.2c31.814,0,61.033,17.804,74.426,45.359
    c1.501,3.095,4.305,5.364,7.633,6.191c38.353,9.623,65.14,43.916,65.14,83.433c0,3.479-0.209,6.9-0.605,10.263
    c-0.756,6.388,3.805,12.172,10.182,12.928c0.466,0.058,0.931,0.081,1.396,0.081c5.807,0,10.833-4.352,11.543-10.263
    c0.5-4.271,0.756-8.599,0.756-13.009C512,137.775,480.361,95.511,434.409,81.617z"/>
  <path d="M272.291,198.982c-33.362,0-60.509,27.148-60.509,60.509c0,6.435,5.213,11.636,11.636,11.636s11.636-5.201,11.636-11.636
    c0-20.538,16.71-37.236,37.236-37.236c6.423,0,11.636-5.201,11.636-11.636C283.927,204.183,278.714,198.982,272.291,198.982z"/>
  <path d="M353.745,247.855c-24.378,0-44.218,19.84-44.218,44.218c0,42.985-36.806,77.964-82.036,77.964
    c-20.573,0-40.239-7.261-55.401-20.457c-16.931-14.743-26.636-35.7-26.636-57.507c0-6.435-5.213-11.636-11.636-11.636
    s-11.636,5.201-11.636,11.636c0,28.544,12.614,55.901,34.63,75.055c19.398,16.884,44.497,26.182,70.679,26.182
    c58.065,0,105.309-45.417,105.309-101.236c0-11.555,9.402-20.945,20.945-20.945c6.423,0,11.636-5.201,11.636-11.636
    S360.169,247.855,353.745,247.855z"/>
  <path d="M495.709,283.939c0-13.312-2.467-26.473-7.331-39.156c-16.116-42.007-57.123-70.237-102.051-70.237
    c-6.423,0-11.636,5.201-11.636,11.636s5.213,11.636,11.636,11.636c35.91,0,67.433,21.702,80.326,55.296
    c3.84,10.007,5.783,20.375,5.783,30.813c0,49.885-32.791,86.097-77.964,86.097c-0.547,0-57.367,1.14-85.492,15.197
    c-3.945,1.978-6.435,6.004-6.435,10.415c0,19.828,19.037,83.002,23.761,91.345c7.575,13.382,19.759,13.382,44.02,13.382
    c5.76,0,56.634-0.582,69.004-20.666c3.537-5.725,3.793-12.521,1.071-17.839l-14.72-35.724c-2.455-5.946-9.263-8.762-15.197-6.33
    c-5.946,2.455-8.774,9.251-6.33,15.197l13.882,33.606c-5.737,3.549-23.424,8.483-47.709,8.483c-6.854,0-21.132,0-23.657-1.385
    c-3.328-6.726-16.791-51.456-20.108-72.623c22.796-7.889,60.998-9.775,67.91-9.775
    C453.132,393.309,495.709,347.311,495.709,283.939z"/>
`;

// ────────────────────────────────────────────────────────────
// Site Configuration
// ────────────────────────────────────────────────────────────

interface SiteConfig {
  name: string;
  inputSelector: string;
  containerSelector: string;
}

const SITE_CONFIGS: Record<string, SiteConfig> = {
  'claude.ai': {
    name: 'Claude',
    inputSelector: '[contenteditable="true"]',
    containerSelector: 'fieldset' 
  },
  'chatgpt.com': {
    name: 'ChatGPT',
    inputSelector: '#prompt-textarea',
    containerSelector: 'form' 
  },
  'gemini.google.com': {
    name: 'Gemini',
    inputSelector: 'rich-textarea [contenteditable="true"], textarea',
    containerSelector: '.input-area' 
  },
  'deepseek.com': {
    name: 'DeepSeek',
    inputSelector: 'textarea#chat-input, textarea, [contenteditable="true"]',
    containerSelector: 'body'
  },
  'grok.com': {
    name: 'Grok',
    inputSelector: 'textarea, [contenteditable="true"], [role="textbox"]',
    containerSelector: 'body'
  },
  'qwen.ai': {
    name: 'Qwen',
    inputSelector: 'textarea, [contenteditable="true"]',
    containerSelector: 'body'
  },
  'chatglm.cn': {
    name: 'Z-AI (Zhipu)',
    inputSelector: 'textarea, [contenteditable="true"]',
    containerSelector: 'body'
  },
  'z.ai': {
    name: 'Z-AI',
    inputSelector: 'textarea, [contenteditable="true"], [role="textbox"]',
    containerSelector: 'body'
  },
  'kimi.moonshot.cn': {
    name: 'Kimi',
    inputSelector: '[contenteditable="true"], textarea',
    containerSelector: 'body'
  },
  'chat.mistral.ai': {
    name: 'Mistral',
    inputSelector: 'textarea, [contenteditable="true"]',
    containerSelector: 'body'
  },
  'perplexity.ai': {
    name: 'Perplexity',
    inputSelector: 'textarea[placeholder*="Ask"], textarea',
    containerSelector: 'body'
  },
  'huggingface.co': {
    name: 'HuggingChat',
    inputSelector: 'textarea[placeholder*="message"], textarea',
    containerSelector: 'body'
  },
  'poe.com': {
    name: 'Poe',
    inputSelector: 'textarea[placeholder*="message"], textarea',
    containerSelector: 'body'
  },
  'groq.com': {
    name: 'Groq',
    inputSelector: 'textarea, #chat-input',
    containerSelector: 'body'
  },
  'phind.com': {
    name: 'Phind',
    inputSelector: 'textarea',
    containerSelector: 'body'
  }
};

// ────────────────────────────────────────────────────────────
// Initialization
// ────────────────────────────────────────────────────────────

const currentHostname = window.location.hostname;
// Single lookup for the matching domain key
const matchedDomain = Object.keys(SITE_CONFIGS).find(domain => currentHostname.includes(domain));
const activeConfig = matchedDomain ? SITE_CONFIGS[matchedDomain] : null;

let detectionAttempts = 0;
let buttonInjected = false;
// Track intervals/listeners for cleanup on SPA navigation
let positionIntervalId: ReturnType<typeof setInterval> | null = null;
let scrollHandler: (() => void) | null = null;
let resizeHandler: (() => void) | null = null;

if (activeConfig) {
  // Check settings to see if adapter is enabled
  try {
    chrome.storage.local.get(['settings'], (result) => {
      try {
        if (chrome.runtime.lastError) return;
        const settings = result.settings;
        const adapterEnabled = settings?.siteAdapters?.[matchedDomain!] ?? true;
        
        if (adapterEnabled) {
          initInjectionLoop();
        }
      } catch (_innerErr) {
        // Catch async context invalidation during callback execution
      }
    });
  } catch (_err) {
    // Catch sync context invalidation
  }
}

function initInjectionLoop() {
  const interval = setInterval(() => {
    try {
      if (typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.id) {
        clearInterval(interval);
        return;
      }
      
      const input = document.querySelector(activeConfig!.inputSelector);
      const existing = document.getElementById('skill-bridge-trigger');
      
      if (input && !existing) {
        injectTriggerButton(false);
        buttonInjected = true;
        clearInterval(interval);
      } else {
        detectionAttempts++;
        // If we cannot find the input box after 5 attempts (10 seconds), render a fixed fallback button
        if (detectionAttempts >= 5 && !buttonInjected && !existing) {
          injectTriggerButton(true);
          buttonInjected = true;
          clearInterval(interval);
          console.warn('Skill Bridge: Could not detect site prompt box. Initialized clipboard fallback widget.');
        }
      }
    } catch (_err) {
      // Clear interval if context is invalidated
      clearInterval(interval);
    }
  }, 2000);
}

// ────────────────────────────────────────────────────────────
// DOM Helpers
// ────────────────────────────────────────────────────────────

function findInputContainer(inputEl: HTMLElement): HTMLElement {
  if (activeConfig && activeConfig.containerSelector && activeConfig.containerSelector !== 'body') {
    const el = document.querySelector(activeConfig.containerSelector) as HTMLElement;
    if (el && el.contains(inputEl)) {
      if (activeConfig.name === 'Gemini' && el.classList.contains('input-area') && el.parentElement) {
        return el.parentElement;
      }
      return el;
    }
  }
  
  let curr = inputEl.parentElement;
  const best = inputEl.parentElement;
  
  while (curr && curr.tagName !== 'BODY') {
    const tagName = curr.tagName;
    if (tagName === 'FORM' || tagName === 'FIELDSET') {
      return curr;
    }
    
    const className = curr.className || '';
    if (typeof className === 'string' && (
      className.includes('input-container') || 
      className.includes('input_container') ||
      className.includes('PromptTextarea') ||
      className.includes('chat-input')
    )) {
      return curr;
    }
    
    if (curr.parentElement?.tagName === 'BODY') {
      break;
    }
    
    curr = curr.parentElement;
  }
  
  return best || inputEl;
}

/** Cleans up position-tracking listeners/intervals for the trigger button. */
function cleanupPositionTracking() {
  if (positionIntervalId !== null) {
    clearInterval(positionIntervalId);
    positionIntervalId = null;
  }
  if (scrollHandler) {
    window.removeEventListener('scroll', scrollHandler, true);
    scrollHandler = null;
  }
  if (resizeHandler) {
    window.removeEventListener('resize', resizeHandler);
    resizeHandler = null;
  }
}

// ────────────────────────────────────────────────────────────
// Trigger Button Injection
// ────────────────────────────────────────────────────────────

function injectTriggerButton(isFallback: boolean) {
  // Clean up any previous tracking before re-injecting
  cleanupPositionTracking();

  const trigger = document.createElement('div');
  trigger.id = 'skill-bridge-trigger';

  if (isFallback) {
    // Large circular floating trigger in window corner
    Object.assign(trigger.style, {
      zIndex: '9999',
      backgroundColor: '#111111',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      transition: 'background-color 0.2s, transform 0.15s',
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      width: '40px',
      height: '40px',
      borderRadius: '50%'
    });

    trigger.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 512 512" fill="white">
        ${BRAIN_SVG_PATHS}
      </svg>
    `;

    trigger.addEventListener('mouseover', () => { 
      trigger.style.backgroundColor = '#242424'; 
      trigger.style.transform = 'scale(1.05)';
    });
    trigger.addEventListener('mouseout', () => { 
      trigger.style.backgroundColor = '#111111'; 
      trigger.style.transform = 'scale(1)';
    });
  } else {
    // Premium pill badge sitting above the input container
    Object.assign(trigger.style, {
      zIndex: '9999',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '5px',
      backgroundColor: '#ffffff',
      border: '1px solid #e5e7eb',
      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
      transition: 'border-color 0.2s, box-shadow 0.2s',
      height: '22px',
      borderRadius: '11px',
      padding: '0 10px'
    });

    trigger.innerHTML = `
      <svg width="12" height="12" viewBox="0 0 512 512" fill="#111111">
        ${BRAIN_SVG_PATHS}
      </svg>
      <span style="font-size: 10px; font-weight: 600; color: #111111; font-family: Inter, system-ui, sans-serif; user-select: none;">SKILLS</span>
      <span style="width: 4px; height: 4px; border-radius: 50%; background-color: #10b981;"></span>
    `;

    trigger.addEventListener('mouseover', () => { 
      trigger.style.borderColor = '#111111';
    });
    trigger.addEventListener('mouseout', () => { 
      trigger.style.borderColor = '#e5e7eb';
    });
  }

  trigger.title = isFallback ? 'Skill Bridge: Copy Skill (Input box not found)' : 'Skill Bridge: Inject Prompt Context';
  
  if (isFallback) {
    document.body.appendChild(trigger);
  } else {
    const inputEl = document.querySelector(activeConfig!.inputSelector) as HTMLElement;
    const container = inputEl ? findInputContainer(inputEl) : null;

    // Use fixed positioning anchored to the input container's location
    Object.assign(trigger.style, {
      position: 'fixed',
      zIndex: '9999'
    });
    document.body.appendChild(trigger);

    function updateTriggerPosition() {
      const el = container || document.querySelector(activeConfig!.inputSelector) as HTMLElement;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      // Position below the input, aligned to the right edge
      trigger.style.top = `${rect.bottom + 6}px`;
      trigger.style.left = `${rect.right - trigger.offsetWidth}px`;
    }

    // Initial position
    requestAnimationFrame(updateTriggerPosition);

    // Keep position updated on scroll/resize — store references for cleanup
    scrollHandler = updateTriggerPosition;
    resizeHandler = updateTriggerPosition;
    window.addEventListener('scroll', scrollHandler, true);
    window.addEventListener('resize', resizeHandler);
    // Periodic re-check for dynamic layouts (SPA navigation, expanding textareas)
    positionIntervalId = setInterval(updateTriggerPosition, 1500);
  }

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleSkillPickerOverlay(isFallback);
  });
}

// ────────────────────────────────────────────────────────────
// Skill Picker Overlay
// ────────────────────────────────────────────────────────────

function toggleSkillPickerOverlay(isFallback: boolean) {
  const existing = document.getElementById('skill-bridge-overlay');
  if (existing) {
    existing.remove();
    return;
  }

  const overlay = document.createElement('div');
  overlay.id = 'skill-bridge-overlay';

  // Position the overlay relative to the trigger button
  const triggerBtn = document.getElementById('skill-bridge-trigger');
  let overlayBottom = '80px';
  let overlayRight = '24px';

  if (triggerBtn) {
    const rect = triggerBtn.getBoundingClientRect();
    // Place overlay above the button, aligned to its right edge
    overlayBottom = `${window.innerHeight - rect.top + 8}px`;
    overlayRight = `${window.innerWidth - rect.right}px`;
  }
  
  Object.assign(overlay.style, {
    position: 'fixed',
    bottom: overlayBottom,
    right: overlayRight,
    zIndex: '10000',
    width: '320px',
    height: '380px',
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05), 0 4px 6px -2px rgba(0,0,0,0.03)',
    display: 'flex',
    flexDirection: 'column',
    color: '#111111',
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
  });

  const header = document.createElement('div');
  Object.assign(header.style, {
    padding: '12px 14px',
    borderBottom: '1px solid #e5e7eb',
    fontSize: '12px',
    fontWeight: 'bold',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
  });
  header.innerHTML = `
    <span style="color:#111111; display: flex; align-items: center; gap: 6px; font-weight: 600; font-family: Inter, system-ui, sans-serif;">
      <svg width="12" height="12" viewBox="0 0 512 512" fill="currentColor">
        ${BRAIN_SVG_PATHS}
      </svg>
      SKILL BRIDGE
    </span>
    <span id="sb-close-overlay" style="cursor:pointer;margin-left:auto;color:#6b7280;font-size:16px;">&times;</span>
  `;
  overlay.appendChild(header);

  const searchContainer = document.createElement('div');
  searchContainer.style.padding = '8px 12px';
  const searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.placeholder = isFallback ? 'Search skills to copy...' : 'Search skills to inject...';
  Object.assign(searchInput.style, {
    width: '100%',
    height: '32px',
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '0 10px',
    color: '#111111',
    fontSize: '11px',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'Inter, system-ui, sans-serif',
    transition: 'border-color 0.2s'
  });
  searchInput.addEventListener('focus', () => {
    searchInput.style.borderColor = '#111111';
  });
  searchInput.addEventListener('blur', () => {
    searchInput.style.borderColor = '#e5e7eb';
  });

  searchContainer.appendChild(searchInput);
  overlay.appendChild(searchContainer);

  const list = document.createElement('div');
  Object.assign(list.style, {
    flex: '1',
    overflowY: 'auto',
    padding: '4px 12px 12px 12px'
  });
  overlay.appendChild(list);

  // Load skills
  try {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['cachedSkills'], (result) => {
        try {
          if (chrome.runtime.lastError) return;
          const skills = result.cachedSkills || [];
          renderSkillsList(skills, list, searchInput.value, isFallback);

          searchInput.addEventListener('input', () => {
            try {
              renderSkillsList(skills, list, searchInput.value, isFallback);
            } catch (_e) {
              // Context invalidated during filter input
            }
          });
        } catch (_innerErr) {
          // Callback context invalidated
        }
      });
    }
  } catch (_err) {
    // Catch sync context invalidation
  }

  document.body.appendChild(overlay);

  const closeBtn = header.querySelector('#sb-close-overlay');
  closeBtn?.addEventListener('click', () => overlay.remove());

  const outsideClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!overlay.contains(target) && !target.closest('#skill-bridge-trigger')) {
      overlay.remove();
      document.removeEventListener('click', outsideClick);
    }
  };
  document.addEventListener('click', outsideClick);
}

// ────────────────────────────────────────────────────────────
// Skills List Rendering
// ────────────────────────────────────────────────────────────

interface SkillData {
  name: string;
  description: string;
  content: string;
  validation: { isValid: boolean };
}

function renderSkillsList(skills: SkillData[], container: HTMLDivElement, search: string, isFallback: boolean) {
  container.innerHTML = '';
  
  const searchLower = search.toLowerCase();
  const filtered = skills.filter(s => 
    s.validation.isValid && (
      s.name.toLowerCase().includes(searchLower) ||
      s.description.toLowerCase().includes(searchLower)
    )
  );

  if (filtered.length === 0) {
    const empty = document.createElement('div');
    empty.style.textAlign = 'center';
    empty.style.padding = '32px 0';
    empty.style.fontSize = '11px';
    empty.style.color = '#6b7280';
    empty.style.fontFamily = 'Inter, system-ui, sans-serif';
    empty.textContent = 'No matching active skills.';
    container.appendChild(empty);
    return;
  }

  filtered.forEach(skill => {
    const item = document.createElement('div');
    Object.assign(item.style, {
      padding: '10px 12px',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      marginBottom: '6px',
      cursor: 'pointer',
      backgroundColor: '#f5f5f5',
      transition: 'border-color 0.2s, background-color 0.2s, box-shadow 0.2s'
    });

    // Use escaped HTML to prevent XSS from user-authored skill names/descriptions
    const escapedName = escapeHtml(skill.name);
    const escapedDesc = escapeHtml(skill.description);
    const actionLabel = isFallback ? 'COPY' : 'INJECT';

    item.innerHTML = `
      <div style="font-size:11px;font-weight:600;margin-bottom:2px;font-family:Inter, system-ui, sans-serif;display:flex;justify-content:space-between;color:#111111;">
        <span>${escapedName}</span>
        <span style="font-size:8px;color:#111111;font-weight:bold;opacity:0.8">${actionLabel}</span>
      </div>
      <div style="font-size:9.5px;color:#6b7280;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-family:Inter, system-ui, sans-serif;">${escapedDesc}</div>
    `;

    item.addEventListener('mouseover', () => {
      item.style.borderColor = '#111111';
      item.style.backgroundColor = '#ffffff';
      item.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
    });
    item.addEventListener('mouseout', () => {
      item.style.borderColor = '#e5e7eb';
      item.style.backgroundColor = '#f5f5f5';
      item.style.boxShadow = 'none';
    });

    item.addEventListener('click', () => {
      if (isFallback) {
        copyToClipboardFallback(skill);
      } else {
        injectSkillContent(skill);
      }
      document.getElementById('skill-bridge-overlay')?.remove();
    });

    container.appendChild(item);
  });
}

// ────────────────────────────────────────────────────────────
// Skill Content Injection
// ────────────────────────────────────────────────────────────

function buildFormattedPrompt(skill: SkillData): string {
  return `[AGENT SKILL DEFINITION]
Name: ${skill.name}
Description: ${skill.description}
Instructions:
${skill.content}
[END AGENT SKILL DEFINITION]

`;
}

function injectSkillContent(skill: SkillData) {
  const inputEl = document.querySelector(activeConfig!.inputSelector) as HTMLElement;
  if (!inputEl) {
    copyToClipboardFallback(skill);
    return;
  }

  const formattedPrompt = buildFormattedPrompt(skill);

  inputEl.focus();

  try {
    if (inputEl.isContentEditable) {
      // For contenteditable elements: collapse selection to end, then insert
      const selection = window.getSelection();
      if (selection) {
        selection.collapseToEnd();
      }
      document.execCommand('insertText', false, formattedPrompt);
    } else {
      // For textarea/input elements: insert at cursor position
      const textarea = inputEl as HTMLTextAreaElement;
      const start = textarea.selectionStart ?? textarea.value.length;
      const end = textarea.selectionEnd ?? textarea.value.length;
      const originalValue = textarea.value;
      
      textarea.value = originalValue.substring(0, start) + formattedPrompt + originalValue.substring(end);
      textarea.selectionStart = textarea.selectionEnd = start + formattedPrompt.length;
    }
    
    const event = new Event('input', { bubbles: true });
    inputEl.dispatchEvent(event);
    showToast(`Skill context "${skill.name}" injected successfully.`);
  } catch (err) {
    console.warn('DOM Injection failed. Falling back to clipboard.', err);
    copyToClipboardFallback(skill);
  }
}

function copyToClipboardFallback(skill: SkillData) {
  const formattedPrompt = buildFormattedPrompt(skill);

  navigator.clipboard.writeText(formattedPrompt).then(() => {
    showToast(`Copied "${skill.name}" to clipboard! Paste (Ctrl+V) into prompt box.`);
  }).catch(() => {
    showToast('Failed to copy to clipboard. View skill source in popup instead.', true);
  });
}

// ────────────────────────────────────────────────────────────
// Toast Notifications
// ────────────────────────────────────────────────────────────

function showToast(message: string, isError = false) {
  const existing = document.getElementById('skill-bridge-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'skill-bridge-toast';
  
  Object.assign(toast.style, {
    position: 'fixed',
    bottom: '24px',
    left: '24px',
    zIndex: '10001',
    padding: '10px 16px',
    backgroundColor: '#101010',
    border: `1px solid ${isError ? '#ef4444' : '#1a1a1a'}`,
    borderRadius: '8px',
    color: '#ffffff',
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: '11px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    opacity: '0',
    transform: 'translateY(10px)',
    transition: 'opacity 0.25s, transform 0.25s'
  });

  toast.textContent = message;
  document.body.appendChild(toast);

  // Trigger reflow for transition animation
  setTimeout(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  }, 50);

  // Fade out and remove
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 250);
  }, 4000);
}
