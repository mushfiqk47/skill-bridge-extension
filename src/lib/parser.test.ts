import { describe, it, expect } from 'vitest';
import { parseSkillMarkdown, validateSkillName } from './parser';

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

  it('should allow single-word kebab-case names', () => {
    const result = validateSkillName('brandkit', 'Brandkit');
    expect(result.isValid).toBe(true);
  });

  it('should warn when frontmatter name kebab does not match folder name', () => {
    const result = validateSkillName('my-skill', 'Different Name');
    expect(result.isValid).toBe(true); // warnings don't invalidate
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings[0]).toContain('does not match the folder name');
  });

  it('should handle numeric-only folder names', () => {
    const result = validateSkillName('123', '123');
    expect(result.isValid).toBe(true);
  });

  it('should reject folder names with leading/trailing dashes', () => {
    const result = validateSkillName('-bad-name-', 'Bad Name');
    expect(result.isValid).toBe(false);
    expect(result.errors[0]).toContain('must be kebab-case');
  });

  it('should reject folder names with uppercase letters', () => {
    const result = validateSkillName('MySkill', 'MySkill');
    expect(result.isValid).toBe(false);
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
    expect(parsed.frontmatter.tags).toEqual(['test', 'parser']);
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

  it('should detect and fail on angle brackets in frontmatter', () => {
    const rawSource = `---
name: "<invalid-tag>"
description: Test skill with html tag
---
# Body
`;
    const parsed = parseSkillMarkdown('invalid-tag', rawSource, rawSource.length, 1234567, './invalid-tag');
    
    expect(parsed.validation.isValid).toBe(false);
    expect(parsed.validation.errors.some(e => e.includes('angle brackets'))).toBe(true);
  });

  // ── Edge Cases ───────────────────────────────────────────

  it('should handle empty string input', () => {
    const parsed = parseSkillMarkdown('empty', '', 0, 0, './empty');
    
    expect(parsed.validation.isValid).toBe(false);
    expect(parsed.validation.errors.some(e => e.includes('Missing frontmatter'))).toBe(true);
    expect(parsed.name).toBe('empty'); // falls back to folder name
    expect(parsed.description).toBe('');
  });

  it('should handle whitespace-only input', () => {
    const parsed = parseSkillMarkdown('whitespace', '   \n\n  \n', 6, 0, './whitespace');
    
    expect(parsed.validation.isValid).toBe(false);
    expect(parsed.validation.errors.some(e => e.includes('Missing frontmatter'))).toBe(true);
  });

  it('should handle frontmatter with empty description string', () => {
    const rawSource = `---
name: some-skill
description: "  "
---
# Body
`;
    const parsed = parseSkillMarkdown('some-skill', rawSource, rawSource.length, 0, './some-skill');
    
    expect(parsed.validation.isValid).toBe(false);
    expect(parsed.validation.errors.some(e => e.includes('cannot be empty'))).toBe(true);
  });

  it('should handle frontmatter with missing name field', () => {
    const rawSource = `---
description: Has description but no name
---
# Body
`;
    const parsed = parseSkillMarkdown('no-name', rawSource, rawSource.length, 0, './no-name');
    
    expect(parsed.validation.isValid).toBe(false);
    expect(parsed.validation.errors.some(e => e.includes('missing the required "name" field'))).toBe(true);
    expect(parsed.name).toBe('no-name'); // falls back to folder name
  });

  it('should handle malformed YAML gracefully', () => {
    const rawSource = `---
name: bad-yaml
description: [unclosed bracket
  - this is: {broken
---
# Body
`;
    const parsed = parseSkillMarkdown('bad-yaml', rawSource, rawSource.length, 0, './bad-yaml');
    
    expect(parsed.validation.isValid).toBe(false);
    expect(parsed.validation.errors.some(e => e.includes('Failed to parse frontmatter YAML'))).toBe(true);
  });

  it('should handle unicode characters in skill names', () => {
    const rawSource = `---
name: café-skill
description: A skill with unicode name
---
# Body
`;
    const parsed = parseSkillMarkdown('caf-skill', rawSource, rawSource.length, 0, './caf-skill');
    
    // Name validation should produce warnings about mismatch but not crash
    expect(parsed.name).toBe('café-skill');
    expect(parsed.description).toBe('A skill with unicode name');
  });

  it('should preserve the raw source verbatim', () => {
    const rawSource = `---
name: raw-test
description: Testing raw source preservation
---
# Content Here

Some **markdown** content.
`;
    const parsed = parseSkillMarkdown('raw-test', rawSource, rawSource.length, 999, './raw-test');
    
    expect(parsed.rawSource).toBe(rawSource);
    expect(parsed.content).not.toContain('---');
    expect(parsed.content).toContain('# Content Here');
  });

  it('should handle very long description content', () => {
    const longDesc = 'A'.repeat(10000);
    const rawSource = `---
name: long-desc
description: ${longDesc}
---
# Body
`;
    const parsed = parseSkillMarkdown('long-desc', rawSource, rawSource.length, 0, './long-desc');
    
    expect(parsed.validation.isValid).toBe(true);
    expect(parsed.description).toBe(longDesc);
  });

  it('should correctly set metadata fields', () => {
    const rawSource = `---
name: meta-test
description: Metadata test
---
# Body
`;
    const parsed = parseSkillMarkdown('meta-test', rawSource, 500, 1720000000, 'skills/meta-test');
    
    expect(parsed.id).toBe('meta-test');
    expect(parsed.size).toBe(500);
    expect(parsed.lastModified).toBe(1720000000);
    expect(parsed.path).toBe('skills/meta-test');
    expect(parsed.files).toEqual([]);
  });

  it('should handle frontmatter with extra unknown fields', () => {
    const rawSource = `---
name: extra-fields
description: Has extra fields
version: 2.0
author: test
custom_field: value
---
# Body
`;
    const parsed = parseSkillMarkdown('extra-fields', rawSource, rawSource.length, 0, './extra-fields');
    
    expect(parsed.validation.isValid).toBe(true);
    expect(parsed.frontmatter.version).toBe(2.0);
    expect(parsed.frontmatter.author).toBe('test');
  });
});
