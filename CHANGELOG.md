# Changelog

Todas as mudanças notáveis deste projeto são documentadas aqui.

O formato segue [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e o projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [Não lançado]

## [0.1.0-alpha.1] - 2026-06-09

Primeira série alpha publicada no npm (`npx docseed@alpha init`), com provenance via OIDC trusted publishing.

### Adicionado

- CLI `init` com os presets `minimal` e `mvp`, mais os comandos `add adr` e `presets`.
- Engine determinístico: loader (override por filesystem em `.docseed/templates/`), renderer Handlebars, resolução de conflitos (`strict`/`force`/`merge`) e writer.
- Geração de `LICENSE` na raiz quando o projeto é open source.
- Documentação inicial (README, PRD, ARCHITECTURE, ROADMAP, REFERENCES), ADRs 0001-0011 e estrutura de contribuição (templates de issue/PR, labels, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`).
