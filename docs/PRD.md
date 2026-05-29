# PRD — docseed

## Problema

Iniciar um projeto novo trava no planejamento: o dev sabe que precisa documentar, mas não sabe _o quê_ nem _quanto_. Resultado: documenta demais (overhead) ou de menos (perde contexto depois). Esse "limbo" consome dias de produtividade no momento mais frágil do projeto.

## Solução

CLI que gera **templates de documentação calibrados ao escopo do projeto**, prontos para preencher. O dev pula a etapa de "decidir o que documentar" e vai direto para "preencher o quê".

## Usuários-alvo

- Devs solo iniciando side projects
- Times pequenos iniciando produtos
- Tech leads que querem padronizar início de projetos

## Por que docseed e não X?

Mercado existente:

| Tool                                   | Foco                                            | Por que não cobre                                                            |
| -------------------------------------- | ----------------------------------------------- | ---------------------------------------------------------------------------- |
| `plop` / `hygen`                       | Geradores genéricos (qualquer file scaffolding) | Sem opinião sobre _quais_ docs gerar. User precisa montar templates do zero. |
| `yeoman`                               | Generators full-stack (app inteira)             | Foco em código, não doc. Overengineer para problema.                         |
| `degit`                                | Clone de template repo                          | Estático. Sem wizard, sem calibração por escopo.                             |
| `create-react-app` / `create-next-app` | Stack-specific scaffolding                      | Stack-bound. Não cobre doc structure.                                        |
| `adr-tools`                            | Só ADRs                                         | Escopo único. Não cobre README/PRD/ARCH/etc.                                 |

**Wedge docseed:** opinião curada sobre _quais_ docs cada tamanho de projeto precisa, fundamentada em referências consolidadas (Shape Up, ADR, arc42, C4, Diátaxis). Não compete em features de templating — compete em **opinião editorial** sobre doc structure.

## Escopo MVP (v0.1)

- Comando `init` com wizard interativo (6-7 perguntas)
- Comando `add adr` — adiciona o próximo ADR sequencial a um projeto existente (uso recorrente, cria hábito de voltar à ferramenta)
- 2 presets funcionando: `minimal`, `mvp`
- Templates Markdown editáveis localmente, gerados em **pt-BR** (ver ADR 0010)
- Geração de arquivo `LICENSE` quando o projeto é open source, a partir da `license` escolhida (ver ADR 0011)
- Override de templates por filesystem (`.docseed/templates/<arquivo>.hbs`), sem config file
- Variáveis substituídas no render: vindas do wizard (projectName, author, shortDescription, preset, isOpenSource, projectType e license — esta só se open source) mais as derivadas no render (date, year)
- Conflito de `docs/` existente: estratégia strict (abort + flags `--force` / `--merge` / `--dry-run`)
- Modo não-interativo via `--yes` + flags

## Não-escopo (MVP)

- Comando `add` completo (feature, bug spec) e `sync` (Fase 2) — só `add adr` entra no MVP
- Presets `saas` e `enterprise` (Fase 2)
- Templates customizáveis pelo user via config file (Fase 3, formato pré-decidido: `docseed.config.mjs`)
- Integração com GitHub/Linear/Jira (Fase 4)
- Geração assistida por AI (Fase 4)
- Binários standalone (Fase 4)
- Internacionalização (templates em inglês) — fase futura planejada, ver ADR 0010
- GUI ou interface web

## Métrica de sucesso

Reduzir o tempo de "decidir como documentar → estrutura pronta para preencher" para menos de 5 minutos.
