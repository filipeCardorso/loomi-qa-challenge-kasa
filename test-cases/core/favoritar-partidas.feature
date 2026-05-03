# language: pt
# NOTA: Cenários abaixo descrevem o fluxo ESPERADO de favoritar partidas segundo
# padrão UX comum. A exploração 2026-05-02 capturou apenas modais de partidas
# FINALIZADAS (que vêm vazias — ver BUG-011). Modais de partidas FUTURAS exigem
# validação manual no site logado pra confirmar selectors antes de automatizar.
# Tag @manual-validation indica essa dependência.
@manual-validation
Funcionalidade: Favoritar partidas
  Como torcedor
  Quero favoritar partidas específicas no kasa.live
  Para acompanhar de perto os jogos que mais me interessam

  Cenário: Favoritar uma partida futura pelo modal
    Dado que estou logado em "https://kasa.live" e na aba "Partidas"
    Quando clico no card de uma partida futura (div.css-7mca6u)
    E no modal Chakra clico no ícone de favoritar partida
    Então a partida deve ser marcada como favorita
    E o ícone de favorito deve permanecer ativo dentro do modal

  Cenário: Desfavoritar uma partida previamente favoritada
    Dado que estou logado e tenho uma partida favoritada
    Quando abro o modal dessa partida e clico no ícone de favorito ativo
    Então a partida deve ser removida dos favoritos
    E ao reabrir o modal o ícone deve estar inativo

  Cenário: Modal mantém o estado de favorito após reabrir
    Dado que estou logado e favoritei a partida "Flamengo x Palmeiras"
    Quando fecho o modal e volto a clicar no card da mesma partida
    Então o modal deve abrir já com o ícone de favorito marcado
    E o estado deve refletir corretamente sem necessidade de refresh

  Cenário: Visualizar partidas favoritas no calendário
    Dado que estou logado e favoritei pelo menos duas partidas futuras
    Quando acesso a página "/calendario"
    E ativo o switch "Partidas favoritas" no filtro lateral
    Então o calendário deve exibir apenas as partidas favoritadas
    E as datas correspondentes devem estar destacadas

  Cenário: Persistir partidas favoritas entre sessões
    Dado que estou logado e favoritei uma partida específica
    Quando faço logout e entro novamente com o mesmo usuário
    E acesso a aba "Favoritos"
    Então a partida favoritada anteriormente deve continuar listada

  Cenário: Tentar favoritar uma partida sem estar logado
    Dado que estou em "https://kasa.live" sem autenticação
    Quando abro o card de uma partida e clico no ícone de favoritar
    Então devo ser redirecionado para a tela de login
    Ou uma mensagem solicitando autenticação deve ser exibida
    E a partida não deve ser salva como favorita

  Cenário: Não permitir favoritar uma partida finalizada
    Dado que estou logado e abro o modal de uma partida com status "Finalizada"
    Quando tento clicar no ícone de favoritar
    Então a ação não deve ter efeito
    Ou o ícone de favoritar não deve estar disponível para partidas encerradas

  Cenário: Favoritar uma partida em viewport mobile
    Dado que acesso "https://kasa.live" em um dispositivo mobile (375x667)
    E que estou logado com email e senha
    Quando toco no card de uma partida futura e no ícone de favoritar no modal
    Então a partida deve ser marcada como favorita
    E o modal deve manter usabilidade adequada na tela reduzida
