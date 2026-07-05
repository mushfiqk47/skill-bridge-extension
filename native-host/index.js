const fs = require('fs');
const path = require('path');
const os = require('os');

// Helper to resolve home directories in Windows/Mac/Linux
const homeDir = os.homedir();

// Standard I/O Accumulators
let inputBuffer = Buffer.alloc(0);

process.stdin.on('readable', () => {
  let chunk;
  while ((chunk = process.stdin.read()) !== null) {
    inputBuffer = Buffer.concat([inputBuffer, chunk]);
  }
  processMessages();
});

function processMessages() {
  while (inputBuffer.length >= 4) {
    const msgLen = inputBuffer.readUInt32LE(0);
    if (inputBuffer.length >= 4 + msgLen) {
      const msgData = inputBuffer.slice(4, 4 + msgLen);
      inputBuffer = inputBuffer.slice(4 + msgLen);
      try {
        const message = JSON.parse(msgData.toString('utf8'));
        handleMessage(message);
      } catch (err) {
        sendError('Invalid message encoding: ' + err.message);
      }
    } else {
      break; // Incomplete message, wait for next readable chunk
    }
  }
}

function sendMessage(msg) {
  const jsonStr = JSON.stringify(msg);
  const dataBuf = Buffer.from(jsonStr, 'utf8');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32LE(dataBuf.length, 0);
  process.stdout.write(Buffer.concat([lenBuf, dataBuf]));
}

function sendError(text) {
  sendMessage({ success: false, error: text });
}

function handleMessage(msg) {
  const { action, payload } = msg;

  switch (action) {
    case 'ping':
      sendMessage({ success: true, message: 'pong' });
      break;

    case 'detect_targets':
      detectTargets();
      break;

    case 'check_conflict':
      checkConflict(payload);
      break;

    case 'sync_skill':
      syncSkill(payload);
      break;

    case 'remove_skill':
      removeSkill(payload);
      break;

    default:
      sendError(`Unknown action: ${action}`);
  }
}

// 1. Detect target CLI tools on disk
function detectTargets() {
  const detectedTargets = [];

  // Claude Code
  const claudePath = path.join(homeDir, '.claude', 'skills');
  const claudeConfigExists = fs.existsSync(path.join(homeDir, '.claude'));
  detectedTargets.push({
    id: 'claude-code',
    name: 'Claude Code',
    detected: claudeConfigExists,
    defaultPath: claudePath,
    syncedSkills: getSyncedSkillsInFolder(claudePath, 'folder')
  });

  // Codex CLI
  const codexPath = path.join(homeDir, '.codex', 'skills');
  const codexConfigExists = fs.existsSync(path.join(homeDir, '.codex'));
  detectedTargets.push({
    id: 'codex-cli',
    name: 'Codex CLI',
    detected: codexConfigExists,
    defaultPath: codexPath,
    syncedSkills: getSyncedSkillsInFolder(codexPath, 'folder')
  });

  // Gemini CLI
  const geminiPath = path.join(homeDir, '.gemini', 'skills');
  const geminiConfigExists = fs.existsSync(path.join(homeDir, '.gemini'));
  detectedTargets.push({
    id: 'gemini-cli',
    name: 'Gemini CLI',
    detected: geminiConfigExists,
    defaultPath: geminiPath,
    syncedSkills: getSyncedSkillsInFolder(geminiPath, 'folder')
  });

  // Cursor rules - Detect Cursor config to check if Cursor is installed
  let cursorConfigExists = false;
  if (process.platform === 'win32') {
    cursorConfigExists = fs.existsSync(path.join(process.env.APPDATA || '', 'Cursor'));
  } else if (process.platform === 'darwin') {
    cursorConfigExists = fs.existsSync(path.join(homeDir, 'Library', 'Application Support', 'Cursor'));
  } else {
    cursorConfigExists = fs.existsSync(path.join(homeDir, '.config', 'Cursor'));
  }
  detectedTargets.push({
    id: 'cursor',
    name: 'Cursor',
    detected: cursorConfigExists,
    defaultPath: '', // Project-specific, must be configured
    syncedSkills: [] // Filled dynamically based on custom paths
  });

  sendMessage({ success: true, targets: detectedTargets });
}

function getSyncedSkillsInFolder(folderPath, type = 'folder') {
  if (!fs.existsSync(folderPath)) return [];
  try {
    const items = fs.readdirSync(folderPath);
    const skills = [];
    for (const item of items) {
      const fullPath = path.join(folderPath, item);
      const stat = fs.statSync(fullPath);
      if (type === 'folder' && stat.isDirectory()) {
        if (fs.existsSync(path.join(fullPath, 'SKILL.md'))) {
          skills.push(item);
        }
      } else if (type === 'file' && stat.isFile() && item.endsWith('.md')) {
        skills.push(path.basename(item, '.md'));
      }
    }
    return skills;
  } catch (e) {
    return [];
  }
}

// Validation utility to prevent Directory Traversal attacks
function validateInput(skillId, targetId, targetPath) {
  const kebabCaseRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/;
  if (!kebabCaseRegex.test(skillId)) {
    throw new Error(`Invalid skill ID "${skillId}". It must be strictly kebab-case.`);
  }

  if (!targetPath) {
    throw new Error('Target path is required.');
  }

  const resolvedTargetPath = path.resolve(targetPath);
  let resolvedSkillPath;

  if (targetId === 'cursor') {
    resolvedSkillPath = path.resolve(path.join(resolvedTargetPath, '.cursor', 'rules', `${skillId}.md`));
  } else {
    resolvedSkillPath = path.resolve(path.join(resolvedTargetPath, skillId));
  }

  // Traversal Check: Ensure resolvedSkillPath resides inside resolvedTargetPath
  const relative = path.relative(resolvedTargetPath, resolvedSkillPath);
  const isOutside = relative.startsWith('..') || path.isAbsolute(relative);
  
  if (isOutside) {
    throw new Error('Security Error: Directory traversal attempt blocked.');
  }

  return { resolvedTargetPath, resolvedSkillPath };
}

// 2. Check for conflicts
function checkConflict({ skillId, targetId, targetPath }) {
  let exists = false;
  let matches = false;

  try {
    const { resolvedSkillPath } = validateInput(skillId, targetId, targetPath);
    exists = fs.existsSync(resolvedSkillPath);
    sendMessage({ success: true, exists, matches });
  } catch (e) {
    sendError(`Conflict check failed: ${e.message}`);
  }
}

// 3. Write files programmatically (Sync)
function syncSkill({ skillId, targetId, targetPath, files }) {
  try {
    const { resolvedSkillPath, resolvedTargetPath } = validateInput(skillId, targetId, targetPath);

    if (targetId === 'cursor') {
      // Cursor expects single rule file at <targetPath>/.cursor/rules/<skillId>.md
      const rulesDir = path.dirname(resolvedSkillPath);
      fs.mkdirSync(rulesDir, { recursive: true });

      // Find the main SKILL.md content
      const skillFile = files.find(f => f.path.toLowerCase() === 'skill.md');
      if (!skillFile) {
        return sendError('Missing SKILL.md file in the sync payload.');
      }

      fs.writeFileSync(resolvedSkillPath, skillFile.content, 'utf8');
      sendMessage({ success: true, message: `Synced skill to Cursor rules file: ${resolvedSkillPath}` });
    } else {
      // Claude Code / Codex / Gemini CLI expect folder structure: <targetPath>/<skillId>/SKILL.md
      
      // Clean up directory first if it exists to prevent leftovers
      if (fs.existsSync(resolvedSkillPath)) {
        fs.rmSync(resolvedSkillPath, { recursive: true, force: true });
      }
      fs.mkdirSync(resolvedSkillPath, { recursive: true });

      for (const file of files) {
        // Additional file traversal check inside the skill folder
        const filePath = path.resolve(path.join(resolvedSkillPath, file.path));
        if (!filePath.startsWith(resolvedSkillPath + path.sep) && filePath !== resolvedSkillPath) {
          throw new Error(`Security Error: Traversal blocked for script file path: ${file.path}`);
        }

        const dir = path.dirname(filePath);
        fs.mkdirSync(dir, { recursive: true });

        if (file.isBinary) {
          fs.writeFileSync(filePath, Buffer.from(file.content, 'base64'));
        } else {
          fs.writeFileSync(filePath, file.content, 'utf8');
        }
      }

      sendMessage({ success: true, message: `Synced skill folder successfully to ${resolvedSkillPath}` });
    }
  } catch (e) {
    sendError(`Sync operation failed: ${e.message}`);
  }
}

// 4. Uninstall/remove synced skill
function removeSkill({ skillId, targetId, targetPath }) {
  try {
    const { resolvedSkillPath } = validateInput(skillId, targetId, targetPath);

    if (fs.existsSync(resolvedSkillPath)) {
      const stat = fs.statSync(resolvedSkillPath);
      if (stat.isDirectory()) {
        fs.rmSync(resolvedSkillPath, { recursive: true, force: true });
      } else {
        fs.unlinkSync(resolvedSkillPath);
      }
      sendMessage({ success: true, message: `Removed skill asset: ${resolvedSkillPath}` });
    } else {
      sendMessage({ success: true, message: 'Skill asset already uninstalled.' });
    }
  } catch (e) {
    sendError(`Uninstall operation failed: ${e.message}`);
  }
}

