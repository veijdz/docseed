# ADR 0003 — Handlebars como template engine

- **Status:** Accepted
- **Data:** 2026-05-28

## Contexto

Os templates `.hbs` precisam de substituição de variáveis e de conditionals — por exemplo, incluir um bloco apenas quando `isOpenSource`, ou variar conteúdo por `projectType`. A escolha do engine define o teto de expressividade dos templates.

## Opções consideradas

- **Handlebars** — logic-less com helpers; suporta conditionals, loops e partials. Maduro e amplamente usado.
- **Mustache** — logic-less puro, menor, mas conditionals limitados (dificulta as dimensões do wizard).
- **Eta / EJS** — permitem JS embutido. Poderoso demais; risco de templates virarem código difícil de manter.
- **String replace nativo** — zero dependência, mas sem conditionals — a dimensão `isOpenSource` exigiria hacks.

## Decisão

Usar **Handlebars**.

## Consequências

**Positivas:**

- Conditionals nativos cobrem as dimensões (`isOpenSource`, `projectType`) sem hacks.
- Partials habilitam trechos compartilhados entre presets (ver ADR [0007](0007-declarative-presets-separated-templates.md)).
- Ecossistema grande e estável.

**Negativas:**

- Overhead frente a string replace para templates triviais (aceitável).
- Sintaxe `{{ }}` exige escape em docs que falam sobre os próprios templates (caso raro).

> **Reavaliar:** se os templates permanecerem triviais (poucas variáveis, sem conditionals), mustache ou string replace bastariam. Os conditionals das dimensões já justificam Handlebars hoje.
