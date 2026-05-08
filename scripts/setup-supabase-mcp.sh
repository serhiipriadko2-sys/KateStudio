#!/usr/bin/env bash
set -euo pipefail

PROJECT_URL="https://mcp.supabase.com/mcp?project_ref=qkaycdcbstjobacmuaro"
INSTALL_SKILLS=false
SKILLS_FLAGS=(-y -g)

while (($#)); do
  case "$1" in
    --install-skills)
      INSTALL_SKILLS=true
      shift
      ;;
    --skills-flags)
      shift
      if [ $# -eq 0 ]; then
        echo "--skills-flags requires a quoted value, e.g. --skills-flags '-y -g'" >&2
        exit 1
      fi
      # shellcheck disable=SC2206
      SKILLS_FLAGS=($1)
      shift
      ;;
    *)
      echo "Unknown argument: $1" >&2
      echo "Usage: $0 [--install-skills] [--skills-flags '-y -g']" >&2
      exit 1
      ;;
  esac
done

codex mcp add supabase --url "$PROJECT_URL"

CONFIG_DIR="$HOME/.codex"
CONFIG_FILE="$CONFIG_DIR/config.toml"
mkdir -p "$CONFIG_DIR"

if [ ! -f "$CONFIG_FILE" ]; then
  cat > "$CONFIG_FILE" <<'CFG'
[mcp]
remote_mcp_client_enabled = true
CFG
else
  tmp_file="$(mktemp)"
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
  mv "$tmp_file" "$CONFIG_FILE"
fi

codex mcp login supabase

echo "Run /mcp in Codex to verify authentication."

if [ "$INSTALL_SKILLS" = true ]; then
  npx skills add supabase/agent-skills "${SKILLS_FLAGS[@]}"
fi
