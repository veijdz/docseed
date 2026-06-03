/**
 * Contrato compartilhado do engine de render.
 *
 * Convenção de template ref: caminho relativo à raiz de templates, sem `.hbs`.
 * Ex.: ref `shared/README.md` resolve para:
 *   1. override:  <cwd>/.docseed/templates/shared/README.md.hbs
 *   2. bundled:   <bundledRoot>/shared/README.md.hbs
 */

/** Tipo de projeto (dimensão do wizard). */
export type ProjectType = 'web' | 'cli' | 'library' | 'mobile' | 'other'

/** Variáveis disponíveis nos templates. */
export interface TemplateVars {
  projectName: string
  author: string
  shortDescription: string
  preset: string
  isOpenSource: boolean
  projectType: ProjectType
  /** Só presente quando isOpenSource. */
  license?: string
  /** Injetada automaticamente pelo renderer (YYYY-MM-DD). */
  date: string
  /** Injetado automaticamente pelo renderer (deriva de date). */
  year: string
}

/** Variáveis do wizard/flags, antes da injeção automática de date/year. */
export type InputVars = Omit<TemplateVars, 'date' | 'year'>

/** Um documento que o preset manda gerar. */
export interface PresetDoc {
  /** Template ref (sem `.hbs`), relativo à raiz de templates. Ex.: 'shared/README.md'. */
  template: string
  /** Caminho de saída relativo a `docs/`. Ex.: 'README.md'. */
  path: string
}

/** Preset declarativo (ADR 0007). Carregado e validado por src/presets/loader.ts. */
export interface Preset {
  /** Identificador usado em `--preset` e no select do wizard. Ex.: 'minimal'. */
  id: string
  /** Rótulo legível exibido no wizard. */
  label: string
  docs: PresetDoc[]
  /** Variáveis obrigatórias para gerar este preset (validadas no modo não-interativo). */
  requiredVars: string[]
}

/** Estratégia de conflito em docs/ existente (ADR 0005). */
export type ConflictStrategy = 'strict' | 'force' | 'merge'

// ---- loader (#18) ----

export interface LoaderOptions {
  /** Raiz do projeto do usuário (para override em .docseed/templates/). */
  cwd: string
  /** Raiz dos templates empacotados com o docseed. */
  bundledRoot: string
}

export interface LoadedTemplate {
  ref: string
  /** Caminho absoluto do arquivo .hbs usado. */
  path: string
  source: 'override' | 'bundled'
  content: string
}

/**
 * loader.ts (#18) deve exportar:
 *
 *   export function loadTemplate(ref: string, opts: LoaderOptions): LoadedTemplate
 *
 * Resolve e carrega o conteúdo bruto de um template. O override em
 * `.docseed/templates/` tem precedência sobre o bundled. Lança erro claro
 * se o ref não existir em nenhum dos dois locais.
 */

// ---- renderer (#19) ----

/**
 * renderer.ts (#19) deve exportar:
 *
 *   export function render(template: string, vars: InputVars): string
 *
 * Compila e renderiza o template Handlebars, injetando automaticamente
 * `date` (new Date().toISOString().slice(0, 10)) e `year`.
 */

// ---- conflict (#20) ----

export interface PlannedFile {
  /** Caminho de saída relativo a docs/. */
  output: string
  /** Caminho absoluto onde seria escrito. */
  absPath: string
}

export interface ConflictDecision {
  /** Arquivos a escrever. */
  toWrite: PlannedFile[]
  /** Arquivos existentes pulados (estratégia merge). */
  toSkip: PlannedFile[]
  /** Arquivos existentes que bloqueiam (estratégia strict). */
  conflicts: PlannedFile[]
}

/**
 * conflict.ts (#20) deve exportar:
 *
 *   export function resolveConflicts(
 *     planned: PlannedFile[],
 *     strategy: ConflictStrategy,
 *     exists: (absPath: string) => boolean,
 *   ): ConflictDecision
 *
 * Decide o que escrever conforme a estratégia, sem tocar no filesystem
 * (recebe o predicado `exists` para ser testável). Semântica:
 *   - strict: existentes -> conflicts; novos -> toWrite
 *   - force:  todos -> toWrite
 *   - merge:  existentes -> toSkip; novos -> toWrite
 */

// ---- writer + generate (#21) ----

export interface GenerateOptions {
  strategy: ConflictStrategy
  dryRun: boolean
  /** Raiz do projeto do usuário. Default: process.cwd(). */
  cwd?: string
  /** Raiz dos templates empacotados. Default: resolvido a partir do dist. */
  bundledRoot?: string
}

export interface GenerateSummary {
  created: string[]
  skipped: string[]
  conflicts: string[]
  dryRun: boolean
}
