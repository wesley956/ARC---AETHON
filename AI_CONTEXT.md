# AI_CONTEXT — Arc: Aethon

Leia este arquivo antes de alterar qualquer código.

## O que é Arc: Aethon

Arc: Aethon é um idle mobile narrativo onde o jogador encontra um único ovo de dragão em um mundo pós-apocalíptico chamado Aethon.

O jogo é fofo e colorido na superfície, mas profundo e emocional por baixo. O foco é vínculo, tempo real, mistério, consequência e uma criatura única.

O jogador não coleciona dragões. O jogador cria vínculo com um único dragão.

## Estado atual do projeto

Esta versão está aprovada após o **Prompt 4.1**.

Já existe:

- Projeto React + Vite + TypeScript
- Save local com `localStorage`
- `GameContext`
- `SaveManager`
- `GameStateValidator`
- `TimeManager`
- Taxonomia Dracônica
- Onboarding
- EggScreen
- Orbs
- Absorção
- HatchScreen
- DragonTypeResolver
- DragonFactory
- Criação de `dragonData`
- Diário Dia 1
- Transição irreversível ovo → dragão

## Próximo passo

O próximo prompt é:

```text
Prompt 5 — Tela do Dragão, Alimentação Básica e Diário Inicial
```

Arquivo:

```text
docs/prompts/PROMPT_5_dragon_screen_alimentacao_diario.txt
```

## Regras críticas

Nunca quebrar:

1. Uma conta = um ovo ou um dragão, nunca os dois.
2. Não criar segundo ovo.
3. Não criar reset público.
4. Não transformar Vazio em escolha direta.
5. Não criar Dragão do Limiar automaticamente.
6. Não criar Dragão da Convergência jogável.
7. Não vender elemento específico.
8. Não vender dragão específico.
9. Não vender profissão direta.
10. Não implementar sistemas futuros antes da hora.

## Orbs e Absorção

Orbs são a mecânica principal da fase do ovo.

- Orbs do MVP: `fire`, `water`, `earth`
- Máximo no tray: 8
- Máximo no ovo: 5
- Hold para absorver: 2 segundos
- Nome oficial do bônus pós-orbs: **Absorção**
- Não usar “Amplifique o Ritual”

## Nascimento

O nascimento é irreversível.

Depois de confirmar o nome do dragão:

```ts
hasEgg = false
eggData = null
hasDragon = true
dragonData = novoDragonData
```

Ao recarregar, o jogo deve abrir em `DragonScreen`.

## Limiar

Dragões do Limiar:

- ultra raros;
- apenas 4 no mundo inteiro;
- 1 reservado ao criador;
- exigem controle global de servidor no futuro;
- não nascem automaticamente por `voidEnergy`;
- no MVP, Vazio alto apenas marca `voidTouched`.

## Convergência

Dragão da Convergência:

- linhagem única do criador;
- nasce dos 6 elementos: Fogo, Água, Terra, Ar, Metal e Vazio;
- apenas 1 no mundo inteiro;
- não é vendável;
- não é sorteável;
- não é jogável para jogadores comuns;
- deve permanecer apenas como estrutura/lore neste MVP.

## Visual

Neste momento, a prioridade é lógica, estado, save e gameplay funcional.

O visual final será feito depois.

Não gastar prompts implementando polish visual profundo antes de fechar:

1. DragonScreen;
2. alimentação;
3. diário;
4. expedições;
5. materiais;
6. ninho básico.
