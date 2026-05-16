# Arc: Aethon

Repositório oficial:

https://github.com/wesley956/ARC---AETHON

Versão atual deste pacote: **aprovada até o Prompt 12**.

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
- **PWA instalável (Prompt 12)**
- **Web App Manifest com display standalone**
- **Service Worker com cache básico**
- **Install App Prompt discreto**
- **Ícones SVG: principal, maskable, apple-touch**
- **Meta tags mobile completas**
- **Apple mobile web app tags**
- **Safe-area CSS para notch**

## Próximo passo

Executar:

docs/prompts/PROMPT_13_preparacao_release.txt

OU

docs/prompts/PROMPT_13_polimento_final_ux.txt

## Rodar localmente

```bash
npm install
npm run build
npm run dev
```

## Testar PWA

1. `npm run build && npm run preview`
2. DevTools > Application > Manifest
3. Confirmar nome "Arc: Aethon", display standalone, theme_color #7c3aed
4. DevTools > Application > Service Workers
5. Chrome: "Add to Home Screen" ou "Install App"
6. Testar offline após primeiro load

## Testar responsividade

1. Abrir DevTools (F12)
2. Ativar modo mobile (Ctrl+Shift+M)
3. Testar em 360px, 390px, 430px de largura
4. Verificar que não há scroll horizontal
5. Verificar que botões são tocáveis
6. Testar navegação entre abas
