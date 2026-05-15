# ARC: AETHON — GAME FLOW BIBLE v1.2

## 1. Visão Geral

Arc: Aethon é um idle mobile narrativo em que o jogador encontra um único ovo de dragão em um mundo pós-apocalíptico chamado Aethon.

O jogo é fofo e colorido na superfície, mas profundo e emocional por baixo.

O foco do jogo é:

- vínculo;
- tempo real;
- mistério;
- consequência;
- uma criatura única;
- progressão emocional.

O jogador não coleciona dragões. O jogador cria vínculo com um único dragão.

Frase operacional:

> O jogador encontra um ovo único, alimenta-o com orbs elementais em tempo real, usa Absorção para intensificar progresso, presencia um nascimento emocional, nomeia o dragão e passa a cuidar dele com alimentação, expedições, materiais, ninho e diário narrativo.

---

## 2. Regra Central Absoluta

**Uma conta = um ovo ou um dragão, nunca os dois.**

Regras obrigatórias:

- Se `hasEgg = true`, então `hasDragon = false`.
- Se `hasDragon = true`, então `hasEgg = false`.
- Não existe segundo ovo.
- Não existe reset narrativo público.
- Não existe backdoor em produção.
- O nascimento é irreversível.
- Se o save estiver inválido, não resetar automaticamente.
- Save inválido deve ir para tela de proteção.

Essa regra é o coração emocional do jogo.

---

## 3. Estados Principais

Estados principais:

- `NoSave`
- `Onboarding`
- `EggActive`
- `EggReadyToHatch`
- `HatchScene`
- `DragonActive`
- `DragonOnExpedition`
- `ExpeditionReturnReady`
- `NestManagement`
- `DiaryView`
- `InvalidSaveState`

Ordem correta de roteamento:

1. Abrir app.
2. Carregar save.
3. Validar save.
4. Se save inválido: `InvalidSaveScreen`.
5. Se não existe save: `OnboardingScreen`.
6. Se `hasDragon = true`: `DragonScreen`.
7. Senão, se `hasEgg = true` e `eggData.maturationProgress >= 1`: `HatchScreen`.
8. Senão, se `hasEgg = true`: `EggScreen`.
9. Senão: `OnboardingScreen`.

---

## 4. Elementos

Elementos públicos:

- Fogo / `fire`
- Água / `water`
- Terra / `earth`
- Ar / `air`
- Metal / `metal`

Elemento oculto/passivo:

- Vazio / `void`

O Vazio é sempre passivo. O jogador nunca escolhe inserir Vazio diretamente.

---

## 5. Ovo, Orbs e Absorção

A fase do ovo é a primeira fase principal do jogo.

Orbs são a mecânica principal da fase do ovo.

Regras:

- Orbs são gerados a cada 2 horas.
- Cada janela gera 1–2 orbs.
- Elementos possíveis dos orbs no MVP: `fire`, `water`, `earth`.
- Máximo de 8 orbs no tray.
- Máximo de 5 orbs orbitando o ovo.
- Jogador arrasta orb até o ovo usando pointer events.
- Ao soltar sobre o ovo, o orb sai do tray e passa a orbitar o ovo.
- Se tentar colocar mais de 5 orbs no ovo: “Segure o ovo pra absorver primeiro!”
- Se segurar o ovo sem orbs: “Arraste energias pro ovo primeiro!”

Absorção:

- O jogador segura o ovo por 2 segundos.
- Cada orb de Fogo adiciona `+0.05 fireEnergy`.
- Cada orb de Água adiciona `+0.05 waterEnergy`.
- Cada orb de Terra adiciona `+0.05 earthEnergy`.
- Toda absorção adiciona `+0.01 voidEnergy`, máximo `0.5`.
- Maturação aumenta em `orbsOnEgg.length * 0.02`.
- Mensagem após absorver: “✨ O ovo absorveu as energias!”

O bônus opcional pós-orbs se chama oficialmente:

**Absorção**

Não usar “Amplifique o Ritual”.

O ritual diário antigo não é a mecânica principal do MVP.

---

## 6. Offline dos Orbs

Ao abrir o app:

- Calcular janelas de 2 horas desde `lastOrbGenTime`.
- Gerar orbs acumulados até preencher o tray.
- Se o tray encher, atualizar `lastOrbGenTime` para agora.
- Nunca acumular mais de 8 orbs no tray.

Meta de balanceamento:

- Jogador muito ativo: nascimento em aproximadamente 3 dias.
- Jogador casual: nascimento em aproximadamente 5 dias.
- Jogador quase só idle: nascimento em aproximadamente 7 dias.

---

## 7. Nascimento

A cena de nascimento é o momento mais importante do MVP.

Sequência:

1. Maturação chega a 100%.
2. Bloquear interações comuns do ovo.
3. Resolver DNA elemental.
4. Ovo racha.
5. Luz do elemento dominante pulsa.
6. Ovo explode em partículas.
7. Dragão aparece.
8. Frase narrativa aparece.
9. Jogador nomeia o dragão.
10. Diário cria a entrada:

> Dia 1 — Ele abriu os olhos pela primeira vez. Me olhou. Não tinha medo.

11. Save muda para:

```ts
hasEgg = false
eggData = null
hasDragon = true
dragonData = novoDragonData
```

---

## 8. Taxonomia Dracônica

### Elementos públicos

- Fogo
- Água
- Terra
- Ar
- Metal

### Elemento oculto

- Vazio

### Linhagens puras

- Dragão de Fogo Puro
- Dragão das Águas Puras
- Dragão da Terra Antiga
- Dragão dos Ventos
- Dragão de Metal Vivo

### Linhagens fundidas públicas

- Fogo + Água = Dragão do Vapor
- Fogo + Terra = Dragão da Lava
- Água + Terra = Dragão das Marés Vivas
- Fogo + Ar = Dragão da Tempestade de Cinzas
- Água + Ar = Dragão da Névoa Celeste
- Terra + Ar = Dragão das Montanhas Suspensas
- Fogo + Metal = Dragão da Forja
- Água + Metal = Dragão do Mercúrio
- Terra + Metal = Dragão da Couraça
- Ar + Metal = Dragão das Lâminas do Vento

### Variantes internas do Limiar

Essas variantes são internas e não devem ser reveladas ao jogador.

- Vazio + Fogo = Chama Apagada
- Vazio + Água = Águas Paradas
- Vazio + Terra = Terra Oca
- Vazio + Ar = Céu Sem Eco
- Vazio + Metal = Metal Fantasma
- Vazio + Fogo + Metal = Forja do Limiar
- Vazio + Água + Ar = Névoa do Limiar

---

## 9. Dragões do Limiar

Dragões do Limiar são ultra raros.

Regras:

- Só existirão 4 Dragões do Limiar no jogo inteiro.
- 1 é reservado ao criador/fundador.
- Vazio alto não garante Limiar; apenas abre possibilidade.
- Em produção, exige controle global de servidor.
- O cliente nunca decide sozinho criar um Limiar.
- Não vender Dragão do Limiar.
- Não revelar condições ao jogador.

No MVP local, apenas preparar tipos e estrutura. Não implementar controle global real ainda.

---

## 10. Dragão da Convergência

Existe uma linhagem única do criador:

**Dragão da Convergência**

Categoria:

- Linhagem Única do Criador

Elementos:

- Fogo
- Água
- Terra
- Ar
- Metal
- Vazio

Quantidade:

- Apenas 1 no mundo inteiro.

Dono:

- Criador/fundador.

Regras:

- Não é vendável.
- Não é sorteável.
- Não é farmável.
- Não é público.
- Não deve quebrar o balanceamento.
- É o mais especial em significado, versatilidade e potencial, mas não deve tornar os outros dragões inúteis.

Lore:

> Não nasceu de um elemento dominante, nem de uma fusão comum. Ele surgiu quando os seis princípios de Aethon tocaram o mesmo ovo sem se destruírem. Fogo, Água, Terra, Ar, Metal e Vazio encontraram um equilíbrio impossível. O que nasceu não pertence a nenhuma linhagem conhecida. Ele não é apenas raro — ele é um sinal de que o Próximo Ciclo já começou.

No MVP, não implementar como sistema jogável. Apenas deixar previsto na taxonomia e nos tipos.

---

## 11. Dragão

Depois do nascimento, o jogo muda de mistério para vínculo.

Dados principais do dragão:

- `dragonName`
- `dragonType`
- `dominantElement`
- `vitality`
- `personalityTraits`
- `isOnExpedition`
- `diaryEntries`
- `crystals`
- `materials`
- `nestData`
- `professionProgress`

Alimentação MVP:

- Brasa Crocante: Cristal de Fogo x1, aumenta vitalidade e empurra para Corajoso.
- Caldo das Marés: Cristal de Água x1, aumenta vitalidade e empurra para Gentil.
- Raiz Dourada: Cristal de Terra x1, aumenta vitalidade e empurra para Leal.

---

## 12. Expedições e Materiais

Expedições ligam gameplay, recursos, lore, ninho e profissões.

Zona MVP:

**Ruínas de Ignareth**

Camada 1 — Fronteira:

- Duração: 30min–2h.
- Risco: nenhum.
- Recompensas: 1–3 Cristais de Fogo, 1 material comum de ruína, chance baixa de fragmento narrativo.

Camada 2 — Interior:

- Duração: 3h–6h.
- Risco: 10% lesão leve.
- Recompensas: 2–5 cristais mistos, 1–2 materiais incomuns, chance de Eco de Memória.

Materiais exemplos:

- Cinza Viva
- Pedra Antiga
- Musgo Luminoso
- Vidro de Tempestade
- Fragmento de Casca
- Eco do Vazio

---

## 13. Ninho

O ninho é a casa emocional do dragão.

Loop:

Expedições geram materiais → materiais alteram o ninho → ninho muda conforto, estética e bônus passivos → dragão reage → personalidade e profissão são influenciadas com o tempo.

Partes do ninho:

- Base
- Revestimento
- Fonte de calor
- Objeto de conforto
- Relíquia
- Ambiente elemental

No MVP, o ninho pode começar simples:

- slots visuais;
- poucos materiais;
- estrutura preparada para bônus futuros.

---

## 14. Profissões

Profissões não são escolhidas diretamente. Elas emergem da história vivida pelo dragão.

Fórmula:

> O que o dragão come + onde explora + como é o ninho + seus traços + seu tipo elemental + eventos vividos = profissão despertada.

Exemplos:

- Guardião de Cinzas
- Cantor de Marés
- Farejador de Ecos
- Tecedor de Ninho
- Memoriador
- Vigia do Limiar

Regra:

- Não vender profissão direta.
- Não permitir selecionar classe.
- A profissão deve parecer descoberta natural.

No MVP, apenas preparar estrutura. Não implementar sistema completo ainda.

---

## 15. Roadmap

### MVP obrigatório

- Onboarding
- Ovo
- Orbs
- Absorção
- Nascimento
- Dragão
- Alimentação básica
- Expedição básica
- Diário
- Materiais simples
- Ninho básico visual

### Preparar estrutura

- Ninho com slots expansíveis
- Materiais por zona
- Traços de personalidade
- Tendências de profissão
- Controle de eventos raros
- Proteção de save
- Servidor futuro para Limiar

### Futuro

- Profissões completas
- Crafting profundo
- Zonas além de Ignareth
- Personalidade com 5 eixos
- Portador
- Passe do Ciclo
- Jogo 2 / sociedade dos dragões
