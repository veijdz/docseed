# ADR 0011 — Geração de arquivo LICENSE

- **Status:** Accepted
- **Data:** 2026-05-29

## Contexto

O wizard coleta a variável `license` (condicional a `isOpenSource`). Faltava decidir o destino dela: gerar um arquivo `LICENSE` real no projeto do usuário, ou apenas mencioná-la no README gerado. Sem decisão, a variável ficava meio-implementada.

## Opções consideradas

- **Gerar arquivo `LICENSE`** — quando `isOpenSource`, o docseed escreve um `LICENSE` com o texto da licença escolhida (MIT, Apache-2.0, GPL-3.0). É o que devs esperam de um scaffold; alinha com o Standard Readme (seção License).
- **Só menção no README** — `license` vira apenas uma linha no README gerado. Mais simples, mas deixa o projeto sem o arquivo de licença que o GitHub e o npm reconhecem.
- **Não perguntar `license` no MVP** — remove a dimensão até haver demanda. Reduz escopo, mas perde uma necessidade real e comum.

## Decisão

Quando `isOpenSource` for verdadeiro, **gerar um arquivo `LICENSE`** no projeto a partir do texto da licença escolhida. A `license` também é referenciada no README gerado. Quando `isOpenSource` for falso, nenhum `LICENSE` é gerado e a pergunta não aparece no wizard.

## Consequências

**Positivas:**

- A variável `license` tem destino claro e útil; o projeto gerado fica completo (GitHub e npm reconhecem o `LICENSE`).
- Coerente com o Standard Readme adotado nas referências.

**Negativas:**

- O docseed precisa embarcar os textos das licenças suportadas (MIT, Apache-2.0, GPL-3.0) como templates.
- O modo `--yes` precisa ser coerente: hoje define `isOpenSource=false` + `license=MIT`. Com esta decisão, ou `--yes` assume `isOpenSource=true` para justificar o `LICENSE`, ou não gera `LICENSE` quando `isOpenSource=false` (a definir na implementação do wizard, issues #14/#15).
