# language: pt
Funcionalidade: Integração com Google Calendar
  Como torcedor
  Quero conectar minha conta do kasa.live ao Google Calendar
  Para acompanhar minhas partidas favoritas direto na minha agenda pessoal

  Cenário: Conectar o Google Calendar via switch no popover do avatar
    Dado que estou logado em "https://kasa.live" com email e senha
    Quando clico no avatar do header para abrir o popover do usuário
    E ativo o switch "Conectar com seu Google Calendar"
    Então devo ser redirecionado para o fluxo OAuth do Google
    E ao concluir o consentimento o switch deve permanecer ativo no popover
    E uma confirmação de conexão bem-sucedida deve ser exibida

  Cenário: Sincronizar partidas favoritas com o Google Calendar
    Dado que estou logado e já conectei minha conta ao Google Calendar
    E que tenho pelo menos duas partidas favoritadas na aba "Favoritos"
    Quando a sincronização automática com o Google Calendar é executada
    Então as partidas favoritadas devem aparecer como eventos no meu Google Calendar
    E cada evento deve conter título, data, horário e canal de transmissão da partida

  Cenário: Desconectar o Google Calendar pelo switch do popover
    Dado que estou logado e o switch "Conectar com seu Google Calendar" está ativo
    Quando abro o popover do avatar e desativo o switch
    Então a integração com o Google Calendar deve ser encerrada
    E os eventos previamente sincronizados não devem mais receber atualizações
    E o switch deve permanecer desativado após reabrir o popover

  Cenário: Reconectar o Google Calendar após uma desconexão anterior
    Dado que estou logado e desconectei o Google Calendar previamente
    Quando ativo novamente o switch "Conectar com seu Google Calendar" no popover
    E completo o fluxo OAuth do Google
    Então a integração deve ser restabelecida com sucesso
    E novas partidas favoritadas devem voltar a sincronizar automaticamente

  Cenário: Cancelar o consentimento OAuth durante a conexão
    Dado que estou logado e ativei o switch "Conectar com seu Google Calendar"
    Quando sou redirecionado para a tela de consentimento do Google
    E clico em "Cancelar" sem conceder permissões
    Então devo retornar ao kasa.live sem integração ativa
    E o switch deve permanecer desativado no popover do avatar
    E uma mensagem informando que a conexão não foi concluída deve ser exibida
