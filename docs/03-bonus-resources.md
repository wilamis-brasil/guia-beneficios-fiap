# Recursos complementares

[← Voltar ao README](../README.md)

Página complementar: links úteis, canais e o **bookmarklet** de leitura em voz (`scripts/`). Nada aqui é obrigatório para usar o Pack — é acervo para quando precisar.

---

## Sumário

- [Biblioteca de livros](#biblioteca-de-livros)
- [Leitura em voz (bookmarklet)](#leitura-em-voz-bookmarklet)
- [Canais do YouTube](#canais-do-youtube)
- [Roadmap por área](#roadmap-por-area)

---

<a id="biblioteca-de-livros"></a>

## 📚 Biblioteca de livros

- [BibliotecaDev](https://github.com/KAYOKG/BibliotecaDev)
- [Free Programming Books](https://github.com/EbookFoundation/free-programming-books)

Para ir além de tutorial solto e estudar com mais profundidade.

---

<a id="leitura-em-voz-bookmarklet"></a>

## 🔊 Leitura em voz (bookmarklet)

Ler muito na tela cansa. O repositório inclui um **bookmarklet**: um favorito que abre um pequeno leitor na própria página. Você cola o texto e ouve, usando a **voz do sistema** ou a **ElevenLabs** (opcional, só se você configurar uma chave de API).

**Arquivos:**

- Bookmarklet pronto (minificado): [scripts/tts-bookmarklet.js](../scripts/tts-bookmarklet.js)
- Código-fonte legível e comentado: [scripts/src/tts.js](../scripts/src/tts.js)

> ⚠️ **Um bookmarklet executa JavaScript na página aberta.** Só instale código que você **leia e confie**. Este é aberto — confira a [versão legível](../scripts/src/tts.js) antes de usar. Nunca salve num favorito um `javascript:` recebido de estranhos.

<!-- -->

> No **Microsoft Edge** a voz nativa costuma soar mais natural.

### Como instalar

<img width="1919" height="989" alt="Tela do navegador com o painel do leitor em voz aberto sobre uma página, mostrando a caixa de texto e os botões de leitura" src="https://github.com/user-attachments/assets/c0d9ec4a-a99f-418e-be45-f12f730235a3" />

1. Abra [tts-bookmarklet.js](../scripts/tts-bookmarklet.js) no repositório.
2. Copie o código **inteiro**.
3. Crie um **novo favorito** no navegador.
4. Cole o código no campo de **URL/endereço**.
   - ⚠️ Chrome e Edge costumam **apagar o `javascript:`** do começo ao colar. Se ele sumir, **digite `javascript:`** manualmente na frente do código antes de salvar — sem isso o favorito não funciona.
5. Salve com um nome claro, ex.: `Leitura em voz`.
6. Abra a página desejada e clique no favorito.
7. Cole o texto e use o botão de leitura no painel.

<img width="386" height="405" alt="Recorte aproximado do painel do leitor: área para colar texto, seletor de modo de voz e botão de play" src="https://github.com/user-attachments/assets/12ddd63f-2196-4c73-83ff-7d776c469465" />

O áudio segue o modo escolhido no painel. As imagens acima são **apenas ilustrativas** — os passos já bastam.

<details>
<summary><strong>🔑 Usar a voz da ElevenLabs (opcional, avançado)</strong></summary>

A voz do sistema funciona sem configurar nada. Para vozes mais naturais da [ElevenLabs](https://elevenlabs.io/app/developers/api-keys), informe uma **chave de API** no painel.

- A chave fica **no seu navegador** e é enviada **direto à API da ElevenLabs** para gerar o áudio.
- **Trate a chave como senha:** não compartilhe, não suba para nenhum repositório e não a use em sites desconhecidos. Quem tiver sua chave pode gastar sua cota.
- Você pode **revogar ou recriar** a chave quando quiser no painel da ElevenLabs.

</details>

---

<a id="canais-do-youtube"></a>

## 📺 Canais do YouTube

Curadoria pessoal — sem ordem de "melhor para pior":

- [Curso em Vídeo](https://www.youtube.com/cursoemvideo)
- [Dev Aprender](https://www.youtube.com/@devaprender)
- [Código Fonte TV](https://www.youtube.com/@codigofontetv)
- [Filipe Deschamps](https://www.youtube.com/channel/UCU5JicSrEM5A63jkJ2QvGYw)
- [Dev em Dobro](https://www.youtube.com/c/DevemDobro)
- [Hashtag Programação](https://www.youtube.com/channel/UCafFexaRoRylOKdzGBU6Pgg)
- [Programação Dinâmica](https://www.youtube.com/@programacaodinamica)
- [Joviano Silveira](https://www.youtube.com/@jovianosilveira)

---

<a id="roadmap-por-area"></a>

## 🗺️ Roadmap por área

Um **roadmap** é um mapa dos assuntos de uma área e de **uma ordem possível** de estudo — não é lei. Serve para ver **onde você está** e **o que pode vir depois**.

- [roadmap.sh](https://roadmap.sh/)

### Uso recomendado

1. Escolha a área (front, back, dados…).
2. Olhe o mapa inteiro antes de querer cravar tudo.
3. Pegue **um ou dois** tópicos no seu nível.
4. Volte ao mapa depois de praticar.

### Base comum (web)

Muita gente começa por:

- Git e GitHub
- HTML · CSS · JavaScript

---

## Navegação

- [← README do repositório](../README.md)
- [Guia principal](01-github-student-pack.md)
- [Catálogo](02-pack-catalog.md)
