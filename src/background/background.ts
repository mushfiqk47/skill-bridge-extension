// Skill Bridge Service Worker (Manifest V3 Background Script)

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const { action, payload } = message;

  // 1. Verify Host Installation (Ping)
  if (action === 'ping_host') {
    chrome.runtime.sendNativeMessage('com.skillbridge.sync', { action: 'ping' }, (response) => {
      if (chrome.runtime.lastError) {
        sendResponse({ success: false, error: chrome.runtime.lastError.message });
      } else {
        sendResponse(response || { success: false, error: 'Empty response from host' });
      }
    });
    return true; // Keeps the message channel open for async response
  }

  // 2. Relay sync and detection commands to the native helper
  if (action === 'detect_targets' || action === 'check_conflict' || action === 'sync_skill' || action === 'remove_skill') {
    chrome.runtime.sendNativeMessage('com.skillbridge.sync', { action, payload }, (response) => {
      if (chrome.runtime.lastError) {
        sendResponse({ success: false, error: chrome.runtime.lastError.message });
      } else {
        sendResponse(response || { success: false, error: 'Empty response from host' });
      }
    });
    return true;
  }

  // 3. Return Extension Metadata
  if (action === 'check_extension_id') {
    sendResponse({ success: true, id: chrome.runtime.id });
    return false;
  }

  // Default fallback
  return false;
});
