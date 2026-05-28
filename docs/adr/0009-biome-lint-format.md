# ADR 0009 — Biome para lint e format

- **Status:** Accepted
- **Data:** 2026-05-28

## Contexto

O projeto precisa de linting e formatação. O padrão histórico é ESLint + Prettier — duas ferramentas em JavaScript, com configuração dupla e desempenho lento em bases grandes.

## Opções consideradas

- **Biome** — ferramenta única em Rust que faz lint, format e import-sorting num só binário. 10-35x mais rápido, ~97% de compatibilidade com Prettier e linting type-aware (v2). Inclui comandos de migração assistida.
- **ESLint + Prettier** — ecossistema máximo de plugins, mas duas ferramentas, mais lento e com configuração separada.
- **Apenas Prettier** — resolve formatação, mas não substitui o lint.

## Decisão

Usar **Biome**, configurado via `biome.json`. `biome check` cobre lint + format + ordenação de imports.

## Consequências

**Positivas:**

- Uma ferramenta, uma configuração (`biome.json`), muito rápida.
- `biome check --write` aplica lint, format e import-sort de uma vez.
- Migração assistida (`biome migrate`) caso surja um setup ESLint/Prettier legado.

**Negativas:**

- Cobertura de regras type-aware e plugins específicos de framework ainda menor que a do ESLint — irrelevante para uma CLI sem framework.
- Plugins de terceiros limitados frente ao ecossistema ESLint.

## Referências

- <https://biomejs.dev>
- Guia de migração: <https://biomejs.dev/guides/migrate-eslint-prettier/>
