import { parse as parseYaml } from 'yaml';
import { SkillFile, SkillValidationResult, SkillSource } from './types';

// Reserved terms list for safety
const RESERVED_WORDS = new Set([
  'cd', 'ls', 'cat', 'rm', 'git', 'docker', 'sudo', 'help', 'skills', 
  'agent', 'system', 'config', 'init', 'run', 'exec', 'sh', 'bash', 
  'cmd', 'powershell', 'node', 'python', 'npm', 'yarn', 'pnpm'
]);

/** Maximum recommended body length (in lines) per SKILL.md spec. */
const MAX_RECOMMENDED_BODY_LINES = 500;

/**
 * Validates a skill name according to kebab-case folder matching and reserved keywords
 */
export function validateSkillName(folderName: string, frontmatterName?: string): SkillValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Folder name must be kebab-case
  const kebabCaseRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/;
  if (!kebabCaseRegex.test(folderName)) {
    errors.push(`Folder name "${folderName}" must be kebab-case (lowercase, numbers, and dashes only).`);
  }

  if (frontmatterName) {
    // Generate ideal kebab-case representation of frontmatter name to compare
    const kebabFM = frontmatterName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    if (kebabFM !== folderName) {
      warnings.push(`Frontmatter name "${frontmatterName}" (kebab: "${kebabFM}") does not match the folder name "${folderName}". It is recommended they match exactly.`);
    }
    
    if (RESERVED_WORDS.has(frontmatterName.toLowerCase()) || RESERVED_WORDS.has(folderName.toLowerCase())) {
      errors.push(`Skill name "${frontmatterName || folderName}" uses a reserved shell command or utility keyword.`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Converts a display name to a kebab-case ID suitable for folder names.
 */
export function toKebabCase(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/**
 * Extracts tags from frontmatter. Handles both array and comma-separated string formats.
 */
function extractTags(frontmatter: Record<string, any>): string[] {
  const raw = frontmatter.tags;
  if (!raw) return [];
  
  if (Array.isArray(raw)) {
    // Filter to strings, trim, remove empties
    return raw
      .filter((t): t is string => typeof t === 'string')
      .map(t => t.trim().toLowerCase())
      .filter(t => t.length > 0);
  }
  
  if (typeof raw === 'string') {
    // Support comma-separated: "design, assets, branding"
    return raw
      .split(',')
      .map(t => t.trim().toLowerCase())
      .filter(t => t.length > 0);
  }
  
  return [];
}

/**
 * Parses raw SKILL.md text source, extracts frontmatter and body content, and validates it.
 */
export function parseSkillMarkdown(
  folderName: string, 
  rawSource: string, 
  fileSize: number, 
  lastModified: number,
  relativePath: string
): SkillFile {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  let frontmatter: Record<string, any> = {};
  let bodyContent = rawSource;

  // Split frontmatter from body
  const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/;
  const match = rawSource.match(frontmatterRegex);

  if (match) {
    const yamlString = match[1];
    bodyContent = rawSource.substring(match[0].length);



    try {
      frontmatter = parseYaml(yamlString) || {};
    } catch (e: any) {
      errors.push(`Failed to parse frontmatter YAML: ${e.message}`);
    }
  } else {
    errors.push('Missing frontmatter delimiters (--- at the top of the SKILL.md).');
  }

  // Check required fields
  if (!frontmatter.name) {
    errors.push('Frontmatter is missing the required "name" field.');
  }
  if (!frontmatter.description) {
    errors.push('Frontmatter is missing the required "description" field.');
  } else if (typeof frontmatter.description === 'string' && frontmatter.description.trim().length === 0) {
    errors.push('Frontmatter "description" field cannot be empty.');
  }

  // Body size warning
  const bodyLineCount = bodyContent.split('\n').length;
  if (bodyLineCount > MAX_RECOMMENDED_BODY_LINES) {
    warnings.push(
      `Skill body is ${bodyLineCount} lines (recommended max: ${MAX_RECOMMENDED_BODY_LINES}). ` +
      `Consider moving detailed content to a references/ subdirectory.`
    );
  }

  // Extract tags from frontmatter
  const tags = extractTags(frontmatter);

  // Validate name formats
  const nameVal = validateSkillName(folderName, frontmatter.name);
  errors.push(...nameVal.errors);
  warnings.push(...nameVal.warnings);

  return {
    id: folderName,
    name: frontmatter.name || folderName,
    description: frontmatter.description || '',
    path: relativePath,
    size: fileSize,
    lastModified,
    content: bodyContent,
    rawSource,
    frontmatter,
    files: [],
    tags: tags.length > 0 ? tags : undefined,
    source: 'local',
    validation: {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  };
}

/**
 * Parses raw SKILL.md text content and creates a SkillFile suitable for import.
 * Automatically generates a kebab-case ID from the frontmatter name.
 * Used by paste-import and URL-import flows.
 */
export function parseSkillFromRawText(
  rawSource: string,
  source: SkillSource = 'imported-text'
): SkillFile {
  // First parse with a placeholder folder name — we'll derive the real ID after
  const placeholder = '__import__';
  const parsed = parseSkillMarkdown(placeholder, rawSource, rawSource.length, Date.now(), '(imported)');
  
  // Derive the ID from the frontmatter name
  const derivedId = parsed.frontmatter.name 
    ? toKebabCase(parsed.frontmatter.name)
    : `imported-${Date.now()}`;
  
  // Re-validate with the derived ID
  const revalidated = parseSkillMarkdown(derivedId, rawSource, rawSource.length, Date.now(), '(imported)');
  
  return {
    ...revalidated,
    source,
    importedAt: Date.now()
  };
}
