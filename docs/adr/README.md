# Architecture Decision Records

Decisões arquiteturais do docseed, em formato MADR-lite (baseado em [MADR](https://adr.github.io)). Uma decisão por arquivo.

| ADR                                                     | Decisão                                        | Status   |
| ------------------------------------------------------- | ---------------------------------------------- | -------- |
| [0001](0001-typescript.md)                              | TypeScript como linguagem                      | Accepted |
| [0002](0002-cli-stack-commander-clack.md)               | CLI stack: commander + @clack/prompts          | Accepted |
| [0003](0003-handlebars-template-engine.md)              | Handlebars como template engine                | Accepted |
| [0004](0004-pnpm-package-manager.md)                    | pnpm como package manager                      | Accepted |
| [0005](0005-strict-conflict-strategy.md)                | Estratégia strict de conflito em `docs/`       | Accepted |
| [0006](0006-filesystem-override-no-config.md)           | Override filesystem-first, sem config no MVP   | Accepted |
| [0007](0007-declarative-presets-separated-templates.md) | Presets JSON declarativo + templates separados | Accepted |
| [0008](0008-tsdown-bundler.md)                          | tsdown como bundler                            | Accepted |
| [0009](0009-biome-lint-format.md)                       | Biome para lint e format                       | Accepted |

**Status possíveis:** Proposed, Accepted, Deprecated, Superseded.

Ao adicionar um ADR novo: copie a estrutura de um existente, use o próximo número sequencial e adicione a linha na tabela acima.

A seção `## Referências` (links externos) é opcional — inclua quando a decisão se apoiar em fontes que valham registro.
