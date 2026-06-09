#!/usr/bin/env bash
set -euo pipefail

PLAN_FILE="${PLAN_FILE:-release-plan.json}"
ISSUE_FILE="${ISSUE_FILE:-release-issue.txt}"
ROADMAP_REPO="${ROADMAP_REPO:-wcpos/roadmap}"

if [[ ! -f "$PLAN_FILE" ]]; then
  echo "::error::Missing plan file: $PLAN_FILE" >&2
  exit 1
fi

release_id="$(jq -r '.release_id' "$PLAN_FILE")"
body_file="$(mktemp)"

{
  echo "# WCPOS Release Train: $release_id"
  echo ""
  echo "This issue is maintained by the Roadmap release orchestration workflow."
  echo ""
  echo "## Planned lanes"
  echo ""
  echo "| Lane | Repository | Latest | Next | Status |"
  echo "| --- | --- | --- | --- | --- |"
  jq -r '.lanes | to_entries[] | "| `\(.key)` | `\(.value.repository)` | `\(.value.latest_version)` | `\(.value.next_version)` | `\(.value.status)` |"' "$PLAN_FILE"
  echo ""
  echo "## Gates"
  echo ""
  echo "- [ ] Prepare workflows completed"
  echo "- [ ] Publish approved via the \`wcpos-release-publish\` environment"
  echo "- [ ] Publish workflows completed"
  echo "- [ ] Final verification completed"
} > "$body_file"

existing="$(gh issue list --repo "$ROADMAP_REPO" --state open --search "\"WCPOS Release Train: $release_id\" in:title" --json number --jq '.[0].number // empty')"

if [[ -n "$existing" ]]; then
  gh issue edit "$existing" --repo "$ROADMAP_REPO" --body-file "$body_file" >/dev/null
  echo "$existing" > "$ISSUE_FILE"
  echo "Updated release tracking issue #$existing"
else
  created_url="$(gh issue create --repo "$ROADMAP_REPO" --title "WCPOS Release Train: $release_id" --body-file "$body_file")"
  issue_number="${created_url##*/}"
  echo "$issue_number" > "$ISSUE_FILE"
  echo "Created release tracking issue #$issue_number"
fi
