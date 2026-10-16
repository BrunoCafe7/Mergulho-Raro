# Mergulho Raro V5 — Anuncios

Esta versao deixa **dois espacos de publicidade**: na pagina inicial, depois do tutorial, e abaixo do ranking. **Durante as perguntas nao aparecem anuncios** e nenhum anuncio interfere no cadastro do placar. O jogo funciona normalmente mesmo sem AdSense.

## Como ativar (100% no navegador)

1. Cadastre o seu site no [Google AdSense](https://adsense.google.com/) e aguarde a aprovacao do site. Pode ser exigido dominio proprio.
2. No AdSense, crie **2 unidades de anuncios display responsivos** e copie os respectivos IDs numericos (`data-ad-slot`).
3. No GitHub, abra `public/ads-config.mjs`, clique em editar e preencha `ADSENSE_CLIENT` (`ca-pub-...`) e os dois IDs em `AD_SLOTS`. Salve com **Commit changes**.
4. Espere o deploy automatico da Cloudflare e visite a home e o ranking para verificar. Anuncios podem nao aparecer imediatamente, dependendo da conta, bloqueadores e inventario.
5. No AdSense, adicione/verifique o site pelo metodo disponibilizado. Se solicitar codigo no `head`, use `public/index.html`. Para `ads.txt`, crie `public/ads.txt` com a linha exata fornecida pelo Google (nao copie IDs de exemplo).

**Importante:** esta versao prepara a exibicao, mas **nao gera receita automaticamente**; e necessaria conta aprovada, anuncios ativos e visitantes reais. Desative anuncios automaticos que possam cobrir o tabuleiro ou o formulario do ranking.

**Privacidade e consentimento:** antes de ativar publicidade, publique politica de privacidade apropriada, informe o uso de cookies e avalie necessidade de plataforma de gestao de consentimento conforme os paises atendidos e requisitos do Google/LGPD. O codigo nao inclui uma plataforma CMP nem pretende substituir essas exigencias.

**Politica Google:** unidades estao fora da area de jogo. Nao clique nos seus anuncios, nao incentive cliques e nao crie atualizacao/recarregamento automatico.

Se usar apenas o ID de publisher, sem as unidades, o projeto continua sem mostrar anuncios ate preencher os slots.
