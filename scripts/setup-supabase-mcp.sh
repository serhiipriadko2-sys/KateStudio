#!/usr/bin/env bash
set -euo pipefail

PROJECT_URL="https://mcp.supabase.com/mcp?project_ref=qkaycdcbstjobacmuaro"
INSTALL_SKILLS=false
DRY_RUN=false
SKILLS_FLAGS=("-y" "-g")

log() { echo "[setup-supabase-mcp] $*"; }
warn() { echo "[setup-supabase-mcp] WARNING: $*" >&2; }
die() { echo "[setup-supabase-mcp] ERROR: $*" >&2; exit 1; }
run() {
  if [ "$DRY_RUN" = true ]; then
    log "DRY-RUN: $*"
    return 0
  fi
  "$@"
}

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || die "Required command not found: $1"
}

while (($#)); do
  case "$1" in
    --install-skills)
      INSTALL_SKILLS=true
      shift
      ;;
    --skill-flag)
      shift
      if [ $# -eq 0 ]; then
        die "--skill-flag requires a value, e.g. --skill-flag -y"
      fi
      SKILLS_FLAGS+=("$1")
      shift
      ;;
    --skills-flags)
      shift
      if [ $# -eq 0 ]; then
        die "--skills-flags requires a quoted value, e.g. --skills-flags '-y -g'"
      fi
      # Backward-compatible parser for old API. Split on spaces intentionally.
      # shellcheck disable=SC2206
      parsed_flags=($1)
      SKILLS_FLAGS=("${parsed_flags[@]}")
      warn "--skills-flags is deprecated; use repeated --skill-flag <flag>"
      shift
      ;;
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    *)
      die "Unknown argument: $1. Usage: $0 [--dry-run] [--install-skills] [--skill-flag <flag>] [--skills-flags '-y -g']"
      ;;
  esac
done

require_cmd awk
require_cmd mktemp
if [ "$DRY_RUN" = false ]; then
  require_cmd codex
fi

CONFIG_DIR="$HOME/.codex"
CONFIG_FILE="$CONFIG_DIR/config.toml"
[ -n "${HOME:-}" ] || die "HOME is not set"
run mkdir -p "$CONFIG_DIR"

run codex mcp add supabase --url "$PROJECT_URL"

if [ ! -f "$CONFIG_FILE" ]; then
  if [ "$DRY_RUN" = true ]; then
    log "DRY-RUN: create $CONFIG_FILE with [mcp].remote_mcp_client_enabled = true"
  else
    cat > "$CONFIG_FILE" <<'CFG'
[mcp]
remote_mcp_client_enabled = true
CFG
  fi
else
  tmp_file="$(mktemp)"
  python3_bin="$(command -v python3 || true)"
  if [ -n "$python3_bin" ]; then
    if [ "$DRY_RUN" = true ]; then
      log "DRY-RUN: merge $CONFIG_FILE with python3 tomllib strategy"
    else
      "$python3_bin" - "$CONFIG_FILE" "$tmp_file" <<'PY'
import pathlib
import sys
import tomllib

source = pathlib.Path(sys.argv[1])
target = pathlib.Path(sys.argv[2])
content = source.read_text(encoding="utf-8")
data = tomllib.loads(content) if content.strip() else {}

mcp = data.get("mcp")
if not isinstance(mcp, dict):
    data["mcp"] = {"remote_mcp_client_enabled": True}
else:
    mcp["remote_mcp_client_enabled"] = True

def render_table(name: str, table: dict) -> str:
    lines = [f"[{name}]"]
    for key, value in table.items():
        if isinstance(value, bool):
            rendered = "true" if value else "false"
        elif isinstance(value, (int, float)):
            rendered = str(value)
        else:
            rendered = f"\"{str(value)}\""
        lines.append(f"{key} = {rendered}")
    return "\n".join(lines)

sections = []
for key, value in data.items():
    if isinstance(value, dict):
        sections.append(render_table(key, value))
target.write_text("\n\n".join(sections).strip() + "\n", encoding="utf-8")
PY
      run mv "$tmp_file" "$CONFIG_FILE"
    fi
  else
    awk '
    BEGIN {
      in_mcp = 0
      saw_mcp = 0
      wrote_key = 0
    }
    /^\[[^]]+\][[:space:]]*$/ {
      if (in_mcp && !wrote_key) {
        print "remote_mcp_client_enabled = true"
        wrote_key = 1
      }
      if ($0 == "[mcp]") {
        in_mcp = 1
        saw_mcp = 1
      } else {
        in_mcp = 0
      }
      print
      next
    }
    {
      if (in_mcp && $0 ~ /^[[:space:]]*remote_mcp_client_enabled[[:space:]]*=/) {
        if (!wrote_key) {
          print "remote_mcp_client_enabled = true"
          wrote_key = 1
        }
        next
      }
      print
    }
    END {
      if (in_mcp && !wrote_key) {
        print "remote_mcp_client_enabled = true"
        wrote_key = 1
      }
      if (!saw_mcp) {
        print ""
        print "[mcp]"
        print "remote_mcp_client_enabled = true"
      }
    }
  ' "$CONFIG_FILE" > "$tmp_file"
    run mv "$tmp_file" "$CONFIG_FILE"
  fi
fi

run codex mcp login supabase

log "Run /mcp in Codex to verify authentication."

if [ "$INSTALL_SKILLS" = true ]; then
  if [ "$DRY_RUN" = false ]; then
    require_cmd npx
  fi
  has_yes=false
  for flag in "${SKILLS_FLAGS[@]}"; do
    if [ "$flag" = "-y" ] || [ "$flag" = "--yes" ]; then
      has_yes=true
      break
    fi
  done
  if [ "$has_yes" = false ]; then
    warn "Skills install flags do not include -y/--yes and may become interactive."
  fi
  run npx skills add supabase/agent-skills "${SKILLS_FLAGS[@]}"
fi
