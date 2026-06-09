import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadTemplate } from './engine/loader'
import { render } from './engine/renderer'
import { toKebabCase } from './utils/env'

export interface AddAdrOptions {
  /** Raiz do projeto do usuário. Default: process.cwd(). */
  cwd?: string
  /** Raiz dos templates empacotados. Default: resolvido a partir do dist. */
  bundledRoot?: string
}

export interface AddAdrResult {
  /** Número sequencial com 4 dígitos (ex.: '0003'). */
  number: string
  /** Slug do título (kebab-case). */
  slug: string
  /** Caminho do ADR gerado, relativo ao cwd. */
  path: string
  /** Caminho do índice, relativo ao cwd. */
  indexPath: string
  /** Se o índice foi criado agora (não existia). */
  indexCreated: boolean
}

const STATUS = 'Proposed'

/** Maior NNNN existente em docs/adr/ + 1; '0001' se a pasta não existir ou estiver vazia. */
function nextNumber(adrDir: string): string {
  let max = 0
  if (existsSync(adrDir)) {
    for (const name of readdirSync(adrDir)) {
      const match = /^(\d{4})-.+\.md$/i.exec(name)
      if (match) {
        const n = Number.parseInt(match[1] ?? '0', 10)
        if (n > max) max = n
      }
    }
  }
  return String(max + 1).padStart(4, '0')
}

/**
 * Insere `row` no fim do bloco contíguo da tabela principal. Ancora na linha
 * separadora do cabeçalho e insere após a última linha consecutiva que começa
 * com `|`; sem separador, faz append no fim do arquivo.
 */
function insertRow(content: string, row: string): string {
  const lines = content.split('\n')
  let separator = -1
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? ''
    if (/^\s*\|?\s*-{3,}/.test(line) || line.includes('| --- |')) {
      separator = i
      break
    }
  }
  if (separator === -1) {
    return `${content.trimEnd()}\n\n${row}\n`
  }
  let last = separator
  for (let i = separator + 1; i < lines.length; i++) {
    if (lines[i]?.trimStart().startsWith('|')) last = i
    else break
  }
  lines.splice(last + 1, 0, row)
  return lines.join('\n')
}

/**
 * Adiciona o próximo ADR sequencial em docs/adr/, renderizando o template
 * MADR-lite e atualizando o índice (README.md), que é criado se não existir.
 */
export function addAdr(title: string, opts: AddAdrOptions = {}): AddAdrResult {
  const cwd = opts.cwd ?? process.cwd()
  const bundledRoot = opts.bundledRoot ?? fileURLToPath(new URL('../templates', import.meta.url))

  const trimmed = title.trim()
  const slug = toKebabCase(trimmed)
  if (!slug) {
    throw new Error(`Invalid ADR title '${title}': produces an empty slug.`)
  }

  const adrDir = resolve(cwd, 'docs', 'adr')
  const number = nextNumber(adrDir)
  const fileName = `${number}-${slug}.md`

  const bodyTpl = loadTemplate('shared/adr.md', { cwd, bundledRoot })
  const body = render(bodyTpl.content, { number, title: trimmed, slug, status: STATUS })
  mkdirSync(adrDir, { recursive: true })
  const destination = resolve(adrDir, fileName)
  if (existsSync(destination)) {
    throw new Error(`ADR file already exists: docs/adr/${fileName}`)
  }
  writeFileSync(destination, body, 'utf8')

  const indexAbs = resolve(adrDir, 'README.md')
  let indexCreated = false
  let indexContent: string
  if (existsSync(indexAbs)) {
    indexContent = readFileSync(indexAbs, 'utf8')
  } else {
    indexContent = render(loadTemplate('shared/adr-index.md', { cwd, bundledRoot }).content, {})
    indexCreated = true
  }
  const row = `| [${number}](${fileName}) | ${trimmed.replaceAll('|', '\\|')} | ${STATUS} |`
  writeFileSync(indexAbs, insertRow(indexContent, row), 'utf8')

  return {
    number,
    slug,
    path: `docs/adr/${fileName}`,
    indexPath: 'docs/adr/README.md',
    indexCreated,
  }
}
