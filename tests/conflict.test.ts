import { existsSync, mkdtempSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { resolveConflicts } from '../src/engine/conflict'
import type { PlannedFile } from '../src/engine/types'
import { writeFiles } from '../src/engine/writer'

const tmp = () => mkdtempSync(join(tmpdir(), 'docseed-conflict-'))

const planned: PlannedFile[] = [
  { output: 'README.md', absPath: '/abs/docs/README.md', content: '# README' },
  { output: 'ARCHITECTURE.md', absPath: '/abs/docs/ARCHITECTURE.md', content: '# ARCHITECTURE' },
]

const existing = new Set(['/abs/docs/README.md'])
const exists = (absPath: string) => existing.has(absPath)

describe('resolveConflicts', () => {
  it('strict routes existing to conflicts and new to toWrite', () => {
    const { toWrite, toSkip, conflicts } = resolveConflicts(planned, 'strict', exists)

    expect(conflicts).toEqual([planned[0]])
    expect(toWrite).toEqual([planned[1]])
    expect(toSkip).toEqual([])
  })

  it('force routes all planned files to toWrite', () => {
    const { toWrite, toSkip, conflicts } = resolveConflicts(planned, 'force', exists)

    expect(toWrite).toEqual(planned)
    expect(toSkip).toEqual([])
    expect(conflicts).toEqual([])
  })

  it('merge skips existing and writes new', () => {
    const { toWrite, toSkip, conflicts } = resolveConflicts(planned, 'merge', exists)

    expect(toSkip).toEqual([planned[0]])
    expect(toWrite).toEqual([planned[1]])
    expect(conflicts).toEqual([])
  })
})

describe('writeFiles', () => {
  it('dry-run writes nothing', () => {
    const dir = tmp()
    const absPath = join(dir, 'f.md')

    writeFiles([{ absPath, content: 'x' }], true)

    expect(existsSync(absPath)).toBe(false)
  })

  it('real write creates nested dirs and file content', () => {
    const dir = tmp()
    const absPath = join(dir, 'nested', 'deep', 'f.md')

    writeFiles([{ absPath, content: 'x' }], false)

    expect(existsSync(absPath)).toBe(true)
    expect(readFileSync(absPath, 'utf8')).toBe('x')
  })
})
