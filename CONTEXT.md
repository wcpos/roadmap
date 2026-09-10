# WCPOS Roadmap

The planning context for WCPOS and WCPOS Pro: how releases are scoped, described and shown to merchants. Issues in this repo are the source; every other roadmap surface is derived from them.

## Language

### Releases

**Release**:
A versioned minor of WCPOS (`v1.11.0`) that ships from the development lane and has a public scope. Patch lines and standing tracks are not releases.
_Avoid_: Milestone, sprint, version, iteration

**Release issue**:
The one issue in this repo that *is* a release: labelled `release`, titled with the version and theme. It is the single source every roadmap surface derives from.
_Avoid_: Release ticket, milestone issue, roadmap entry

**Theme**:
The few words after the version in a release's title that say what the release is about.
_Avoid_: Title, tagline, headline

**Brief**:
The body of a release issue: why the release exists, what is deliberately not in it, and its due date. Written for merchants, so public in full.
_Avoid_: Spec, description, scope doc

**Epic**:
A merchant-facing unit of a release: any issue that is a direct child of a release issue. Its size does not matter; its position does.
_Avoid_: Feature, initiative, item, story

**Summary**:
An epic's public text: the two or three sentences for merchants in its `Summary` section. An epic without one is not shown publicly.
_Avoid_: Description, blurb, excerpt

**Work**:
Anything beneath an epic: landing tasks, implementation issues in the code repos, research. Never public, never a direct child of a release.
_Avoid_: Sub-task, ticket, task (in the roadmap sense)

### Lifecycle

**Planning**:
An open release that is not the lowest open version. Shown as "Next", or "Later" if it has no due date.

**Active**:
The lowest-version open release. Shown as "Now". There is exactly one at a time.
_Avoid_: Current, in progress (that is an epic state)

**Shipped**:
A release issue closed as completed. The Free plugin's `vX.Y.0` tag is what closes it.
_Avoid_: Done, released, closed

**Withdrawn**:
A release issue closed as not planned. It never appears anywhere and its milestone copies are removed.
_Avoid_: Cancelled, abandoned

**Leftover**:
An epic that was still open when its release closed. It detaches, loses its milestone, and waits in the digest to be placed.
_Avoid_: Carry-over, rollover, orphan

### Epic states

**Planned**:
An open epic none of whose work has completed yet. An epic with no work filed under it is planned.
_Avoid_: Up next, backlog, todo

**In progress**:
An open epic with at least one piece of work completed.
_Avoid_: Active (that is a release state), started, WIP

**Done**:
An epic closed as completed: its merchant-facing outcome is in. Epics are done; only releases are shipped.
_Avoid_: Shipped, complete, resolved

**Withdrawn epic**:
An epic closed as not planned or duplicate. It leaves its release and its milestone and is never shown.
_Avoid_: Cancelled, dropped, superseded (say why in the close reason, not the name)

### Derived surfaces

**Milestone**:
A per-repo GitHub milestone the sync writes from a release: title is the version, description the theme. A projection, never a source.
_Avoid_: Release (a milestone is a copy of one)

**Thread**:
The Discord roadmap forum's projection of one visible epic: starter post kept current, replies only for events, archived when the epic is done or withdrawn.
_Avoid_: Forum post, announcement, topic

**Digest**:
The one pinned issue the sync keeps current: the state of every open release, then every item needing attention, each in a lane. Paul reads it instead of touching GitHub; the assistant acts from it.
_Avoid_: Review queue, approval list, notification, report

**Lane**:
Who acts on a digest item: `paul` (a call or veto only he can make), `assistant` (acted on unasked, reported after), or `log` (healed automatically, listed for the record).
_Avoid_: Severity, priority, owner

**Heal**:
What the sync does to a derived surface that disagrees with its release issue: overwrite it. Only projections heal; choices are reported.
_Avoid_: Fix, repair, auto-correct

**Drift**:
Any disagreement between a release issue and a surface derived from it.
_Avoid_: Out of sync, stale (describe the surface, not the state)
