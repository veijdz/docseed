import { LICENSE_TEXTS } from './licenses'

/**
 * Maps the project's open-source license ids to SPDX ids.
 *
 * 'GPL-3.0' resolves to 'GPL-3.0-or-later' (not '-only'): "or later" is the
 * FSF-recommended default and the most permissive reading for downstream users.
 */
const SPDX_ID: Record<string, string> = {
  MIT: 'MIT',
  'Apache-2.0': 'Apache-2.0',
  'GPL-3.0': 'GPL-3.0-or-later',
}

/**
 * Renders the canonical license text for an open-source license id.
 *
 * For MIT the `<year>` and `<copyright holders>` placeholders are substituted
 * with the given year and author. Apache-2.0 and GPL-3.0 are returned as-is
 * (their canonical texts carry no per-project placeholders). Returns null for
 * any unsupported/non-open-source value.
 */
export function renderLicense(
  license: string,
  vars: { author: string; year: string },
): string | null {
  const spdxId = SPDX_ID[license]
  if (!spdxId) return null

  const text = LICENSE_TEXTS[spdxId]
  if (!text) return null

  if (spdxId === 'MIT') {
    return text.replace('<year>', () => vars.year).replace('<copyright holders>', () => vars.author)
  }

  return text
}
