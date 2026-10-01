# ISO subdivisions: upstream contribution fork

Preserve the published JSON shape and upstream attribution. `data/eQuest.csv` is the source; `compile.js` generates `iso-3166-2.json`. Make corrections in the source and regenerate, never patch generated JSON alone. Country/subdivision prefixes must agree; identical subdivision names may repeat, but conflicting duplicates must fail unless their exact ordered rows match `data/duplicate-exceptions.json`. Stale exceptions fail too; review that file whenever source data changes.

Node 22.12+ (CI uses Node 22 from `.nvmrc`): `npm ci --ignore-scripts`, then `npm run verify`. Use `npm run build` only to regenerate after a source change and inspect the resulting diff. Verification is offline after installation and requires no account or service.

This fork is for contributions to olahol/iso-3166-2.json, not a new package release channel. Package metadata declares ISC for code; it does not establish permission to relicense the underlying eQuest-derived data. See CONTRIBUTING.md before refreshing or republishing data.

## Contribution workflow

- Work from the remote default branch in a separate checkout. With the maintainer's `wt` tool, run `git fetch origin` then `wt new chore/<task> origin/master`; it creates `<repo>/.worktrees/chore/<task>`. Contributors without `wt` can use a separate clone and feature branch. Never modify another task's working tree.
- Use Conventional Commits: imperative lower-case subject, at most 72 characters, no trailing full stop, one change per commit. Explain why in the body only when needed; link issues with `Refs: #N` or `Closes: #N`.
- Open a PR against `master` with the problem, resulting behavior, verification command/results and any limitations. Agents never merge PRs, push directly to protected branches, deploy, or publish releases.
- A required check or administrator-only branch rule is not an agent permission boundary: administrator credentials can bypass rules. Keep publication credentials out of ordinary development.
- Tasks need an observable acceptance criterion, affected area, constraints and a verification command. Use synthetic fixtures; do not include credentials or personal data in issues, logs or tests.
