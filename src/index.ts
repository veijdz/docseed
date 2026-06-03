#!/usr/bin/env node
import { buildProgram } from './cli'

buildProgram()
  .parseAsync()
  .catch((err) => {
    console.error(err instanceof Error ? err.message : err)
    process.exitCode = 1
  })
