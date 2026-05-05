#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const MIGRATIONS_DIR = path.join(process.cwd(), 'supabase', 'migrations');
const FILE_PATTERN = /^(\d{8}|\d{14})_([a-z0-9]+(?:_[a-z0-9]+)*)\.sql$/;

// Legacy naming kept for backward compatibility with already applied history.
const LEGACY_SHORT_TIMESTAMP_FILES = new Set(['20260205_create_contacts.sql']);

// Timestamp collisions break Supabase CLI from-scratch replay.
const KNOWN_TIMESTAMP_COLLISIONS = new Map();

const issues = [];

if (!fs.existsSync(MIGRATIONS_DIR)) {
  console.error(`[migration-integrity] Directory not found: ${MIGRATIONS_DIR}`);
  process.exit(1);
}

const files = fs
  .readdirSync(MIGRATIONS_DIR, { withFileTypes: true })
  .filter((entry) => entry.isFile() && entry.name.endsWith('.sql'))
  .map((entry) => entry.name)
  .sort();

const byTimestamp = new Map();

for (const fileName of files) {
  const match = fileName.match(FILE_PATTERN);
  if (!match) {
    issues.push(
      `Invalid migration name: ${fileName} (expected <timestamp>_<name>.sql, lowercase snake_case).`
    );
    continue;
  }

  const timestamp = match[1];
  if (timestamp.length === 8 && !LEGACY_SHORT_TIMESTAMP_FILES.has(fileName)) {
    issues.push(
      `Short timestamp is not allowed for new files: ${fileName} (use YYYYMMDDHHMMSS prefix).`
    );
  }

  const group = byTimestamp.get(timestamp) ?? [];
  group.push(fileName);
  byTimestamp.set(timestamp, group);
}

for (const [timestamp, groupedFiles] of byTimestamp.entries()) {
  if (groupedFiles.length < 2) continue;

  const known = KNOWN_TIMESTAMP_COLLISIONS.get(timestamp);
  if (!known) {
    issues.push(`Unexpected timestamp collision ${timestamp}: ${groupedFiles.join(', ')}`);
    continue;
  }

  const actual = new Set(groupedFiles);
  if (actual.size !== known.size) {
    issues.push(
      `Known collision set changed for ${timestamp}: expected ${[...known].sort().join(', ')}, actual ${groupedFiles.join(', ')}`
    );
    continue;
  }

  for (const fileName of known) {
    if (!actual.has(fileName)) {
      issues.push(`Known collision entry missing for ${timestamp}: ${fileName}`);
    }
  }
}

for (const [timestamp, knownFiles] of KNOWN_TIMESTAMP_COLLISIONS.entries()) {
  const actual = new Set(byTimestamp.get(timestamp) ?? []);
  if (actual.size === 0) {
    issues.push(`Known collision timestamp ${timestamp} no longer exists; update checker.`);
    continue;
  }
  for (const fileName of knownFiles) {
    if (!actual.has(fileName)) {
      issues.push(`Known collision baseline mismatch for ${timestamp}: missing ${fileName}`);
    }
  }
}

if (issues.length > 0) {
  console.error('[migration-integrity] FAIL');
  for (const issue of issues) {
    console.error(`- ${issue}`);
  }
  process.exit(1);
}

const collisions = [...byTimestamp.entries()].filter(([, grouped]) => grouped.length > 1);
console.log(
  `[migration-integrity] PASS (${files.length} files, ${collisions.length} known collision group(s), ${LEGACY_SHORT_TIMESTAMP_FILES.size} legacy short timestamp file(s))`
);
