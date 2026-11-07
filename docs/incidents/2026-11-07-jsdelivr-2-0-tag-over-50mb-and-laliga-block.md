# Incident: jsDelivr `@2.0` refused every file (tag over 50 MB) while LaLiga blocks hid cdn.wcpos.com (2026-11-06/07)

**Impact:** from 2026-11-06 ~22:50 UTC to 2026-11-07 18:36 UTC (about 20 hours) the jsDelivr fallback for the 2.0 web lane served HTTP 403 on every path. cdn.wcpos.com, the primary, stayed healthy, so a 2.0 web POS failed where the browser could not reach cdn.wcpos.com, and on every POS served from an insecure context (plain `http://`, no WebCrypto), because the loader sends those straight to jsDelivr without trying the primary. On Saturday 2026-11-07 that was every merchant on Telefónica/Movistar (and the other Spanish ISPs applying LaLiga's court order) during the match-day blocks, including Paul in Valencia and demo.wcpos.com for him. 2.0 is in public beta (web and desktop); 1.11 merchants were never affected, because `@1.11` stayed under the limit and 1.11 never touches cdn.wcpos.com. Desktop and native were never affected.

**Severity:** medium today, because the broken source was the fallback and the plugin is a beta. The same mechanism was one publish away from taking the `@1.11` primary over 50 MB, which would have stopped every stable web POS worldwide.

**Root causes, one sentence each:**

1. Since the 2.0 promotion both the `1.11.x` and `2.0` lanes publish onto the one web-bundle `main` branch, and the workflow's 24 h retention of the previous build's hashed files therefore stacked the other lane's 10.5 MB entries into the tree that gets tagged: `v2.0.10` was 60 MB against jsDelivr's hard 50 MB per version.
2. Cloudflare assigns cdn.wcpos.com two addresses from its shared pool (188.114.96.5 / 188.114.97.5), both on LaLiga's block list, so Spanish ISPs blackhole the primary for hours on every match day until the order lapses in June 2027.

## How the pieces fit

The 2.0 plugin's loader (`assets/js/pos-loader.js`) fetches a signed manifest from `https://cdn.wcpos.com/manifest`, with a 5 s timeout, then loads the entry from the `bundle_base` it names. On any failure it falls back to jsDelivr `@<major.minor>`: it probes `bundle.json` + `bundle.sig` (404 there means "use the legacy `metadata.json`"), and any other non-200 is `manifest_error`, the end.

jsDelivr's GitHub endpoint refuses the whole package version, every path, when the git tree at that ref exceeds 50 MB (the body says "Package size exceeded the configured limit of 50 MB"). It counts raw bytes of the whole tree, not what a browser downloads. One 2.0 build is about 21 MB raw (the eager entry alone is 10.5 MB, about 2 MB brotli on the wire).

`publish-web-bundle.yml` lays the new build over `build/` and keeps hashed `_expo/` files the new build does not carry for 24 h, because a jsDelivr edge may hold an old `metadata.json` for up to 12 h and the entry it names must still exist. That retention was sized for one lane per branch (worst case two builds, about 42 MB). On 2026-11-03 `next` was deleted and the `1.11.x` lane was left publishing to `main` as well; the workflow's own comment acknowledges "both lanes publish to this branch" and handles only the root files (workers, `metadata.json`), not the hashed ones.

## What happened

| Time (UTC) | Event |
|---|---|
| 2026-11-06 15:33 | 1.11.11 bundle published to web-bundle `main`; tag `v1.11.11`. |
| 16:52 | 2.0.9 bundle published to `main`; tag `v2.0.9` (tree 34 MB: its own build plus 1.11.11's entry). |
| 19:12 | 1.11.12 bundle published to `main` for the 1.11.11 train; tag `v1.11.12` (tree 43 MB: three entries). The run log shows "keeping … published 2 h ago" for the 2.0.9 files. |
| 22:40 | 2.0.10 bundle (monorepo `4bfff1a6`, app 2.0.0) published to `main`. The tree now holds four entries: 60 MB. The run's jsDelivr verify step saw `HTTP 403 … Package size exceeded the configured limit of 50 MB` on four paths, retried, found other edges still serving them, and printed "Verified by content: 417 hashed files". Green. |
| ~22:50 | Tag `v2.0.10` cut at that commit. No run record names it. **`@2.0` on jsDelivr now 403s on every path.** cdn.wcpos.com serves the same build fine, so nobody notices. |
| 2026-11-07 (Sat) | LaLiga match day. Telefónica blackholes 188.114.96.0/23 from inside Spain. From Paul's Movistar line: TCP 443 to both cdn.wcpos.com addresses times out, the route dies at Telefónica's third hop, neighbouring Cloudflare ranges and 1.1.1.1 connect, Cloudflare's status page shows nothing for Madrid. From the Hetzner server the manifest answers in 200 ms. |
| ~17:50 | Paul: "What is going wrong with the demo.wcpos.com/pos site!!" Console: `GET …web-bundle@2.0/build/bundle.json 403`, `Error loading POS bundle: manifest_error`, with `loadFromFallback` in the stack. |
| 18:17 | Paul's go on the recommendation. Tag `v2.0.10` deleted so `@2.0` would fall back to `v2.0.9`. |
| 18:17–18:30 | jsDelivr's data API keeps listing 2.0.10 (its GitHub tag cache is far longer than the ~90 s a new tag takes to appear). The deletion alone does not restore service. |
| 18:30 | Paul's second go. Tag `v2.0.11` created by hand at the `v2.0.9` commit `0ce8ac5f` (identical bytes, already gate-checked and served as 2.0.9; 34 MB). `tag-web-bundle.sh` cannot do this: it refuses a commit that already holds the lane's newest tag. |
| 18:36 | `@2.0/build/metadata.json` serves 200 with `x-jsd-version: 2.0.9` from the Madrid and Frankfurt edges, `index.html` reads 2.0.11, `bundle.json` gives the designed 404. Bytes of `metadata.json` and the 10.4 MB entry match the tagged blobs. No purge was needed; the 403 had not been cached. **Fallback restored.** |
| 18:45 | Proof: headless Chromium login to demo.wcpos.com/pos (demo/demo) from the blocked Movistar line. `cdn.wcpos.com/manifest` aborts on the timeout, jsDelivr serves `metadata.json`, the css, the entry and chunks, products panel rendered after 14 s, footer `v 2.0.0`. |

## Why the checks did not catch it

- **Nothing measures the tree.** Neither the publish step nor `tag-web-bundle.sh` computes the size of what it is about to publish or tag. The limit is documented by jsDelivr and absolute.
- **`cdn-verify.sh` treats a 403 like a 503.** It polls each path by content until a deadline. The size 403 is not transient, but edges that had cached the files before the tree crossed the limit kept serving them, so the poll succeeded and the run went green.
- **The October lesson cut the wrong way.** After the 1.11.4 train's false FAILs on jsDelivr 503s, the standing note reads "a FAIL means re-probe now, not 'not live'". The script's verdict cannot distinguish a transient 503 from a permanent size 403, so a human reading FAIL as noise is now the expected outcome.
- **The lane branch was never re-planned at the promotion.** Deleting `next` removed the only precedent for "a lane has its own web-bundle branch". The 1.11.x train inherited `bundle_branch=main` from the days when `main` was the 1.11 lane.
- **The fallback is only exercised when the primary fails.** No probe loads the POS through jsDelivr on purpose, and the loader's `fallback`/`fail` beacons go to cdn.wcpos.com, which during a block is the very host the browser cannot reach (they queue in localStorage and arrive later).
- **Nothing watched the `@2.0` range.** The 403 sat there for 20 hours until a human in Spain, on a match day, hit the only path that reaches it.

## What was done

- `v2.0.10` deleted; `v2.0.11` cut at the `v2.0.9` commit. `@2.0` serves 2.0.9's bytes (app 2.0.0) and cdn.wcpos.com serves 2.0.10's; the difference is the fixes merged between monorepo `1e477dc6` and `4bfff1a6`. The next `Publish Web Bundle` on `main` drops the 1.11.x files once they are over 24 h old (after 19:12 UTC on 2026-11-07) but keeps 2.0.10's entry until 22:40 UTC, so a publish between those times leaves a tree of about 42 MB and one after 22:40 UTC about 21 MB. Either way the tree size is measured before `tag-web-bundle.sh` cuts `v2.0.12`.
- Memory for every roadmap session: `jsdelivr-50mb-limit-two-lanes-on-web-bundle-main` (size the tree before tagging, trust the CDN header not the data API, probe cdn.wcpos.com from the server not from Spain).

## Prevention, proposed (Paul's ruling pending at the time of writing)

1. **One web-bundle branch per lane.** `1.11.x` publishes to a `1.11.x` branch (`bundle_branch=1.11.x`), as `next` always had its own. The workflow's gates keyed on the literal `main` become "any released lane".
2. **A size refusal in both places that move bytes.** The publish step refuses to push a tree over 45 MB; `tag-web-bundle.sh` refuses to tag one. Two lines each, and either alone would have stopped 2.0.10; 1.11.12 at 43 MB would have passed a 45 MB gate with 2 MB to spare, which is the argument for the branch split in item 1 rather than a lower number.
3. **`cdn-verify.sh` distinguishes verdicts.** A 403 whose body says "Package size exceeded" is a hard FAIL on the spot; only a 503/404-from-GitHub may be re-probed. The October note is rewritten to say which FAIL may be re-probed.
4. **A range probe.** A scheduled job fetches `@2.0/build/metadata.json`, `@1.11/build/metadata.json` and the cdn.wcpos.com manifest every 15 minutes and alerts Discord on anything but 200. A second probe from inside Spain (the Mac mini is on a Movistar line) covers the ISP blocks, which GitHub's runners cannot see.
5. **A second source off Cloudflare.** Cloudflare only sells dedicated addresses on Enterprise; the shared pool will be on LaLiga's list again. The realistic fix is a mirror of the build and a static per-lane manifest on the Hetzner box that already serves updates.wcpos.com, tried by the loader before jsDelivr. The signed descriptor plus SRI already make the bytes host-independent.
6. **Retention by count, not by clock,** and a smaller eager entry. Two 21 MB builds already sit at 42 MB; growth alone crosses 50 MB within a few releases.

## Related

- `docs/incidents/2026-10-14-rxdb-version-shipped-on-released-web-lane.md` (why the tag is cut by the script; the one hand-cut tag this incident needed is the inverse case, identical verified bytes).
- `docs/releases/2026-11-06-wcpos-1.11.11-patch-run.md` (the 1.11.12 publish in the timeline).
- `docs/releases/2026-11-01-wcpos-2.0-promotion-and-beta-plan.md` (the promotion that left `1.11.x` publishing to `main`).
- Public reporting on the blocks: Bandaancha's running list of blocked addresses names 188.114.96.5 and 188.114.97.5; Euronews, 2026-09-18, "In Spain, football matches knock thousands of websites and services offline".
