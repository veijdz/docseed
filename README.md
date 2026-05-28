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
```

## Presets disponíveis

- `portfolio` — landing, portfólio pessoal (3 docs)
- `mvp` — produto pequeno, validação (6 docs)
- `saas` — produto sério, múltiplos stakeholders (10+ docs)
- `enterprise` — projetos grandes, compliance (15+ docs)

> No MVP (v0.1) só `portfolio` e `mvp` estão implementados. `saas` e `enterprise` entram na Fase 2.

## Status

Em desenvolvimento — alpha.
