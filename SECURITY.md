# Política de Segurança

Este repositório é um guia em Markdown e um bookmarklet em JavaScript. Ainda assim, alguns cuidados valem a pena.

## 🛡️ Como reportar um problema

Encontrou algo sensível — por exemplo, o bookmarklet enviando dados para onde não deveria, um link malicioso ou uma chave de API exposta?

- **Não** abra uma issue pública com detalhes que possam ser explorados.
- Contate o mantenedor de forma privada pelo perfil [@wilamis-brasil](https://github.com/wilamis-brasil), descrevendo o problema e como reproduzi-lo.

Você receberá a confirmação de que a mensagem chegou e, em seguida, os próximos passos.

## 🔊 Sobre o bookmarklet

- Ele roda no **seu navegador**, na página que estiver aberta. Leia a [versão legível](scripts/src/tts.js) antes de instalar.
- A chave de API da ElevenLabs é **opcional** e fica no seu navegador. Trate-a como senha: não compartilhe nem suba para repositórios.

## ✅ Boas práticas para quem usa o Pack

- Ative **2FA** na conta do GitHub.
- Guarde tokens e chaves num gerenciador de senhas (o Pack oferece o 1Password), nunca em texto solto ou dentro de um commit.
