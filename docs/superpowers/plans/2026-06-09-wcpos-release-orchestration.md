# WCPOS Release Orchestration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a gated Roadmap release conductor that automatically computes next patch versions per enabled WCPOS artifact, dispatches repo-local release workflows, tracks progress in a Roadmap issue, and pauses before publish/deploy gates.

**Architecture:** The Roadmap repo owns orchestration state, version resolution, cross-repo dispatch, tracking issues, and approval gates. Each product repo exposes a small stable `workflow_dispatch` API for preparing and publishing that repo’s release; repo-specific version bumping, lockfile updates, build artifacts, release notes, and deploy details stay inside that repo.

**Tech Stack:** GitHub Actions, GitHub App token via `actions/create-github-app-token`, `gh` CLI, `jq`, Bash scripts, GitHub Environments for gated approvals, existing pnpm/composer/EAS workflows in WCPOS repos.

---

## Scope for First Version

Build **gated automation**, not full autopilot:

1. A Roadmap workflow can be manually dispatched with enabled release lanes.
2. For each enabled lane, Roadmap automatically detects the latest release/tag and bumps patch by `+1`.
3. Roadmap creates or updates a tracking issue with planned versions and live links.
4. Roadmap dispatches target repo `prepare-release.yml` workflows.
5. Roadmap stops at an environment approval gate before publish workflows.
6. Publish workflows are dispatched only after approval.
7. The plan is intentionally compatible with removing gates later.

Out of scope for the first version:

- Full release-note authorship quality automation. First version gathers generated notes and leaves final text review at the gate.
- Removing human approvals.
- Building an external dashboard.
- Supporting non-patch version strategies beyond explicit override JSON.

## Repository/Lane Map

| Lane | Repository | Prepare workflow | Publish workflow | Version source |
| --- | --- | --- | --- | --- |
| `web_bundle` | `wcpos/web-bundle` | `.github/workflows/prepare-release.yml` | `.github/workflows/publish-release.yml` | latest GitHub release/tag, fallback `package.json` |
| `electron` | `wcpos/electron` | `.github/workflows/prepare-release.yml` | `.github/workflows/publish-release.yml` | latest GitHub release/tag, fallback `package.json` |
| `monorepo` | `wcpos/monorepo` | `.github/workflows/prepare-release.yml` | `.github/workflows/publish-release.yml` | latest GitHub release/tag, fallback `apps/main/package.json`; requires app release notes |
| `mobile` | `wcpos/monorepo` | same as monorepo or existing `build.yml` | existing `build.yml` | app release version from monorepo lane |
| `free_plugin` | `wcpos/woocommerce-pos` | `.github/workflows/prepare-release.yml` | existing/new `.github/workflows/publish-release.yml` | latest GitHub release/tag, fallback plugin header |
| `pro_plugin` | `wcpos/woocommerce-pos-pro` | `.github/workflows/prepare-release.yml` | existing/new `.github/workflows/publish-release.yml` | latest GitHub release/tag, fallback plugin header |

Lane config must support phase-specific input maps because existing workflows do not all share the same dispatch contract. For example, the `mobile` publish lane calls `wcpos/monorepo` `build.yml` with `platform=all`, `profile=production`, and `submit=true`, while plugin release workflows use version-style inputs.

## File Structure

### Roadmap repo: `/Users/kilbot/Projects/roadmap`

- Create `.github/workflows/release-train.yml`
  - User-facing workflow dispatch entrypoint.
  - Generates GitHub App token.
  - Runs planning scripts.
  - Dispatches prepare workflows.
  - Waits for manual environment approval.
  - Dispatches publish workflows.
  - Updates tracking issue.

- Create `scripts/release/lanes.json`
  - Declarative lane configuration: repo, workflow names, fallback version files, dependencies.

- Create `scripts/release/resolve-versions.sh`
  - Reads enabled lanes from environment.
  - Resolves latest version per lane.
  - Applies patch bump or override.
  - Writes `release-plan.json`.

- Create `scripts/release/create-tracking-issue.sh`
  - Creates a Roadmap issue for the release train.
  - Writes issue number to `release-issue.txt`.

- Create `scripts/release/dispatch-workflow.sh`
  - Thin wrapper around `gh workflow run` that dispatches target repo workflows with consistent inputs.

- Create `scripts/release/update-tracking-issue.sh`
  - Appends status comments to the tracking issue.

- Create `docs/releases/wcpos-release-orchestration.md`
  - Operator documentation: how to run, what each gate means, failure recovery.

### Target repos

These are separate PRs after the Roadmap conductor exists.

- `wcpos/web-bundle`
  - Create `.github/workflows/prepare-release.yml`
  - Create `.github/workflows/publish-release.yml`
  - Create/update `scripts/release/bump-version.sh`

- `wcpos/electron`
  - Create `.github/workflows/prepare-release.yml`
  - Create `.github/workflows/publish-release.yml`
  - Create/update `scripts/release/bump-version.sh`

- `wcpos/monorepo`
  - Create `.github/workflows/prepare-release.yml`
  - Create `.github/workflows/publish-release.yml` if needed, otherwise wrap existing `build.yml` dispatch.
  - Update existing submodule bumping workflow if it does not include `apps/web`.

- `wcpos/woocommerce-pos`
  - Create `.github/workflows/prepare-release.yml`
  - Create `.github/workflows/publish-release.yml` or adapt existing `release.yml`/`wporg-deploy.yml` behind explicit dispatch inputs.

- `wcpos/woocommerce-pos-pro`
  - Create `.github/workflows/prepare-release.yml`
  - Create `.github/workflows/publish-release.yml` or adapt existing `release.yml` behind explicit dispatch inputs.

---

## Task 1: Add lane configuration to Roadmap

**Files:**
- Create: `scripts/release/lanes.json`

- [ ] **Step 1: Create release scripts directory**

Run:

```bash
mkdir -p scripts/release
```

Expected: command exits with status `0`.

- [ ] **Step 2: Create `scripts/release/lanes.json`**

Write:

```json
{
  "web_bundle": {
    "label": "Web Bundle",
    "repository": "wcpos/web-bundle",
    "prepare_workflow": "prepare-release.yml",
    "publish_workflow": "publish-release.yml",
    "fallback_file": "package.json",
    "fallback_type": "package_json",
    "depends_on": []
  },
  "electron": {
    "label": "Electron",
    "repository": "wcpos/electron",
    "prepare_workflow": "prepare-release.yml",
    "publish_workflow": "publish-release.yml",
    "fallback_file": "package.json",
    "fallback_type": "package_json",
    "depends_on": ["web_bundle"]
  },
  "monorepo": {
    "label": "Monorepo Submodules",
    "repository": "wcpos/monorepo",
    "prepare_workflow": "prepare-release.yml",
    "publish_workflow": "publish-release.yml",
    "fallback_file": "apps/main/package.json",
    "fallback_type": "package_json",
    "depends_on": ["web_bundle", "electron"]
  },
  "mobile": {
    "label": "Mobile App Store Build",
    "repository": "wcpos/monorepo",
    "prepare_workflow": "prepare-release.yml",
    "publish_workflow": "build.yml",
    "fallback_file": "apps/main/package.json",
    "fallback_type": "package_json",
    "depends_on": ["monorepo"],
    "publish_inputs": {
      "platform": "all",
      "profile": "production",
      "submit": "true"
    }
  },
  "free_plugin": {
    "label": "Free WordPress Plugin",
    "repository": "wcpos/woocommerce-pos",
    "prepare_workflow": "prepare-release.yml",
    "publish_workflow": "publish-release.yml",
    "fallback_file": "woocommerce-pos.php",
    "fallback_type": "wp_plugin_header",
    "depends_on": []
  },
  "pro_plugin": {
    "label": "Pro WordPress Plugin",
    "repository": "wcpos/woocommerce-pos-pro",
    "prepare_workflow": "prepare-release.yml",
    "publish_workflow": "publish-release.yml",
    "fallback_file": "woocommerce-pos-pro.php",
    "fallback_type": "wp_plugin_header",
    "depends_on": ["free_plugin"]
  }
}
```

- [ ] **Step 3: Validate JSON**

Run:

```bash
jq empty scripts/release/lanes.json
```

Expected: no output and exit status `0`.

- [ ] **Step 4: Commit lane config**

Run:

```bash
git add scripts/release/lanes.json
git commit -m "feat(release): define WCPOS release lanes"
```

Expected: commit succeeds.

---

## Task 2: Implement version resolution

**Files:**
- Create: `scripts/release/resolve-versions.sh`
- Test manually with: `bash scripts/release/resolve-versions.sh`

- [ ] **Step 1: Create resolver script**

Write `scripts/release/resolve-versions.sh`:

```bash
#!/usr/bin/env bash
set -euo pipefail

LANES_FILE="${LANES_FILE:-scripts/release/lanes.json}"
OUTPUT_FILE="${OUTPUT_FILE:-release-plan.json}"
RELEASE_ID="${RELEASE_ID:-release-$(date -u +%Y%m%d-%H%M%S)}"
VERSION_OVERRIDES_JSON="${VERSION_OVERRIDES_JSON:-{}}"

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

require gh
require jq
require base64

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

  jq \
    --arg lane "$lane" \
    --arg repo "$repo" \
    --arg latest "$latest" \
    --arg next "$next" \
    '.lanes[$lane] = {repository: $repo, latest_version: $latest, next_version: $next, status: "planned"}' \
    "$plan_tmp" > "$plan_tmp.next"
  mv "$plan_tmp.next" "$plan_tmp"
done < <(enabled_lane_names)

mv "$plan_tmp" "$OUTPUT_FILE"
jq . "$OUTPUT_FILE"
```

- [ ] **Step 2: Make resolver executable**

Run:

```bash
chmod +x scripts/release/resolve-versions.sh
```

Expected: command exits with status `0`.

- [ ] **Step 3: Run resolver in dry mode with plugin lanes only**

Run:

```bash
ENABLE_FREE_PLUGIN=true ENABLE_PRO_PLUGIN=true RELEASE_ID=test-plugin-hotfix bash scripts/release/resolve-versions.sh
```

Expected:

```text
{
  "release_id": "test-plugin-hotfix",
  "lanes": {
    "free_plugin": { ... "next_version": "<latest patch + 1>" },
    "pro_plugin": { ... "next_version": "<latest patch + 1>" }
  }
}
```

- [ ] **Step 4: Run resolver with an override**

Run:

```bash
ENABLE_WEB_BUNDLE=true VERSION_OVERRIDES_JSON='{"web_bundle":"1.9.99"}' bash scripts/release/resolve-versions.sh
jq -r '.lanes.web_bundle.next_version' release-plan.json
```

Expected:

```text
1.9.99
```

- [ ] **Step 5: Commit resolver**

Run:

```bash
git add scripts/release/resolve-versions.sh
git commit -m "feat(release): resolve next patch versions"
```

Expected: commit succeeds. Do not commit `release-plan.json`; it is generated state and Task 3 ignores it.

---

## Task 3: Add release artifact ignores

**Files:**
- Modify: `.gitignore`

- [ ] **Step 1: Check whether `.gitignore` exists**

Run:

```bash
test -f .gitignore && cat .gitignore || true
```

Expected: existing contents are displayed, or no output if no file exists.

- [ ] **Step 2: Add generated release files to `.gitignore`**

Append:

```gitignore
# Generated by release orchestration workflows
release-plan.json
release-issue.txt
```

- [ ] **Step 3: Verify ignore behavior**

Run:

```bash
git check-ignore release-plan.json release-issue.txt
```

Expected:

```text
release-plan.json
release-issue.txt
```

- [ ] **Step 4: Commit ignores**

Run:

```bash
git add .gitignore
git commit -m "chore(release): ignore generated release state"
```

Expected: commit succeeds.

---

## Task 4: Implement tracking issue creation

**Files:**
- Create: `scripts/release/create-tracking-issue.sh`

- [ ] **Step 1: Create tracking issue script**

Write `scripts/release/create-tracking-issue.sh`:

```bash
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
  echo "- [ ] Publish app stack approved"
  echo "- [ ] Publish plugin stack approved"
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
```

- [ ] **Step 2: Make script executable**

Run:

```bash
chmod +x scripts/release/create-tracking-issue.sh
```

Expected: command exits with status `0`.

- [ ] **Step 3: Test script against a temporary plan if safe**

Run only when authenticated with the GitHub App/user that can create issues in `wcpos/roadmap`:

```bash
ENABLE_FREE_PLUGIN=true RELEASE_ID=dry-run-$(date -u +%Y%m%d-%H%M%S) bash scripts/release/resolve-versions.sh
bash scripts/release/create-tracking-issue.sh
cat release-issue.txt
```

Expected: a Roadmap issue is created and the issue number is printed.

- [ ] **Step 4: Commit tracking issue script**

Run:

```bash
git add scripts/release/create-tracking-issue.sh
git commit -m "feat(release): create release tracking issues"
```

Expected: commit succeeds.

---

## Task 5: Implement workflow dispatch and run-monitoring helpers

**Files:**
- Create: `scripts/release/dispatch-workflow.sh`
- Create: `scripts/release/wait-for-workflow.sh`

- [ ] **Step 1: Create dispatch helper**

Write `scripts/release/dispatch-workflow.sh`:

```bash
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

inputs_json="$(jq -c \
  --arg lane "$LANE" \
  --arg phase "$PHASE" \
  --arg version "$version" \
  --arg release_id "$release_id" \
  --arg source_issue "${SOURCE_ISSUE:-}" \
  --arg dry_run "${DRY_RUN:-false}" '
  .[$lane][($phase + "_inputs")] // {}
  | with_entries(.value = (.value | tostring | gsub("\\$version"; $version)))
  | . + {
      release_id: $release_id,
      lane: $lane,
      release_version: $version,
      source_issue: $source_issue,
      dry_run: $dry_run
    }
' "$LANES_FILE")"

args=(workflow run "$workflow" --repo "$repo")
while IFS='=' read -r key value; do
  args+=(-f "$key=$value")
done < <(jq -r 'to_entries[] | "\(.key)=\(.value)"' <<<"$inputs_json")

"${args[@]}"
```

- [ ] **Step 2: Create workflow wait helper**

Write `scripts/release/wait-for-workflow.sh`:

```bash
#!/usr/bin/env bash
set -euo pipefail

REPO="${1:?Usage: wait-for-workflow.sh <repo> <workflow> <branch> <after-iso8601>}"
WORKFLOW="${2:?Usage: wait-for-workflow.sh <repo> <workflow> <branch> <after-iso8601>}"
BRANCH="${3:?Usage: wait-for-workflow.sh <repo> <workflow> <branch> <after-iso8601>}"
AFTER="${4:?Usage: wait-for-workflow.sh <repo> <workflow> <branch> <after-iso8601>}"

for attempt in {1..90}; do
  run_json="$(gh run list \
    --repo "$REPO" \
    --workflow "$WORKFLOW" \
    --branch "$BRANCH" \
    --created ">=$AFTER" \
    --limit 1 \
    --json databaseId,status,conclusion,url \
    --jq '.[0] // empty')"

  if [[ -n "$run_json" ]]; then
    status="$(jq -r '.status' <<<"$run_json")"
    conclusion="$(jq -r '.conclusion // ""' <<<"$run_json")"
    url="$(jq -r '.url' <<<"$run_json")"
    echo "Found $WORKFLOW run: $url status=$status conclusion=$conclusion"

    if [[ "$status" == "completed" ]]; then
      if [[ "$conclusion" == "success" ]]; then
        exit 0
      fi
      echo "::error::$WORKFLOW in $REPO completed with conclusion=$conclusion" >&2
      exit 1
    fi
  fi

  sleep 20
done

echo "::error::Timed out waiting for $WORKFLOW in $REPO after $AFTER" >&2
exit 1
```

- [ ] **Step 3: Make helpers executable**

Run:

```bash
chmod +x scripts/release/dispatch-workflow.sh scripts/release/wait-for-workflow.sh
```

Expected: command exits with status `0`.

- [ ] **Step 4: Test helper in dry-run mode after target workflows exist**

Run after at least one target repo has a matching workflow:

```bash
ENABLE_FREE_PLUGIN=true RELEASE_ID=test-dispatch bash scripts/release/resolve-versions.sh
DRY_RUN=true bash scripts/release/dispatch-workflow.sh prepare free_plugin
```

Expected: `gh workflow run` exits with `0` and a run appears in the target repository.

- [ ] **Step 5: Commit helpers**

Run:

```bash
git add scripts/release/dispatch-workflow.sh scripts/release/wait-for-workflow.sh
git commit -m "feat(release): dispatch and monitor target release workflows"
```

Expected: commit succeeds.

---

## Task 6: Implement Roadmap release train workflow

**Files:**
- Create: `.github/workflows/release-train.yml`

- [ ] **Step 1: Create release workflow**

Write `.github/workflows/release-train.yml`:

```yaml
name: WCPOS Release Train

on:
  workflow_dispatch:
    inputs:
      release_id:
        description: Optional stable release identifier
        required: false
        type: string
      web_bundle:
        description: Release web bundle
        required: false
        default: false
        type: boolean
      electron:
        description: Release Electron app
        required: false
        default: false
        type: boolean
      monorepo:
        description: Bump monorepo submodules / app release state
        required: false
        default: false
        type: boolean
      mobile:
        description: Build and submit mobile apps
        required: false
        default: false
        type: boolean
      free_plugin:
        description: Release free WordPress plugin
        required: false
        default: false
        type: boolean
      pro_plugin:
        description: Release Pro WordPress plugin
        required: false
        default: false
        type: boolean
      version_overrides_json:
        description: Optional JSON object, e.g. {"web_bundle":"1.9.9"}
        required: false
        default: '{}'
        type: string
      dry_run:
        description: Dispatch target workflows in dry-run mode
        required: false
        default: true
        type: boolean

permissions:
  contents: read
  issues: write
  actions: write

concurrency:
  group: wcpos-release-train
  cancel-in-progress: false

jobs:
  plan:
    name: Plan release train
    runs-on: ubuntu-latest
    outputs:
      release_id: ${{ steps.release-id.outputs.release_id }}
      issue_number: ${{ steps.issue.outputs.issue_number }}
    steps:
      - name: Checkout Roadmap
        uses: actions/checkout@de0fac2e4500dabe0009e67214ff5f5447ce83dd # v6.0.2

      - name: Generate GitHub App token
        id: app-token
        uses: actions/create-github-app-token@29824e69f54612133e76f7eaac726eef6c875baf # v2.2.1
        with:
          app-id: ${{ secrets.PROJECT_BOT_APP_ID }}
          private-key: ${{ secrets.PROJECT_BOT_PRIVATE_KEY }}
          owner: wcpos

      - name: Resolve release id
        id: release-id
        run: |
          set -euo pipefail
          if [ -n "${{ inputs.release_id }}" ]; then
            RELEASE_ID="${{ inputs.release_id }}"
          else
            RELEASE_ID="release-$(date -u +%Y%m%d-%H%M%S)"
          fi
          echo "release_id=$RELEASE_ID" >> "$GITHUB_OUTPUT"

      - name: Resolve next versions
        env:
          GH_TOKEN: ${{ steps.app-token.outputs.token }}
          RELEASE_ID: ${{ steps.release-id.outputs.release_id }}
          VERSION_OVERRIDES_JSON: ${{ inputs.version_overrides_json }}
          ENABLE_WEB_BUNDLE: ${{ inputs.web_bundle }}
          ENABLE_ELECTRON: ${{ inputs.electron }}
          ENABLE_MONOREPO: ${{ inputs.monorepo }}
          ENABLE_MOBILE: ${{ inputs.mobile }}
          ENABLE_FREE_PLUGIN: ${{ inputs.free_plugin }}
          ENABLE_PRO_PLUGIN: ${{ inputs.pro_plugin }}
        run: bash scripts/release/resolve-versions.sh

      - name: Create tracking issue
        id: issue
        env:
          GH_TOKEN: ${{ steps.app-token.outputs.token }}
          ROADMAP_REPO: ${{ github.repository }}
        run: |
          bash scripts/release/create-tracking-issue.sh
          echo "issue_number=$(cat release-issue.txt)" >> "$GITHUB_OUTPUT"

      - name: Upload release plan
        uses: actions/upload-artifact@bbbca2ddaa5d8feaa63e36b76fdaad77386f024f # v7.0.0
        with:
          name: release-plan
          path: |
            release-plan.json
            release-issue.txt

  prepare:
    name: Dispatch prepare workflows
    needs: plan
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Roadmap
        uses: actions/checkout@de0fac2e4500dabe0009e67214ff5f5447ce83dd # v6.0.2

      - name: Download release plan
        uses: actions/download-artifact@634f93cb2916e3fdff6788551b99b062d0335ce0 # v6.0.0
        with:
          name: release-plan

      - name: Generate GitHub App token
        id: app-token
        uses: actions/create-github-app-token@29824e69f54612133e76f7eaac726eef6c875baf # v2.2.1
        with:
          app-id: ${{ secrets.PROJECT_BOT_APP_ID }}
          private-key: ${{ secrets.PROJECT_BOT_PRIVATE_KEY }}
          owner: wcpos

      - name: Dispatch enabled prepare lanes and wait for completion
        env:
          GH_TOKEN: ${{ steps.app-token.outputs.token }}
          SOURCE_ISSUE: ${{ needs.plan.outputs.issue_number }}
          DRY_RUN: ${{ inputs.dry_run }}
        run: |
          set -euo pipefail
          dispatch_started_at="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
          jq -r '.lanes | keys[]' release-plan.json | while read -r lane; do
            bash scripts/release/dispatch-workflow.sh prepare "$lane"
          done

          jq -r '.lanes | keys[]' release-plan.json | while read -r lane; do
            repo="$(jq -r --arg lane "$lane" '.[$lane].repository' scripts/release/lanes.json)"
            workflow="$(jq -r --arg lane "$lane" '.[$lane].prepare_workflow' scripts/release/lanes.json)"
            branch="$(jq -r --arg lane "$lane" '.[$lane].prepare_branch // "main"' scripts/release/lanes.json)"
            bash scripts/release/wait-for-workflow.sh "$repo" "$workflow" "$branch" "$dispatch_started_at"
          done

          # Prepare workflows are responsible for opening/merging release PRs or
          # returning failure. The publish gate is only reachable after all
          # enabled prepare runs have completed successfully.

      - name: Upload release plan
        uses: actions/upload-artifact@bbbca2ddaa5d8feaa63e36b76fdaad77386f024f # v7.0.0
        with:
          name: release-plan-prepared
          path: |
            release-plan.json
            release-issue.txt

  approve_publish:
    name: Approve publish gate
    needs: [plan, prepare]
    runs-on: ubuntu-latest
    environment: wcpos-release-publish
    steps:
      - run: echo "Publish gate approved for release ${{ needs.plan.outputs.release_id }}"

  publish:
    name: Dispatch publish workflows
    needs: [plan, approve_publish]
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Roadmap
        uses: actions/checkout@de0fac2e4500dabe0009e67214ff5f5447ce83dd # v6.0.2

      - name: Download release plan
        uses: actions/download-artifact@634f93cb2916e3fdff6788551b99b062d0335ce0 # v6.0.0
        with:
          name: release-plan-prepared

      - name: Generate GitHub App token
        id: app-token
        uses: actions/create-github-app-token@29824e69f54612133e76f7eaac726eef6c875baf # v2.2.1
        with:
          app-id: ${{ secrets.PROJECT_BOT_APP_ID }}
          private-key: ${{ secrets.PROJECT_BOT_PRIVATE_KEY }}
          owner: wcpos

      - name: Dispatch enabled publish lanes
        env:
          GH_TOKEN: ${{ steps.app-token.outputs.token }}
          SOURCE_ISSUE: ${{ needs.plan.outputs.issue_number }}
          DRY_RUN: ${{ inputs.dry_run }}
        run: |
          set -euo pipefail
          jq -r '.lanes | keys[]' release-plan.json | while read -r lane; do
            bash scripts/release/dispatch-workflow.sh publish "$lane"
          done
```

- [ ] **Step 2: Validate workflow YAML syntax locally**

Run:

```bash
ruby -e 'require "yaml"; YAML.load_file(".github/workflows/release-train.yml"); puts "ok"'
```

Expected:

```text
ok
```

- [ ] **Step 3: Commit workflow**

Run:

```bash
git add .github/workflows/release-train.yml
git commit -m "feat(release): add release train workflow"
```

Expected: commit succeeds.

---

## Task 7: Document operator workflow

**Files:**
- Create: `docs/releases/wcpos-release-orchestration.md`
- Modify: `README.md`

- [ ] **Step 1: Create docs directory**

Run:

```bash
mkdir -p docs/releases
```

Expected: command exits with status `0`.

- [ ] **Step 2: Write operator docs**

Create `docs/releases/wcpos-release-orchestration.md`:

````markdown
# WCPOS Release Orchestration

The Roadmap repo acts as the release conductor for coordinated WCPOS releases.

## Start a release

1. Open **Actions → WCPOS Release Train** in `wcpos/roadmap`.
2. Click **Run workflow**.
3. Select only the lanes that should release.
4. Leave `version_overrides_json` as `{}` unless a lane needs an explicit version.
5. Keep `dry_run` enabled until the target workflows have been verified.

The workflow automatically detects the latest release/tag for each enabled lane and bumps the patch version by one.

## Lanes

- `web_bundle`: releases `wcpos/web-bundle`.
- `electron`: releases `wcpos/electron`; normally depends on web bundle.
- `monorepo`: updates app release state and submodule references in `wcpos/monorepo`, then creates the canonical app GitHub release with app-facing release notes.
- `mobile`: triggers EAS build/submit through `wcpos/monorepo`.
- `free_plugin`: releases `wcpos/woocommerce-pos` and prepares WordPress.org deploy.
- `pro_plugin`: releases `wcpos/woocommerce-pos-pro`; normally depends on the Free plugin release.

## Approval gates

The first version uses the `wcpos-release-publish` GitHub Environment as the publish approval gate.
Nothing is published until that environment is approved.

## Failure recovery

- If planning fails, fix lane config or GitHub App permissions and rerun.
- If prepare fails in a target repo, fix that repo and rerun the release train with the same `release_id`.
- If publish fails after approval, inspect the target repo workflow run linked from the tracking issue and rerun only the failed target workflow if safe.
- If a patch version was computed incorrectly, rerun with `version_overrides_json`.

## Version overrides

Example:

```json
{"web_bundle":"1.9.99","free_plugin":"1.10.3"}
```
````

- [ ] **Step 3: Link docs from README**

Add under README `## Links`:

```markdown
- [Release orchestration](docs/releases/wcpos-release-orchestration.md)
```

- [ ] **Step 4: Commit docs**

Run:

```bash
git add README.md docs/releases/wcpos-release-orchestration.md
git commit -m "docs(release): document orchestration workflow"
```

Expected: commit succeeds.

---

## Task 8: Add a target workflow contract to each repo

**Files per target repo:**
- Create: `.github/workflows/prepare-release.yml`
- Create: `.github/workflows/publish-release.yml`

This task is repeated per target repository. Do one repository at a time and open one PR per repository.

- [ ] **Step 1: Create a worktree for the target repo**

Example for Free plugin:

```bash
cd /Users/kilbot/Projects/woocommerce-pos
git pull origin main --ff-only
git worktree add ../woocommerce-pos-worktrees/release-orchestration -b release-orchestration
cd ../woocommerce-pos-worktrees/release-orchestration
```

Expected: new worktree is created on branch `release-orchestration`.

- [ ] **Step 2: Add `prepare-release.yml` skeleton**

Create `.github/workflows/prepare-release.yml`:

```yaml
name: Prepare Release

on:
  workflow_dispatch:
    inputs:
      release_id:
        required: true
        type: string
      lane:
        required: true
        type: string
      release_version:
        required: true
        type: string
      source_issue:
        required: false
        type: string
      dry_run:
        required: false
        default: true
        type: boolean

permissions:
  contents: write
  pull-requests: write
  issues: write

jobs:
  prepare:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@de0fac2e4500dabe0009e67214ff5f5447ce83dd # v6.0.2
        with:
          fetch-depth: 0

      - name: Report inputs
        run: |
          echo "release_id=${{ inputs.release_id }}"
          echo "lane=${{ inputs.lane }}"
          echo "release_version=${{ inputs.release_version }}"
          echo "dry_run=${{ inputs.dry_run }}"

      - name: Stop before repo-specific implementation
        if: ${{ inputs.dry_run }}
        run: echo "Dry run only; repo-specific release preparation not executed."
```

- [ ] **Step 3: Add `publish-release.yml` skeleton**

Create `.github/workflows/publish-release.yml`:

```yaml
name: Publish Release

on:
  workflow_dispatch:
    inputs:
      release_id:
        required: true
        type: string
      lane:
        required: true
        type: string
      release_version:
        required: true
        type: string
      source_issue:
        required: false
        type: string
      dry_run:
        required: false
        default: true
        type: boolean

permissions:
  contents: write
  actions: write
  issues: write

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@de0fac2e4500dabe0009e67214ff5f5447ce83dd # v6.0.2
        with:
          fetch-depth: 0

      - name: Report inputs
        run: |
          echo "release_id=${{ inputs.release_id }}"
          echo "lane=${{ inputs.lane }}"
          echo "release_version=${{ inputs.release_version }}"
          echo "dry_run=${{ inputs.dry_run }}"

      - name: Stop before repo-specific implementation
        if: ${{ inputs.dry_run }}
        run: echo "Dry run only; repo-specific publish not executed."
```

- [ ] **Step 4: Validate YAML**

Run:

```bash
ruby -e 'require "yaml"; YAML.load_file(".github/workflows/prepare-release.yml"); YAML.load_file(".github/workflows/publish-release.yml"); puts "ok"'
```

Expected:

```text
ok
```

- [ ] **Step 5: Commit and PR**

Run:

```bash
git add .github/workflows/prepare-release.yml .github/workflows/publish-release.yml
git commit -m "ci(release): add Roadmap release workflow contract"
git push -u origin release-orchestration
gh pr create --draft --title "ci(release): add Roadmap release workflow contract" --body "Adds dry-run workflow_dispatch endpoints for the Roadmap release conductor."
```

Expected: draft PR opens.

---

## Task 9: Replace target skeletons with repo-specific preparation

**Files:**
- Modify per target repo: `.github/workflows/prepare-release.yml`
- Create per target repo: `scripts/release/bump-version.sh`

Implement one repo at a time. Start with `wcpos/woocommerce-pos` because plugin releases are a frequent independent release path.

- [ ] **Step 1: Write failing smoke check for version bump script**

In target repo, create `scripts/release/test-bump-version.sh`:

```bash
#!/usr/bin/env bash
set -euo pipefail

tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
cp woocommerce-pos.php "$tmp/woocommerce-pos.php"
cp package.json "$tmp/package.json"
cp readme.txt "$tmp/readme.txt"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET_ROOT="$tmp" "$SCRIPT_DIR/bump-version.sh" "9.9.9"

grep -q 'Version: 9.9.9' "$tmp/woocommerce-pos.php"
grep -q '"version": "9.9.9"' "$tmp/package.json"
grep -q 'Stable tag: 9.9.9' "$tmp/readme.txt"

echo "ok"
```

Run:

```bash
chmod +x scripts/release/test-bump-version.sh
bash scripts/release/test-bump-version.sh
```

Expected before implementation: failure because `scripts/release/bump-version.sh` does not exist.

- [ ] **Step 2: Implement Free plugin bump script**

Create `scripts/release/bump-version.sh` in `wcpos/woocommerce-pos`:

```bash
#!/usr/bin/env bash
set -euo pipefail

version="${1:?Usage: bump-version.sh <version>}"
root="${TARGET_ROOT:-$(git rev-parse --show-toplevel)}"

php_file="$root/woocommerce-pos.php"
package_file="$root/package.json"
readme_file="$root/readme.txt"

perl -0pi -e "s/(Version:\s*)[0-9]+\.[0-9]+\.[0-9]+(?:-[A-Za-z0-9.]+)?/\${1}$version/" "$php_file"
node -e "const fs=require('fs'); const f=process.argv[1]; const p=JSON.parse(fs.readFileSync(f,'utf8')); p.version=process.argv[2]; fs.writeFileSync(f, JSON.stringify(p,null,2)+'\\n');" "$package_file" "$version"
perl -0pi -e "s/(Stable tag:\s*)[0-9]+\.[0-9]+\.[0-9]+(?:-[A-Za-z0-9.]+)?/\${1}$version/" "$readme_file"
```

Run:

```bash
chmod +x scripts/release/bump-version.sh
bash scripts/release/test-bump-version.sh
```

Expected:

```text
ok
```

- [ ] **Step 3: Wire prepare workflow to use bump script**

Modify `wcpos/woocommerce-pos/.github/workflows/prepare-release.yml` to add after checkout:

```yaml
      - name: Bump version
        if: ${{ !inputs.dry_run }}
        run: bash scripts/release/bump-version.sh "${{ inputs.release_version }}"

      - name: Update lockfile
        if: ${{ !inputs.dry_run }}
        run: pnpm install --lockfile-only --ignore-scripts

      - name: Create release branch
        if: ${{ !inputs.dry_run }}
        run: |
          set -euo pipefail
          branch="release/${{ inputs.release_version }}"
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git checkout -b "$branch"
          git add woocommerce-pos.php package.json pnpm-lock.yaml readme.txt
          git commit -m "chore(release): prepare v${{ inputs.release_version }}"
          git push origin "$branch"
```

- [ ] **Step 4: Repeat Task 9 for Pro, web-bundle, electron, and monorepo**

Use repo-specific files:

- Pro plugin: `woocommerce-pos-pro.php`, `package.json`, `pnpm-lock.yaml`.
- Web bundle: `package.json`, `pnpm-lock.yaml` if present.
- Electron: `package.json`, `pnpm-lock.yaml` if present.
- Monorepo app: `apps/main/package.json`, root `pnpm-lock.yaml`, submodule pointers.

- [ ] **Step 5: Commit each repo-specific implementation**

Run in each target repo:

```bash
git add .github/workflows/prepare-release.yml scripts/release/bump-version.sh scripts/release/test-bump-version.sh
git commit -m "feat(release): prepare version bump workflow"
```

Expected: commit succeeds.

---

## Task 10: Add publish behavior lane by lane

**Files:**
- Modify per target repo: `.github/workflows/publish-release.yml`
- Existing workflows to reference:
  - `wcpos/woocommerce-pos/.github/workflows/release.yml`
  - `wcpos/woocommerce-pos/.github/workflows/wporg-deploy.yml`
  - `wcpos/woocommerce-pos-pro/.github/workflows/release.yml`
  - `wcpos/monorepo/.github/workflows/build.yml`
  - `wcpos/monorepo/.github/workflows/deploy.yml`

- [ ] **Step 1: Implement Free plugin publish workflow**

In `wcpos/woocommerce-pos/.github/workflows/publish-release.yml`, replace dry-run-only body with:

```yaml
      - name: Publish GitHub release draft
        if: ${{ !inputs.dry_run }}
        env:
          GH_TOKEN: ${{ github.token }}
        run: |
          set -euo pipefail
          version="${{ inputs.release_version }}"
          if gh release view "v$version" >/dev/null 2>&1; then
            gh release edit "v$version" --draft=false --latest
          else
            gh release create "v$version" --title "Release v$version" --draft=false --generate-notes
          fi
```

- [ ] **Step 2: Verify WordPress.org deploy trigger**

Because `wporg-deploy.yml` runs on `release: released`, publishing the GitHub release should trigger WordPress.org deploy.

Run after a dry-run PR is merged and with a test version only if safe:

```bash
gh workflow run publish-release.yml --repo wcpos/woocommerce-pos -f release_id=test -f lane=free_plugin -f release_version=<test-version> -f dry_run=true
```

Expected: dry-run workflow completes and does not publish.

- [ ] **Step 3: Implement Pro publish workflow**

In `wcpos/woocommerce-pos-pro/.github/workflows/publish-release.yml`, publish the existing draft release, matching current Pro behavior:

```yaml
      - name: Publish Pro release
        if: ${{ !inputs.dry_run }}
        env:
          GH_TOKEN: ${{ github.token }}
        run: |
          set -euo pipefail
          version="${{ inputs.release_version }}"
          if gh release view "v$version" >/dev/null 2>&1; then
            gh release edit "v$version" --draft=false --latest
          else
            gh release create "v$version" --title "Release v$version" --draft=false --generate-notes
          fi
```

- [ ] **Step 4: Implement web-bundle publish workflow**

Use the target repo’s existing build command. In `wcpos/web-bundle/.github/workflows/publish-release.yml`, add:

```yaml
      - name: Build web bundle
        if: ${{ !inputs.dry_run }}
        run: |
          pnpm install --frozen-lockfile
          pnpm build

      - name: Create GitHub release
        if: ${{ !inputs.dry_run }}
        env:
          GH_TOKEN: ${{ github.token }}
        run: |
          version="${{ inputs.release_version }}"
          gh release create "v$version" --title "Release v$version" --draft=false --generate-notes || gh release edit "v$version" --draft=false --latest

      - name: Purge jsDelivr
        if: ${{ !inputs.dry_run }}
        run: |
          set -euo pipefail
          version="${{ inputs.release_version }}"
          curl -fsS "https://purge.jsdelivr.net/gh/wcpos/web-bundle@$version/" || true
          curl -fsS "https://purge.jsdelivr.net/gh/wcpos/web-bundle@v$version/" || true
```

- [ ] **Step 5: Implement monorepo publish workflow**

In `wcpos/monorepo/.github/workflows/publish-release.yml`, publish the canonical app GitHub release after the monorepo release PR has merged. This release is required even when Electron, mobile, Free, and Pro are also being released, because it is the source of truth for app-facing release notes.

```yaml
      - name: Create monorepo app release notes
        if: ${{ !inputs.dry_run }}
        env:
          GH_TOKEN: ${{ github.token }}
        run: |
          set -euo pipefail
          version="${{ inputs.release_version }}"
          previous="$(gh release list --limit 1 --json tagName --jq '.[0].tagName // empty')"
          notes_file="release-notes.md"
          if [[ -n "$previous" ]]; then
            gh api "repos/${{ github.repository }}/releases/generate-notes" \
              -f tag_name="v$version" \
              -f previous_tag_name="$previous" \
              --jq '.body' > "$notes_file"
          else
            printf 'Release v%s\n' "$version" > "$notes_file"
          fi

      - name: Publish monorepo app GitHub release
        if: ${{ !inputs.dry_run }}
        env:
          GH_TOKEN: ${{ github.token }}
        run: |
          set -euo pipefail
          version="${{ inputs.release_version }}"
          if gh release view "v$version" >/dev/null 2>&1; then
            gh release edit "v$version" --title "WCPOS App v$version" --notes-file release-notes.md --draft=false --latest
          else
            gh release create "v$version" --title "WCPOS App v$version" --notes-file release-notes.md --draft=false --latest
          fi
```

Gate check: the release train must verify `gh release view v${{ inputs.release_version }} --repo wcpos/monorepo` succeeds before Electron publish and mobile submit are allowed to continue.

- [ ] **Step 6: Implement Electron publish workflow**

Use Electron’s existing publish command. In `wcpos/electron/.github/workflows/publish-release.yml`, add:

```yaml
      - name: Build and publish Electron apps
        if: ${{ !inputs.dry_run }}
        env:
          GH_TOKEN: ${{ github.token }}
        run: |
          pnpm install --frozen-lockfile
          pnpm publish-app
```

- [ ] **Step 7: Implement mobile publish by dispatching existing EAS workflow**

For mobile lane, Roadmap can dispatch existing `wcpos/monorepo` `build.yml` directly with:

```bash
gh workflow run build.yml --repo wcpos/monorepo -f platform=all -f profile=production -f submit=true
```

If this works, do not add a separate mobile publish workflow.

---

## Task 11: End-to-end dry run

**Files:**
- No source changes expected unless failures reveal missing contract details.

- [ ] **Step 1: Merge Roadmap conductor PR**

Run from Roadmap worktree after validation:

```bash
git status --short
gh pr create --draft --title "feat(release): add WCPOS release conductor" --body "Adds gated release train orchestration for WCPOS releases."
```

Expected: draft PR opens.

- [ ] **Step 2: Merge dry-run target workflow PRs**

Merge the skeleton/contract workflows into each target repo before testing Roadmap dispatch.

Expected: all target repos contain dry-run `prepare-release.yml` and `publish-release.yml`.

- [ ] **Step 3: Run Roadmap workflow in dry-run mode for Free plugin only**

Use Actions UI or CLI:

```bash
gh workflow run release-train.yml \
  --repo wcpos/roadmap \
  -f free_plugin=true \
  -f dry_run=true
```

Expected:

- Roadmap tracking issue is created.
- `wcpos/woocommerce-pos` prepare workflow is dispatched.
- Roadmap waits at `wcpos-release-publish` environment.
- After approval, `wcpos/woocommerce-pos` publish workflow is dispatched in dry-run mode.
- No releases are published.

- [ ] **Step 4: Run Roadmap workflow in dry-run mode for app stack**

Run:

```bash
gh workflow run release-train.yml \
  --repo wcpos/roadmap \
  -f web_bundle=true \
  -f electron=true \
  -f monorepo=true \
  -f mobile=true \
  -f dry_run=true
```

Expected: all enabled lane workflows dispatch in dry-run mode and no releases are published.

---

## Task 12: Turn on real prepare for one lane

**Files:**
- Target repo: start with `wcpos/woocommerce-pos`

- [ ] **Step 1: Run real prepare for Free plugin only**

Run:

```bash
gh workflow run release-train.yml \
  --repo wcpos/roadmap \
  -f release_id=free-plugin-prepare-smoke \
  -f free_plugin=true \
  -f dry_run=false
```

Expected:

- Next Free plugin patch version is computed.
- Roadmap issue is created.
- Free plugin prepare workflow creates a release branch.
- Free plugin prepare workflow opens or leaves a PR for review.
- Publish does not happen until environment approval.

- [ ] **Step 2: Do not approve publish gate until release branch/PR is manually reviewed**

Check:

```bash
gh pr list --repo wcpos/woocommerce-pos --search "release" --state open
```

Expected: release PR is visible.

- [ ] **Step 3: After review, approve the environment gate**

Expected: publish workflow dispatches.

- [ ] **Step 4: Confirm release artifacts**

Run:

```bash
gh release view --repo wcpos/woocommerce-pos "v<computed-version>"
```

Expected: GitHub releases exist for every enabled release lane, including `wcpos/monorepo`. If approved for production, WordPress.org deploy workflow should also have run from the release event.

---

## Self-Review

### Spec coverage

- Active orchestration: covered by `release-train.yml` and dispatch helper.
- Per-artifact versions: covered by `lanes.json` and per-lane version resolution.
- Automatic patch bump: covered by `resolve-versions.sh`.
- Gated release: covered by `wcpos-release-publish` environment job.
- Tracking/checklist: covered by tracking issue script.
- Future full autopilot: approval gate is isolated and can be removed later.

### Placeholder scan

No `TBD`, `TODO`, or unspecified “add error handling” steps remain. Repo-specific implementation is intentionally split into target-repo tasks because each repository must own its release mechanics.

### Type/signature consistency

Workflow inputs are consistent across Roadmap dispatch and target skeletons:

- `release_id`
- `lane`
- `release_version`
- `source_issue`
- `dry_run`
