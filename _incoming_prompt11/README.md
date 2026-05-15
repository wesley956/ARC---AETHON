# Arc: Aethon

Repositório oficial:

https://github.com/wesley956/ARC---AETHON

Versão atual deste pacote: **aprovada até o Prompt 11**.

## Estado atual aprovado

- Fundação do projeto
- Save e validação
- Normalização de saves antigos
- Onboarding
- EggScreen (polimento visual Prompt 10)
- Orbs com drag/drop touch-friendly
- Absorção com feedback visual
- HatchScreen / nascimento (polimento visual Prompt 10)
- DragonTypeResolver corrigido
- DragonData e diário Dia 1
- DragonScreen com navegação fixa (polimento visual Prompt 11)
- Alimentação (polimento visual Prompt 11)
- Cristais
- Diário (polimento visual Prompt 11)
- Expedições (polimento visual Prompt 11)
- Materiais (polimento visual Prompt 11)
- Lesão leve
- Timer de retorno
- Normalização segura de materiais antigos
- Ninho básico com slots (polimento visual Prompt 11)
- Conforto do ninho
- **Mobile-first responsive design**
- **Touch-friendly buttons (44px min)**
- **Fixed bottom navigation**
- **Safe area support for notched devices**

## Próximo passo

Executar:

docs/prompts/PROMPT_12_pwa_instalacao_mobile.txt

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
6. Testar navegação entre abas
