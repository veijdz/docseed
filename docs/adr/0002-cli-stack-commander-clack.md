# ADR 0002 — CLI stack: commander + @clack/prompts

- **Status:** Accepted
- **Data:** 2026-05-28

## Contexto

A CLI tem dois sub-problemas distintos: parsing de argumentos (flags, subcomandos como `init`) e wizard interativo (perguntas calibradas ao preset). Precisa suportar tanto modo interativo quanto não-interativo (`--yes` + flags).

## Opções consideradas

- **commander (args) + @clack/prompts (wizard)** — bibliotecas leves e focadas, composáveis. @clack tem UX moderna (spinners, grupos, cancel handling) e bundle pequeno.
- **oclif** — framework completo (Salesforce). Poderoso, mas pesado, opinativo e gera boilerplate desproporcional para o escopo.
- **yargs + inquirer** — maduros, mas inquirer é verboso e tem UX datada.
- **cac / sade** — minimalistas, ecossistema menor e menos exemplos.

## Decisão

Usar **commander** para parsing de argumentos e **@clack/prompts** para a UX do wizard.

## Consequências

**Positivas:**

- commander é padrão de fato, com documentação e exemplos abundantes.
- @clack entrega UX moderna com bundle enxuto.
- Os dois coexistem bem com o modo não-interativo: commander parseia flags; o wizard (clack) só roda para preencher o que faltou (ver ADR [0005](0005-strict-conflict-strategy.md) para flags relacionadas).

**Negativas:**

- Duas dependências em vez de um framework único.
- @clack/prompts atingiu o 1.x com API estável; resta a ressalva menor de comunidade ainda menor que a do inquirer.
