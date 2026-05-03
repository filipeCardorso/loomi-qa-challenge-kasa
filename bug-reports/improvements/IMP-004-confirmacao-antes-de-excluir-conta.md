# IMP-004 — Confirmação antes de excluir conta

> **Evidências:** ver [`bug-reports/evidence/IMP-004/cross-references.md`](../evidence/IMP-004/cross-references.md) — proposta de UX/compliance LGPD baseada em padrões de mercado (GitHub, Slack, Discord) e art. 18 IX.

**Impacto:** High
**Categoria:** UX
**Esforço estimado:** S
**Trello card:** https://trello.com/c/Cf6ayq9g

## Contexto

Na tela de Perfil existe a ação "Excluir conta". Ações destrutivas e irreversíveis exigem dupla confirmação por padrão de boas práticas (Nielsen — _error prevention_) e por requisitos de privacidade (LGPD art. 18 — direito à eliminação, mas com confirmação inequívoca).

## Problema observado

- O fluxo atual de exclusão não solicita confirmação textual ("digite EXCLUIR para confirmar") nem checkbox explícito.
- Risco alto de exclusão acidental (clique fantasma, double-tap em mobile, foco teclado mal posicionado).
- Não há clareza sobre o que será apagado (favoritos, histórico, dados pessoais) nem prazo (imediato? soft delete 30 dias?).

## Sugestão

Implementar modal de confirmação em duas etapas:

1. **Etapa 1 — Aviso:** modal com título "Excluir conta", lista do que será removido, e dois botões (`Cancelar` em destaque, `Continuar` secundário).
2. **Etapa 2 — Confirmação ativa:** input texto onde o usuário digita literalmente sua senha **ou** a palavra `EXCLUIR`. Botão "Excluir definitivamente" só habilita ao bater.
3. **Pós-ação:** snackbar de sucesso e logout automático com redirect para a Home.
4. **Acessibilidade:** modal com `role="alertdialog"`, foco no botão Cancelar por padrão, trap de foco, ESC fecha.
5. **Logging:** evento de auditoria server-side com timestamp, IP e user-agent.

## Por que melhora

- **Previne perda de dados** por engano — defeito alto custo emocional/reputacional.
- **Conformidade LGPD** com trilha de auditoria.
- **Reduz tickets de suporte** ("apaguei minha conta sem querer").
- **Aumenta confiança** no produto.

## Evidência

- Padrões de referência: GitHub, Slack, Discord (todos exigem digitar nome do usuário).
- Print do fluxo atual sem confirmação: `bug-reports/evidence/IMP-004/perfil-excluir-fluxo-atual.png` (a capturar).
- Vídeo do clique acidental: `bug-reports/evidence/IMP-004/clique-acidental.webm` (a capturar).
