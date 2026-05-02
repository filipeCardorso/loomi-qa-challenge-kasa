# language: pt
Funcionalidade: Favoritar times
  Como torcedor
  Quero favoritar meus times preferidos no kasa.live
  Para acompanhar suas partidas e receber lembretes personalizados

  Cenário: Favoritar um time popular pelo caminho feliz
    Dado que estou logado em "https://kasa.live" com email e senha
    E que estou na aba "Partidas"
    Quando clico no card do time "Flamengo" (div.css-7mca6u)
    E no modal Chakra clico no ícone de favoritar
    Então o time "Flamengo" deve ser marcado como favorito
    E uma confirmação visual deve ser exibida no modal

  Cenário: Filtrar partidas por times favoritos no calendário
    Dado que estou logado e tenho o time "Palmeiras" favoritado
    E que acesso a página "/calendario"
    Quando ativo o switch "Partidas favoritas" no filtro lateral
    Então a lista deve exibir apenas partidas envolvendo o time "Palmeiras"
    E partidas de outros times não devem aparecer

  Cenário: Desfavoritar um time previamente favoritado
    Dado que estou logado e o time "Corinthians" está nos meus favoritos
    Quando abro o card do time "Corinthians" e clico no ícone de favorito ativo
    Então o time "Corinthians" deve ser removido dos favoritos
    E ao recarregar a página o time deve permanecer desfavoritado

  Cenário: Persistir times favoritos entre sessões
    Dado que estou logado e favoritei o time "São Paulo"
    Quando faço logout e volto a fazer login com o mesmo usuário
    E acesso a aba "Favoritos"
    Então o time "São Paulo" deve continuar listado como favorito

  Cenário: Favoritar múltiplos times de campeonatos diferentes
    Dado que estou logado em "https://kasa.live"
    Quando favorito os times "Flamengo", "Real Madrid" e "Manchester City"
    E acesso a aba "Favoritos"
    Então os três times devem aparecer na lista de favoritos
    E cada um deve manter o estado de favorito ativo

  Cenário: Tentar favoritar um time sem estar logado
    Dado que estou em "https://kasa.live" sem autenticação
    Quando abro o card do time "Vasco" e clico no ícone de favoritar
    Então devo ser redirecionado para a tela de login
    Ou uma mensagem solicitando autenticação deve ser exibida
    E o time não deve ser salvo como favorito

  Cenário: Buscar um time inexistente para favoritar
    Dado que estou logado e na aba "Partidas"
    Quando pesquiso por um time chamado "TimeQueNaoExiste123"
    Então nenhum card de time deve ser exibido
    E uma mensagem informando ausência de resultados deve aparecer
    E não deve haver opção de favoritar

  Cenário: Favoritar um time em viewport mobile
    Dado que acesso "https://kasa.live" em um dispositivo mobile (375x667)
    E que estou logado com email e senha
    Quando toco no card do time "Botafogo" e no ícone de favoritar dentro do modal
    Então o time "Botafogo" deve ser marcado como favorito
    E a interação deve respeitar o layout responsivo sem cortes ou overflow
