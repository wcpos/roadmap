#!/usr/bin/env bash
set -euo pipefail

PHASE="${1:?Usage: dispatch-workflow.sh prepare|publish <lane>}"
LANE="${2:?Usage: dispatch-workflow.sh prepare|publish <lane>}"
LANES_FILE="${LANES_FILE:-scripts/release/lanes.json}"
PLAN_FILE="${PLAN_FILE:-release-plan.json}"

case "$PHASE" in
  prepare|publish) ;;
  *)
    echo "::error::Unknown phase: $PHASE" >&2
    exit 1
    ;;
esac

repo="$(jq -r --arg lane "$LANE" '.[$lane].repository' "$LANES_FILE")"
workflow_key="${PHASE}_workflow"
workflow="$(jq -r --arg lane "$LANE" --arg key "$workflow_key" '.[$lane][$key]' "$LANES_FILE")"
version="$(jq -r --arg lane "$LANE" '.lanes[$lane].next_version' "$PLAN_FILE")"
release_id="$(jq -r '.release_id' "$PLAN_FILE")"

if [[ "$repo" == "null" || "$workflow" == "null" || "$version" == "null" ]]; then
  echo "::error::Missing dispatch data for phase=$PHASE lane=$LANE" >&2
  exit 1
fi

echo "Dispatching $workflow in $repo for $LANE v$version ($PHASE)"

if [[ "${DRY_RUN:-false}" == "true" ]]; then
  echo "Dry run: not dispatching $workflow in $repo"
  exit 0
fi

if [[ "$PHASE" == "publish" && "$workflow" == "build.yml" && "$LANE" == "mobile" ]]; then
  gh workflow run "$workflow" \
    --repo "$repo" \
    -f platform="$(jq -r --arg lane "$LANE" '.[$lane].publish_inputs.platform' "$LANES_FILE")" \
    -f profile="$(jq -r --arg lane "$LANE" '.[$lane].publish_inputs.profile' "$LANES_FILE")" \
    -f submit="$(jq -r --arg lane "$LANE" '.[$lane].publish_inputs.submit' "$LANES_FILE")"
  exit 0
fi

gh workflow run "$workflow" \
  --repo "$repo" \
  -f release_id="$release_id" \
  -f lane="$LANE" \
  -f release_version="$version" \
  -f source_issue="${SOURCE_ISSUE:-}" \
  -f dry_run="${DRY_RUN:-false}"
