# language: pt
Funcionalidade: Melhores momentos das partidas finalizadas
  Como torcedor
  Quero acessar os melhores momentos das partidas já encerradas
  Para rever os lances e gols dos jogos que perdi ao vivo

  Cenário: Navegar da home até a página de melhores momentos
    Dado que estou em "https://kasa.live/"
    Quando acesso o menu de navegação e clico no link "Melhores momentos"
    Então devo ser redirecionado para a URL "/melhores-momentos"
    E a página deve apresentar o heading "Melhores momentos das Partidas Finalizadas"
    E os 4 filtros padrão e os 2 inputs "Pesquisar" devem estar visíveis

  Cenário: Pesquisar melhores momentos por texto livre
    Dado que estou em "https://kasa.live/melhores-momentos"
    Quando digito "Final" em um dos inputs "Pesquisar"
    E confirmo a busca
    Então a listagem deve exibir somente vídeos cujo título contenha o termo "Final"
    E o input de pesquisa deve manter o termo digitado

  Cenário: Filtrar melhores momentos por campeonato
    Dado que estou em "https://kasa.live/melhores-momentos"
    Quando seleciono "Copa do Brasil" no filtro "Qual campeonato?"
    Então a listagem deve atualizar exibindo apenas melhores momentos de partidas da "Copa do Brasil"
    E nenhum vídeo de outros campeonatos deve aparecer

  Cenário: Filtrar melhores momentos por data específica
    Dado que estou em "https://kasa.live/melhores-momentos"
    Quando abro o filtro "Hoje" e seleciono uma data passada com partidas finalizadas
    Então a listagem deve atualizar exibindo apenas melhores momentos de partidas finalizadas naquela data
    E o filtro de data deve refletir o dia escolhido

  Cenário: Combinar três filtros (time, campeonato e pesquisa textual)
    Dado que estou em "https://kasa.live/melhores-momentos"
    Quando seleciono "São Paulo" no filtro "Qual time?"
    E seleciono "Brasileirão Série A" no filtro "Qual campeonato?"
    E digito "gols" em um dos inputs "Pesquisar"
    Então a listagem deve atualizar exibindo apenas vídeos do "São Paulo" no "Brasileirão Série A" cujo título contenha "gols"
    Ou uma mensagem indicando ausência de resultados deve ser exibida quando não houver vídeos

  # Player embedado: hipótese é YouTube iframe (verificar tipo exato e selector
  # do botão play após click no card — pode ser custom HTML5 player também).
  @manual-validation
  Cenário: Reproduzir um vídeo de melhores momentos no player embedado
    Dado que estou em "https://kasa.live/melhores-momentos" com a listagem carregada
    Quando clico no botão "play" do primeiro card de melhores momentos
    Então o player de vídeo deve estar presente e iniciar reprodução
    E o vídeo dos melhores momentos deve continuar reproduzindo até o usuário pausar

  Cenário: Buscar por termo sem resultados correspondentes
    Dado que estou em "https://kasa.live/melhores-momentos"
    Quando digito "TermoQueNaoExiste123" em um dos inputs "Pesquisar"
    E confirmo a busca
    Então a listagem não deve exibir nenhum card de vídeo
    E uma mensagem informando que não há melhores momentos para o filtro deve ser exibida
