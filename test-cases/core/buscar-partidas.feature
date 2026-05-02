# language: pt
Funcionalidade: Buscar partidas
  Como torcedor
  Quero usar os filtros da home do kasa.live
  Para encontrar rapidamente as partidas que desejo assistir

  Cenário: Filtrar partidas pelo nome do time usando typeahead
    Dado que estou em "https://kasa.live/"
    Quando clico no filtro "Qual time?" e digito "Flamengo"
    E seleciono a opção "Flamengo" da lista de sugestões do typeahead
    E clico no botão de busca (lupa verde)
    Então a listagem deve exibir apenas partidas envolvendo o time "Flamengo"
    E o filtro "Qual time?" deve permanecer com o valor "Flamengo" selecionado

  Cenário: Filtrar partidas por campeonato
    Dado que estou em "https://kasa.live/"
    Quando clico no filtro "Qual campeonato?" e seleciono "Brasileirão Série A"
    E clico no botão de busca (lupa verde)
    Então a listagem deve exibir apenas partidas do campeonato "Brasileirão Série A"
    E nenhum jogo de outros campeonatos deve aparecer nos resultados

  Cenário: Filtrar partidas por data específica via datepicker
    Dado que estou em "https://kasa.live/"
    Quando clico no filtro de data (datepicker) para abrir o calendário
    E seleciono a data correspondente ao próximo sábado no calendário mensal
    E clico no botão de busca (lupa verde)
    Então a listagem deve exibir apenas partidas agendadas para a data selecionada
    E o filtro de data deve refletir o dia escolhido

  Cenário: Filtrar partidas por local de transmissão
    Dado que estou em "https://kasa.live/"
    Quando clico no filtro "Onde quer ver?" e seleciono "Globo"
    E clico no botão de busca (lupa verde)
    Então a listagem deve exibir apenas partidas que serão transmitidas em "Globo"
    E o filtro "Onde quer ver?" deve permanecer com o valor "Globo"

  Cenário: Combinar filtros de time, campeonato e data
    Dado que estou em "https://kasa.live/"
    Quando seleciono "Corinthians" no filtro "Qual time?"
    E seleciono "Brasileirão Série A" no filtro "Qual campeonato?"
    E seleciono uma data futura no filtro de data (datepicker)
    E clico no botão de busca (lupa verde)
    Então a listagem deve exibir apenas partidas do "Corinthians" no "Brasileirão Série A" na data escolhida
    Ou uma mensagem indicando ausência de resultados deve ser exibida quando não houver jogos

  Cenário: Navegar entre páginas dos resultados via paginação
    Dado que estou em "https://kasa.live/" com a listagem padrão de partidas
    Quando rolo a página até o componente de paginação (1 a 117)
    E clico na página número 2
    Então a listagem deve carregar novos resultados correspondentes à página 2
    E o indicador de paginação deve destacar o número 2 como página atual

  Cenário: Abrir o calendar mensal e validar a quantidade de dias
    Dado que estou em "https://kasa.live/"
    Quando clico no campo placeholder de data dinâmica (formato MMM DD, YYYY) para abrir o calendar mensal
    Então o calendário deve exibir o mês corrente com até 31 dias selecionáveis
    E os dias passados devem estar visualmente diferenciados dos dias futuros

  Cenário: Realizar busca sem preencher nenhum filtro
    Dado que estou em "https://kasa.live/" sem nenhum filtro aplicado
    Quando clico diretamente no botão de busca (lupa verde)
    Então a listagem deve exibir todas as partidas disponíveis sem restrição
    E a paginação padrão deve permanecer visível ao final da listagem

  Cenário: Buscar por um time inexistente no typeahead
    Dado que estou em "https://kasa.live/"
    Quando clico no filtro "Qual time?" e digito "TimeQueNaoExiste123"
    Então o typeahead não deve exibir sugestões correspondentes
    E ao clicar na lupa verde a listagem deve mostrar mensagem de "nenhuma partida encontrada"

  Cenário: Limpar todos os filtros aplicados e voltar ao estado inicial
    Dado que estou em "https://kasa.live/" com filtros de time, campeonato e data aplicados
    Quando removo cada filtro selecionado (limpar seleção)
    E clico novamente no botão de busca (lupa verde)
    Então a listagem deve voltar a exibir todas as partidas disponíveis
    E os quatro filtros devem retornar ao estado padrão sem valores selecionados
