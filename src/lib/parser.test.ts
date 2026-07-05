import { describe, it, expect } from 'vitest';
import { parseSkillMarkdown, validateSkillName, parseSkillFromRawText, toKebabCase } from './parser';

describe('Skill Bridge Parser & Validator Tests', () => {
  
  // ── validateSkillName ────────────────────────────────────

  it('should validate valid kebab-case folder names', () => {
    const result = validateSkillName('git-helper', 'Git Helper');
    expect(result.isValid).toBe(true);
    expect(result.errors.length).toBe(0);
  });

  it('should reject invalid kebab-case folder names', () => {
    const result = validateSkillName('Git_Helper_Plugin', 'Git Helper');
    expect(result.isValid).toBe(false);
    expect(result.errors[0]).toContain('must be kebab-case');
  });

  it('should reject reserved shell keywords', () => {
    const result = validateSkillName('git', 'git');
    expect(result.isValid).toBe(false);
    expect(result.errors[0]).toContain('uses a reserved shell command');
  });

  // ── toKebabCase ──────────────────────────────────────────

  it('converts names to strict kebab-case', () => {
    expect(toKebabCase('My Skill Name')).toBe('my-skill-name');
    expect(toKebabCase('  --Weird_Name--  ')).toBe('weird-name');
    expect(toKebabCase('Café Skill & More!')).toBe('caf-skill-more');
  });

  // ── parseSkillMarkdown ───────────────────────────────────

  it('should parse valid frontmatter and content', () => {
    const rawSource = `---
name: test-skill
description: A parser test description
tags:
  - test
  - parser
---
# Main Content
This is the text body of the agent skill.
`;
    const parsed = parseSkillMarkdown('test-skill', rawSource, rawSource.length, 1234567, './test-skill');
    
    expect(parsed.validation.isValid).toBe(true);
    expect(parsed.name).toBe('test-skill');
    expect(parsed.description).toBe('A parser test description');
    expect(parsed.content).toContain('# Main Content');
    expect(parsed.tags).toEqual(['test', 'parser']);
  });

  it('should extract comma-separated tags', () => {
    const rawSource = `---
name: tag-test
description: Testing comma separated tags
tags: design, frontend,  UI 
---
# Body
`;
    const parsed = parseSkillMarkdown('tag-test', rawSource, rawSource.length, 0, './tag-test');
    expect(parsed.tags).toEqual(['design', 'frontend', 'ui']);
  });

  it('should report error for missing description', () => {
    const rawSource = `---
name: no-desc-skill
---
# Body Content
`;
    const parsed = parseSkillMarkdown('no-desc-skill', rawSource, rawSource.length, 1234567, './no-desc-skill');
    
    expect(parsed.validation.isValid).toBe(false);
    expect(parsed.validation.errors.some(e => e.includes('description'))).toBe(true);
  });

  // ── Edge Cases ───────────────────────────────────────────

  it('should handle empty string input', () => {
    const parsed = parseSkillMarkdown('empty', '', 0, 0, './empty');
    expect(parsed.validation.isValid).toBe(false);
    expect(parsed.name).toBe('empty'); // falls back to folder name
  });

  it('should preserve the raw source verbatim', () => {
    const rawSource = `---
name: raw-test
description: Testing raw source preservation
---
# Content Here
`;
    const parsed = parseSkillMarkdown('raw-test', rawSource, rawSource.length, 999, './raw-test');
    expect(parsed.rawSource).toBe(rawSource);
  });

  it('should warn on very long body content', () => {
    const longBody = Array(600).fill('line of text').join('\n');
    const rawSource = `---
name: long-body
description: Test body size warning
---
${longBody}
`;
    const parsed = parseSkillMarkdown('long-body', rawSource, rawSource.length, 0, './long-body');
    
    expect(parsed.validation.isValid).toBe(true);
    expect(parsed.validation.warnings.some(w => w.includes('recommended max'))).toBe(true);
  });

  // ── parseSkillFromRawText (Import Flow) ──────────────────

  it('derives folder ID from frontmatter name for imported skills', () => {
    const rawSource = `---
name: Brand Kit Pro
description: Tests dynamic ID generation
---
# Body
`;
    const parsed = parseSkillFromRawText(rawSource, 'imported-text');
    
    expect(parsed.id).toBe('brand-kit-pro');
    expect(parsed.source).toBe('imported-text');
    expect(parsed.validation.isValid).toBe(true);
  });

  it('falls back to timestamp ID if name is missing', () => {
    const rawSource = `---
description: No name frontmatter
---
# Body
`;
    const parsed = parseSkillFromRawText(rawSource);
    
    expect(parsed.id.startsWith('imported-')).toBe(true);
    expect(parsed.validation.isValid).toBe(false); // still invalid due to missing name
  });

});
