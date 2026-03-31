export interface ChangelogEntry {
  description: string
}

export interface ChangelogVersion {
  version: string
  date: string // ISO format, e.g. '2026-03-30'
  entries: {
    new: ChangelogEntry[]
    improved: ChangelogEntry[]
    fixed: ChangelogEntry[]
  }
}

// When releasing a new version:
// 1. Prepend a new entry to this array
// 2. Make sure the version string matches package.json
export const changelog: ChangelogVersion[] = [
  {
    version: '0.5.0',
    date: '2026-03-30',
    entries: {
      new: [
        {
          description: 'Added button to suggested videos on the player page',
        },
      ],
      improved: [
        {
          description: "Button is now round to match YouTube's design",
        },
      ],
      fixed: [],
    },
  },
]
