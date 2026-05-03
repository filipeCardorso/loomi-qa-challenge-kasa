# language: pt
# NOTA: Cenários focam em COMPORTAMENTO responsivo (interação, persistência de
# estado entre viewports, scroll horizontal indesejado), não em verificação de
# CSS/layout estático. Testes de "logo aparece" / "header alinhado" são
# considerados smoke trivial e foram removidos — pertencem a visual regression
# (automation/tests/visual/), não a BDD comportamental.
Funcionalidade: Responsividade do kasa.live
  Como torcedor
  Quero acessar o kasa.live em diferentes dispositivos
  Para ter uma experiência consistente em desktop, tablet e mobile

  Cenário: Mudança de viewport portrait → landscape preserva tab ativa
    Dado que estou na home em viewport mobile 375x667 (portrait)
    E selecionei a aba "Melhores momentos"
    Quando giro o dispositivo para landscape (667x375)
    Então a aba "Melhores momentos" deve permanecer ativa (estado preservado)
    E o conteúdo já carregado não deve ser recarregado do zero
    E nenhum scroll horizontal indesejado deve aparecer

  Cenário: Menu de navegação em mobile colapsa para hamburger ou tabs reduzidas
    Dado que acesso "https://kasa.live" em viewport mobile 375x667
    Quando a home termina de carregar
    Então deve existir um mecanismo claro de navegação (menu hambúrguer OU tabs visíveis)
    E ao tocar nesse mecanismo as opções de navegação devem ser apresentadas
    E um segundo toque no mesmo mecanismo deve fechar o menu (idempotente)

  Cenário: Cards de partidas em mobile não exibem scroll horizontal
    Dado que acesso "https://kasa.live" em viewport mobile 375x667
    Quando a home termina de carregar com cards de partidas visíveis
    Então cada card deve ocupar a largura disponível sem ultrapassar a viewport
    E não deve haver scroll horizontal na página inteira
    E o conteúdo dentro do card (escudos, placar, status) deve estar legível sem zoom

  Cenário: Tablet landscape mantém filtros utilizáveis sem sobreposição
    Dado que acesso "https://kasa.live" em viewport tablet 1024x768 (landscape)
    Quando expanso o filtro "Qual time?" do header
    Então o painel de filtro não deve sobrepor a listagem de partidas de forma a esconder conteúdo crítico
    E ao selecionar um time o filtro deve fechar e a listagem deve refletir o filtro aplicado

  Cenário: Touch tap em mobile favorita partida na primeira interação
    Dado que estou logado e em viewport mobile 375x667
    E há ao menos um card de partida futura visível na listagem
    Quando toco no ícone de favoritar (estrela) do card uma única vez
    Então o ícone deve indicar estado favoritado dentro de 1 segundo
    E o backend recebe exatamente 1 request POST de favorito (não duplicado)

  Cenário: Toggle favoritar/desfavoritar via toques rápidos converge no estado coerente
    Dado que estou logado e em viewport mobile 375x667
    E há ao menos um card de partida futura visível na listagem
    Quando toco rapidamente (<500ms entre toques) 4 vezes no ícone de favoritar
    Então o estado final do ícone deve refletir o número par/ímpar de toques (favoritado se ímpar; desfavoritado se par)
    E o backend deve receber no máximo 4 requests (debounce não combina com toggle)
    E não deve haver state inconsistente (ícone mostrando estado A enquanto API tem B)
