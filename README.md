# Arc: Aethon

Repositório oficial:

https://github.com/wesley956/ARC---AETHON

Versão atual deste pacote: **aprovada até o Prompt 9**.

## Estado atual aprovado

- Fundação do projeto
- Save e validação
- Normalização de saves antigos
- Onboarding
- EggScreen (mobile-optimized)
- Orbs com drag/drop touch-friendly
- Absorção
- HatchScreen / nascimento
- DragonTypeResolver corrigido
- DragonData e diário Dia 1
- DragonScreen com navegação fixa
- Alimentação
- Cristais
- Diário inicial
- Expedições
- Materiais
- Lesão leve
- Timer de retorno
- Normalização segura de materiais antigos
- Ninho básico com slots
- Conforto do ninho
- **Mobile-first responsive design**
- **Touch-friendly buttons (44px min)**
- **Fixed bottom navigation**
- **Safe area support for notched devices**

## Próximo passo

Executar:

docs/prompts/PROMPT_10_polimento_visual_egg_hatch.txt

## Rodar localmente

```bash
npm install
npm run build
npm run dev
```

## Testar responsividade

1. Abrir DevTools (F12)
2. Ativar modo mobile (Ctrl+Shift+M)
3. Testar em 360px, 390px, 430px de largura
4. Verificar que não há scroll horizontal
5. Verificar que botões são tocáveis
6. Testar drag de orbs no mobile
