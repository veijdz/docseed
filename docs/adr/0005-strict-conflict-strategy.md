# ADR 0005 — Estratégia strict de conflito em `docs/`

- **Status:** Accepted
- **Data:** 2026-05-28

## Contexto

Ao rodar `docseed init`, a pasta `docs/` pode já conter arquivos. Sobrescrever sem critério arrisca destruir trabalho do usuário. Precisa de um comportamento padrão seguro que também funcione em automação/CI.

## Opções consideradas

- **Strict (abort + flags)** — se houver conflito, aborta e lista os arquivos; `--force`, `--merge` e `--dry-run` dão controle explícito.
- **Interactive** — pergunta por conflito (estilo yeoman). Mais amigável para humano, mas exige `--yes` em CI e adiciona código.
- **Backup** — renomeia `docs/` para `docs.bak.{timestamp}/` e escreve por cima. Zero perda, mas polui o filesystem e o git.

## Decisão

Usar a estratégia **strict**. Por padrão, aborta com erro listando os conflitos. Flags:

- `--force` — sobrescreve tudo
- `--merge` — só cria arquivos que ainda não existem (skip existing)
- `--dry-run` — preview, não escreve nada

## Consequências

**Positivas:**

- Zero perda de dados por padrão (fail-safe).
- CI-friendly: comportamento determinístico, sem prompt bloqueante.
- Padrão familiar (degit, cookiecutter).

**Negativas:**

- O usuário precisa ler o erro para descobrir o próximo passo.
- Sem resolução por-arquivo no MVP (`--merge` decide por existência, não interativamente). Um modo interativo pode ser adicionado em fase futura se houver demanda.
