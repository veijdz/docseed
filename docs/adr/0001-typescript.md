# ADR 0001 — TypeScript como linguagem

- **Status:** Accepted
- **Data:** 2026-05-28

## Contexto

docseed é uma CLI distribuída via npm, mantida por longo prazo, com um contrato de preset que outros vão consumir e estender. Precisa de refactors seguros e boa DX. Escolha entre TypeScript e JavaScript puro.

## Opções consideradas

- **TypeScript** — tipagem estática, autocomplete, erros em compile-time, contrato de preset tipável. Custo: build step e configuração.
- **JavaScript puro (+ JSDoc)** — zero build, mais simples para começar. Custo: sem garantias de tipo, refactors arriscados, JSDoc verboso para tipos complexos.

## Decisão

Usar **TypeScript**, compilado via `tsup` para CJS + ESM.

## Consequências

**Positivas:**

- Refactors seguros e autocomplete em todo o código.
- Schema de preset vira tipo TS reutilizável (validável em runtime + compile-time).
- Sinaliza maturidade ao público (devs esperam tipos numa lib moderna).

**Negativas:**

- Build step obrigatório (`tsup` já está na stack, custo baixo).
- Contribuidores precisam saber TypeScript.
