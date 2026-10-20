#!/usr/bin/env bash
# gitdata-cut.sh <owner/repo> <full-base-sha> <branch> <message> <local-dir> <repo-path>...
#
# Cuts a release-bump commit through the GitHub git-data API, never through a local clone.
# For every <repo-path>, <local-dir>/<basename> holds the edited file. The script:
#   1. refuses two repo paths that share a basename (they would both read the same local file),
#   2. reads the original at <full-base-sha> through the contents API and its mode from the base tree,
#   3. refuses an empty local file, a local file identical to the original, a local file under half
#      the original's size (a bump edits a few bytes; a failed edit leaves a stub), a size drift over
#      4 KiB (a changelog entry adds at most a couple of KiB), and a .json file that jq cannot parse,
#   4. uploads blobs with the request body on stdin (a changelog or POT file can exceed the
#      per-argument limit), builds the tree on the base tree with each file's ORIGINAL mode,
#      creates the commit and the ref,
#   5. re-reads every file at the new commit and cmp's it against the local copy, and re-reads its mode.
# Prints the new commit SHA on the last line. Exits non-zero on any check.
# Why: the 1.10.30 cut admin-merged an EMPTY package.json because a local `git show` had failed
# silently (roadmap memory git-data-cut-asserts-file-size); every read here goes through the API.
set -euo pipefail

REPO="$1"; BASE="$2"; BRANCH="$3"; MSG="$4"; DIR="$5"; shift 5
PATHS=("$@")
[ "${#BASE}" -eq 40 ] || { echo "base sha must be the FULL 40-char sha (got '$BASE')" >&2; exit 2; }
[ "${#PATHS[@]}" -ge 1 ] || { echo "no repo paths given" >&2; exit 2; }

# 1. basenames must be unique: <local-dir>/<basename> is the only local layout.
seen=""
for p in "${PATHS[@]}"; do
  b=$(basename "$p")
  case " $seen " in *" $b "*) echo "REFUSE: two repo paths share the basename '$b'" >&2; exit 2;; esac
  seen="$seen $b"
done

BASE_TREE=$(gh api "repos/$REPO/git/commits/$BASE" --jq .tree.sha)
echo "base $BASE tree $BASE_TREE"

# mode_of <commit-sha> <repo-path>: the file's mode in that commit's tree ("<sha>:<dir>" addresses a subtree;
# "<sha>:" is the root). Prints nothing when the path is not a blob there.
mode_of() {
  local d b
  d=$(dirname "$2"); b=$(basename "$2")
  [ "$d" = "." ] && d=""
  gh api "repos/$REPO/git/trees/$1:$d" --jq ".tree[] | select(.type==\"blob\" and .path==\"$b\") | .mode"
}

TREE_JSON='['
first=1
MODES=()
for p in "${PATHS[@]}"; do
  local_file="$DIR/$(basename "$p")"
  [ -s "$local_file" ] || { echo "REFUSE: $local_file is empty or missing" >&2; exit 3; }
  orig="$DIR/.orig-$(basename "$p")"
  gh api "repos/$REPO/contents/$p?ref=$BASE" --jq .content | base64 -d > "$orig"
  [ -s "$orig" ] || { echo "REFUSE: could not read original $p at $BASE" >&2; exit 3; }
  mode=$(mode_of "$BASE" "$p")
  case "$mode" in 100644|100755) ;; *) echo "REFUSE: $p has mode '$mode' in the base tree (need 100644 or 100755)" >&2; exit 3;; esac
  MODES+=("$mode")
  if cmp -s "$orig" "$local_file"; then echo "REFUSE: $p unchanged from the original" >&2; exit 3; fi
  osz=$(wc -c < "$orig" | tr -d ' '); nsz=$(wc -c < "$local_file" | tr -d ' ')
  [ $(( nsz * 2 )) -ge "$osz" ] || { echo "REFUSE: $p shrank to under half its size ($osz -> $nsz B); looks like a failed edit" >&2; exit 3; }
  drift=$(( nsz - osz )); [ $drift -lt 0 ] && drift=$(( -drift ))
  [ $drift -le 4096 ] || { echo "REFUSE: $p size drift $drift B ($osz -> $nsz)" >&2; exit 3; }
  case "$p" in *.json) jq -e . "$local_file" > /dev/null || { echo "REFUSE: $local_file is not valid JSON" >&2; exit 3; };; esac
  echo "  $p: $osz -> $nsz B, mode $mode"
  blob=$(base64 < "$local_file" | tr -d '\n' | jq -Rs '{encoding:"base64",content:.}' | gh api -X POST "repos/$REPO/git/blobs" --input - --jq .sha)
  [ $first -eq 1 ] || TREE_JSON+=','
  first=0
  TREE_JSON+="{\"path\":\"$p\",\"mode\":\"$mode\",\"type\":\"blob\",\"sha\":\"$blob\"}"
done
TREE_JSON+=']'

NEW_TREE=$(printf '{"base_tree":"%s","tree":%s}' "$BASE_TREE" "$TREE_JSON" | gh api -X POST "repos/$REPO/git/trees" --input - --jq .sha)
NEW_COMMIT=$(printf '{"message":%s,"tree":"%s","parents":["%s"]}' "$(printf '%s' "$MSG" | jq -Rs .)" "$NEW_TREE" "$BASE" | gh api -X POST "repos/$REPO/git/commits" --input - --jq .sha)
gh api -X POST "repos/$REPO/git/refs" -f ref="refs/heads/$BRANCH" -f sha="$NEW_COMMIT" --jq .ref

i=0
for p in "${PATHS[@]}"; do
  back="$DIR/.back-$(basename "$p")"
  gh api "repos/$REPO/contents/$p?ref=$NEW_COMMIT" --jq .content | base64 -d > "$back"
  cmp "$back" "$DIR/$(basename "$p")" || { echo "MISMATCH after commit: $p" >&2; exit 4; }
  back_mode=$(mode_of "$NEW_COMMIT" "$p")
  [ "$back_mode" = "${MODES[$i]}" ] || { echo "MODE MISMATCH after commit: $p is '$back_mode', wanted '${MODES[$i]}'" >&2; exit 4; }
  echo "  verified $p at $NEW_COMMIT ($(wc -c < "$back" | tr -d ' ') B, mode $back_mode)"
  i=$(( i + 1 ))
done
echo "$NEW_COMMIT"
