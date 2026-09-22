# How v2 gets translated once openclaw is gone

Research for wcpos/roadmap#365 (child of the v2 documentation map, #362). Date: 2026-09-22.
Scope: read-only investigation of `wcpos/docs` (workflows, scripts, git history, live workflow runs),
`wcpos/wiki` `operations/translation-pipeline*`, `wcpos-openclaw` (gateway handler, routing policy,
pipeline tools), `wcpos-infra`, the GitHub milestones on `wcpos/monorepo` and `wcpos/roadmap`, plus one
local Docusaurus build to settle the fallback question empirically. No pipeline, workflow or docs
content was modified.

**Standing correction carried throughout.** `wcpos-openclaw` is being decommissioned (Paul,
2026-09-22) and a replacement will be built later. Nothing below plans around Aide. Where existing
written material treats Aide as a live dependency it is flagged as stale, not repeated as fact.

**Naming.** "v2" here means the **product's version 2** and its `versioned_docs/version-2.x` tree —
not the REST API v2 surface that a bare "v2" usually means inside `wcpos/wiki`. Product name written
as WCPOS throughout.

## 1. Verdict

The blocker is machinery, not money. One complete translation of the 2.x tree into all 11 locales is
**12,274 translation units** (measured with the production parser), which at the pipeline's own
`BATCH_SIZE = 12` is **1,023 model calls per locale — 11,253 calls for the full set**. Priced at
published rates that is roughly **$43 (Haiku 4.5) to $215 (Opus 5) of model spend for a first pass**,
halved again by the Batch API, and about **$110–$140 all-in on Sonnet 5** once QA and repair passes are
counted. That is a rounding error against a €48/month server. What actually dies with openclaw is not
the budget, it is **4,516 lines of TypeScript** holding the MDX unit extractor, the eleven per-locale
QA profiles, the glossaries and the output normalizer — and none of it lives in `wcpos/docs`.

Three findings change the shape of the decision:

1. **A missing locale does not fail, 404, or warn — it silently serves English.** Tested. A build with
   2.x included for a locale with zero 2.x translations exits 0, emits all 283 pages, and renders
   English body text inside a Spanish theme shell. So a partial or staged translation launch is
   technically possible; the risk is the opposite of the one assumed — shipping 3,080 English pages
   under `hreflang`-tagged localized URLs with nothing anywhere saying a word.
2. **The completeness gate is structurally blind to the 2.x gap**, independently of the `AT LAUNCH:`
   exclusion. `findDroppedLocales` returns `[]` when no locale has any translation for a source, which
   is exactly the 2.x state. Removing the exclusion regex does not make the gate see the hole.
3. **`wcpos/docs` already has most of what a replacement needs.** `@anthropic-ai/sdk` is already a
   production dependency, `ANTHROPIC_API_KEY` and `OPENAI_API_KEY` are already repo secrets, and the
   repo ran a self-contained CI translator against a provider API directly until 2026-05-25. The
   precedent is in its own git history.

## 2. What the pipeline actually does today

### 2.1 Two entrypoints, one webhook, fire-and-forget

| Workflow | Trigger | Payload | File |
|---|---|---|---|
| Forward Docs Translations | `push` to `main` on doc/config paths, or `workflow_dispatch` | `{project, repo, base_ref, head_sha, changed_files}` | `.github/workflows/forward-docs-translations-to-aide.yml` |
| Sweep (self-healing) | `cron '0 3 * * *'` (03:00 UTC), or dispatch | adds `repair_targets`, `reason: "completeness-sweep"` | `.github/workflows/sweep-docs-translations.yml` |

Both do the same thing at the end (`forward-…yml:111-125`, `sweep-…yml:128-145`):

```
POST $OPENCLAW_BASE_URL/translation/webhook
Authorization: Bearer $OPENCLAW_HOOKS_TOKEN
```

`OPENCLAW_BASE_URL` is unset as a repo variable (`gh variable list -R wcpos/docs` returns empty), so
the shell default `https://openclaw.wcpos.com` applies in both files.

The response contract is asserted inline in both workflows: the run fails unless the body has
`accepted === true`, a `job_id` and a `poll_url`. Then it **exits**. It does not wait.

Server side (`wcpos-openclaw/services/model-gateway/handlers/translation-webhook.ts`, route registered
at `server.ts:1223`): bearer auth only, no HMAC; 64 KB body cap → `413`; `changed_files` validated as an
array of strings → `400` otherwise; the canonical `project` is **inferred from the file paths**, not
trusted from the payload, so any `versioned_docs/**` file forces `project: "docs"`. Success is
`202 {accepted, project, files, job_id, work_item_id, poll_url, relayed_to: "aide"}` with
`job_id = translation:<project>:<uuid>` and `poll_url = /api/tasks/<job_id>`; `503
{"error":"translation_flow_disabled"}` when the flow wiring is down. Traefik rate-limits the route to
**10 req/min per IP, burst 5** (`docker-compose.yml:211-214`).

### 2.2 `wait-for-openclaw-task.js` is dead code, and deliberately so

The ticket describes this script as blocking CI on the returned task. It does not — **no workflow
invokes it.** Its only importer is `scripts/__tests__/detect-doc-translation-changes.test.js`, and a
guard test actively forbids its return:

```
.github/scripts/test-forward-docs-translations-to-aide.sh:11-14
  if grep -Fq 'wait-for-openclaw-task.js' "$WORKFLOW_FILE"; then
    echo "Docs forwarding workflow must not poll Aide tasks; docs translations are long-running AI work." >&2
```

The script itself still carries the polling contract it would use if it were wired: `GET <poll_url>`
with a bearer `TRANSLATION_STATUS_TOKEN`, 10 s interval, **20-minute** default timeout, terminal states
`completed` / `failed` / `relay_failed` (`scripts/wait-for-openclaw-task.js:6-11`). That 20 minutes is
the only wall-clock figure the docs repo commits to, and it is a ceiling that was never enforced.

**Consequence for the decision:** nothing in `wcpos/docs` CI blocks on openclaw. When the service goes
away, the two forwarding workflows will fail their `Require OpenClaw secrets` / `curl` steps on push
and nightly, and **nothing else breaks**. There is no CI gate to unpick.

### 2.3 What opens the PR

Not the docs repo. `commitTranslations` in
`wcpos-openclaw/agents/aide/workspace/tools/translation-tools/commit-translations.ts` pushes through
the GitHub REST contents/git API using a **GitHub App installation token** (app `2860316`, installation
`109975729`, key bind-mounted at `/data/openclaw/github-app/private-key.pem`), onto a dated rolling
branch `aide/docs-translations-YYYY-MM-DD`
(`translate-docs-pipeline.ts:127-129`), one PR per branch reused while open, title
`feat(aide): update docs translations`. Both forwarding workflows check for an open
`aide/docs-translations-*` PR first and skip dispatch entirely if one exists.

Docs `main` has no branch protection, so the rolling PR is **merged by a human**, not auto-merged.

### 2.4 What gates CI (and what survives openclaw)

| Gate | Workflow | Blocking? | Needs openclaw? |
|---|---|---|---|
| Translation completeness | `check-translations.yml` → `check-translation-completeness.js --changed` | **Yes** | No — API-free source comparison |
| Translation safety | same workflow → `check-translation-safety.js` | **Yes** | No |
| Frontmatter quoting | same workflow → `validate-frontmatter.js --check --changed` | **Yes** | No |
| Full 12-locale build | `build.yml` | Red check, **not a required status check** | No |
| Backlog audit | `translation-audit-report.yml` (Mondays 06:00 UTC) | Never — always exits 0 | No |

Every gate is deterministic and model-free. **All five survive the decommission unchanged.** This is
the single most reusable asset in the current design: whatever replaces the translator inherits a
working, independent correctness harness on day one.

The completeness gate's five failure conditions (`check-translation-completeness.js`): untranslated
JSX text-prop values (any occurrence, props `alt|title|description|label|question|summary|placeholder`);
stub/truncated files (`< 0.35` of source length, `< 0.25` for `zh-CN|ja|ko`, only when source ≥ 600
chars); English prose (≥ 3 byte-identical lines); dropped locales; stale drift (net heading-anchor
deficit ≥ 1). The `--audit-json` mode adds a three-tier repair queue — 0 looks-broken, 1 not-translated,
2 stale drift — which orders the sweep's worst-first batch.

### 2.5 Incremental scope and the `AT LAUNCH:` markers

Three markers gate 2.x, in three different files:

| File:line | Marker |
|---|---|
| `docusaurus.config.js:304` | `// AT LAUNCH: add '2.x' to this array and set lastVersion to '2.x'.` |
| `scripts/check-translation-completeness.js:65-66` | `// AT LAUNCH: drop version-2\.x …` / `AUDIT_EXCLUDE_DEFAULT = 'version-0\.4\.x|version-2\.x'` |
| `scripts/detect-doc-translation-changes.js:9-11` | `// AT LAUNCH: delete this constant and the guard below so 2.x translates.` |

Note the comment in `detect-doc-translation-changes.js` says **265 pages**; the tree now holds 280.
The marker is already stale on its own number.

## 3. What model did the translating, and what a page cost

### 3.1 The wiki is stale on the model

`wiki/operations/translation-pipeline/model-routing-and-translator-guidance.md` (last_updated
2026-08-05) states docs translation is **Opus-first** with Codex fallbacks, `quality_floor: 0.95`. The
live policy says otherwise —
`wcpos-openclaw/services/model-gateway/runtimes/routing-policy.json:131-137`:

```json
"translate_docs": {
  "_description": "GPT-5.6 Terra for Aide docs translation tasks...",
  "quality_floor": 0.95,
  "prefer_billing": "subscription",
  "models": ["openai/gpt-5.6-terra"],
  "fallback_models": ["openai/gpt-5.6-luna"]
}
```

**No Claude model translates docs today.** Primary `openai/gpt-5.6-terra`, fallback
`openai/gpt-5.6-luna`, intent `aide.translation.docs` at `reasoning_effort: "medium"`
(`routing-policy.json:190`). Both carry `billing_strategy: "openai_pro"`
(`shared/model-registry.json:104-125`), i.e. they execute through the subscription runtime, **not
per-token API billing** — which is why no bill exists to look at.

Anyone reading the wiki page for this decision will get the wrong model. Flagged, not fixed (this
investigation is read-only).

### 3.2 There is no cost or timing measurement. Anywhere.

Searched code, config, READMEs, `plans/`, `.claude/plans/`, `.claude/research/`, tests and telemetry
across `wcpos-openclaw`, `wcpos-infra` and `wcpos/docs`. **No tokens-per-page figure, no
seconds-per-page figure, no run duration, no stored bill.** `usage-recorder.ts` forwards
`TokenCounts`/`CostInputs` per call to a dashboard ingest endpoint, so the data was produced — it just
lives in a dashboard on the box, not in any repo.

What does exist:

- **Rate card** (`shared/model-registry.json`): terra $2.50 / $0.25 cached / $15.00 per M in/cached/out;
  luna $1.00 / $0.10 / $6.00.
- **One anecdote, from the stale Opus era** (`wiki/.../docs-translation-pipeline.md`): "Opus translation
  batches running 10–100 s each (a single 162-unit file took ~11 minutes)". Predates the Terra routing.
- **One credit-exhaustion incident, from an even older era**
  (`wcpos-openclaw/.claude/plans/2026-05-25-docs-translation-self-healing.md:3-5`): "docs translations
  stopped because OpenRouter ran out of credits (fleet-wide 402, ~1 week)". Predates both the Terra
  routing and the subscription billing.

### 3.3 So I measured the work instead

Run against `versioned_docs/version-2.x` with the production extractor
(`wcpos-openclaw/.../docs-translation/mdx-units.ts`, `parseDocsMdxUnits`):

| Metric | version-2.x | version-1.x |
|---|---:|---:|
| English source pages | **280** | 267 |
| Translation units | **12,274** | 12,058 |
| Translatable characters | **833,916** | — |
| Total file characters | 1,047,051 | 1,023,867 |
| Units per page (avg / median / max) | 43.8 / 34 / 353 | 45.2 / 36 / 353 |
| Batches per locale @ `BATCH_SIZE = 12` | **1,023** | 1,005 |

Unit types in 2.x: 8,394 paragraph, 2,138 heading, 968 `jsx_attr`, 767 frontmatter, 7 link.
Translatable text is ~80% of the corpus; the rest is code blocks, imports and MDX syntax that never
reaches the model.

Translations per locale, all 11, for 2.x: **zero**. For 1.x: 264–266 of 267 — effectively complete
everywhere. 280 × 11 = **3,080 locale-pages** to produce.

Per-locale output expansion, measured on the 1.x corpus (characters, `wc -m`, vs the English source):

| | es | fr | de | nl | it | pt-BR | ar | hi-IN | ja | ko | zh-CN |
|---|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|
| ratio | 1.255 | 1.280 | 1.273 | 1.205 | 1.248 | 1.214 | 1.018 | 1.117 | 0.730 | 0.728 | 0.590 |

Sum across all 11 = **11.658×** the English character count.

### 3.4 Derived token and cost model

Conversions below are **stated ratios, not measurements** — no tokenizer and no API credential was
available in this session, so these are order-of-magnitude figures with roughly ±30% error, not a quote.

Per model call the fixed prompt is `buildDocsContext` (4,139 chars) + per-locale guidance (≤ 1,715
chars, German is largest) + instruction tail + a `response_schema` naming all 12 unit ids ≈ **~1,850
tokens**, and it repeats on every one of the 1,023 calls per locale.

- Input ≈ 1,023 × 1,850 + 208K source ≈ **2.1M tokens per locale → ~23M for all 11**
- Output ≈ **~4.0M tokens** across all 11 (Latin locales ~1.78M, CJK/ar/hi ~2.20M)

One complete first pass, no QA or repair:

| Option | Rate in / out per M | First pass | With Batch API (−50%) | All-in ×1.4 (QA + repair) |
|---|---|---:|---:|---:|
| `claude-haiku-4-5` | $1 / $5 | $43 | $22 | ~$60 |
| `claude-sonnet-5` | $2 / $10 | $86 | $43 | **~$120** |
| `openai/gpt-5.6-terra` (list) | $2.50 / $15 | $118 | n/a | ~$165 |
| `claude-opus-5` | $5 / $25 | $215 | $108 | ~$300 |
| Google Cloud Translation LLM | $10 / $10 **per M characters** | ~$189 | n/a | n/a |

**The single most important number in this document: one full v2 translation of all 11 locales costs
on the order of $100, and under $350 in the worst case.** Money is not the constraint.

Wall clock is the real constraint. At the anecdotal ~30 s per 12-unit batch, one locale is 1,023 × 30 s
≈ **8.5 hours sequential**. The current pipeline's `DOCS_TRANSLATE_CONCURRENCY` defaults to **3** and
caps at **8** (`translate-docs-pipeline.ts:1085-1091`), so a full 11-locale pass in today's shape is
roughly **31 hours** at the default and ~12 hours at the cap. That is why the 2.x backlog was never
going to be drained by the nightly sweep: at `batch_size` 12 files per night, 280 pages is a **23-night**
run even before per-locale work, and the sweep skips entirely whenever a rolling PR is open.

Note for any CI-hosted replacement: **a GitHub Actions job is capped at 6 hours.** 8.5 h per locale
exceeds it, so a naive one-job-per-locale matrix still times out. Batches within a locale are
independent, so intra-locale concurrency of ~10 brings a locale to ~50 minutes and an 11-way matrix to
about an hour of wall clock. Any design that does not parallelise *inside* a locale does not fit in CI.

## 4. Decommission timeline vs launch — both dates are absent

### 4.1 The decommission

A **ruling** exists. A plan, a date and a successor design do not.

- The ruling lives only as prose in `wcpos/roadmap#362` (created 2026-09-22) and is restated in #365.
- No ADR, plan file, runbook, teardown script or tracking issue in `wcpos-openclaw`, `wcpos-infra` or
  `wcpos/wiki`. `git log --all --grep=` for decommission/sunset/retire/shutdown/successor across all
  three returns nothing about retiring the platform; the newest `wcpos-openclaw` commits are still
  ordinary feature work.
- **No sunset date of any kind.** No milestone, no "before X" constraint.
- Successor explicitly deferred — #362, Out of scope: *"Designing Aide's replacement … the successor is
  a separate effort."*

What else goes with it, from `wcpos-infra/ARCHITECTURE.md` and the wiki: the PR review/fix pipeline,
Drucker board-ops, the public `/support` answerer, wiki ingest and `/wiki-sync`, plus the JS and PHP
string pipelines that share the same `/translation/webhook` ingress. Host watchdog and backup alerting
use openclaw only as a **fallback** behind Discord, so they degrade cleanly. The stack is 9 services on
the shared Hetzner AX41 (~€48–53/month for the whole box, not for openclaw), reserving roughly **36 GB
of the box's 64 GB RAM**.

### 4.2 The launch

Just as soft:

| Milestone | Due | Open / closed |
|---|---|---|
| `wcpos/monorepo` **v1.11.0** | 2026-07-31 | **16 / 17** — 53 days past due |
| `wcpos/roadmap` **v1.11.0** | 2026-09-14 | **22 / 33** — 8 days past due |
| `wcpos/monorepo` **v2.0.0** | **no due date** | 2 / 0 |

The 2.x docs tree itself is 10 days old: cut 2026-09-12 (`docs: cut version 2.x, excluded from the
build until launch`), 11 commits total, last touched 2026-09-17. It is still actively being written.

**Neither timeline constrains the other, because neither exists.** The honest characterisation is that
there is no evidence openclaw will outlive the launch, and no evidence it won't. Planning on the
overlap is planning on nothing. What *is* certain is the ordering constraint: the 2.x tree is still
being written, so translating it is downstream of content freeze either way — and translating a moving
target is the thing the `AT LAUNCH:` guard was put there to prevent
(`detect-doc-translation-changes.js:4-9`: *"every later edit before launch would re-translate them"*).

## 5. Replacement options

Four sketches. Common to all: the five CI gates in §2.4 survive untouched, and the port surface is the
same set of files.

**What must be ported or rebuilt, wherever it runs** (`wcpos-openclaw/agents/aide/workspace/tools/`):

| File | Lines | What it holds |
|---|---:|---|
| `docs-translation/translate-docs-pipeline.ts` | 1,625 | orchestration, context builder, glossaries, QA loop, commit |
| `docs-translation/docs-qa.ts` | 1,203 | `DOCS_LOCALE_PROFILES` — 11 locale guidance blocks, `forbiddenVisibleText`, `forbiddenStylePatterns` |
| `docs-translation/mdx-units.ts` | 712 | unit extraction and `applyDocsMdxTranslations` |
| `translation-tools/commit-translations.ts` | 624 | rolling branch, PR reuse, no-op short-circuit |
| `docs-translation/translate-docs-batch.ts` | 304 | 12-unit batching, JSON schema, retry/salvage |
| **Total** | **4,516** | plus `services/translation-tools/docs-translate-pipeline.test.ts`, 2,251 lines |

A CI-native runner does not need all of it. `job_id` threading, the `/translation/completion` and
`/translation/started` callbacks, the ClawFlow state machine and the GitHub App token minting all exist
to serve the gateway, and GitHub Actions supplies `GITHUB_TOKEN` for free. Realistic lift is
**~2,600–2,800 lines** — `mdx-units.ts` and `docs-qa.ts` essentially verbatim, `translate-docs-batch.ts`
with the gateway call swapped for a provider SDK call, and the translate/QA/commit spine of the
pipeline.

### (a) The successor system

**Nothing is documented.** No design, no repo, no ticket beyond #365 itself. Treating this as an option
means betting the launch on an unscoped, undated system whose owner has explicitly put it out of scope
for this map. It is listed for completeness, not as a candidate.

### (b) Direct provider call from GitHub Actions, no intermediary

This is the option the repo is already most of the way toward, and it has a working precedent in its
own history.

- `scripts/translate-single-locale.js` — **572 lines**, called OpenAI `gpt-4o-mini` directly via the
  `openai` SDK, built on `scripts/parse-mdx-blocks.js`. Removed 2026-05-25 in commit `f52bfd9a`
  (*"feat(translations): self-healing docs sweep; drop legacy translate.yml"*). Recoverable with
  `git show f52bfd9a^:scripts/translate-single-locale.js`.
- `scripts/parse-mdx-blocks.js` — **501 lines, still in the repo today**, still tested.
- **`@anthropic-ai/sdk` is already a production dependency** in `package.json`.
- **`ANTHROPIC_API_KEY` and `OPENAI_API_KEY` are already repo secrets** on `wcpos/docs` (since Jan 2026).

So the marginal build is: port the QA profiles and unit extractor out of openclaw, swap the gateway
`POST /execute` for an SDK call, and replace the two forwarding workflows with one that does the work
instead of dispatching it. Everything else is present.

- **Cost:** ~$120 all-in on `claude-sonnet-5` for the full 2.x cut; ~$60 on `claude-haiku-4-5`. Ongoing
  incremental cost is a rounding error — the current sweep's whole nightly job is 12 files.
- **Wall clock:** ~1 hour for the full cut as an 11-way locale matrix with ~10-way intra-locale
  concurrency; minutes for incremental runs.
- **What breaks in CI:** nothing. The five gates are openclaw-independent. The two forwarding workflows
  and `wait-for-openclaw-task.js` are deleted rather than repaired.
- **Effort:** ~2,600–2,800 lines ported plus a provider call and workflow rewrite. Call it a
  multi-session piece of work, not a day.
- **Risk:** the port is where quality lives. Drop `DOCS_LOCALE_PROFILES` and the German corpus
  regresses to the exact failures #1085/#1087 were built to stop. The gates would catch some of it —
  `forbiddenVisibleText` is enforced in openclaw's QA, *not* in the docs repo's gates, so that specific
  check is lost unless ported.

### (c) Commercial translation service / API

Verified today: Google Cloud Translation charges **$10 per million characters input and $10 per million
characters output** for Translation LLM ("cost equivalent with NMT"). DeepL's API supports all 11 target
languages including Hindi and Arabic (its exact per-character API rate could not be verified from a
static fetch — the pricing page is JS-rendered).

- **Cost:** ~$189 for Google on the 2.x corpus — **more expensive than Sonnet 5 via the Batch API**, for
  a strictly worse fit.
- **What breaks:** most of it. These are string translators with no concept of MDX. The entire reason
  the completeness gate exists is that a translator told to "keep props" left `question=`, `title=` and
  `alt=` in English; `check-translation-safety.js` exists because a batch shipped `DE:` marker prefixes
  and unquoted YAML colons that broke the build. A commercial MT API cannot take `buildDocsContext`'s
  glossary rules, cannot be told that a WP-admin breadcrumb code span is visible UI but a true code span
  is not, and cannot be given the `WCPOS Pro` naming constraint. You would still write the unit
  extractor, the normalizer and the QA layer — i.e. most of option (b)'s work — and then get worse
  output through it.
- **Verdict:** dominated. Higher cost, more work, less control.

### (d) Scripted one-off local/batch run, then a lighter incremental process

The same code as (b), run first from a laptop rather than CI, with the incremental path added after.

- **Cost:** identical to (b) — the model bill does not care where the loop runs. The Batch API's 50%
  discount genuinely fits here: a one-time 11,253-call job with no latency requirement is exactly its
  use case.
- **Wall clock:** unbounded by the 6-hour CI job cap. Overnight comfortably, or ~24 h through the Batch
  API.
- **What breaks in CI:** nothing, same as (b) — but note the **12-locale production build gate** will
  then be compiling 3,080 new pages on every content PR. Worth measuring before the cut; the local
  single-locale build with 2.x produced a 50 MB `build/` with 13 MB of 2.x.
- **Effort:** strictly less than (b) up front (no workflow, no secrets plumbing, no 6-hour ceiling), but
  it is the same port. The incremental half is then a small workflow on top.
- **Risk:** a one-off run done by hand is a one-off run that nobody can repeat. If the incremental half
  is not built immediately after, the corpus starts drifting the day after launch and the nightly
  self-healing property — the thing PR #54 and the sweep were built to provide — is gone.

## 6. Graceful degradation — tested, and the answer is uncomfortable

**Command run:** `NODE_OPTIONS=--max-old-space-size=6144 node scripts/build-with-2x.js --locale es`
**Exit code: 0.**

Result: **283 Spanish 2.x pages generated, from zero Spanish 2.x source files.** The entire build
produced exactly one warning, and it was unrelated (`[docusaurus-plugin-llms-txt] Excluded 326
routes`). Zero warnings about missing translations. Zero errors.

What the page actually looks like (`build/2.x/getting-started/installation/index.html`):

| | Spanish 1.x page (translated) | Spanish 2.x page (no translation) |
|---|---|---|
| `<html lang>` | `es` | `es` |
| `<title>` | `Requisitos de instalación …` | **`Installation Requirements …`** |
| Breadcrumb | `Instalación` | **`Installation`** |
| Body | Spanish | **English** |
| Theme chrome | `Versión: 2.x`, `En esta página` | `Versión: 2.x`, `En esta página` |

So: **not a 404, not a build failure, not an empty page — a bilingual page.** Spanish navbar, Spanish
version label, Spanish "On this page", English everything else.

The mechanism, confirmed against `@docusaurus/core` 3.10.1 source: `getContentPathList` returns
`[localized, english]` and `findFolderContainingFile` takes the **first folder that has the file**
(`node_modules/.pnpm/@docusaurus+utils@3.10.1/lib/dataFileUtils.js:61-72`), while the page inventory is
globbed from the English `contentPath` regardless of locale
(`@docusaurus/plugin-content-docs/lib/docs.js:32-38`). The fallback is per-file, structural and silent
by construction. There is no counter and no warning hook.

Two consequences:

1. **A partial translation launch is possible.** Ship 4 locales, or 40% of pages, and the rest serves
   English inside the localized shell. Nothing breaks.
2. **A zero-translation launch is also "possible", and that is the danger.** Flipping
   `docusaurus.config.js:304` alone publishes 3,080 English pages under localized, `hreflang`-tagged
   URLs. And per §2.4 the completeness gate will not object: `findDroppedLocales` returns `[]` when
   `present.length === 0`, which is precisely the 2.x state, so even `--all` stays green. Also missing:
   no locale — not even `i18n/en/` — has a `docusaurus-plugin-content-docs/version-2.x.json`, so the
   sidebar and category labels are untranslated too, which is what produced the English breadcrumb
   above.

**This needs a deliberate gate that does not exist today.** Whatever is decided about the translator,
something must fail the build or the PR when a locale is enabled for a version it has no content for.

## 7. Do all 11 locales still earn their place? — cannot be answered from here

**Per-locale readership data exists but is unreachable from this machine.** Stated plainly rather than
guessed at.

- The instrumentation is correct and has been since ~2026-06-16. `src/analytics/posthog.js` registers
  `docs_locale` as a super-property on every event, and `$current_url` carries the `/<locale>/` prefix,
  so per-locale traffic is derivable two ways.
- The only credential in the repo is `phc_…`, a **public write-only project key**. It ingests; it cannot
  query. No PostHog personal API key exists in the environment, in `.env*`, or in `gh secret list`
  (which holds only `ANTHROPIC_API_KEY` and `OPENAI_API_KEY`). The server-side ClickHouse route is on
  the Hetzner box and, per `wiki/operations/agents/drucker.md`, not reachable from the agent network.
- No committed exports, CSVs, or prior audit citing per-locale numbers. `scripts/audit-algolia.js` looks
  like search analytics but is a **content indexing** audit — it counts records per `lang`, not readers.
- Capture is consent-gated (`wcpos-analytics-consent`), so any future reading measures consenting
  visitors and may itself skew by region. GA was removed with no backfill, so there is no data before
  ~2026-06-16.

**Someone with a `ph.wcpos.com` login can settle this in about two minutes**: `$pageview` broken down by
`docs_locale`, filtered to `property = 'docs'`, last 90 days.

What *is* visible locally is provenance, and it is suggestive. First-add date per locale:

| Cohort | Locales | Date | Commit subjects |
|---|---|---|---|
| i18n plumbing test | fr | 2023-03-12 | `add i18n for testing` |
| same | es, hi-IN, zh-CN | 2023-06-13/15 | `Test i18n`, `add translations` |
| bulk AI batch | de, ja, pt-BR, ko, it, ar | 2026-01-16 | `chore: translate documentation` (PR #69) |
| newest | nl | 2026-05-20 | docs#211 |

**No document anywhere states why these locales were chosen.** The 2023 cohort's own commit messages
say "testing". That is the strongest provenance signal available and it is inference from commit
subjects, not a recorded decision.

Two things make the cut question lower-stakes than it looks. Marginal cost per locale is model spend
plus build time, not human translators (`README.md`: *"Translations are not edited by hand per page"*).
And all 11 are currently complete for 1.x (264–266 of 267), so completeness gives no signal about which
to drop. The one real cost of keeping 11 is the **12-locale production build gate on every content PR**,
which will grow by 3,080 pages at launch.

## 8. Options

Cost is the full 2.x cut, 11 locales. Effort is the build, not the run.

| # | Option | Cost | Effort | Risk |
|---|---|---|---|---|
| **A** | **Wait for the successor system** | unknown | none now, unbounded later | **High.** No design, no date, no owner, explicitly out of scope for #362. Launch would depend on a system nobody has scoped. |
| **B** | **Direct provider call from GitHub Actions** | ~$120 (Sonnet 5), ~$60 (Haiku 4.5); negligible incremental | ~2,600–2,800 lines ported + workflow rewrite | **Medium.** Port fidelity is everything — the 11 locale QA profiles and glossaries are the quality. Must parallelise inside a locale to fit the 6 h job cap. |
| **C** | **Commercial MT (Google / DeepL)** | ~$189 (Google, verified) | same port *minus* the model call, *plus* an MT adapter | **High and dominated.** Costs more than B, cannot take MDX-aware instructions, glossary or breadcrumb rules. Reintroduces the exact failure classes the gates were built for. |
| **D** | **One-off scripted run, then a light incremental workflow** | ~$43–$60 via Batch API for the cut | same port, no CI ceiling to design around up front | **Medium-low for the cut, high if the second half is skipped.** An unrepeatable hand-run leaves the corpus drifting from day one. |
| **E** | **Ship 2.x English-only at launch, translate after** | $0 at launch | 1 build/PR gate that fails on an untranslated enabled version | **Medium.** §6 proves the site degrades to bilingual pages, not errors — but 3,080 `hreflang`-tagged English pages is an SEO and trust cost, and nothing currently detects it. |

Options B, C and D share the same port; they differ only in who makes the model call and where the loop
runs. A is not really an option. E is orthogonal — it is a *sequencing* choice that can sit in front of
any of the others.

## 9. Recommendation

**This is a recommendation for Paul to accept or reject, not a decision taken.**

**Take D then B, and put E in front of both.**

1. **Decide the sequencing first (E).** The 2.x tree was cut 10 days ago and is still being written.
   Translating a moving target is exactly what the `AT LAUNCH:` guards were put there to prevent, so the
   translation cut belongs after content freeze regardless of which translator wins. Before that,
   **build the missing gate**: something must fail when a locale is enabled for a version with no
   content for it. Today that state is invisible to all five gates and to the build. This is a small,
   independently useful piece of work that should land whatever else is decided — and it is the only
   thing on this list that is urgent, because the `docusaurus.config.js:304` flip is a one-line change
   that silently publishes 3,080 English pages.
2. **Port the machinery out of `wcpos-openclaw` while it still exists (the shared half of B and D).**
   `mdx-units.ts`, `docs-qa.ts` and `translate-docs-batch.ts` are ~2,200 lines that encode every lesson
   from PRs #1083/#1085/#1087/#1092/#1093, and they vanish with the box. Lift them into `wcpos/docs`
   alongside the parser it already has. This is the load-bearing step and the only one with a deadline
   attached to something outside our control.
3. **Do the cut as a one-off Batch API run (D).** ~$43–$60, overnight, no 6-hour CI ceiling to design
   around on the first attempt, and the output lands on an ordinary branch that goes through the five
   existing gates like any other translation PR.
4. **Then wire the incremental half (B)** — one workflow replacing the two forwarding workflows, running
   the same ported code on changed files. Delete `wait-for-openclaw-task.js` and the guard test with
   them.

**Model:** `claude-sonnet-5` for the cut. Not Haiku — the routing policy's own history is that docs
translation was moved *off* the cheap tier (`["haiku"]`, `quality_floor: 0.30`) because cheap models
failed the deterministic QA, and repeating that experiment costs more in repair passes than the ~$60
saved. Not Opus 5 either, at 2.5× Sonnet's rate for a task with a deterministic gate behind it. Sonnet 5
with the Batch API is ~$43 for the first pass, and the gates will tell us if it is not good enough
before anything merges.

**On the locale question:** do not cut any locale on this evidence, because there is no evidence. Get
the PostHog breakdown first — it is a two-minute dashboard query for someone who can log in. Cutting a
locale saves roughly $5 of model spend per full cut and some build time; it is not worth guessing at.

**What this recommendation does not do:** it does not design Aide's replacement, and it does not assume
openclaw survives to launch. It assumes the opposite, and front-loads the one step (2) that becomes
impossible once the box is gone.

## What I could not establish

- **Any real cost or timing figure for the existing pipeline.** None exists in any repo. The dashboard
  that received `usage-recorder.ts`'s `TokenCounts`/`CostInputs` runs on the Hetzner box and was not
  reachable. Every cost and duration in §3.4 is derived from measured unit counts and published rates,
  not from an observed run.
- **Token counts.** No tokenizer and no API credential was available offline, so chars→tokens uses
  stated ratios (4 chars/token English, ~1.2 for CJK, ~2.0 Devanagari, ~2.5 Arabic). Expect ±30%.
- **Per-locale readership.** §7 — requires a PostHog personal key or a `ph.wcpos.com` login. Not guessed.
- **DeepL's exact API per-character rate.** Its pricing page is JS-rendered and the static fetch returned
  only the consumer app plans. Language coverage was verified (all 11 supported); the rate was not.
- **Whether openclaw outlives the launch.** Neither date exists. §4 characterises both as absent rather
  than picking one.
- **The 12-locale build's cost at 3,080 extra pages.** Only a single-locale build with 2.x was run
  (50 MB output, 13 MB of it 2.x). The full 12-locale CI build time at launch scale was not measured;
  locales build strictly sequentially (`@docusaurus/core/lib/commands/build/build.js:31-33`).
- **Whether `OPENCLAW_HOOKS_TOKEN` is an org-level secret.** `gh secret list -R wcpos/docs` shows only
  the two API keys; the org secrets API returned 403 for lack of `admin:org` scope. The forwarding
  workflows are succeeding on schedule (sweep ran 2026-09-22 03:12 UTC, exit success), so the token
  resolves from somewhere — most likely org level.
