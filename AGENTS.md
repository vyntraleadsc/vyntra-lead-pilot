<!-- CRIEFY:CONTEXTO -->
# Instruções compartilhadas do projeto (CrieFy)

Antes de planejar ou alterar arquivos, leia `CLAUDE.md` integralmente. Ele contém as regras obrigatórias do produto, do template, da paleta e do fluxo de construção. O pedido textual do usuário define o produto; o template define somente o visual.

<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

<!-- CRIEFY:MEMORIA:INICIO -->
# Memória do projeto (mantida pelo CrieFy)

Este arquivo é escrito automaticamente. Ele existe para que o trabalho
continue igual quando o motor de IA muda (Claude Code ↔ GPT Codex).
**Leia antes de agir e não recomece o que já está feito.**

## Imagens e Identidade Visual (REGRAS CRÍTICAS DE PRODUÇÃO)

1. É TERMINANTEMENTE PROIBIDO usar links de imagens do Unsplash (images.unsplash.com), Pexels, Pixabay ou bancos externos.
   O modelo costuma alucinar identificadores e inserir imagens bizarras e desconexas (ex: fotos de gatos ou pães em páginas de doces).
2. TODA imagem visual do site (produtos, hero, pratos, vitrine, mockups, banners) DEVE SER GERADA LOCALMENTE via ferramenta:
   node .zheus/imagem.cjs "descrição detalhada da imagem" assets/nome-do-arquivo.png 800x600
3. Todas as tags <img> do site devem apontar EXCLUSIVAMENTE para caminhos locais salvos em assets/ (ex: assets/bolo-chocolate.png).
4. Apenas use bancos de dados de imagens externos se o usuário solicitar explicitamente ("busque fotos grátis em banco de imagens").

## Aplicações e Sites com Geração de Imagem por IA:
Se o site/projeto que você está criando for um SaaS de Geração de Imagens ou tiver botão "Gerar Imagem":
- O JavaScript do index.html DEVE fazer requisição para o endpoint nativo do servidor CrieFy:
  `const res = await fetch("/api/ai/generate-image", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt: textoDoPrompt, aspectRatio: "1:1" }) });`
  `const data = await res.json(); const urlRealDaImagem = data.imageUrl;`
- É TERMINANTEMENTE PROIBIDO USAR POLLINATIONS.AI, FLUX EXTERNO OU MOCKS. Use sempre a API nativa do CrieFy Imagen 3.

<!-- CRIEFY:MEMORIA:FIM -->
