import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { parse } from 'yaml'

const flatten = (value: Record<string, unknown>, prefix = ''): string[] =>
  Object.entries(value).flatMap(([key, item]) => {
    const full = prefix ? `${prefix}.${key}` : key

    return typeof item === 'string'
      ? [full]
      : flatten(item as Record<string, unknown>, full)
  })

const load = (file: string) =>
  parse(readFileSync(path.join(__dirname, file), 'utf8'))

const files = readdirSync(__dirname).filter((file) => file.endsWith('.yml'))
const english = flatten(load('en.yml')).sort()

describe('locales', () => {
  it.each(files.filter((file) => file !== 'en.yml'))(
    '%s has exactly the keys of en.yml',
    (file) => {
      expect(flatten(load(file)).sort()).toEqual(english)
    },
  )
})
