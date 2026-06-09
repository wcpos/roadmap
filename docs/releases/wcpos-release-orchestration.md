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
- `monorepo`: updates app release state and submodule references in `wcpos/monorepo`.
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
