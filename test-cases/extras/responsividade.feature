# language: pt
Funcionalidade: Responsividade do kasa.live
  Como torcedor
  Quero acessar o kasa.live em diferentes dispositivos
  Para ter uma experiência consistente em desktop, tablet e mobile

  Cenário: Layout em desktop 1920x1080
    Dado que acesso "https://kasa.live" em viewport desktop 1920x1080
    Quando a home termina de carregar
    Então o header deve exibir logo, tabs e avatar alinhados horizontalmente
    E a listagem de partidas deve ocupar a largura central com filtros visíveis no topo
    E o footer com "Termos de Uso e Política de Privacidade"/Play Store/App Store/TikTok/Instagram deve aparecer ao final sem quebra de layout

  Cenário: Layout em tablet 768x1024
    Dado que acesso "https://kasa.live" em viewport tablet 768x1024
    Quando a home termina de carregar
    Então as tabs do header devem permanecer acessíveis (sem cortar elementos)
    E os cards de partidas devem reorganizar-se para a largura intermediária
    E os filtros devem permanecer utilizáveis sem sobreposição com o conteúdo

  Cenário: Layout em mobile 375x667
    Dado que acesso "https://kasa.live" em viewport mobile 375x667
    Quando a home termina de carregar
    Então o menu de navegação deve adaptar-se ao formato mobile (ex.: menu hambúrguer ou tabs reduzidas)
    E os cards de partidas devem ser exibidos em coluna única ocupando a largura da tela
    E o footer deve manter os links empilhados verticalmente sem rolagem horizontal
