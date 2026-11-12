import { readFileSync } from 'node:fs'
import path from 'node:path'
import { parse } from 'yaml'

// Test stand-in for the generated `#i18n` module: resolves keys against the
// English locale file so components render real copy without browser.i18n.
const flatten = (
  value: Record<string, unknown>,
  prefix = '',
): Record<string, string> =>
  Object.entries(value).reduce<Record<string, string>>((acc, [key, item]) => {
    const full = prefix ? `${prefix}.${key}` : key

    if (typeof item === 'string') acc[full] = item
    else Object.assign(acc, flatten(item as Record<string, unknown>, full))

    return acc
  }, {})

const messages = flatten(
  parse(readFileSync(path.resolve(__dirname, '../locales/en.yml'), 'utf8')),
)

export const i18n = {
  t: (key: string) => messages[key] ?? key,
}
