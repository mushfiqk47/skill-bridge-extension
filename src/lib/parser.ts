import { parse as parseYaml } from 'yaml';
import { SkillFile, SkillValidationResult } from './types';

// Reserved terms list for safety
const RESERVED_WORDS = new Set([
  'cd', 'ls', 'cat', 'rm', 'git', 'docker', 'sudo', 'help', 'skills', 
  'agent', 'system', 'config', 'init', 'run', 'exec', 'sh', 'bash', 
  'cmd', 'powershell', 'node', 'python', 'npm', 'yarn', 'pnpm'
]);

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

    // Validate no angle brackets in YAML string
    if (/[<>]/.test(yamlString)) {
      errors.push('Frontmatter must not contain angle brackets ("<" or ">") to prevent script tags or parsing issues.');
    }

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
    validation: {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  };
}
