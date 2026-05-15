# GITHUB_UPLOAD_GUIDE — Como subir este projeto

## Opção simples pelo navegador

1. Crie um repositório no GitHub.
2. Extraia este ZIP no seu computador.
3. Entre no repositório no GitHub.
4. Clique em **Add file**.
5. Clique em **Upload files**.
6. Arraste todos os arquivos e pastas extraídos.
7. Faça commit.

## O que subir

Suba tudo, incluindo:

- `src/`
- `package.json`
- `package-lock.json`
- `vite.config.ts`
- `tsconfig.json`
- `index.html`
- `README.md`
- `AI_CONTEXT.md`
- `ARC_AETHON_GAME_FLOW_BIBLE.md`
- `DECISIONS.md`
- `PROMPT_HISTORY.md`
- `BACKLOG.md`
- `docs/`

## O que NÃO subir no futuro

Não subir:

- `.env`
- chaves de API
- tokens
- senhas
- IDs reais de anúncio
- credenciais de backend
- `node_modules/`

Este pacote não contém `node_modules`.

## Como usar em nova conversa

Na nova conversa, diga:

> Este é o repositório atual do Arc: Aethon: [LINK DO GITHUB]
> Leia principalmente AI_CONTEXT.md, ARC_AETHON_GAME_FLOW_BIBLE.md, DECISIONS.md, PROMPT_HISTORY.md e BACKLOG.md.
> Estamos no próximo passo: Prompt 5 — DragonScreen, Alimentação Básica e Diário Inicial.

## Como usar na Arena.ai

Se a Arena.ai aceitar link de GitHub, envie o link do repositório.

Se ela não aceitar, copie o conteúdo de:

```text
docs/prompts/PROMPT_5_dragon_screen_alimentacao_diario.txt
```

e use junto com o projeto/repositório.
