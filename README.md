# Mergulho Raro — GitHub + Cloudflare (sem terminal)

Este repositório publica **site + API** como um Cloudflare **Worker com Static Assets** e usa **D1** para o ranking. É diferente de um projeto Cloudflare Pages: na Cloudflare, crie um **Worker por importação de repositório**.

## Etapa 1 — colocar os arquivos no GitHub

1. Acesse https://github.com/new, escolha o nome `mergulho-raro` e crie um repositório (pode ser privado).
2. Dentro dele, escolha **Add file → Upload files**.
3. **Extraia o ZIP** recebido. Envie **os arquivos e pastas de dentro dele**, incluindo `public/`, `src/`, `migrations/`, `wrangler.jsonc` e `package.json` (não envie apenas o ZIP). No GitHub, arrastar a **pasta extraída com seus arquivos** para o upload pode preservar pastas; confira o resultado antes de confirmar.
4. Clique **Commit changes**. O `index.html` fica em `public/index.html`, não na raiz.

## Etapa 2 — conectar o GitHub à Cloudflare

1. Acesse https://dash.cloudflare.com/ e entre em **Workers & Pages → Create application**.
2. Em **Import a repository**, conecte sua conta GitHub, escolha `mergulho-raro` e selecione **Workers** (não Pages).
3. Nome do Worker: `mergulho-raro` (**precisa ser igual** ao `name` do `wrangler.jsonc`). Branch de produção: `main` (ou a branch principal escolhida no GitHub).
4. Diretório raiz: `/` (raiz). **Build command**: deixe em branco caso seja opcional; se exigir um comando, use `npm install`. **Deploy command**: `npx wrangler deploy`.
5. Clique **Save and Deploy**. A configuração usa **provisionamento automático do D1**, portanto não precisa copiar UUID no arquivo. Se a criação automática não funcionar na sua conta, veja a seção de solução de problemas.
6. Depois do deploy, abra o endereço `.workers.dev` fornecido pela Cloudflare.

## Etapa 3 — criar as tabelas do ranking (uma vez)

1. No painel Cloudflare, abra **Storage & databases → D1** (o menu pode aparecer como **D1 SQL Database**).
2. Abra o banco de dados que a implantação criou para o binding `DB` (nome provável `mergulho-raro`, ou com prefixo do Worker).
3. Abra a aba **Console** (SQL).
4. Copie o texto inteiro do arquivo **`BANCO-D1-COLE-NO-PAINEL.sql`** e execute no console. Ele cria a tabela `scores` e o índice; não apaga pontuações.
5. No endereço do seu jogo, visite `/api/health`: deve retornar `{"ok":true,"database":true}`. **Importante:** esse teste confirma o binding, mas não confirma que a tabela foi criada. Faça uma partida diária, envie o apelido e verifique o ranking online.

## Atualizações (somente navegador)

Abra o repositório GitHub, substitua/edite arquivos e confirme o commit. A conexão do Workers Builds faz novo deploy automaticamente na branch de produção. **Não apague o banco D1 ao atualizar.**

## Se o banco D1 não for criado automaticamente

Crie um banco D1 pelo painel, copie o ID (UUID), e no editor web do GitHub abra `wrangler.jsonc`. Troque o item de `d1_databases` para:

```json
"d1_databases": [{"binding":"DB","database_name":"mergulho-raro","database_id":"SEU-UUID-AQUI"}]
```

Faça commit para gerar novo deploy. Também verifique em Workers & Pages → Worker → Settings → Bindings se `DB` aparece.

## Limitações atuais

- Ranking online do **desafio diário**; modo livre e recordes locais continuam no navegador.
- Respostas avaliadas por banco editorial; nem toda resposta correta está cadastrada.
- A API recalcula os pontos, mas ainda **não é antifraude completa**: sem sessões verificadas e sem limitação robusta de abuso. Não use para prêmios até fortalecer essa proteção.
- O apelido é público. Não use dados pessoais como nome completo, telefone ou e-mail.
- GitHub e Cloudflare não foram acessados/publicados por este pacote; configure suas contas no navegador.

Referências: https://developers.cloudflare.com/workers/ci-cd/builds/ e https://developers.cloudflare.com/workers/wrangler/configuration/ .


## Atualização V4
- Ao concluir as sete rodadas do **desafio diário**, a janela de apelido abre automaticamente.
- Depois de enviar, o jogo navega ao placar global, marcando a posição do jogador (inclusive fora do top 30).
- O jogo reconhece novas respostas, algumas abreviações e pequenas variações de escrita. O mesmo código de validação é importado pelo servidor e pelo cliente.
- Basta substituir o conteúdo do repositório existente com estes arquivos e fazer commit na branch principal. **Não recrie o banco D1 nem execute novamente o SQL**.
- A mudança não adiciona colunas no banco. Mantém placares existentes.
- Ainda há respostas possíveis ausentes do catálogo e a raridade é editorial, não baseada em estatísticas reais.


## Publicidade (V5)
Veja `GUIA-ADSENSE.md`. A configuracao fica em `public/ads-config.mjs`. Nenhuma mudanca no D1 e necessaria.

## Atualização V6
- Nova pontuação com **bônus de tempo**: quanto mais cedo responder, mais pontos extras naquela rodada.
- Novo sistema de **combo**: respostas reconhecidas em sequência aumentam o multiplicador de combo, gerando bônus adicionais.
- O **ranking online** usa a mesma lógica da interface, então a pontuação exibida ao jogador e a gravada no D1 permanecem alinhadas.
- Nova interface de resultado por rodada, mostrando **Base + Tempo + Combo**.
- O submarino agora **desce progressivamente** conforme a pontuação aumenta, e o oceano escurece por profundidade.
- Banco ampliado para **80 categorias** e mais de **2 mil respostas cadastradas/aceitas**.
- **Não é necessário recriar o banco D1** nem rodar novo SQL. Basta substituir os arquivos do repositório, fazer commit e aguardar o deploy automático da Cloudflare.


## V7 — INSTALAÇÃO (LEIA ANTES DO COMMIT)

**Esta atualização exige uma migração no D1 existente antes de publicar a V7.**

1. Cloudflare → Storage & databases → D1 → banco `mergulho-raro` → Console.
2. Abra o arquivo `BANCO-D1-ATUALIZACAO-V7.sql` e copie TODO o SQL para o console. Execute. Isso preserva os registros, amplia o limite antigo de pontuação (700) e cria `answer_suggestions`.
3. No GitHub, na raiz do repositório atual, envie o conteúdo extraído deste ZIP (mesmas pastas e arquivos) e faça commit. O deploy automático da Cloudflare então publicará a V7.
4. Confira `/api/health`; faça uma partida, envie o resultado e teste HOJE, SEMANA e MÊS no ranking.
5. Para revisar sugestões, abra o console D1 e execute: `SELECT id,question,answer,created_at FROM answer_suggestions WHERE status='pending' ORDER BY created_at DESC LIMIT 100;`.
6. Para aprovar uma resposta, adicione-a ao array da pergunta em `public/questions.mjs` (com raridade apropriada) e publique outro commit; opcionalmente marque a sugestão revisada com `UPDATE answer_suggestions SET status='approved' WHERE id=123;`.

**Novidades:** 134 categorias, 3.162 respostas, sugestão de resposta não reconhecida, rankings diário/semanal/mensal, animação de descida entre rodadas com bolhas e zonas do oceano. Os anúncios AdSense da V5 continuam no pacote, mantendo `public/ads-config.mjs`.

**Limites importantes:** não é possível cobrir literalmente todas as respostas possíveis com um catálogo fechado. Raridade é definida editorialmente, não por estatística de jogadores. A API recalcula a pontuação, mas os tempos enviados pelo navegador ainda não têm validação independente e podem ser adulterados: não use o ranking para distribuição de prêmios. Ranking semanal/mensal agrega por apelido, não por conta autenticada. Os resultados diários gerados antes da V7 não têm o bônus de tempo, mas são preservados; por isso comparações com rankings históricos são apenas indicativas.

**Importante:** `BANCO-D1-COLE-NO-PAINEL.sql` é apenas para instalação NOVA. Para um banco já no ar use EXCLUSIVAMENTE `BANCO-D1-ATUALIZACAO-V7.sql`.
