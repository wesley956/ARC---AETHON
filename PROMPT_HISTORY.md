# PROMPT_HISTORY — Arc: Aethon

## Prompt 1 — Fundação

Criou a fundação do projeto:

- React + Vite + TypeScript
- SaveManager
- TimeManager
- GameStateValidator
- GameContext
- Onboarding
- EggScreen placeholder
- HatchScreen placeholder
- DragonScreen placeholder
- InvalidSaveScreen
- Taxonomia Dracônica inicial

## Prompt 2 — Correções da fundação

Corrigiu:

- Roteamento para HatchScene
- Reset diário
- `lastDayKey`
- Tipo específico para orbs do MVP
- Emoji da Terra
- Validação do save

## Prompt 3 — Orbs e Absorção

Implementou:

- Orbs arrastáveis
- Drop no ovo
- Orbs orbitando
- Hold de 2 segundos
- Absorção
- Energia elemental
- Vazio passivo
- Timer do próximo orb
- Botão Absorção placeholder
- Transição para HatchScene

## Prompt 3.1 — Correções finas de Orbs

Corrigiu:

- `pointercancel`
- `releasePointerCapture`
- Área de drop do ovo
- Timer `HH:MM:SS`
- “Tray cheio”
- Texto correto da Absorção
- Checagem de nascimento mais limpa

## Prompt 4 — Cena de Nascimento

Implementou:

- HatchScreen funcional
- DragonTypeResolver
- Sequência de nascimento
- Frases narrativas
- Input de nome
- DragonFactory
- Criação de `dragonData`
- Diário Dia 1
- Transição ovo → dragão

## Prompt 4.1 — Correções do nascimento

Corrigiu:

- IDs de dragões fundidos
- Validação do tipo resolvido
- Frases alinhadas com a taxonomia
- Vazio alto não cria Limiar automaticamente
- Convergência não jogável
- Risco de erro após confirmar nome

## Próximo

Prompt 5 — Tela do Dragão, Alimentação Básica e Diário Inicial.

Arquivo:

```text
docs/prompts/PROMPT_5_dragon_screen_alimentacao_diario.txt
```
