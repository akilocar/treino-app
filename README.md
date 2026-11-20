# Treino — seu personal no bolso

App de treino: a pessoa informa sexo, dias por semana, objetivo, experiência e os aparelhos da academia, e o app monta a ficha (A, B, C…), conduz o treino do dia, mostra como fazer cada exercício (passo a passo + vídeo) e guarda cargas e frequência.

- **Tela (PWA):** `public/index.html`, instala na tela inicial do celular e abre sem internet
- **API:** `src/worker.js` (Cloudflare Worker), rotas em `/api/*`
- **Banco:** Cloudflare D1 `treino` (`DB`). As tabelas são criadas sozinhas no primeiro acesso
- **Vídeos:** Cloudflare R2 `treino-arquivos` (`ARQ`), um vídeo por exercício e por sexo
- **IA (ler aparelhos pelas fotos):** usa `GEMINI_API_KEY` se existir; senão usa o Workers AI (`AI`, Llama 4 Scout)

## Contas

- **Primeiro acesso:** só o e-mail `akilocar@gmail.com` cria a primeira conta (administrador), e só enquanto não existe nenhuma conta.
- **Outras pessoas:** o administrador cadastra em Ajustes → Administração → Pessoas, com uma senha provisória. No primeiro acesso a pessoa troca a senha.
- Sessão de 180 dias por aparelho. 5 senhas erradas bloqueiam 15 minutos. Trocar a senha desconecta os outros aparelhos.
- Cada pessoa tem seu documento de dados (perfil, ficha, histórico). A cada 5 gravações uma cópia antiga é guardada (últimas 30) na tabela `copias`.

## Publicação

Cada envio para a branch `main` é publicado automaticamente pela Cloudflare (Workers Builds).

Configuração inicial, feita uma vez:
1. Em Workers & Pages, crie o app importando este repositório (Import a repository). O build usa `npx wrangler deploy`.
2. Abra o endereço `*.workers.dev` e faça o primeiro acesso com `akilocar@gmail.com`.
3. (Opcional) Em Settings → Variables and Secrets, adicione `GEMINI_API_KEY` para a IA dos aparelhos usar o Gemini.

## Rodar localmente

```
npm install
npx wrangler dev
```

## Como editar

A tela é um arquivo só (`public/index.html`), montado a partir dos pedaços em `fonte/`:

- `dados.js`: biblioteca de exercícios, aparelhos, academias prontas (Vivere do Lago) e divisões de treino
- `motor.js`: regras do treino (montar a ficha, séries e repetições, trocas, sugestão de carga). Funções puras
- `api.js`: conversa com o servidor (login, salvar com fila sem internet, vídeos, IA das fotos)
- `app.js`: telas e cliques
- `style.css` e `body.part`: visual e estrutura

Depois de editar, rode `python3 fonte/build.py` e envie o `public/index.html` gerado junto com os pedaços.

Endereço: https://treino-app.jrcc75.workers.dev
