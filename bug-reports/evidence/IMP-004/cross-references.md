# IMP-004 — evidências (proposta de UX + compliance LGPD)

Esta melhoria propõe adicionar **confirmação de duas etapas antes de
excluir conta** (digitar senha + email + clicar "Confirmar exclusão").
É padrão consolidado da indústria (GitHub, Slack, Discord) e exigência
LGPD art. 18.

## Tipo de evidência

Esta é uma **proposta de UX/compliance** baseada em padrões de mercado e
requisito legal — não tem "estado atual problemático" capturável por
screenshot, exceto a ausência da confirmação. A captura completa requer
fluxo autenticado com permissão de exclusão de conta, fora do escopo
desta sessão.

## Padrão LGPD aplicável

- **LGPD art. 18, IX** — direito à eliminação dos dados pessoais
- **Guia ANPD 2022** — consentimento inequívoco também se aplica à revogação
- **Princípio "destrutivo precisa de fricção"** (Nielsen #5: error prevention)

## Estado atual (verificação manual recomendada)

- Acessar `/perfil` ou popover do avatar logado
- Procurar opção "Excluir conta"
- Validar se há **duas etapas** com aviso de irreversibilidade

## Estado desejado (após IMP-004)

1. **Aviso modal**: "Esta ação é IRREVERSÍVEL. Você perderá: N favoritos, M partidas no calendário, histórico..."
2. **Confirmação ativa**: digitar email + senha + clicar "Quero excluir minha conta permanentemente"
3. **Logging de auditoria**: timestamp + IP + user-agent (compliance LGPD)
4. **Email de confirmação**: enviado pro email cadastrado (segurança contra session hijacking)
5. **Janela de cancelamento**: 7 dias pra reverter (soft-delete)

## Referências

- GitHub delete account flow: https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-personal-account-on-github/managing-your-personal-account/deleting-your-personal-account
- Discord: 30 dias soft-delete antes de hard-delete
- LGPD: https://www.gov.br/anpd/
