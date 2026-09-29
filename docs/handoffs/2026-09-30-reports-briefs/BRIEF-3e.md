# Brief — PR 3e of the Sales room on Reports: Print through the plugin's `report` templates (wcpos/roadmap#332)

Branch `feat/reports-sales-3e`, off `origin/next` after PR 3d (wcpos/monorepo#2262) merged. `R/` means `packages/core/src/screens/main/reports/`, `RC/` means `packages/core/src/screens/main/receipt/`. This worktree already has `node_modules` (installed offline); do not run `pnpm install`, `git pull` or `git fetch`.

## Stakes

Printing a report. No money moves and nothing is written to the server. The worst failure is a blank or malformed printout or a Print that does nothing silently; both are what this PR exists to prevent. Treat concurrency and retry findings as accepted risks. Do not add caches, feature flags, new endpoints or a server rendering contract.

## Why this is its own PR

PR 3d opened Print with `useReceiptDocument({ templateType: 'report', localReport })` — the first caller to pass `'report'` — and review found five defects that live **below** the hook, in stages that only knew `receipt` and `closure`. This PR teaches those stages the `report` envelope and then wires Print. The five, verbatim from wcpos/monorepo#2262's first Codex pass, are the acceptance list:

1. **Template synchronisation readiness.** `useActiveTemplates` returns `[]` until `useTemplatesSync` has fetched; `doc.isSyncing` does not track that fetch for a local document (it comes from `useReceiptData`, which has no order or document here). Print could run before any template existed and the renderer fell back to a receipt-shaped generic.
2. **Data-dependency readiness.** A panel's rows may still be waiting (products, the cashier directory); the document was built from `[]` and Print was enabled.
3. **Server-only templates.** A template with `offline_capable: false` (a legacy PHP template) was offered to a local report that has no server document id; `preparePrintContent` cannot ask the server to render it and substituted the generic content.
4. **Print outcomes.** `doc.print()` can reject or resolve `false`; passed straight as `onPress` neither reached the panel.
5. **The thermal mapper.** `packages/printer/src/encoder/map-receipt-data.ts:989` preserves an envelope whose top level has `closure`; a `report` envelope was converted as an ordinary receipt and the table dropped.

## Read first

- `RC/use-receipt-document.ts` (the hook; returns `templates, selectedTemplateId, setSelectedTemplateId, isOffline, isSyncing, hasFinalData, print, isPrinting, resolvedPrinter, mismatchWarning, documentError, …` at l.375–412), `RC/hooks/use-templates-sync.ts:144` (`useTemplatesSync(type, storeId): void`), `RC/hooks/use-active-templates.ts:20` (`useActiveTemplates(type, storeId): TemplateDocument[]`), `RC/template-switcher.tsx:66` (disables `!offline_capable` only when offline), `RC/utils/prepare-print-content*` and `RC/hooks/use-template-renderer.ts` (how a local document reaches a template), `packages/printer/src/encoder/map-receipt-data.ts:982–995`.
- `R/closures/closure-panel.tsx:50, 68–77, 145–166, 236–` — the closure panel's use of the same hook, its `TemplateSwitcher`, and its **Reprint action's try/catch** around `doc.print()` (copy that shape).
- `R/panels/panel.tsx` — `DetailPanel` as 3d left it (Export CSV in the footer; `ready` gates the body and Export; `raw` and `types` on every spec). `R/panels/specs.ts` — `PanelSpec { keys, head, types, align, rows[{key, cells, raw}], total }`.
- **The document builder from 3d's first head** — `packages/core/src/screens/main/reports/panels/document.ts`, its test and the `__fixtures__/report-sales.json` copy — is at `PRINT-3E/` in this worktree's root (untracked; the orchestrator removes it). Start from it: it already satisfies `Report_Document_Validator` (column count, cell keys in order, `group_by: null`, `totals` always an object, `fiscal.is_report_document: true`, `row-` prefixed keys, string cell values) and pins those invariants in Jest against the plugin fixture. The plugin's `Receipt_Data_Schema.php` `report` tree (`/Users/kilbot/Projects/woocommerce-pos-worktrees/cogs-probe/includes/Services/`) stays the authority over any line here.
- `.claude/rules/design.mdc` rule 5 (a disabled control says why).

## What to build

### 1. The pipeline learns the `report` envelope

- `packages/printer/src/encoder/map-receipt-data.ts` — beside the `closure` pass-through: `if (data.report && typeof data.report === 'object') return { ...emptyReceiptData(), ...data };` with the same comment discipline; a test in the printer package's mapper tests: "a report envelope is preserved through the mapper".
- `RC/hooks/use-templates-sync.ts` — return `{ synced: boolean }`: `false` until the first sync run has settled (resolved or rejected), `true` after; existing callers ignore the return today, so `void → object` breaks nothing (adjust their types if TypeScript complains). Test: "synced turns true when the first run settles, on failure too".
- `RC/use-receipt-document.ts` — for a **local document** (`localReport` set, no `orderId`, no `document`): expose `templatesReady: boolean` = `isOffline || synced`, and filter `templates` to `offline_capable !== false` when there is no server document (a local report can only be rendered locally); if that filter empties the list while online and synced, `templatesReady` stays `true` and the panel says there is no local template (see 3). Tests: "a local report offers only offline-capable templates", "templatesReady waits for the first sync".
- `RC/template-switcher.tsx` — no change if the filtering happens in the hook; if you filter in the switcher instead, keep the hook's list intact and test the switcher.

### 2. The document (`R/panels/document.ts`)

Restore 3d's builder and tests from `PRINT-3E/` unchanged unless the schema says otherwise. `generated_at` is computed once per open panel (`useState` initialiser keyed by the panel's mount, never in render).

### 3. Print in the panel (`R/panels/panel.tsx`)

`const doc = useReceiptDocument({ autoPrintAllowed: false, templateType: 'report', storeId, localReport: document })`. The header gains `<TemplateSwitcher … alwaysVisible />` under the scope line (`detail-panel-template`). The footer gains a primary **Print** (`detail-panel-print`, `loading={doc.isPrinting}`) beside Export CSV. Readiness `waiting: 'store' | 'data' | 'templates' | 'no-template' | null`: `!formats.store → 'store'`; `!ready` (the panel's own data — products, directory) → `'data'`; `!doc.templatesReady → 'templates'`; `doc.templates.length === 0 → 'no-template'`; else `null`. While `waiting`, Print is disabled **and** a muted `Text` beside it (`detail-panel-print-waiting`) says why: `reports.print_waiting_store` ("Waiting for the store"), `reports.print_waiting_data` ("Loading the report"), `reports.print_waiting_templates` ("Loading templates"), `reports.print_no_local_template` ("No template can print offline · manage templates in WP Admin"). Print's press: `try { const ok = await doc.print(); if (ok === false) setPrintError(t('reports.print_failed')); } catch { setPrintError(t('reports.print_failed')); }` shown under the footer (`detail-panel-print-error`); `doc.documentError` shows the same way. The on-screen rows stay the panel's own table; the template formats the printed document only. Export CSV is untouched.

### 4. Translations

The four waiting phrases, `reports.print_failed` ("Could not print. Try again."), `reports.print` if missing (grep first).

## Ledger

`R/LEDGER.md` line 31 (reserved by 3d): every panel prints through the plugin's `report` templates from a document built on the device from the panel's rows (`buildReportDocument`), only when the store, the panel's data and the templates are known and only through templates that can render locally; the on-screen rows stay the panel's own table — evidence: build brief §1 "Detail panels", the plugin's `Report_Document_Validator`, wcpos/monorepo#2262's review, this PR. `RC/` or `packages/printer` ledgers, if they exist: a line for the `report` envelope pass-through and the `synced` signal.

## Tests (by name)

- `packages/printer` mapper tests: "a report envelope is preserved through the mapper".
- `RC/hooks/use-templates-sync.test.ts` (+1): "synced turns true when the first run settles, on failure too".
- `RC/use-receipt-document.test.tsx` (+2): "a local report offers only offline-capable templates"; "templatesReady waits for the first sync and is true offline".
- `R/panels/document.test.ts` (3, restored): the validator's invariants over the payments and orders specs; totals always lists the column keys; the date bundles match the plugin fixture's keys.
- `R/panels/panel.test.tsx` (+4): "Print waits for the templates with a reason"; "Print waits for the panel's data"; "no local template is said, not silently disabled"; "a print that resolves false or rejects shows the message".
- Playwright `reports-closures.spec.ts`, both viewports: open the Taxes panel, `detail-panel-print` enabled or `detail-panel-print-waiting` visible with text (the stub has no templates route — assert one of the two, never a bare click). You cannot run this spec locally.

## Commands (run before you report; verify by exit status)

```
NODE_OPTIONS=--max-old-space-size=4096 pnpm --dir packages/core exec jest src/screens/main/reports src/screens/main/receipt --maxWorkers=2
pnpm --dir packages/printer exec jest --maxWorkers=2
pnpm --dir packages/core exec eslint src/screens/main/reports src/screens/main/receipt --ext .ts,.tsx
pnpm --dir packages/core exec tsc --noEmit
node scripts/check-react-compiler-smells.mjs
pnpm --filter @wcpos/eslint-config test
pnpm translations:check
```

One jest process at a time. Never run prettier on `apps/main/global.css`.

## Out of scope (do not add)

A server rendering contract for local documents; PDF download for reports; printer selection UI beyond what `useReceiptDocument` already gives (no `PrinterSwitcher` in this PR); changes to the closure panel's behaviour (only shared code it also uses, kept green by its tests); the hero's Sales summary print; Where sold; margin; `pos/**`; gallery cells; plan, status or handoff files.

## Budget

Estimate, changed non-test logic lines before formatting: mapper +4, `use-templates-sync.ts` +15, `use-receipt-document.ts` +25, `document.ts` 90 (restored), `panel.tsx` +55, translations ~8. Hard ceiling **400 changed non-test lines**. If you are about to exceed it, STOP and report why instead of continuing.

## Fixed lines

- If anything does not work as expected — a missing tool, an install, a permission, a failing baseline you did not cause — stop and say so rather than working around it. Where this brief and the plugin's schema or the hook's real contract differ, the code you read wins: resolve it yourself and name the resolution in your report; a design question means this brief was not ready: name it as `Readiness failure: <question>` and stop.
- Do not push; do not open or edit a PR; do not reply on any PR; do not `git commit` — the orchestrator reviews the diff and commits.
- Your final message is the report: what changed (file by file), what you ran with exit codes, and your line count against the ceiling.
