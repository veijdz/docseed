import { execSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const repoRoot = fileURLToPath(new URL('..', import.meta.url))

// Build the binary once for the whole run; the e2e suites assume dist/index.mjs exists.
export default function setup() {
  execSync('pnpm -s build', { cwd: repoRoot, stdio: 'ignore' })
}
