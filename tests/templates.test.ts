import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { loadTemplate } from '../src/engine/loader'
import { render } from '../src/engine/renderer'
import type { InputVars } from '../src/engine/types'
import { getPreset } from '../src/presets/loader'

const bundledRoot = fileURLToPath(new URL('../templates', import.meta.url))

const vars: InputVars = {
  projectName: 'Acme',
  author: 'Jane Doe',
  shortDescription: 'A sample project',
  preset: 'mvp',
  isOpenSource: true,
  projectType: 'cli',
  license: 'MIT',
}

// Every template referenced by the bundled presets must render cleanly.
const refs = [
  ...new Set(['minimal', 'mvp'].flatMap((id) => getPreset(id).docs.map((doc) => doc.template))),
]

describe('bundled templates render', () => {
  for (const ref of refs) {
    it(`renders ${ref} with no leftover mustaches`, () => {
      const loaded = loadTemplate(ref, { cwd: bundledRoot, bundledRoot })
      const out = render(loaded.content, vars)
      expect(out).toContain(vars.projectName)
      expect(out).not.toContain('{{')
    })
  }
})
