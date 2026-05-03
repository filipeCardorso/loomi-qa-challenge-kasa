# IMP-001 — Adicionar `data-testid` em elementos críticos

> **Evidências:** ver [`bug-reports/evidence/IMP-001/cross-references.md`](../evidence/IMP-001/cross-references.md) — cross-reference com BUG-005 (`console-zero-testids.txt` mostrando 0/1161 elementos com data-testid).

**Impacto:** Medium
**Categoria:** Manutenibilidade
**Esforço estimado:** M
**Trello card:** https://trello.com/c/0EuSpblu

## Contexto

A aplicação Kasa (https://kasa-front-prd.fly.dev) é alvo da automação E2E (Playwright) deste challenge. Hoje, **nenhum elemento da UI possui atributo `data-testid`**, conforme registrado em BUG-005. Os seletores precisam recorrer a `getByRole`, `getByText` e XPath, o que torna os testes frágeis a mudanças visuais e de copy.

## Problema observado

- 0 ocorrências de `data-testid` em todo o DOM (verificado via `document.querySelectorAll('[data-testid]').length`).
- Seletores baseados em texto quebram quando o time de produto altera labels ou ao adicionar i18n (ver IMP-007).
- Refatorações de markup (ex.: trocar `<button>` por `<a>`) quebram seletores por role sem aviso.

## Sugestão

Adicionar `data-testid` em uma lista priorizada de elementos críticos:

1. **Navegação principal:** header, links de menu (`Início`, `Calendário`, `Favoritos`, `Perfil`), botão hambúrguer mobile.
2. **Cards de partida:** container do card, escudo do time, placar, status, botão favoritar.
3. **Modais:** wrapper do modal, botão fechar, CTAs primário/secundário.
4. **Formulários:** inputs, selects, botão submit, mensagens de erro.
5. **Perfil:** botões "Editar perfil", "Excluir conta", confirmações.

Convenção sugerida: `data-testid="<dominio>-<componente>-<acao>"` (ex.: `match-card-favorite-button`, `profile-delete-account-button`).

## Por que melhora

- **Estabilidade da automação:** seletores deixam de depender de copy e estilo.
- **Velocidade de manutenção:** quando um teste quebra, o motivo é mudança de comportamento, não de markup.
- **Documentação implícita:** os IDs servem como contrato entre dev e QA.
- **Suporte a i18n:** evita que a tradução para EN/ES (IMP-007) quebre a suíte.

## Evidência

- BUG-005 — `bug-reports/bugs/BUG-005-zero-data-testid-no-site.md`.
- Screenshot do console: `bug-reports/evidence/IMP-001/console-zero-testid.png` (a capturar).
- Lista de seletores frágeis na suíte atual: `automation/tests/**/*.spec.ts`.
