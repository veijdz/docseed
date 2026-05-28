# ADR 0004 — pnpm como package manager

- **Status:** Accepted
- **Data:** 2026-05-28

## Contexto

Escolha do package manager para o desenvolvimento do docseed. A distribuição permanece via npm registry, de forma independente desta decisão.

## Opções consideradas

- **pnpm** — store content-addressable, install rápido, disk-efficient, `node_modules` estrito (evita phantom dependencies).
- **npm** — default e universal, mas mais lento e com `node_modules` flat que permite phantom deps.
- **yarn (berry)** — rápido, mas PnP gera atrito com algumas ferramentas do ecossistema.

## Decisão

Usar **pnpm**. O `package.json` declara `packageManager: "pnpm@<v>"` e o `pnpm-lock.yaml` é versionado.

## Consequências

**Positivas:**

- Install rápido com store compartilhado entre projetos.
- `node_modules` estrito pega phantom imports cedo.
- `corepack` habilita pnpm sem install global.

**Negativas:**

- Contribuidores precisam de pnpm (mitigado por `corepack`).
- A distribuição continua via **npm registry**: `pnpm publish` publica no mesmo lugar, e usuários rodam `pnpm dlx docseed` ou `npx docseed` indiferentemente.
