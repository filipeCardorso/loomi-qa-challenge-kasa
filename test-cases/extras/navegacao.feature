# language: pt
Funcionalidade: Navegação principal do kasa.live
  Como torcedor
  Quero navegar pelas tabs, logo e footer do kasa.live
  Para acessar rapidamente as áreas do site relevantes para mim

  Cenário: Logo do header retorna para a home
    Dado que estou em uma rota interna do kasa.live diferente da home (ex.: "/calendario")
    Quando clico no logo "kasa.live" no header
    Então devo ser redirecionado para a home "https://kasa.live/"
    E a aba "Partidas" deve estar selecionada por padrão

  Cenário: Tabs disponíveis para usuário anônimo
    Dado que estou em "https://kasa.live" sem autenticação
    Quando observo o menu de navegação principal do header
    Então devem estar visíveis exatamente 2 tabs: "Partidas" e "Melhores momentos"
    E as tabs "Favoritos" e "Calendário" não devem ser exibidas para visitantes

  Cenário: Tabs disponíveis para usuário logado e acesso ao calendário
    Dado que estou logado em "https://kasa.live" com email e senha
    Quando observo o menu de navegação principal do header
    Então devem estar visíveis exatamente 4 tabs: "Partidas", "Favoritos", "Melhores momentos" e "Calendário"
    Quando clico na tab "Calendário"
    Então devo ser redirecionado para "/calendario"
    E a agenda semanal deve ser exibida

  Cenário: Footer exibe os links institucionais e sociais esperados
    Dado que estou em "https://kasa.live" em qualquer página
    Quando rolo a página até o footer
    Então o footer deve exibir os links "Termos", "Play Store", "App Store", "TikTok" e "Instagram"
    E cada link deve abrir o destino correto em uma nova aba quando aplicável
