import { afterEach, describe, expect, it, vi } from 'vitest'
import { render } from '../src/engine/renderer'

describe('render', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('substitutes basic variables', () => {
    expect(render('Hello {{name}}', { name: 'X' })).toBe('Hello X')
  })

  it('auto-injects date and year', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'))
    expect(render('{{date}} {{year}}', {})).toBe('2026-01-01 2026')
  })

  it('does not escape HTML entities (noEscape)', () => {
    const out = render('{{v}}', { v: '<a>&"' })
    expect(out).toContain('<a>')
    expect(out).toContain('&')
    expect(out).toContain('"')
    expect(out).not.toContain('&lt;')
    expect(out).not.toContain('&amp;')
  })

  it('eq helper resolves both branches', () => {
    const tpl = '{{#if (eq a b)}}Y{{else}}N{{/if}}'
    expect(render(tpl, { a: 1, b: 1 })).toBe('Y')
    expect(render(tpl, { a: 1, b: 2 })).toBe('N')
  })

  it('isOpenSource conditional toggles content', () => {
    const tpl = '{{#if isOpenSource}}OSS{{/if}}'
    expect(render(tpl, { isOpenSource: true })).toBe('OSS')
    expect(render(tpl, { isOpenSource: false })).toBe('')
  })

  it('projectType conditional via eq toggles content', () => {
    const tpl = '{{#if (eq projectType "cli")}}CLI{{/if}}'
    expect(render(tpl, { projectType: 'cli' })).toBe('CLI')
    expect(render(tpl, { projectType: 'lib' })).toBe('')
  })
})
