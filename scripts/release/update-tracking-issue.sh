#!/usr/bin/env bash
set -euo pipefail

ISSUE_FILE="${ISSUE_FILE:-release-issue.txt}"
PLAN_FILE="${PLAN_FILE:-release-plan.json}"
ROADMAP_REPO="${ROADMAP_REPO:-wcpos/roadmap}"
MESSAGE="${1:-}"

if [[ -z "$MESSAGE" ]]; then
  echo "::error::Usage: update-tracking-issue.sh <message>" >&2
  exit 1
fi

if [[ ! -f "$ISSUE_FILE" ]]; then
  echo "::error::Missing issue file: $ISSUE_FILE" >&2
  exit 1
fi

issue_number="$(cat "$ISSUE_FILE")"
release_id="$(jq -r '.release_id' "$PLAN_FILE")"
body_file="$(mktemp)"

{
  echo "## $MESSAGE"
  echo ""
  echo "Release train: \`$release_id\`"
  echo ""
  echo "| Lane | Repository | Next version | Status |"
  echo "| --- | --- | --- | --- |"
  jq -r '.lanes | to_entries[] | "| `\(.key)` | `\(.value.repository)` | `\(.value.next_version)` | `\(.value.status)` |"' "$PLAN_FILE"
} > "$body_file"

gh issue comment "$issue_number" --repo "$ROADMAP_REPO" --body-file "$body_file"
