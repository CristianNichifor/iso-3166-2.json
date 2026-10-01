# Contributing to the data fork

Keep fixes suitable for [olahol/iso-3166-2.json](https://github.com/olahol/iso-3166-2.json). This fork does not independently publish the upstream package. Fetch upstream into a separate branch, review differences and submit a PR; never reset local patches automatically.

## Reproduce and update

```sh
npm ci --ignore-scripts
npm run verify
# After correcting data/eQuest.csv:
npm run build
npm run verify
```

Requires Node 22.12+. Tests validate structure, source parsing, duplicates and generated-output reproducibility. They do not prove that the historical data reflects the current ISO standard. A data correction must include its public source and effective date in the PR, with the affected codes and before/after names.

The README traces the bundled CSV to eQuest's country/state workbook. Preserve that provenance. The package declares ISC; upstream does not include a separate license text in this snapshot. Before an independent data refresh or redistribution, the maintainer must confirm the source's reuse terms. Do not invent a license or silently replace the source with scraped data.

## Historical duplicate compatibility

The old compiler overwrote repeated subdivision codes with the last name. The
current compiler accepts repeated identical names (including `ES-S` and `ES-LO`
in different hierarchy columns). Conflicting names fail by default. For the
bundled CSV only, `data/duplicate-exceptions.json` records these exact ordered
four-column row pairs:

| Code | CSV lines | Earlier name | Published last name |
|---|---|---|---|
| GN-KD | 1617, 1634 | Koundara | Kindia |
| ES-O | 3274, 3275 | Asturias, Principado de | Asturias |
| ES-PM | 3310, 3311 | Islas Baleares | Baleares |
| ES-M | 3314, 3315 | Madrid, Comunidad de | Madrid |
| ES-MU | 3316, 3317 | Murcia, Región de | Murcia |
| ES-NA | 3318, 3319 | Navarra, Comunidad Foral de | Navarra |

These are compatibility exceptions, not judgments about canonical geography.
The source and published JSON remain unchanged. Name, column, order, or occurrence
count changes invalidate an exception. Removing a conflict also requires removing
its now-unused exception. Do not add exceptions just to make verification pass:
a source change needs explicit review and provenance, including any resulting
published-data changes. Line numbers above identify this historical snapshot;
the validator compares parsed row contents and order, not physical line numbers.

`compile(source)` is strict by default; the CLI explicitly passes the reviewed
exceptions. Tests check each exception is necessary, reject changed/reversed/extra
occurrences, and compare generated output byte for byte with the published JSON.
`--check` never writes; a rejected build leaves existing output intact.

## Local and hosted checks

After dependency installation, `npm run verify` is offline and uses only repository
files and synthetic fixtures. No account, private handbook, or publishing token is
needed. The initial `npm ci --ignore-scripts` needs registry access or a populated
npm cache; ignoring lifecycle scripts avoids running the legacy `prepublish` build
during installation. Use `nvm use` with `.nvmrc` or select Node 22 with your version
manager. The `checks` CI job runs verification once; the aggregate `verify` fails
unless `checks` succeeds, including when it is skipped or cancelled. Fork PRs use
no secrets. Do not run `npm publish` for verification.

## Contribution workflow

- Work from the remote default branch in a separate checkout. With the maintainer's `wt` tool, run `git fetch origin` then `wt new chore/<task> origin/master`; it creates `<repo>/.worktrees/chore/<task>`. Contributors without `wt` can use a separate clone and feature branch. Never modify another task's working tree.
- Use Conventional Commits: imperative lower-case subject, at most 72 characters, no trailing full stop, one change per commit. Explain why in the body only when needed; link issues with `Refs: #N` or `Closes: #N`.
- Open a PR against `master` with the problem, resulting behavior, verification command/results and any limitations. Agents never merge PRs, push directly to protected branches, deploy, or publish releases.
- A required check or administrator-only branch rule is not an agent permission boundary: administrator credentials can bypass rules. Keep publication credentials out of ordinary development.
- Tasks need an observable acceptance criterion, affected area, constraints and a verification command. Use synthetic fixtures; do not include credentials or personal data in issues, logs or tests.
