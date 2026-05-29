# docseed

CLI para gerar estrutura inicial de documentação de projetos, calibrada ao escopo.

## Por quê

O início de projeto é onde mais se perde tempo: muita coisa para decidir, muita coisa para documentar, fácil de se perder entre "demais" e "de menos". `docseed` resolve isso gerando templates prontos para preencher, baseados no tamanho do projeto.

## Instalação

```bash
pnpm dlx docseed init        # recomendado
# ou
npx docseed init             # alternativa
```

## Uso rápido

```bash
docseed init                       # wizard interativo
docseed init --preset mvp          # gera estrutura para MVP
docseed init --preset mvp --yes    # usa defaults sem perguntar
docseed init --dry-run             # mostra o que seria gerado, não escreve
docseed init --force               # sobrescreve arquivos existentes
docseed init --merge               # só cria arquivos que ainda não existem

docseed add adr "título da decisão"   # adiciona o próximo ADR a um projeto existente
```

## Presets

- `minimal` — projeto simples, doc essencial (3 docs)
- `mvp` — produto pequeno, validação (6 docs)
- `saas` — produto sério, múltiplos stakeholders _(em breve — Fase 2)_
- `enterprise` — projetos grandes, compliance _(em breve — Fase 2)_

> No MVP (v0.1) só `minimal` e `mvp` estão implementados.

## O que é gerado

Cada preset gera um conjunto de documentos prontos para preencher:

```text
minimal → README · GOALS · TASKS
mvp     → README · GOALS · TASKS · PRD · ARCHITECTURE · ROADMAP
```

Os documentos são gerados em **português (pt-BR)**. Se o projeto for open source, um arquivo `LICENSE` também é criado a partir da licença escolhida.

## Customizando templates

Para usar um template próprio no lugar do template do preset, crie o arquivo correspondente em `.docseed/templates/<nome>.hbs` na raiz do projeto. O `docseed` procura esse arquivo antes de cair para o template padrão — sem configuração necessária.

```bash
mkdir -p .docseed/templates
$EDITOR .docseed/templates/README.hbs   # sobrescreve só o README, mantém o resto do preset
```

## Documentação

- [Visão geral dos docs](docs/) — PRD, arquitetura, roadmap e referências
- [Decisões arquiteturais (ADRs)](docs/adr/)
- [Como contribuir](CONTRIBUTING.md)
- [Política de segurança](SECURITY.md)

## Status

Em desenvolvimento — alpha.

## Licença

[MIT](LICENSE) © veijdz
