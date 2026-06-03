import type { Preset, PresetDoc } from '../engine/types'
import minimalRaw from './minimal.json'
import mvpRaw from './mvp.json'

function isString(value: unknown): value is string {
  return typeof value === 'string'
}

function validateDoc(raw: unknown, presetId: string, index: number): PresetDoc {
  if (typeof raw !== 'object' || raw === null) {
    throw new Error(`Invalid preset '${presetId}': docs[${index}] must be an object`)
  }
  const doc = raw as Record<string, unknown>
  if (!isString(doc.template)) {
    throw new Error(`Invalid preset '${presetId}': docs[${index}].template must be a string`)
  }
  if (!isString(doc.path)) {
    throw new Error(`Invalid preset '${presetId}': docs[${index}].path must be a string`)
  }
  return { template: doc.template, path: doc.path }
}

function validatePreset(raw: unknown): Preset {
  if (typeof raw !== 'object' || raw === null) {
    throw new Error('Invalid preset: must be an object')
  }
  const { id, label, docs, requiredVars } = raw as Record<string, unknown>
  if (!isString(id)) {
    throw new Error('Invalid preset: id must be a string')
  }
  if (!isString(label)) {
    throw new Error(`Invalid preset '${id}': label must be a string`)
  }
  if (!Array.isArray(docs) || docs.length === 0) {
    throw new Error(`Invalid preset '${id}': docs must be a non-empty array`)
  }
  if (!Array.isArray(requiredVars) || !requiredVars.every(isString)) {
    throw new Error(`Invalid preset '${id}': requiredVars must be a string array`)
  }
  return {
    id,
    label,
    docs: docs.map((doc, index) => validateDoc(doc, id, index)),
    requiredVars,
  }
}

// Validated at module load so an invalid bundled preset fails fast at startup.
const registry: Record<string, Preset> = {
  minimal: validatePreset(minimalRaw),
  mvp: validatePreset(mvpRaw),
}

export function getPreset(id: string): Preset {
  const preset = registry[id]
  if (!preset) {
    throw new Error(`Unknown preset: ${id}. Available: ${Object.keys(registry).join(', ')}`)
  }
  return preset
}
