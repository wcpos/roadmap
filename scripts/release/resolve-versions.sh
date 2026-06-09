#!/usr/bin/env bash
set -euo pipefail

LANES_FILE="${LANES_FILE:-scripts/release/lanes.json}"
OUTPUT_FILE="${OUTPUT_FILE:-release-plan.json}"
RELEASE_ID="${RELEASE_ID:-release-$(date -u +%Y%m%d-%H%M%S)}"
VERSION_OVERRIDES_JSON="${VERSION_OVERRIDES_JSON:-}"
if [[ -z "$VERSION_OVERRIDES_JSON" ]]; then
  VERSION_OVERRIDES_JSON="{}"
fi

require() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "::error::$1 is required" >&2
    exit 1
  fi
}

strip_v() {
  printf '%s' "$1" | sed -E 's/^v//'
}

bump_patch() {
  local version
  version="$(strip_v "$1")"
  if [[ ! "$version" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    echo "::error::Cannot auto-bump non-semver patch version: $version" >&2
    exit 1
  fi
  awk -F. '{ printf "%d.%d.%d", $1, $2, $3 + 1 }' <<< "$version"
}

latest_release_or_tag() {
  local repo="$1"
  local latest=""

  latest="$(gh release list --repo "$repo" --limit 1 --json tagName --jq '.[0].tagName // empty' 2>/dev/null || true)"
  if [[ -n "$latest" ]]; then
    strip_v "$latest"
    return 0
  fi

  latest="$(gh api "repos/$repo/tags" --jq '.[0].name // empty' 2>/dev/null || true)"
  if [[ -n "$latest" ]]; then
    strip_v "$latest"
    return 0
  fi

  return 1
}

fallback_version() {
  local repo="$1"
  local file="$2"
  local type="$3"
  local contents

  contents="$(gh api "repos/$repo/contents/$file" --jq '.content' | base64 --decode)"

  case "$type" in
    package_json)
      jq -r '.version' <<< "$contents"
      ;;
    wp_plugin_header)
      grep -E '^ \* Version:|^Version:' <<< "$contents" | head -1 | sed -E 's/.*Version:[[:space:]]*//'
      ;;
    *)
      echo "::error::Unsupported fallback_type: $type" >&2
      exit 1
      ;;
  esac
}

enabled_lane_names() {
  jq -r 'keys[]' "$LANES_FILE" | while read -r lane; do
    local env_name
    env_name="ENABLE_$(tr '[:lower:]' '[:upper:]' <<< "$lane")"
    if [[ "${!env_name:-false}" == "true" ]]; then
      echo "$lane"
    fi
  done
}

add_lane_to_plan() {
  local plan_tmp="$1"
  local lane="$2"
  local repo="$3"
  local latest="$4"
  local next="$5"
  jq \
    --arg lane "$lane" \
    --arg repo "$repo" \
    --arg latest "$latest" \
    --arg next "$next" \
    '.lanes[$lane] = {repository: $repo, latest_version: $latest, next_version: $next, status: "planned"}' \
    "$plan_tmp" > "$plan_tmp.next"
  mv "$plan_tmp.next" "$plan_tmp"
}

require gh
require jq
require base64

if [[ ! -f "$LANES_FILE" ]]; then
  echo "::error::Missing lanes file: $LANES_FILE" >&2
  exit 1
fi

if ! jq empty <<< "$VERSION_OVERRIDES_JSON" >/dev/null 2>&1; then
  echo "::error::VERSION_OVERRIDES_JSON is not valid JSON" >&2
  exit 1
fi

plan_tmp="$(mktemp)"
printf '{"release_id":"%s","lanes":{}}\n' "$RELEASE_ID" > "$plan_tmp"

while read -r lane; do
  [[ -z "$lane" ]] && continue

  repo="$(jq -r --arg lane "$lane" '.[$lane].repository' "$LANES_FILE")"
  fallback_file="$(jq -r --arg lane "$lane" '.[$lane].fallback_file' "$LANES_FILE")"
  fallback_type="$(jq -r --arg lane "$lane" '.[$lane].fallback_type' "$LANES_FILE")"
  override="$(jq -r --arg lane "$lane" '.[$lane] // empty' <<< "$VERSION_OVERRIDES_JSON")"

  if [[ -n "$override" ]]; then
    latest="override"
    next="$override"
  else
    latest="$(latest_release_or_tag "$repo" || fallback_version "$repo" "$fallback_file" "$fallback_type")"
    next="$(bump_patch "$latest")"
  fi

  add_lane_to_plan "$plan_tmp" "$lane" "$repo" "$latest" "$next"
done < <(enabled_lane_names)

if [[ "$(jq '.lanes | length' "$plan_tmp")" -eq 0 ]]; then
  echo "::error::No release lanes enabled" >&2
  exit 1
fi

mv "$plan_tmp" "$OUTPUT_FILE"
jq . "$OUTPUT_FILE"
