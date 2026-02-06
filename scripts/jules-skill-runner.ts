import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Simple types for our prototype
interface SkillConfig {
  skill: string;
  trigger: {
    event: string;
    files?: string[];
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

function loadRegistry(): Registry {
  if (!fs.existsSync(REGISTRY_PATH)) {
    console.error(`Registry not found at ${REGISTRY_PATH}`);
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf-8'));
}

function parseSkill(relativePath: string): SkillConfig | null {
  const fullPath = path.join(ROOT_DIR, relativePath);
  if (!fs.existsSync(fullPath)) {
    console.warn(`Skill file not found: ${fullPath}`);
    return null;
  }

  const content = fs.readFileSync(fullPath, 'utf-8');
  // In a real app, we'd use a YAML parser.
  // For this prototype, we'll do a very basic regex check to "validate" it.
  const nameMatch = content.match(/skill:\s*"(.+)"/);

  if (!nameMatch) return null;

  return {
    skill: nameMatch[1],
    trigger: { event: 'unknown' }, // Mock
    actions: [],
  };
}

function run() {
  console.log('🚀 Jules Skill Runner Prototype v0.1');
  console.log('====================================');

  const registry = loadRegistry();
  console.log(`Loaded ${registry.skills.length} skills from registry.`);

  registry.skills.forEach((entry) => {
    if (!entry.enabled) {
      console.log(`[SKIP] ${entry.id} is disabled.`);
      return;
    }

    console.log(`\nLoading skill: ${entry.id}...`);
    const skill = parseSkill(entry.path);

    if (skill) {
      console.log(`✅ Validated skill: ${skill.skill}`);
      console.log(`   Path: ${entry.path}`);
      // Here is where the actual logic engine would go
      // e.g., if (trigger.matches(currentEvent)) execute(actions)
    } else {
      console.error(`❌ Failed to parse skill file: ${entry.path}`);
    }
  });

  console.log('\n====================================');
  console.log('Prototype run complete.');
}

run();
