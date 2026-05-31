# Evidence Index

## 2026-05-31 — Codex skill installation

- Artifact: `/opt/codex/skills/codex-dynamic-workflows/SKILL.md`
- Source URL: `https://github.com/DannyMac180/skills/tree/main/codex-dynamic-workflows`
- Verification commands:
  - `python /opt/codex/skills/.system/skill-installer/scripts/install-skill-from-github.py --url https://github.com/DannyMac180/skills/tree/main/codex-dynamic-workflows`
  - `find /opt/codex/skills/codex-dynamic-workflows -maxdepth 3 -type f -print | sort`
  - `sed -n '1,220p' /opt/codex/skills/codex-dynamic-workflows/SKILL.md`
- Result: Installed and locally verified; restart Codex to load it.
