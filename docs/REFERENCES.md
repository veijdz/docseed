# Referências & Metodologias — docseed

Este documento reúne as referências, padrões e metodologias que fundamentam a estrutura de documentação gerada pelo `docseed`. Cada metodologia abaixo explica _por que_ um determinado documento existe em um preset — por exemplo, por que o preset `mvp` inclui um PRD em formato de pitch, ou por que `enterprise` adiciona ADRs e RFCs.

**Como usar este documento:**

- Quer entender a base de uma decisão de design? Vá direto à seção da metodologia correspondente.
- Quer ver como os presets mapeiam para cada metodologia? Veja a tabela [Mapeamento por Preset](#mapeamento-por-preset-do-docseed).
- Quer estudar os fundamentos a fundo? Veja [Leitura recomendada](#leitura-recomendada) ao final.

Para a tradução dessas metodologias em decisões concretas de stack e arquitetura, veja [`ARCHITECTURE.md`](./ARCHITECTURE.md).

---

## 1. ADR — Architecture Decision Records

**Origem:** Michael Nygard, blog post "Documenting Architecture Decisions" (2011).

**O quê:** Documentos curtos que capturam uma decisão arquitetural importante, com seu contexto e consequências.

**Por quê existe:** Ninguém lê documentos grandes, mas não saber o racional por trás de decisões arquiteturais pode levar a problemas sérios quando decisões posteriores acabam invalidando as anteriores. ADR resolve isso documentando _uma decisão por arquivo_, em formato leve.

**Estrutura clássica (Nygard):**

- **Title** — descritivo, geralmente no nome do arquivo
- **Status** — proposed, accepted, rejected, deprecated, superseded
- **Context** — motivação ou problema que levou à decisão
- **Decision** — o que será feito
- **Consequences** — efeitos positivos e negativos

**Variações:**

- **MADR** (Markdown ADR) — adiciona análise de tradeoffs e opções consideradas
- **Y-Statement** — formato de uma frase: "In the context of _X_, facing _concern_, we decided for _option_ to achieve _quality_, accepting _downside_"

**Links:**

- Catálogo completo: <https://adr.github.io>
- Repositório de templates: <https://github.com/joelparkerhenderson/architecture-decision-record>
- Tooling: `adr-tools` (Nat Pryce)

---

## 2. arc42 — Template de Arquitetura

**Origem:** Dr. Gernot Starke e Dr. Peter Hruschka, 2005. Open source.

**O quê:** Template estruturado em 12 seções para documentar arquitetura de software, agnóstico de tecnologia.

**As 12 seções:**

1. Introduction and Goals
2. Constraints
3. Context and Scope
4. Solution Strategy
5. Building Block View
6. Runtime View
7. Deployment View
8. Crosscutting Concepts
9. Architecture Decisions (geralmente ADRs linkados)
10. Quality Requirements
11. Risks and Technical Debt
12. Glossary

**Filosofia importante:** Trate como compartimentos de um armário — o armário tem valor mesmo com compartimentos vazios. Não é obrigatório preencher tudo. Adapte ao tamanho do projeto.

**Quando usar no docseed:**

- Subset (seções 1, 3, 4, 9) → tier `mvp`
- Subset expandido (1, 3, 4, 5, 9, 11) → tier `saas`
- Completo → tier `enterprise`

**Links:**

- Site oficial: <https://arc42.org>
- Documentação: <https://docs.arc42.org>
- Template no GitHub: <https://github.com/arc42/arc42-template>

---

## 3. C4 Model — Diagramas de Arquitetura

**Origem:** Simon Brown, 2006–2011. Inspirado em UML e no modelo "4+1" de Kruchten.

**O quê:** Abordagem hierárquica para diagramar arquitetura em 4 níveis de abstração, do mais amplo ao mais detalhado.

**Os 4 níveis:**

1. **Context** — o sistema no ambiente (usuários, sistemas externos)
2. **Container** — apps, APIs, bancos, file systems
3. **Component** — módulos dentro de cada container
4. **Code** — classes, funções (opcional, raramente mantido)

**Diagramas suplementares:** Dynamic View, Deployment View, System Landscape.

**Por que importa:** Mais leve que UML, mais estruturado que diagramas ad-hoc. Padronizou comunicação visual de arquitetura na indústria.

**Complemento natural:** Usado em conjunto com arc42 (preenche a seção 5 — Building Block View).

**Links:**

- Site oficial: <https://c4model.com>
- Tooling: Structurizr (do próprio Simon Brown), também suportado em Mermaid e PlantUML

---

## 4. Shape Up — Metodologia (Basecamp)

**Origem:** Ryan Singer, livro _Shape Up: Stop Running in Circles and Ship Work that Matters_ (2019). Publicado gratuitamente online pela Basecamp.

**O quê:** Metodologia alternativa a Scrum/Kanban, baseada em ciclos de 6 semanas, "shaping" prévio do trabalho, e "betting" ao invés de backlog.

**Conceitos-chave:**

- **Appetite (não estimate)** — quanto tempo _queremos_ gastar nisso, não quanto _vai_ custar. Fixed time, variable scope.
- **Shaping** — trabalho de pré-produção: definir problema, esboçar solução, identificar rabbit holes, antes de comprometer o time.
- **Pitch** — documento final do shaping. Os 5 ingredientes:
  - **Problem** — definição específica, idealmente uma história concreta
  - **Appetite** — 2 semanas? 6 semanas?
  - **Solution** — "fat marker sketches" e breadboards, não wireframes
  - **Rabbit holes** — riscos identificados e como evitar
  - **No-gos** — o que explicitamente _não_ será feito
- **Betting Table** — substitui priorização de backlog. Decide-se em o que apostar a cada ciclo.
- **Circuit breaker** — se não entrega em 6 semanas, projeto morre por padrão. Sem extensões automáticas.
- **Hill Chart** — visualização de progresso (subindo a colina = descoberta; descendo = execução).

**Crítica a backlogs:** Vistos como desperdiçadores de tempo. Centenas de tasks acumuladas que nunca serão feitas geram sensação falsa de atraso e custo de manutenção sem retorno.

**Influência no docseed:**

- O conceito de "no-gos" virou a seção _Não-escopo_ no PRD template
- Critério de saída por fase no ROADMAP vem do "circuit breaker"
- `TASKS.md` mantém só a fase atual, não backlog eterno

**Link:**

- Livro completo grátis: <https://basecamp.com/shapeup>

---

## 5. Diátaxis — Framework de Documentação

**Origem:** Daniele Procida.

**O quê:** Framework para organizar documentação técnica voltada a _usuários_ (não a planejamento interno). Identifica 4 tipos fundamentais, cada um respondendo a uma necessidade diferente.

**Os 4 tipos:**

| Tipo             | Orientado a | Pergunta que responde | Exemplo                      |
| ---------------- | ----------- | --------------------- | ---------------------------- |
| **Tutorial**     | Aprendizado | "Como eu começo?"     | Quickstart, primeiro projeto |
| **How-to guide** | Tarefa      | "Como faço X?"        | "Como autenticar via OAuth"  |
| **Reference**    | Informação  | "O que isto é?"       | API docs, CLI flags          |
| **Explanation**  | Compreensão | "Por que é assim?"    | Design rationale, conceitos  |

**Eixos conceituais:**

- Tutorial e Explanation servem o _estudo_
- How-to e Reference servem o _trabalho_
- Tutorial e How-to descrevem _ação_
- Reference e Explanation descrevem _conhecimento_

**Por que importa:** O erro mais comum em documentação é misturar os tipos. Um tutorial cheio de explicações vira confuso; uma referência com narrativa vira ilegível. Separar resolve.

**Adotado por:** Stripe Docs, Kubernetes, Django, AWS, Cloudflare, GitLab.

**Quando usar no docseed:** Presets `saas` e `enterprise`, quando o projeto tem usuários externos ou API pública. Gera estrutura `docs/{tutorials,how-to,reference,explanation}/`.

**Link:**

- Site oficial: <https://diataxis.fr>

---

## 6. Now / Next / Later — Roadmap

**Origem:** Janna Bastow (ProductPlan, Mind the Product).

**O quê:** Formato de roadmap por _horizonte de confiança_, não por datas.

**Estrutura:**

- **Now** — em execução, alta certeza
- **Next** — próximo, certeza média
- **Later** — explorando, baixa certeza

**Por que importa:** Roadmaps com datas precisas mentem. Now/Next/Later é honesto sobre o nível de comprometimento e evita o teatro do "Q3 2026: feature X".

**Influência no docseed:** Os templates de ROADMAP usam _fases_ ao invés de meses/trimestres por padrão. Datas viram opcionais.

---

## 7. Standard Readme

**Origem:** RichardLitt e contribuidores, especificação aberta.

**O quê:** Especificação formal para README de projetos open source. Define seções obrigatórias e ordem.

**Seções recomendadas (em ordem):**

1. Title
2. Banner/Badges
3. Short description
4. Long description
5. Table of contents (se longo)
6. Security (se relevante)
7. Background
8. Install
9. Usage
10. API
11. Maintainers
12. Contributing
13. License

**Quando usar:** Projetos open source com expectativa de contribuição externa. Para projetos privados, é overkill.

**Link:**

- Spec: <https://github.com/RichardLitt/standard-readme>

---

## 8. Outras referências relevantes

### RFC (Request for Comments)

Tradição do IETF, adaptada por empresas como Rust, Squarespace, Oxide. Documento que propõe mudança significativa antes de implementar — discutido publicamente, depois aceito ou rejeitado. Útil em times médios/grandes para mudanças não-triviais que merecem debate registrado.

### PRD tradicional (Marty Cagan, Lenny Rachitsky)

Product Requirements Document clássico de PM. Tipicamente: contexto, problema, usuários, requisitos, métricas de sucesso, riscos. Mais formal que o pitch do Shape Up, mais útil quando há múltiplos stakeholders (vendas, suporte, etc).

### OKRs (Objectives & Key Results)

Andy Grove → John Doerr → popularizado pelo Google. Estrutura objetivo + 3-5 resultados-chave mensuráveis. Mais relevante para o preset `enterprise`.

### DACI / RACI

Modelos de tomada de decisão e responsabilidade. Úteis em projetos com muitos stakeholders. Geram seção em docs de governança.

---

## Mapeamento por Preset do docseed

| Doc                         | `portfolio` | `mvp`         | `saas`              | `enterprise`    |
| --------------------------- | ----------- | ------------- | ------------------- | --------------- |
| README (Standard Readme)    | ✅ leve     | ✅            | ✅                  | ✅ completo     |
| PRD (Shape Up pitch)        | —           | ✅            | ✅                  | ✅ + PRD formal |
| ARCHITECTURE (arc42 subset) | —           | ✅ leve       | ✅ médio            | ✅ completo     |
| C4 diagrams                 | —           | Context       | Context + Container | Todos os níveis |
| ROADMAP (Now/Next/Later)    | —           | ✅            | ✅                  | ✅ + OKRs       |
| TASKS                       | ✅          | ✅ fase atual | ✅ fase atual       | ✅              |
| ADRs                        | —           | ✅ pasta      | ✅                  | ✅              |
| Diátaxis docs/              | —           | —             | ✅                  | ✅              |
| RFCs                        | —           | —             | opcional            | ✅              |
| Risk Register               | —           | —             | —                   | ✅              |
| OKRs                        | —           | —             | —                   | ✅              |

---

## Leitura recomendada

Ordem sugerida, do mais acionável ao mais teórico:

1. **Shape Up** (livro grátis, ~2-3h) — muda a mentalidade sobre escopo e appetite
2. **Documenting Architecture Decisions** (Nygard, ~10min) — suficiente para adotar ADRs
3. **C4 Model** (site, ~1h para o essencial) — diagramas de arquitetura decentes rapidamente
4. **Diátaxis** (site, ~30min) — clareia a organização de docs voltados a usuário
5. **arc42** (referência de consulta) — quando precisar de profundidade arquitetural
