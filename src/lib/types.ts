export interface SkillFile {
  id: string; // Folder name (kebab-case)
  name: string; // Display name from frontmatter
  description: string; // Description from frontmatter
  path: string; // Relative path from skills root
  size: number; // Size of SKILL.md file in bytes
  lastModified: number; // Timestamp
  content: string; // Raw markdown text (excluding frontmatter)
  rawSource: string; // Full raw content (including frontmatter)
  frontmatter: Record<string, any>;
  files: { path: string; size: number }[]; // Files inside scripts/, references/, assets/
  validation: SkillValidationResult;
  isFavorite?: boolean;
  tags?: string[];
}

export interface SkillValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface SyncTarget {
  id: string; // "claude-code" | "codex-cli" | "gemini-cli" | "cursor"
  name: string;
  detected: boolean;
  defaultPath: string;
  customPath?: string;
  syncedSkills: string[]; // list of skill IDs synced here
}

export interface Settings {
  skillsFolderChosen: boolean;
  skillsFolderName?: string;
  autoRescanOnOpen: boolean;
  privacyTelemetry: boolean;
  targets: Record<string, { enabled: boolean; customPath?: string }>;
  siteAdapters: Record<string, boolean>; // e.g. "claude.ai": true, "chatgpt.com": true
}

export interface SkillPayloadFile {
  path: string;
  content: string; // text content, or base64 for binary
  isBinary: boolean;
}

export interface SkillSyncPayload {
  skillId: string;
  targetId: string;
  targetPath: string;
  files: SkillPayloadFile[];
}
