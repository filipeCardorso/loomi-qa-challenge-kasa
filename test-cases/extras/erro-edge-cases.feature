# language: pt
Funcionalidade: Erros e edge cases do kasa.live
  Como torcedor
  Quero que o kasa.live se comporte de forma previsível em condições adversas
  Para não perder informações de partidas mesmo com falhas de rede, sessão ou ambiente

  Cenário: Rede caindo durante carregamento da listagem de partidas
    Dado que estou em "https://kasa.live" autenticado
    E a conexão de rede é interrompida antes do fim do carregamento das partidas
    Quando a requisição da listagem de partidas falha por timeout
    Então o site deve exibir mensagem clara de erro de rede
    E deve oferecer ação de "Tentar novamente"
    E não deve apresentar tela em branco ou loading infinito

  Cenário: API DEV instável com resposta lenta acima de 5s
    Dado que estou no ambiente DEV "https://dev.kasa.live"
    E o backend está respondendo com latência acima de 5 segundos
    Quando acesso a tab "Partidas"
    Então um indicador de carregamento deve permanecer visível enquanto aguardo a resposta
    E ao receber os dados a listagem deve renderizar sem cards duplicados
    E nenhuma ação do usuário (favoritar, abrir partida) deve disparar antes do fim do carregamento

  Cenário: Sessão expirada ao tentar favoritar uma partida
    Dado que estou logado em "https://kasa.live"
    E meu token de sessão expirou em background
    Quando clico no ícone de favoritar de uma partida
    Então o site deve detectar a sessão expirada
    E devo ser redirecionado para o fluxo de login
    E após reautenticar a partida deve permanecer marcada como favorita

  Cenário: Acesso a uma partida finalizada cujo modal de detalhes vem vazio
    Dado que estou em "https://kasa.live/partidas" autenticado
    E existe uma partida com status "Finalizada" sem dados de melhores momentos
    Quando clico no card desta partida finalizada
    Então o modal de detalhes não deve abrir vazio sem mensagem
    E deve ser exibida a mensagem "Detalhes indisponíveis para esta partida"
    E o botão "Fechar" deve permanecer funcional para sair do modal

  Cenário: Viewport esquisito muito estreito (320x480) não deve quebrar layout
    Dado que acesso "https://kasa.live" em viewport mobile reduzido 320x480
    Quando a home termina de carregar
    Então não deve haver rolagem horizontal indevida
    E os cards de partidas devem permanecer legíveis em coluna única
    E o footer deve manter os links acessíveis sem sobreposição com o conteúdo
