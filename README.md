# Arc: Aethon

**Arc: Aethon** é um idle mobile narrativo sobre um único ovo de dragão, vínculo emocional, tempo real, mistério e consequência.

Este repositório contém a versão atual aprovada do projeto após o **Prompt 4.1**.

## Estado atual do projeto

Implementado e aprovado:

- Fundação do projeto
- Save local
- Validação de save
- Roteamento por estado
- Onboarding
- Tela do Ovo
- Sistema de Orbs
- Sistema de Absorção
- Transição para nascimento
- HatchScreen / Cena de Nascimento
- DragonTypeResolver corrigido
- Criação de `dragonData`
- Diário Dia 1
- Transição irreversível de ovo para dragão

Próximo passo:

- **Prompt 5 — DragonScreen, Alimentação Básica e Diário Inicial**

O Prompt 5 está em:

```text
docs/prompts/PROMPT_5_dragon_screen_alimentacao_diario.txt
```

## Rodar localmente

```bash
npm install
npm run dev
```

## Gerar build

```bash
npm run build
```

## Regras principais

- Uma conta = um ovo ou um dragão, nunca os dois.
- Não existe segundo ovo.
- Não existe reset narrativo público.
- Vazio é passivo.
- O bônus pós-orbs se chama **Absorção**.
- Dragões do Limiar são ultra raros e exigem controle global futuro.
- Dragão da Convergência é único do criador e não deve ser jogável para jogadores comuns neste MVP.

## Arquivos importantes para IA

Antes de qualquer IA alterar o projeto, ela deve ler:

```text
AI_CONTEXT.md
ARC_AETHON_GAME_FLOW_BIBLE.md
DECISIONS.md
PROMPT_HISTORY.md
BACKLOG.md
```

Também existe uma versão HTML editável da Bíblia em:

```text
docs/ARC_AETHON_GAME_FLOW_BIBLE_v1.2_editavel.html
```
