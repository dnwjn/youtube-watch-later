export interface ChangelogVersion {
  version: string
  date: string // ISO format, e.g. '2026-03-30'
  entries: {
    new?: number
    improved?: number
    fixed?: number
  }
}

// Entry text lives in src/locales/*.yml under changelog.v<version>.<type>_<n>
// (dots in the version become underscores, n starts at 1). Each count below is
// the number of entries of that type.
//
// When releasing a new version:
// 1. Prepend a new entry to this array
// 2. Add the matching texts to src/locales/en.yml (other locales fall back to
//    English until translated)
// 3. Make sure the version string matches package.json
export const changelog: ChangelogVersion[] = [
  {
    version: '1.0.0',
    date: '2026-11-12',
    entries: { new: 2 },
  },
  {
    version: '0.6.3',
    date: '2026-08-31',
    entries: { fixed: 1 },
  },
  {
    version: '0.6.2',
    date: '2026-07-29',
    entries: { fixed: 1 },
  },
  {
    version: '0.6.1',
    date: '2026-07-24',
    entries: { new: 1 },
  },
  {
    version: '0.6.0',
    date: '2026-07-23',
    entries: { new: 2, improved: 3, fixed: 2 },
  },
  {
    version: '0.5.3',
    date: '2026-05-25',
    entries: { fixed: 1 },
  },
  {
    version: '0.5.2',
    date: '2026-04-07',
    entries: { fixed: 1 },
  },
  {
    version: '0.5.1',
    date: '2026-04-04',
    entries: { new: 1 },
  },
  {
    version: '0.5.0',
    date: '2026-03-30',
    entries: { new: 1, improved: 1 },
  },
  {
    version: '0.4.2',
    date: '2026-03-19',
    entries: { fixed: 2 },
  },
  {
    version: '0.4.0',
    date: '2025-11-24',
    entries: { new: 2 },
  },
  {
    version: '0.3.0',
    date: '2025-08-27',
    entries: { new: 1 },
  },
  {
    version: '0.2.0',
    date: '2025-06-26',
    entries: { new: 1 },
  },
]
