# Arquitetura — docseed

## Stack

- **Runtime:** Node.js 24+
- **Linguagem:** TypeScript
- **Package manager:** pnpm (campo `packageManager` no `package.json`)
- **CLI:** `commander` (parsing de args) + `@clack/prompts` (UX do wizard)
- **Templates:** Handlebars
- **Bundle:** `tsup`
- **Distribuição:** npm registry, executável via `pnpm dlx docseed` (primário) ou `npx docseed`

## Estrutura de pastas

```
docseed/
├── src/
│   ├── commands/        # init (MVP), add+sync (Fase 2)
│   ├── presets/         # configs JSON declarativas de cada preset
│   ├── engine/          # render de templates, resolução de override
│   └── utils/
├── templates/           # arquivos .hbs (fora do código)
│   ├── shared/          # docs que todo preset usa
│   ├── portfolio/
│   ├── mvp/
│   ├── saas/            # Fase 2
│   └── enterprise/      # Fase 2
└── tests/
```

## Decisões principais

### Templates separados do código

Ficam em `templates/`, podem evoluir sem mexer no engine. Facilita também customização futura via filesystem override.

### Presets como JSON declarativo

Cada preset define quais docs gerar e quais perguntas fazer no wizard. Adicionar preset novo = adicionar JSON + templates.

### Sem AI no MVP

Tudo determinístico, roda offline, sem dependência externa.

### Output em `docs/`

Convenção universal, fácil de versionar.

### Wizard mínimo (dimensões B)

Wizard pergunta: `projectName`, `author`, `shortDescription`, `preset`, `isOpenSource`, `projectType`, `license` (só se open source). Total: 6-7 perguntas. Modo `--yes` usa defaults sensatos para todas.

Dimensões adicionais (team size, compliance, has external users) ficam para Fase 2+ quando feedback real justificar.

### Estratégia de conflito em `docs/` existente: strict

Se algum arquivo conflitaria, comando aborta e lista files conflitantes. Flags:

- `--force` — sobrescreve tudo
- `--merge` — só escreve files que não existem (skip existing)
- `--dry-run` — preview sem escrever

Sem prompt interativo no MVP (CI-friendly, comportamento previsível).

### Override de templates: filesystem-first

MVP: engine procura `.docseed/templates/<filename>.hbs` no projeto antes de cair para o template do preset. Override por nome de arquivo, zero config necessária.

Fase 3: opcionalmente adiciona `docseed.config.mjs` para custom presets, vars adicionais, hooks. Formato pré-reservado para evitar refactor.

### Variáveis do template

| Variável           | Origem                                        |
| ------------------ | --------------------------------------------- |
| `projectName`      | wizard                                        |
| `author`           | wizard                                        |
| `shortDescription` | wizard                                        |
| `preset`           | wizard                                        |
| `isOpenSource`     | wizard                                        |
| `projectType`      | wizard (web / cli / library / mobile / other) |
| `license`          | wizard (condicional: só se `isOpenSource`)    |
| `date`             | `new Date().toISOString().slice(0,10)`        |
| `year`             | derivado de `date`                            |

### Distribuição

npm registry como canal único. `pnpm dlx` e `npx` resolvem do mesmo lugar. Binários standalone (pkg/sea/bun) ficam para Fase 4 se demanda surgir.
