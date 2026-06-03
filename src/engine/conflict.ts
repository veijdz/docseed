import type { ConflictDecision, ConflictStrategy, PlannedFile } from './types'

export function resolveConflicts(
  planned: PlannedFile[],
  strategy: ConflictStrategy,
  exists: (absPath: string) => boolean,
): ConflictDecision {
  const toWrite: PlannedFile[] = []
  const toSkip: PlannedFile[] = []
  const conflicts: PlannedFile[] = []

  for (const file of planned) {
    const fileExists = exists(file.absPath)

    if (strategy === 'force') {
      toWrite.push(file)
    } else if (strategy === 'strict') {
      if (fileExists) {
        conflicts.push(file)
      } else {
        toWrite.push(file)
      }
    } else if (strategy === 'merge') {
      if (fileExists) {
        toSkip.push(file)
      } else {
        toWrite.push(file)
      }
    } else {
      const _exhaustive: never = strategy
      return _exhaustive
    }
  }

  return { toWrite, toSkip, conflicts }
}
