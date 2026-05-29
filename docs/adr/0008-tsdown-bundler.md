# ADR 0008 — tsdown como bundler

- **Status:** Accepted
- **Data:** 2026-05-28

## Contexto

O código TypeScript precisa ser empacotado para `dist/`: dual ESM + CJS, geração de `.d.ts` e preservação do shebang do binário. A escolha original (`tsup`) entrou em manutenção lenta, e o ecossistema migra para bundlers baseados em [Rolldown](https://rolldown.rs).

## Opções consideradas

- **tsdown** — sucessor espiritual do tsup, powered by Rolldown (Rust). 3-10x mais rápido, gera `.d.ts` e dual format out-of-the-box, migração trivial vinda do tsup. Evan You (Vite) sinaliza como caminho de longo prazo.
- **tsup** — esbuild, maduro e com a maior comunidade, mas manutenção estagnada.
- **unbuild** — usado pelo ecossistema UnJS, baseado em Rollup, exige mais configuração.
- **Rollup puro** — máxima flexibilidade, mas muito boilerplate para uma CLI.
- **`tsc` apenas** — sem bundle (múltiplos arquivos), sem tree-shaking.

## Decisão

Usar **tsdown**, configurado via `tsdown.config.ts`.

## Consequências

**Positivas:**

- Build rápido (Rolldown); `.d.ts` + dual ESM/CJS + shebang sem configuração extra.
- Alinhado ao futuro do ecossistema (Vite migrando para Rolldown).
- Configuração mínima.

**Negativas:**

- Projeto ainda pré-1.0 (v0.22.x em maio/2026) — breaking changes são esperados na faixa `0.x`; comunidade menor que a do tsup.
- Rolldown ainda está amadurecendo (o core já chegou ao 1.0, mas o tsdown que o embrulha não).

## Referências

- <https://tsdown.dev>
- <https://github.com/rolldown/tsdown>
- Guia de migração: <https://tsdown.dev/guide/migrate-from-tsup>
