# Casos de Teste BDD (61 cenários)

## Por funcionalidade core

| Funcionalidade     | Arquivo                                                            | # Cenários |
| ------------------ | ------------------------------------------------------------------ | ---------- |
| Favoritar times    | [core/favoritar-times.feature](core/favoritar-times.feature)       | 8          |
| Favoritar partidas | [core/favoritar-partidas.feature](core/favoritar-partidas.feature) | 8          |
| Buscar partidas    | [core/buscar-partidas.feature](core/buscar-partidas.feature)       | 10         |
| Melhores momentos  | [core/melhores-momentos.feature](core/melhores-momentos.feature)   | 7          |
| Google Calendar    | [core/google-calendar.feature](core/google-calendar.feature)       | 7          |
| **Subtotal core**  |                                                                    | **40**     |

## Extras

| Cenário             | Arquivo                                                              | #      |
| ------------------- | -------------------------------------------------------------------- | ------ |
| Navegação           | [extras/navegacao.feature](extras/navegacao.feature)                 | 4      |
| Responsividade      | [extras/responsividade.feature](extras/responsividade.feature)       | 6      |
| Recursos não-core   | [extras/recursos-nao-core.feature](extras/recursos-nao-core.feature) | 5      |
| Erro/edge cases     | [extras/erro-edge-cases.feature](extras/erro-edge-cases.feature)     | 6      |
| **Subtotal extras** |                                                                      | **21** |

**TOTAL: 61 cenários** (vs 40 do Pleno S1 → +52%)

## Convenção

- Gherkin em PT-BR (`# language: pt`)
- Cada cenário cobre 1 caminho de usuário comum
- Persona: torcedor
- Edge cases extremos viram bugs, não cenários
