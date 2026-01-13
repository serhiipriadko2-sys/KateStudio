import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Type definitions
interface SkillConfig {
  skill: string;
  trigger: {
    event: string;
    files?: string[];
    branches?: string[];
  };
  rules: {
    forbidden_patterns?: string[];
    severity?: 'warning' | 'error';
    [key: string]: any;
  };
  actions: Array<{ type: string; [key: string]: any }>;
}

interface Registry {
  skills: Array<{
    id: string;
    path: string;
    enabled: boolean;
  }>;
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');
const SKILLS_DIR = path.join(ROOT_DIR, 'skills');
const REGISTRY_PATH = path.join(SKILLS_DIR, 'registry.json');

// Helper to load registry
function loadRegistry(): Registry {
  if (!fs.existsSync(REGISTRY_PATH)) {
    console.error(`Registry not found at ${REGISTRY_PATH}`);
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf-8'));
}

// Simple YAML-like parser (regex-based for prototype)
function parseSkill(relativePath: string): SkillConfig | null {
  const fullPath = path.join(ROOT_DIR, relativePath);
  if (!fs.existsSync(fullPath)) {
    console.warn(`Skill file not found: ${fullPath}`);
    return null;
  }

  const content = fs.readFileSync(fullPath, 'utf-8');

  // Extract key fields using Regex
  const skillName = content.match(/skill:\s*['"](.+)['"]/)?.[1];
  if (!skillName) return null;

  // Parse forbidden patterns manually for the audit skill
  const forbiddenPatterns: string[] = [];
  const patternsMatch = content.match(/forbidden_patterns:\n((?:\s+-\s+['"].+['"]\n?)+)/);
  if (patternsMatch) {
    const lines = patternsMatch[1].split('\n');
    lines.forEach((line) => {
      const match = line.match(/['"](.+)['"]/);
      if (match) forbiddenPatterns.push(match[1]);
    });
  }

  return {
    skill: skillName,
    trigger: { event: 'prototype_run' },
    rules: { forbidden_patterns: forbiddenPatterns },
    actions: [{ type: 'scan_files' }],
  };
}

// Action: Scan Files
function executeScan(skill: SkillConfig) {
  console.log(`\n🔍 Executing Scan for skill: ${skill.skill}`);
  const patterns = skill.rules.forbidden_patterns || [];

  if (patterns.length === 0) {
    console.log('No patterns to scan.');
    return;
  }

  let foundIssues = 0;

  // Using grep to find patterns recursively
  // Excluding node_modules, dist, .git, and binary files
  // Note: splitting exclude-dir to be safe across different grep versions/shells
  const excludeDir =
    '--exclude-dir=node_modules --exclude-dir=dist --exclude-dir=.git --exclude-dir=coverage --exclude-dir=skills';
  const excludeFiles =
    '--exclude=README.md --exclude=PRODUCTION_READINESS_AUDIT_2026.md --exclude=*.json --exclude=*.lock --exclude=*.yaml';

  patterns.forEach((pattern) => {
    try {
      console.log(`   Scanning for "${pattern}"...`);
      const cmd = `grep -r "${pattern}" . ${excludeDir} ${excludeFiles} --line-number`;
      const output = execSync(cmd, {
        cwd: ROOT_DIR,
        encoding: 'utf-8',
        stdio: ['ignore', 'pipe', 'ignore'],
      });

      if (output.trim()) {
        const lines = output.trim().split('\n');
        console.log(`   ⚠️  Found ${lines.length} occurrences:`);
        // Show first 3 only
        lines
          .slice(0, 3)
          .forEach((line) => console.log(`      ${line.trim().substring(0, 80)}...`));
        if (lines.length > 3) console.log(`      (...and ${lines.length - 3} more)`);
        foundIssues += lines.length;
      }
    } catch (e) {
      // grep returns exit code 1 if not found, which throws an error in execSync
      // We ignore this as it means "0 found"
    }
  });

  if (foundIssues === 0) {
    console.log('✅ Clean. No issues found.');
  } else {
    console.log(`❌ Audit failed. Found ${foundIssues} total issues.`);
  }
}

// Main Runner
function run() {
  console.log('🚀 Jules Skill Runner v1.0 (Functional Prototype)');
  console.log('=================================================');

  const registry = loadRegistry();

  registry.skills.forEach((entry) => {
    if (!entry.enabled) return;

    if (entry.id === 'asset_audit_sentinel') {
      const skill = parseSkill(entry.path);
      if (skill) {
        executeScan(skill);
      }
    } else {
      console.log(`\n[INFO] Skill "${entry.id}" is loaded but mock execution only.`);
    }
  });

  console.log('\n=================================================');
}

run();
