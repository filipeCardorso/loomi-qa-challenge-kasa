# language: pt
Funcionalidade: Recursos não-core do kasa.live
  Como torcedor
  Quero gerenciar minha conta e interagir com canais sociais do kasa.live
  Para personalizar minha experiência e acompanhar o time fora do site

  Cenário: Cadastro de novo torcedor com email e senha
    Dado que estou em "https://kasa.live" sem autenticação
    Quando clico em "Criar conta"
    E preencho o formulário com email "torcedor.teste+novo@example.com" e senha "Senha@123"
    E aceito os "Termos de Uso e Política de Privacidade" e confirmo o cadastro
    Então a conta deve ser criada com sucesso
    E devo ser redirecionado para a home autenticado
    E o avatar do usuário deve estar visível no header

  Cenário: Login com email e senha já cadastrados
    Dado que tenho conta válida no kasa.live com email "torcedor.teste@example.com" e senha "Senha@123"
    E estou em "https://kasa.live" sem autenticação
    Quando clico em "Entrar"
    E preencho email "torcedor.teste@example.com" e senha "Senha@123"
    E confirmo o login
    Então devo ser autenticado com sucesso
    E as tabs "Partidas", "Favoritos", "Melhores momentos" e "Calendário" devem ficar visíveis no header

  Cenário: Logout encerra a sessão e oculta tabs autenticadas
    Dado que estou logado em "https://kasa.live" como "torcedor.teste@example.com"
    Quando abro o menu do avatar no header
    E clico em "Sair"
    Então a sessão deve ser encerrada
    E devo ser redirecionado para a home como visitante
    E somente as tabs "Partidas" e "Melhores momentos" devem ficar visíveis

  Cenário: Editar perfil atualiza nome exibido no avatar
    Dado que estou logado em "https://kasa.live" como "torcedor.teste@example.com"
    Quando acesso "Editar perfil" pelo menu do avatar
    E altero o nome de exibição para "Filipe Torcedor"
    E salvo as alterações
    Então o nome "Filipe Torcedor" deve ser persistido no perfil
    E o avatar do header deve continuar visível após a atualização

  Cenário: Acesso às redes sociais do kasa.live pelo footer
    Dado que estou em "https://kasa.live" em qualquer página
    Quando rolo a página até o footer
    E clico no link "Instagram"
    Então uma nova aba deve abrir no perfil oficial "@kasa.live" no Instagram
    Quando volto ao kasa.live e clico no link "TikTok"
    Então uma nova aba deve abrir no perfil oficial do kasa.live no TikTok
