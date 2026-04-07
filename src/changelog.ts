export interface ChangelogVersion {
  version: string
  date: string // ISO format, e.g. '2026-03-30'
  entries: {
    new?: string[]
    improved?: string[]
    fixed?: string[]
  }
}

// When releasing a new version:
// 1. Prepend a new entry to this array
// 2. Make sure the version string matches package.json
export const changelog: ChangelogVersion[] = [
  {
    version: '0.5.2',
    date: '2026-04-07',
    entries: {
      fixed: [
        'Fixed an issue on Firefox, where the button would not work in combination with the Multi-Account Containers extension.',
      ],
    },
  },
  {
    version: '0.5.1',
    date: '2026-04-04',
    entries: {
      new: [
        "Added this What's New tab (hi!), so you can stay informed about the noteworthy recent changes.",
      ],
    },
  },
  {
    version: '0.5.0',
    date: '2026-03-30',
    entries: {
      new: [
        'Added the button to the suggested videos on the player page, next to (desktop) and below (mobile) the player.',
      ],
      improved: ["The button is now round to better match YouTube's design."],
    },
  },
  {
    version: '0.4.2',
    date: '2026-03-19',
    entries: {
      fixed: [
        'Fixed an issue where the button would not always be visible.',
        'Fixed an issue where the colors would not match custom themes.',
      ],
    },
  },
  {
    version: '0.4.0',
    date: '2025-11-24',
    entries: {
      new: [
        'Added the button to the suggested videos in the modern video endscreen.',
        'Added the button to shorts.',
      ],
    },
  },
  {
    version: '0.3.0',
    date: '2025-08-27',
    entries: {
      new: [
        'Added the button to the video player controls, next to the like/dislike buttons.',
      ],
    },
  },
  {
    version: '0.2.0',
    date: '2025-06-26',
    entries: {
      new: [
        'Added the button to the suggested videos in the classic video endscreen.',
      ],
    },
  },
]
