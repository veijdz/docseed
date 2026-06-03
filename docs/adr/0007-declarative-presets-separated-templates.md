# ADR 0007: Presets JSON declarativo + templates separados do código

- **Status:** Accepted
- **Data:** 2026-05-28

## Contexto

É preciso decidir como representar "qual preset gera quais documentos" e onde os templates vivem. Essa escolha define a facilidade de adicionar presets novos e de aceitar contribuições.

## Opções consideradas

- **Presets JSON declarativo + templates em `templates/`**: cada preset é um manifest `{ doc → template }`; os `.hbs` ficam fora do código.
- **Templates inline (strings no TS)**: tudo num lugar, mas mistura conteúdo e lógica, torna a edição penosa e gera diffs ruins.
- **Presets como código (funções TS)**: flexível, mas acopla o preset ao engine e dificulta a contribuição.

## Decisão

Representar **presets como JSON declarativo** em `src/presets/` e manter os **templates `.hbs` separados** em `templates/`.

### Schema do preset

```jsonc
{
  "id": "minimal",                 // identificador usado em --preset e no select do wizard
  "label": "Minimal: ...",         // rótulo legível exibido no wizard
  "requiredVars": ["projectName"], // variáveis obrigatórias (validadas no modo não-interativo)
  "docs": [
    { "template": "shared/README.md", "path": "README.md" }
    // template: ref relativo à raiz de templates, sem `.hbs`
    // path: caminho de saída relativo a `docs/`
  ]
}
```

Esse schema é o contrato `Preset`/`PresetDoc` em `src/engine/types.ts`. O loader (`src/presets/loader.ts`) valida cada JSON no startup e falha com erro descritivo se o shape divergir.

## Consequências

**Positivas:**

- Adicionar um preset = um JSON + templates, sem tocar no engine.
- Templates são editáveis e diffáveis como arquivos normais.
- Habilita o override por filesystem (ADR [0006](0006-filesystem-override-no-config.md)) e o config file futuro.
- Contribuição de preset fica acessível, não exige entender o engine.

**Negativas:**

- Indireção: ler um preset exige cruzar o JSON com os templates.
- Exige validação de schema do JSON no startup (responsabilidade do loader).
