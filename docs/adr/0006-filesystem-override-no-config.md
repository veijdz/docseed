# ADR 0006 — Override filesystem-first, sem config file no MVP

- **Status:** Accepted
- **Data:** 2026-05-28

## Contexto

Usuários vão querer customizar templates (ex.: um README próprio da empresa). É preciso decidir quando e como introduzir override, sem pintar o engine num canto que force refactor depois.

## Opções consideradas

- **Filesystem-first** — o engine procura `.docseed/templates/<arquivo>.hbs` no projeto antes de cair para o template do preset. Override por nome de arquivo, zero configuração.
- **Config-first (`docseed.config.mjs` desde o MVP)** — declara overrides e presets custom num arquivo. Flexível, mas exige escrever código de config já no MVP.
- **Sem override (fork-only)** — mais simples, mas hostil à customização.

## Decisão

No MVP, apenas **descoberta por filesystem** (`.docseed/templates/`). O config file (`docseed.config.mjs`) fica reservado para a Fase 3, com formato já pré-decidido para evitar refactor.

## Consequências

**Positivas:**

- Zero linhas de código de config no MVP.
- Override por nome de arquivo é um modelo mental trivial.
- Caminho de evolução claro: o config file entra de forma aditiva depois, sem breaking change.
- Habilitado pela separação template/código (ver ADR [0007](0007-declarative-presets-separated-templates.md)).

**Negativas:**

- Custom presets e variáveis adicionais não são possíveis até a Fase 3.
- A convenção `.docseed/templates/` precisa ser documentada para ser descoberta pelos usuários.
