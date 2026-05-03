# language: pt
# NOTA: Cenários OAuth completos exigem interação manual com Google (R3 da spec).
# Apenas o cenário "switch existe no popover" pode ser automatizado integralmente.
Funcionalidade: Integração com Google Calendar
  Como torcedor
  Quero conectar minha conta do kasa.live ao Google Calendar
  Para acompanhar minhas partidas favoritas direto na minha agenda pessoal

  Contexto:
    Dado que estou em "https://kasa.live"

  @manual-oauth
  Cenário: Conectar o Google Calendar via switch no popover do avatar
    Dado que estou logado com email e senha
    Quando clico no avatar do header para abrir o popover do usuário
    E ativo o switch "Conectar com seu Google Calendar"
    Então devo ser redirecionado para o fluxo OAuth do Google
    E ao concluir o consentimento o switch deve permanecer ativo no popover
    E uma confirmação de conexão bem-sucedida deve ser exibida

  @manual-oauth
  Cenário: Sincronizar partidas favoritas com o Google Calendar
    Dado que estou logado e já conectei minha conta ao Google Calendar
    E que tenho pelo menos duas partidas favoritadas na aba "Favoritos"
    Quando a sincronização automática com o Google Calendar é executada
    Então as partidas favoritadas devem aparecer como eventos no meu Google Calendar
    E cada evento deve conter título, data, horário e canal de transmissão da partida

  @manual-oauth
  Cenário: Desconectar o Google Calendar pelo switch do popover
    Dado que estou logado e o switch "Conectar com seu Google Calendar" está ativo
    Quando abro o popover do avatar e desativo o switch
    Então a integração com o Google Calendar deve ser encerrada
    E os eventos previamente sincronizados não devem mais receber atualizações
    E o switch deve permanecer desativado após reabrir o popover

  @manual-oauth
  Cenário: Reconectar o Google Calendar após uma desconexão anterior
    Dado que estou logado e desconectei o Google Calendar previamente
    Quando ativo novamente o switch "Conectar com seu Google Calendar" no popover
    E completo o fluxo OAuth do Google
    Então a integração deve ser restabelecida com sucesso
    E novas partidas favoritadas devem voltar a sincronizar automaticamente

  @manual-oauth
  Cenário: Cancelar o consentimento OAuth durante a conexão
    Dado que estou logado e ativei o switch "Conectar com seu Google Calendar"
    Quando sou redirecionado para a tela de consentimento do Google
    E clico em "Cancelar" sem conceder permissões
    Então devo retornar ao kasa.live sem integração ativa
    E o switch deve permanecer desativado no popover do avatar
    E uma mensagem informando que a conexão não foi concluída deve ser exibida

  Cenário: Tentar acessar funcionalidade de Google Calendar sem ter conectado
    Dado que estou logado e nunca conectei minha conta ao Google Calendar
    Quando abro o popover do avatar do header
    Então o switch "Conectar com seu Google Calendar" deve estar visível e desativado
    E uma mensagem ou tooltip explicando o benefício da integração deve estar presente
    E nenhuma sincronização deve estar ocorrendo em background

  @manual-oauth
  Cenário: Permissão do Google Calendar revogada externamente pelo usuário
    Dado que estou logado e havia conectado minha conta ao Google Calendar previamente
    E que revoguei a permissão do kasa.live diretamente em myaccount.google.com/permissions
    Quando volto ao kasa.live e abro o popover do avatar
    Então o sistema deve detectar a permissão revogada na próxima tentativa de sincronização
    E o switch "Conectar com seu Google Calendar" deve refletir o estado desconectado
    E uma mensagem clara deve informar que a integração precisa ser refeita
    E nenhuma sincronização silenciosa deve continuar tentando rodar
