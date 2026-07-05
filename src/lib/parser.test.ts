import { describe, it, expect } from 'vitest';
import { parseSkillMarkdown, validateSkillName } from './parser';

describe('Skill Bridge Parser & Validator Tests', () => {
  
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
});
