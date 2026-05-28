# Contribuindo com o docseed

Obrigado pelo interesse. Este guia cobre setup, fluxo de trabalho e convenções.

## Setup de desenvolvimento

Pré-requisitos: Node.js 24+ e pnpm (via corepack).

```bash
corepack enable
pnpm install
pnpm build
pnpm test
```

Para testar a CLI localmente:

```bash
pnpm link --global
docseed init        # rode em um diretório de teste
```

## Fluxo de trabalho

1. Abra ou escolha uma issue. Tasks normalmente pertencem a um épico.
2. Crie um branch a partir de `main`: `git checkout -b <tipo>/<descrição-curta>`.
3. Faça commits atômicos (ver abaixo).
4. Abra um PR contra `main`, referenciando a issue (`Closes #123`).

## Convenção de commits

- **Atômicos:** um commit é uma mudança lógica. Nunca um commit "bomba" com tudo junto.
- **Conventional Commits:** `type: subject` em minúsculas.
  - Tipos: `feat`, `fix`, `docs`, `chore`, `test`, `refactor`.
  - Exemplos: `feat(engine): add conflict resolver`, `docs: add 0008 ADR`.
- Subject em imperativo, idealmente ≤ 50 caracteres.

## Decisões arquiteturais (ADRs)

Decisões significativas viram um ADR em [`docs/adr/`](docs/adr/), no formato MADR-lite. Ao propor uma mudança arquitetural, inclua o ADR no PR. Veja o [índice](docs/adr/README.md).

## Adicionando um preset

Um preset é um JSON declarativo em `src/presets/` mais templates `.hbs` em `templates/` (ver ADR [0007](docs/adr/0007-declarative-presets-separated-templates.md)). Um guia detalhado virá na Fase 3.

## Labels

O esquema de labels está em [`.github/labels.yml`](.github/labels.yml): tipo (`epic`, `task`, `bug`, ...), área (`area:*`) e meta (`blocked`, `needs-triage`).
