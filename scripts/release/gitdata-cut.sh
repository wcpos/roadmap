#!/usr/bin/env bash
# gitdata-cut.sh <owner/repo> <full-base-sha> <branch> <message> <local-dir> <repo-path>...
#
# Cuts a release-bump commit through the GitHub git-data API, never through a local clone.
# For every <repo-path>, <local-dir>/<basename> holds the edited file. The script:
#   1. reads the original at <full-base-sha> through the contents API,
#   2. refuses an empty local file, a local file identical to the original, or a size drift > 4 KiB
#      (a bump edits a few bytes; a changelog entry adds at most a couple of KiB),
#   3. uploads base64 blobs, builds the tree on the base tree, creates the commit and the ref,
#   4. re-reads every file at the new commit and cmp's it against the local copy.
# Prints the new commit SHA on the last line. Exits non-zero on any check.
# Why: the 1.10.30 cut admin-merged an EMPTY package.json because a local `git show` had failed
# silently (roadmap memory git-data-cut-asserts-file-size); every read here goes through the API.
set -euo pipefail

REPO="$1"; BASE="$2"; BRANCH="$3"; MSG="$4"; DIR="$5"; shift 5
PATHS=("$@")
[ "${#BASE}" -eq 40 ] || { echo "base sha must be the FULL 40-char sha (got '$BASE')" >&2; exit 2; }
[ "${#PATHS[@]}" -ge 1 ] || { echo "no repo paths given" >&2; exit 2; }

BASE_TREE=$(gh api "repos/$REPO/git/commits/$BASE" --jq .tree.sha)
echo "base $BASE tree $BASE_TREE"

TREE_JSON='['
first=1
for p in "${PATHS[@]}"; do
  local_file="$DIR/$(basename "$p")"
  [ -s "$local_file" ] || { echo "REFUSE: $local_file is empty or missing" >&2; exit 3; }
  orig="$DIR/.orig-$(basename "$p")"
  gh api "repos/$REPO/contents/$p?ref=$BASE" --jq .content | base64 -d > "$orig"
  [ -s "$orig" ] || { echo "REFUSE: could not read original $p at $BASE" >&2; exit 3; }
  if cmp -s "$orig" "$local_file"; then echo "REFUSE: $p unchanged from the original" >&2; exit 3; fi
  osz=$(wc -c < "$orig" | tr -d ' '); nsz=$(wc -c < "$local_file" | tr -d ' ')
  drift=$(( nsz - osz )); [ $drift -lt 0 ] && drift=$(( -drift ))
  [ $drift -le 4096 ] || { echo "REFUSE: $p size drift $drift B ($osz -> $nsz)" >&2; exit 3; }
  echo "  $p: $osz -> $nsz B"
  blob=$(gh api -X POST "repos/$REPO/git/blobs" -f encoding=base64 -f content="$(base64 < "$local_file" | tr -d '\n')" --jq .sha)
  [ $first -eq 1 ] || TREE_JSON+=','
  first=0
  TREE_JSON+="{\"path\":\"$p\",\"mode\":\"100644\",\"type\":\"blob\",\"sha\":\"$blob\"}"
done
TREE_JSON+=']'

NEW_TREE=$(printf '{"base_tree":"%s","tree":%s}' "$BASE_TREE" "$TREE_JSON" | gh api -X POST "repos/$REPO/git/trees" --input - --jq .sha)
NEW_COMMIT=$(printf '{"message":%s,"tree":"%s","parents":["%s"]}' "$(printf '%s' "$MSG" | jq -Rs .)" "$NEW_TREE" "$BASE" | gh api -X POST "repos/$REPO/git/commits" --input - --jq .sha)
gh api -X POST "repos/$REPO/git/refs" -f ref="refs/heads/$BRANCH" -f sha="$NEW_COMMIT" --jq .ref

for p in "${PATHS[@]}"; do
  back="$DIR/.back-$(basename "$p")"
  gh api "repos/$REPO/contents/$p?ref=$NEW_COMMIT" --jq .content | base64 -d > "$back"
  cmp "$back" "$DIR/$(basename "$p")" || { echo "MISMATCH after commit: $p" >&2; exit 4; }
  echo "  verified $p at $NEW_COMMIT ($(wc -c < "$back" | tr -d ' ') B)"
done
echo "$NEW_COMMIT"
