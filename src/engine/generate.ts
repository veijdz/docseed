import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { resolveConflicts } from './conflict'
import { loadTemplate } from './loader'
import { render } from './renderer'
import type { GenerateOptions, GenerateSummary, InputVars, PlannedFile, Preset } from './types'
import { writeFiles } from './writer'

export function generate(preset: Preset, vars: InputVars, opts: GenerateOptions): GenerateSummary {
  const cwd = opts.cwd ?? process.cwd()
  const bundledRoot = opts.bundledRoot ?? fileURLToPath(new URL('../templates', import.meta.url))

  const contentByPath = new Map<string, string>()
  const planned: PlannedFile[] = []

  for (const doc of preset.docs) {
    const loaded = loadTemplate(doc.template, { cwd, bundledRoot })
    const content = render(loaded.content, vars)
    const absPath = resolve(cwd, 'docs', doc.path)
    contentByPath.set(absPath, content)
    planned.push({ output: doc.path, absPath })
  }

  const decision = resolveConflicts(planned, opts.strategy, (p) => existsSync(p))

  if (opts.strategy === 'strict' && decision.conflicts.length > 0) {
    const list = decision.conflicts.map((p) => p.output).join(', ')
    throw new Error(
      `Conflict: these docs already exist (${list}). Use --force to overwrite or --merge to skip existing.`,
    )
  }

  const filesToWrite = decision.toWrite.map((p) => ({
    absPath: p.absPath,
    content: contentByPath.get(p.absPath) ?? '',
  }))
  writeFiles(filesToWrite, opts.dryRun)

  return {
    created: decision.toWrite.map((p) => p.output),
    skipped: decision.toSkip.map((p) => p.output),
    conflicts: decision.conflicts.map((p) => p.output),
    dryRun: opts.dryRun,
  }
}
