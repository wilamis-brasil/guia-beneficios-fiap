# O que deixar para depois

[Voltar ao hub](../README.MD%20(2))

“Depois” não significa nunca.

Significa: só entrar quando existir um gatilho real, um problema concreto e uma razão simples para aquele investimento.

Se a resposta for “acho que seria legal ter”, geralmente ainda é cedo.

## Regra prática

Antes de comprar, configurar ou adicionar algo novo, pergunte:

1. Isso resolve uma dor que já apareceu?
2. Eu consigo explicar essa dor em uma frase?
3. Existe uma alternativa mais simples que já funciona hoje?

Se a resposta for “não”, deixe para depois.

## Gatilhos concretos

| Tema | Deixe para depois quando... | Sinal de que ainda é cedo |
|---|---|---|
| Domínio | você já tem um projeto publicado, quer um link mais profissional e não vai mudar o endereço toda semana | o projeto ainda está cru, muda sem parar ou só existe no seu computador |
| Cloud | o app precisa rodar fora da sua máquina, com código do servidor, jobs, variáveis de ambiente ou acesso de outras pessoas | é só um exercício local, uma página estática ou um protótipo de estudo |
| Banco de dados | os dados precisam sobreviver entre sessões, usuários ou deploys, e você já tem um fluxo claro de cadastro, leitura, atualização e exclusão | o dado cabe em arquivo simples, mock ou memória e ainda não há persistência real a resolver |
| Observabilidade | o sistema já está publicado e você precisa entender erro, latência, uso ou falha sem depender de “olhar a tela” | você ainda depura tudo no navegador ou no terminal e não tem usuários reais |
| Segredos e cofres | você já tem variáveis de ambiente, tokens, chaves ou múltiplos acessos para projeto real | você ainda está em exercício simples, sem credencial sensível além do básico |
| Certificação | Git e GitHub já deixaram de ser novidade e você consegue explicar branch, commit, pull request e merge com segurança | você ainda apanha no básico do fluxo de trabalho |
| Monetização | existe uso real, valor claro e uma ideia minimamente estável de quem pagaria e por quê | você ainda está testando se a ideia resolve alguma coisa |
| Ferramentas de nicho | um problema repetitivo ficou claro e a ferramenta resolve isso melhor que o básico | você só quer “completar stack” ou imitar o que viu alguém usando |
| GitHub Pages | o que você quer publicar é estático, como portfólio, documentação, demo ou landing page | o projeto depende de backend pesado, autenticação complexa ou processamento no servidor |

## Quando cada tema começa a fazer sentido

### Domínio

Deixe o domínio para depois do primeiro projeto publicado.

O motivo é simples: antes disso, você ainda está mudando nome, escopo e stack. Colocar um domínio cedo pode só adicionar custo e manutenção sem melhorar seu aprendizado.

Quando fizer sentido:

- você já sabe o nome do projeto
- o conteúdo não vai mudar toda semana
- você quer um endereço fácil de compartilhar

### Cloud

Cloud entra quando o projeto passou do “está rodando aqui no meu PC” para “precisa existir fora dele”.

Sinais claros:

- backend precisa ficar online
- mais de uma pessoa precisa acessar
- o app precisa de variáveis de ambiente, armazenamento ou agendamentos

Se ainda é só exercício de sala, não force cloud.

### Banco de dados

Banco hospedado entra quando a informação não pode sumir ao fechar a aplicação.

Exemplos de gatilho:

- cadastro de usuários
- login
- histórico
- conteúdo que vários usuários mexem

Se você só quer aprender a lógica, use o caminho mais simples que funcione para o exercício.

### Observabilidade

Observabilidade entra quando apagar incêndio começa a ser parte da rotina.

Isso normalmente acontece depois que:

- o projeto já está no ar
- outras pessoas começaram a usar
- você precisa entender falhas sem adivinhar

Antes disso, logs simples e ferramentas do navegador costumam bastar.

### Segredos e cofres

Ferramentas como `1Password` e `Doppler` entram quando você começa a lidar com:

- tokens;
- chaves de API;
- variáveis de ambiente;
- acessos compartilhados entre projeto, máquina e deploy.

Antes disso, o risco é adicionar processo antes de existir problema real.

### Certificação

Certificação entra depois que Git e GitHub já viraram hábito.

A lógica é boa: primeiro você aprende a trabalhar, depois valida isso com uma credencial.

Faz mais sentido quando você já consegue:

- organizar repositório
- fazer commit com intenção
- abrir pull request
- revisar mudanças

### Monetização

Monetização entra quando o produto já tem sinal de valor.

Não comece cobrando antes de entender:

- quem usa
- por que usa
- o que acontece se remover
- por que alguém pagaria por isso

Se o projeto ainda está em fase de descoberta, monetização só aumenta ruído.

### Ferramentas de nicho

Ferramenta de nicho entra quando existe um problema específico e recorrente.

Use esse critério:

- o problema já apareceu mais de uma vez
- a ferramenta realmente economiza tempo ou reduz risco
- a solução genérica já ficou curta

Se a ferramenta só parece sofisticada, espere.

## Quando GitHub Pages entra

GitHub Pages entra cedo, mas só quando o projeto é estático e já merece ser visto.

Ele faz sentido para:

- portfólio
- documentação
- apresentação de projeto
- landing page simples

Ele não precisa esperar domínio próprio. Primeiro publique, depois pense em customizar o endereço.

O ponto aqui é bem prático: se o site não depende de backend complexo, Pages costuma ser a forma mais simples de colocar algo no ar.

## Resumo curto

- Se o problema ainda não apareceu, não compre a solução.
- Se o projeto ainda muda toda hora, não fixe infraestrutura cedo.
- Se você ainda está aprendendo o básico, priorize entrega simples.
- Se o uso real começou, aí sim faz sentido subir o nível.

## Próximo passo natural

- Para escolher o que ativar cedo: [03-github-pack-agora.md](03-github-pack-agora.md)
- Para consultar tudo o que existe: [05-catalogo-github-pack.md](05-catalogo-github-pack.md)

## Fontes oficiais consultadas

- [About custom domains and GitHub Pages - GitHub Docs](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/about-custom-domains-and-github-pages)
- [Configuring a custom domain for your GitHub Pages site - GitHub Docs](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)
- [Managing a custom domain for your GitHub Pages site - GitHub Docs](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)
- [GitHub Student Developer Pack - GitHub Education](https://education.github.com/pack)
- [GitHub Foundations Certification - GitHub Education](https://education.github.com/experiences/foundations_certificate)
