# Casos de Teste BDD (64 cenários)

## Por funcionalidade core

| Funcionalidade     | Arquivo                                                            | # Cenários |
| ------------------ | ------------------------------------------------------------------ | ---------- |
| Favoritar times    | [core/favoritar-times.feature](core/favoritar-times.feature)       | 8          |
| Favoritar partidas | [core/favoritar-partidas.feature](core/favoritar-partidas.feature) | 8          |
| Buscar partidas    | [core/buscar-partidas.feature](core/buscar-partidas.feature)       | 12         |
| Melhores momentos  | [core/melhores-momentos.feature](core/melhores-momentos.feature)   | 7          |
| Google Calendar    | [core/google-calendar.feature](core/google-calendar.feature)       | 7          |
| **Subtotal core**  |                                                                    | **42**     |

## Extras

| Cenário             | Arquivo                                                              | #      |
| ------------------- | -------------------------------------------------------------------- | ------ |
| Navegação           | [extras/navegacao.feature](extras/navegacao.feature)                 | 3      |
| Responsividade      | [extras/responsividade.feature](extras/responsividade.feature)       | 6      |
| Recursos não-core   | [extras/recursos-nao-core.feature](extras/recursos-nao-core.feature) | 7      |
| Erro/edge cases     | [extras/erro-edge-cases.feature](extras/erro-edge-cases.feature)     | 6      |
| **Subtotal extras** |                                                                      | **22** |

**TOTAL: 64 cenários** (vs 40 do Pleno S1 → +60%)

## Convenção

- Gherkin em PT-BR (`# language: pt`)
- Cada feature usa `Contexto:` (Background) com URL base — DRY
- Cada cenário cobre 1 caminho de usuário comum
- Persona: torcedor
- Edge cases extremos viram bugs, não cenários
