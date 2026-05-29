# Roadmap — docseed

## Como ler este roadmap

Dois eixos independentes:

- **Fases** descrevem _o que_ é construído (etapas de desenvolvimento).
- **Versões** seguem [semver](https://semver.org) e descrevem o _contrato de estabilidade_.

O mapeamento fase↔versão abaixo é **aproximado**: uma fase pode abranger várias releases (`0.1.0-alpha`, `0.1.0`, `0.1.1`...).

**Semver pré-1.0:** enquanto em `0.x`, mudanças minor (`0.1` → `0.2`) podem incluir breaking changes — esperado e sinalizado no CHANGELOG. A partir de `1.0.0`, breaking changes exigem major bump (`2.0`).

---

## Fase 1 — MVP (~v0.1.x)

- Estrutura base do projeto (TS 6 + tsdown + Biome + pnpm)
- Comando `init` com wizard interativo (6-7 perguntas)
- 2 presets funcionando: `portfolio` e `mvp`
- 6 templates Markdown básicos com variáveis (README, PRD, ARCHITECTURE, ROADMAP, TASKS, GOALS)
- Override de templates por filesystem (`.docseed/templates/`)
- Modo não-interativo via `--yes` + flags
- Estratégia strict de conflito: `--force` / `--merge` / `--dry-run`
- Suite de testes (engine + snapshot por preset)
- Publicar primeira versão alpha no npm (`0.1.0-alpha`)

**Critério de saída:** rodar `pnpm dlx docseed init` num diretório vazio e ter docs prontas para preencher, idênticas em estrutura ao que produzimos manualmente.

## Fase 2 — Expansão (~v0.2.x)

- Presets `saas` e `enterprise`
- Comando `add` (adicionar ADR, feature, bug spec incremental)
- Comando `sync` (valida estrutura existente, aponta gaps por preset)

## Fase 3 — Customização (~v0.3.x)

- Config file `docseed.config.mjs` (custom presets, vars adicionais, hooks)
- Override formal por config (não só por filesystem)
- Documentação de "como criar seu próprio preset"

---

## Marco 1.0.0 — Estabilidade

`1.0.0` não é "mais features" — é o compromisso de **não quebrar o que já existe**. Declarado quando a superfície pública está estável e battle-tested.

**Critérios para 1.0:**

- [ ] Comando `init` estável (flags e comportamento congelados)
- [ ] Presets `portfolio`, `mvp` e `saas` sólidos e validados em uso real; `enterprise` disponível
- [ ] Contrato de preset (schema JSON) estável
- [ ] Formato de override (`.docseed/templates/` + `docseed.config.mjs`) settled
- [ ] Cobertura de testes adequada (engine + snapshot + e2e)
- [ ] Documentação completa (README, guia de presets, contributing)

**Compromisso pós-1.0:** breaking changes na CLI ou no contrato de preset só acontecem em major bump (`2.0`).

---

## Fase 4 — Pós-1.0 (~v1.x)

Features aditivas sobre a base estável. Cada item é um minor (`1.1`, `1.2`...).

- Export para GitHub Issues (TASKS → issues)
- Integração Linear / Jira
- Geração assistida por AI (opt-in)
- Binários standalone via pkg/sea/bun build (se demanda real surgir)
- Comando `docseed audit` (analisa `docs/` existente, sugere o que falta)
