# ADR 0010 — Idioma dos templates: pt-BR no MVP

- **Status:** Accepted
- **Data:** 2026-05-29

## Contexto

Os documentos gerados pelo docseed precisam sair num idioma. A documentação do projeto e o público inicial (devs e times no Brasil) são em português, mas a terminologia técnica (nomes de variáveis, presets, metodologias) é em inglês. É preciso decidir em que idioma os templates `.hbs` gerados saem, sem fechar a porta para alcance global no futuro.

## Opções consideradas

- **pt-BR fixo no MVP** — templates em português. Posiciona o docseed como a primeira CLI de scaffold de docs pensada para times que documentam em português — diferencial de nicho menos copiável. Limita o mercado inicial ao público lusófono.
- **Inglês fixo** — alcance global no npm desde o início, mas exige migrar a documentação pública e dilui o diferencial; compete de frente com qualquer template repo em inglês.
- **Flag `--lang` desde o MVP** — suporta os dois, mas dobra o custo de manutenção de templates antes de validar a demanda.

## Decisão

No MVP, os templates gerados saem **em pt-BR**, fixo. A expansão para inglês (provavelmente via `--lang`, formato a decidir) fica reservada para uma fase futura, depois que a base estiver estável e validada — mesma lógica aditiva do config file (ver ADR [0006](0006-filesystem-override-no-config.md)).

## Consequências

**Positivas:**

- Diferencial de nicho real: scaffold de docs em português é território pouco coberto.
- Escopo enxuto: um só conjunto de templates para manter no MVP.
- Caminho de evolução claro: `--lang en` entra de forma aditiva, sem breaking change.

**Negativas:**

- Alcance global limitado até a internacionalização chegar.
- Nome e descrição do pacote em pt-BR reduzem a descoberta por público anglófono (aceitável enquanto o foco é o nicho lusófono).
- Internacionalização deixa de ser não-escopo permanente e passa a ser trabalho futuro planejado.
