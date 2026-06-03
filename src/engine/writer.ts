import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'

export function writeFiles(files: { absPath: string; content: string }[], dryRun: boolean): void {
  if (dryRun) {
    return
  }

  for (const file of files) {
    mkdirSync(dirname(file.absPath), { recursive: true })
    writeFileSync(file.absPath, file.content, 'utf8')
  }
}
