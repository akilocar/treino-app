// Treino — API do app (Cloudflare Worker + D1 + R2)
// Rotas em /api/*; o resto é servido pelos arquivos estáticos de /public.

// Só este e-mail pode criar a primeira conta (a do administrador), e só enquanto não existe nenhuma.
const EMAIL_ADMIN = 'akilocar@gmail.com';
const SESSAO_DIAS = 180;
const MAX_FALHAS = 5;
const BLOQUEIO_MIN = 15;
const COPIAS_MAX = 30;              // cópias antigas dos dados guardadas por pessoa
const VIDEO_MAX = 95 * 1024 * 1024; // limite de envio de um vídeo
const ITERACOES = 100000;

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS usuarios (
     id TEXT PRIMARY KEY,
     email TEXT NOT NULL UNIQUE,
     nome TEXT NOT NULL DEFAULT '',
     salt TEXT NOT NULL,
     hash TEXT NOT NULL,
     iteracoes INTEGER NOT NULL,
     admin INTEGER NOT NULL DEFAULT 0,
     senha_provisoria INTEGER NOT NULL DEFAULT 0,
     versao_senha INTEGER NOT NULL DEFAULT 1,
     falhas INTEGER NOT NULL DEFAULT 0,
     bloqueado_ate INTEGER NOT NULL DEFAULT 0,
     criado_em TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS segredos (nome TEXT PRIMARY KEY, valor TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS estados (
     usuario_id TEXT PRIMARY KEY,
     dados TEXT NOT NULL,
     versao INTEGER NOT NULL,
     atualizado_em TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS copias (
     usuario_id TEXT NOT NULL,
     versao INTEGER NOT NULL,
     dados TEXT NOT NULL,
     salvo_em TEXT NOT NULL,
     PRIMARY KEY (usuario_id, versao))`,
  `CREATE TABLE IF NOT EXISTS videos (
     ex_id TEXT NOT NULL,
     sexo TEXT NOT NULL,
     chave TEXT NOT NULL,
     mime TEXT NOT NULL,
     tamanho INTEGER NOT NULL,
     enviado_em TEXT NOT NULL,
     PRIMARY KEY (ex_id, sexo))`,
];

let preparado = false;
async function prepara(db) {
  if (preparado) return;
  await db.batch(SCHEMA.map((s) => db.prepare(s)));
  preparado = true;
}

// ===== utilidades =====
function b64(buf) {
  let s = ''; const b = new Uint8Array(buf);
  for (let i = 0; i < b.length; i++) s += String.fromCharCode(b[i]);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function iguais(a, b) {
  if (a.length !== b.length) return false;
  let d = 0; for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}
function sorteia(n) { return b64(crypto.getRandomValues(new Uint8Array(n))); }
async function pbkdf2(senha, salt, iteracoes) {
  const k = await crypto.subtle.importKey('raw', new TextEncoder().encode(senha), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: new TextEncoder().encode(salt), iterations: iteracoes }, k, 256);
  return b64(bits);
}
async function hmac(segredo, texto) {
  const k = await crypto.subtle.importKey('raw', new TextEncoder().encode(segredo), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return b64(await crypto.subtle.sign('HMAC', k, new TextEncoder().encode(texto)));
}
function json(obj, status = 200, extra = {}) {
  return new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...extra } });
}
function cookie(req, nome) {
  const m = (req.headers.get('Cookie') || '').match(new RegExp('(?:^|;\\s*)' + nome + '=([^;]+)'));
  return m ? m[1] : null;
}
function agora() { return new Date().toISOString(); }
function emailOk(e) { return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e); }
function normEmail(e) { return String(e || '').trim().toLowerCase(); }
async function corpo(req) { try { return await req.json(); } catch (e) { return {}; } }

async function segredo(db) {
  const r = await db.prepare('SELECT valor FROM segredos WHERE nome = ?').bind('sessao').first();
  if (r) return r.valor;
  const v = sorteia(32);
  await db.prepare('INSERT OR IGNORE INTO segredos (nome, valor) VALUES (?, ?)').bind('sessao', v).run();
  return (await db.prepare('SELECT valor FROM segredos WHERE nome = ?').bind('sessao').first()).valor;
}

// ===== sessão =====
async function criaSessao(db, u) {
  const exp = Date.now() + SESSAO_DIAS * 864e5;
  const base = u.id + '.' + u.versao_senha + '.' + exp;
  const tok = base + '.' + await hmac(await segredo(db), base);
  return 'sessao=' + tok + '; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=' + SESSAO_DIAS * 86400;
}
const SAIR = 'sessao=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0';
async function usuarioDaSessao(req, db) {
  const tok = cookie(req, 'sessao'); if (!tok) return null;
  const p = tok.split('.'); if (p.length !== 4) return null;
  const base = p.slice(0, 3).join('.');
  if (!iguais(p[3], await hmac(await segredo(db), base))) return null;
  if (+p[2] < Date.now()) return null;
  const u = await db.prepare('SELECT * FROM usuarios WHERE id = ?').bind(p[0]).first();
  if (!u || String(u.versao_senha) !== p[1]) return null;
  return u;
}
function publico(u) { return { id: u.id, email: u.email, nome: u.nome, admin: !!u.admin, senha_provisoria: !!u.senha_provisoria }; }

async function novoUsuario(db, email, nome, senha, admin, provisoria) {
  const salt = sorteia(16);
  const u = { id: 'u' + Date.now().toString(36) + sorteia(4), email, nome, salt, hash: await pbkdf2(senha, salt, ITERACOES), iteracoes: ITERACOES,
    admin: admin ? 1 : 0, senha_provisoria: provisoria ? 1 : 0, versao_senha: 1 };
  await db.prepare('INSERT INTO usuarios (id, email, nome, salt, hash, iteracoes, admin, senha_provisoria, versao_senha, criado_em) VALUES (?,?,?,?,?,?,?,?,?,?)')
    .bind(u.id, u.email, u.nome, u.salt, u.hash, u.iteracoes, u.admin, u.senha_provisoria, 1, agora()).run();
  return u;
}

async function eu(req, db) {
  const u = await usuarioDaSessao(req, db);
  if (u) return json({ usuario: publico(u) });
  const n = await db.prepare('SELECT COUNT(*) AS n FROM usuarios').first();
  return json({ usuario: null, primeiro_acesso: !n.n }, 200);
}

async function primeiroAcesso(req, db) {
  const n = await db.prepare('SELECT COUNT(*) AS n FROM usuarios').first();
  if (n.n) return json({ erro: 'O primeiro acesso já foi feito. Entre com e-mail e senha.' }, 409);
  const b = await corpo(req);
  const email = normEmail(b.email);
  if (email !== EMAIL_ADMIN) return json({ erro: 'Só o administrador pode fazer o primeiro acesso.' }, 403);
  if (String(b.senha || '').length < 8) return json({ erro: 'A senha precisa ter pelo menos 8 caracteres.' }, 400);
  const u = await novoUsuario(db, email, String(b.nome || '').trim().slice(0, 60), String(b.senha), true, false);
  return json({ usuario: publico(u) }, 200, { 'Set-Cookie': await criaSessao(db, u) });
}

async function entrar(req, db) {
  const b = await corpo(req);
  const email = normEmail(b.email), senha = String(b.senha || '');
  const u = await db.prepare('SELECT * FROM usuarios WHERE email = ?').bind(email).first();
  const erro = json({ erro: 'E-mail ou senha incorretos.' }, 401);
  if (!u) { await pbkdf2(senha, 'x', ITERACOES); return erro; }
  if (u.bloqueado_ate > Date.now()) {
    const min = Math.ceil((u.bloqueado_ate - Date.now()) / 60000);
    return json({ erro: 'Muitas tentativas erradas. Tente de novo em ' + min + ' min.' }, 429);
  }
  if (!iguais(await pbkdf2(senha, u.salt, u.iteracoes), u.hash)) {
    const f = u.falhas + 1;
    await db.prepare('UPDATE usuarios SET falhas = ?, bloqueado_ate = ? WHERE id = ?')
      .bind(f >= MAX_FALHAS ? 0 : f, f >= MAX_FALHAS ? Date.now() + BLOQUEIO_MIN * 60000 : 0, u.id).run();
    return erro;
  }
  await db.prepare('UPDATE usuarios SET falhas = 0, bloqueado_ate = 0 WHERE id = ?').bind(u.id).run();
  return json({ usuario: publico(u) }, 200, { 'Set-Cookie': await criaSessao(db, u) });
}

async function trocarSenha(req, db, u) {
  const b = await corpo(req);
  if (!iguais(await pbkdf2(String(b.atual || ''), u.salt, u.iteracoes), u.hash)) return json({ erro: 'A senha atual está errada.' }, 400);
  if (String(b.nova || '').length < 8) return json({ erro: 'A nova senha precisa ter pelo menos 8 caracteres.' }, 400);
  const salt = sorteia(16);
  await db.prepare('UPDATE usuarios SET salt = ?, hash = ?, iteracoes = ?, senha_provisoria = 0, versao_senha = versao_senha + 1 WHERE id = ?')
    .bind(salt, await pbkdf2(String(b.nova), salt, ITERACOES), ITERACOES, u.id).run();
  const novo = await db.prepare('SELECT * FROM usuarios WHERE id = ?').bind(u.id).first();
  return json({ usuario: publico(novo) }, 200, { 'Set-Cookie': await criaSessao(db, novo) });
}

// ===== dados de treino (um documento por pessoa) =====
async function lerEstado(db, u) {
  const r = await db.prepare('SELECT dados, versao, atualizado_em FROM estados WHERE usuario_id = ?').bind(u.id).first();
  if (!r) return json({ dados: null, versao: 0 });
  return json({ dados: JSON.parse(r.dados), versao: r.versao, atualizado_em: r.atualizado_em });
}
async function gravarEstado(req, db, u) {
  const b = await corpo(req);
  if (!b.dados || typeof b.dados !== 'object') return json({ erro: 'Dados ausentes.' }, 400);
  const txt = JSON.stringify(b.dados);
  if (txt.length > 4 * 1024 * 1024) return json({ erro: 'Dados grandes demais.' }, 413);
  const atual = await db.prepare('SELECT dados, versao FROM estados WHERE usuario_id = ?').bind(u.id).first();
  const versaoAtual = atual ? atual.versao : 0;
  if (+b.versao !== versaoAtual) return json({ erro: 'conflito', versao: versaoAtual, dados: atual ? JSON.parse(atual.dados) : null }, 409);
  const nova = versaoAtual + 1, quando = agora();
  const ops = [
    db.prepare('INSERT INTO estados (usuario_id, dados, versao, atualizado_em) VALUES (?,?,?,?) ON CONFLICT(usuario_id) DO UPDATE SET dados = excluded.dados, versao = excluded.versao, atualizado_em = excluded.atualizado_em WHERE estados.versao = ?')
      .bind(u.id, txt, nova, quando, versaoAtual),
  ];
  if (atual && versaoAtual % 5 === 0) {
    ops.push(db.prepare('INSERT OR REPLACE INTO copias (usuario_id, versao, dados, salvo_em) VALUES (?,?,?,?)').bind(u.id, versaoAtual, atual.dados, quando));
    ops.push(db.prepare('DELETE FROM copias WHERE usuario_id = ? AND versao NOT IN (SELECT versao FROM copias WHERE usuario_id = ? ORDER BY versao DESC LIMIT ?)').bind(u.id, u.id, COPIAS_MAX));
  }
  const res = await db.batch(ops);
  if (!res[0].meta.changes) return json({ erro: 'conflito', versao: versaoAtual }, 409);
  return json({ versao: nova, atualizado_em: quando });
}

// ===== vídeos (biblioteca única, um vídeo por exercício e por sexo) =====
const ID_OK = /^[a-z0-9_]{2,40}$/;
async function listaVideos(db) {
  const r = await db.prepare('SELECT ex_id, sexo, tamanho, enviado_em FROM videos').all();
  return json({ videos: r.results });
}
async function serveVideo(req, db, r2, ex, sexo) {
  const v = await db.prepare('SELECT chave, mime FROM videos WHERE ex_id = ? AND sexo = ?').bind(ex, sexo).first();
  if (!v) return json({ erro: 'Vídeo não encontrado.' }, 404);
  const range = req.headers.get('Range');
  const obj = await r2.get(v.chave, range ? { range: req.headers } : undefined);
  if (!obj) return json({ erro: 'Arquivo do vídeo sumiu do armazenamento.' }, 404);
  const h = new Headers({ 'Content-Type': v.mime, 'Accept-Ranges': 'bytes', 'Cache-Control': 'private, max-age=86400', ETag: obj.httpEtag });
  if (range && obj.range) {
    const ini = obj.range.offset || 0, len = obj.range.length != null ? obj.range.length : obj.size - ini;
    h.set('Content-Range', 'bytes ' + ini + '-' + (ini + len - 1) + '/' + obj.size);
    h.set('Content-Length', String(len));
    return new Response(obj.body, { status: 206, headers: h });
  }
  h.set('Content-Length', String(obj.size));
  return new Response(obj.body, { headers: h });
}
async function gravaVideo(req, db, r2, ex, sexo) {
  const mime = (req.headers.get('Content-Type') || '').split(';')[0];
  if (!/^video\//.test(mime)) return json({ erro: 'O arquivo precisa ser um vídeo.' }, 400);
  const tam = +req.headers.get('Content-Length') || 0;
  if (tam > VIDEO_MAX) return json({ erro: 'Vídeo grande demais (máx. 95 MB). Exporte em 720p.' }, 413);
  const ext = mime === 'video/quicktime' ? 'mov' : mime === 'video/webm' ? 'webm' : 'mp4';
  const chave = 'videos/' + ex + '/' + sexo + '-' + Date.now().toString(36) + '.' + ext;
  const obj = await r2.put(chave, req.body, { httpMetadata: { contentType: mime } });
  const antigo = await db.prepare('SELECT chave FROM videos WHERE ex_id = ? AND sexo = ?').bind(ex, sexo).first();
  await db.prepare('INSERT OR REPLACE INTO videos (ex_id, sexo, chave, mime, tamanho, enviado_em) VALUES (?,?,?,?,?,?)')
    .bind(ex, sexo, chave, mime, obj.size, agora()).run();
  if (antigo && antigo.chave !== chave) await r2.delete(antigo.chave);
  return json({ ok: true, tamanho: obj.size });
}
async function apagaVideo(db, r2, ex, sexo) {
  const v = await db.prepare('SELECT chave FROM videos WHERE ex_id = ? AND sexo = ?').bind(ex, sexo).first();
  if (v) { await r2.delete(v.chave); await db.prepare('DELETE FROM videos WHERE ex_id = ? AND sexo = ?').bind(ex, sexo).run(); }
  return json({ ok: true });
}

// ===== pessoas (só o administrador) =====
async function pessoas(req, db, rota, m) {
  if (m === 'GET' && rota === '/api/pessoas') {
    const r = await db.prepare('SELECT u.id, u.email, u.nome, u.admin, u.senha_provisoria, u.criado_em, e.atualizado_em AS ultimo_uso FROM usuarios u LEFT JOIN estados e ON e.usuario_id = u.id ORDER BY u.criado_em').all();
    return json({ pessoas: r.results });
  }
  if (m === 'POST' && rota === '/api/pessoas') {
    const b = await corpo(req);
    const email = normEmail(b.email);
    if (!emailOk(email)) return json({ erro: 'E-mail inválido.' }, 400);
    if (String(b.senha || '').length < 8) return json({ erro: 'A senha provisória precisa ter pelo menos 8 caracteres.' }, 400);
    const ja = await db.prepare('SELECT id FROM usuarios WHERE email = ?').bind(email).first();
    if (ja) return json({ erro: 'Já existe uma conta com esse e-mail.' }, 409);
    const u = await novoUsuario(db, email, String(b.nome || '').trim().slice(0, 60), String(b.senha), false, true);
    return json({ pessoa: publico(u) });
  }
  const mm = rota.match(/^\/api\/pessoas\/([A-Za-z0-9_-]+)(\/senha)?$/);
  if (mm) {
    const alvo = await db.prepare('SELECT * FROM usuarios WHERE id = ?').bind(mm[1]).first();
    if (!alvo) return json({ erro: 'Pessoa não encontrada.' }, 404);
    if (m === 'POST' && mm[2]) {
      const b = await corpo(req);
      if (String(b.senha || '').length < 8) return json({ erro: 'A senha provisória precisa ter pelo menos 8 caracteres.' }, 400);
      const salt = sorteia(16);
      await db.prepare('UPDATE usuarios SET salt = ?, hash = ?, iteracoes = ?, senha_provisoria = 1, versao_senha = versao_senha + 1, falhas = 0, bloqueado_ate = 0 WHERE id = ?')
        .bind(salt, await pbkdf2(String(b.senha), salt, ITERACOES), ITERACOES, alvo.id).run();
      return json({ ok: true });
    }
    if (m === 'DELETE' && !mm[2]) {
      if (alvo.admin) return json({ erro: 'A conta do administrador não pode ser apagada.' }, 400);
      await db.batch([
        db.prepare('DELETE FROM estados WHERE usuario_id = ?').bind(alvo.id),
        db.prepare('DELETE FROM copias WHERE usuario_id = ?').bind(alvo.id),
        db.prepare('DELETE FROM usuarios WHERE id = ?').bind(alvo.id),
      ]);
      return json({ ok: true });
    }
  }
  return json({ erro: 'Rota não encontrada.' }, 404);
}

// ===== IA: reconhecer aparelhos pelas fotos =====
function promptAparelhos(lista) {
  return 'Você é um personal trainer. As imagens são fotos de uma academia. Identifique quais destes aparelhos aparecem nas fotos ' +
    '(responda só com as chaves da lista):\n' + Object.keys(lista).map((k) => '- ' + k + ': ' + lista[k]).join('\n') +
    '\n\nRegras: só marque o que você realmente vê. Máquinas combinadas (ex.: extensora com flexora, abdutora com adutora) marcam as duas chaves que existirem. ' +
    'Em "outros", liste em português aparelhos que você vê e que não estão na lista.\n' +
    'Responda APENAS com JSON neste formato: {"aparelhos":["chave1","chave2"],"outros":["nome"]}';
}
let listaGemini = null;
async function modelosGemini(chave) {
  if (listaGemini) return listaGemini;
  const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models?pageSize=200&key=' + chave);
  const j = await r.json().catch(() => null);
  if (!r.ok) throw new Error('Gemini: ' + (j && j.error && j.error.message || r.status));
  const nomes = ((j && j.models) || [])
    .filter((m) => (m.supportedGenerationMethods || []).indexOf('generateContent') >= 0)
    .map((m) => String(m.name || '').replace(/^models\//, ''))
    .filter((n) => /^gemini-/.test(n))
    .filter((n) => !/(embedding|aqa|image-generation|tts|live|native|dialog|preview|transcribe|robotics|computer-use|nano|customtools)/.test(n));
  function nota(n) {
    const v = parseFloat((n.match(/gemini-(\d+(?:\.\d+)?)/) || [0, 0])[1]) || 9;
    const tipo = /flash/.test(n) && !/lite/.test(n) ? 3 : /pro/.test(n) ? 2 : 1; // foto de academia: flash basta
    return tipo * 1000 + v * 10;
  }
  nomes.sort((a, b) => nota(b) - nota(a));
  if (!nomes.length) throw new Error('Gemini: nenhum modelo disponível nesta chave');
  listaGemini = nomes.slice(0, 3);
  return listaGemini;
}
async function visao(env, prompt, imagens) {
  if (env.GEMINI_API_KEY) {
    let ultimo = '';
    for (const modelo of (env.IA_MODELO ? [env.IA_MODELO] : await modelosGemini(env.GEMINI_API_KEY))) {
      const parts = [{ text: prompt }].concat(imagens.map((d) => ({ inline_data: { mime_type: d.split(';')[0].slice(5), data: d.split(',')[1] } })));
      const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models/' + modelo + ':generateContent?key=' + env.GEMINI_API_KEY, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts }], generationConfig: { temperature: 0, responseMimeType: 'application/json' } }),
      });
      const j = await r.json().catch(() => null);
      if (!r.ok) { ultimo = modelo + ': ' + (j && j.error && j.error.message || r.status); continue; }
      const t = j && j.candidates && j.candidates[0] && j.candidates[0].content && (j.candidates[0].content.parts || []).map((p) => p.text || '').join('');
      if (t) return { texto: t, modelo };
      ultimo = modelo + ': não devolveu texto';
    }
    throw new Error('Gemini — ' + ultimo);
  }
  if (env.AI) {
    const modelo = '@cf/meta/llama-4-scout-17b-16e-instruct';
    const content = [{ type: 'text', text: prompt }].concat(imagens.slice(0, 5).map((d) => ({ type: 'image_url', image_url: { url: d } })));
    const r = await env.AI.run(modelo, { messages: [{ role: 'user', content }], max_tokens: 800, temperature: 0 });
    const t = r && (typeof r.response === 'string' ? r.response : JSON.stringify(r.response));
    if (t) return { texto: t, modelo: 'Workers AI (Llama 4 Scout)' };
    throw new Error('Workers AI não devolveu texto');
  }
  throw new Error('sem_ia');
}
async function lerAparelhos(req, env) {
  const b = await corpo(req);
  const imagens = (Array.isArray(b.imagens) ? b.imagens : []).filter((d) => /^data:image\/(jpeg|png|webp);base64,/.test(d)).slice(0, 12);
  const lista = b.lista && typeof b.lista === 'object' ? b.lista : null;
  if (!imagens.length) return json({ erro: 'Nenhuma foto recebida.' }, 400);
  if (!lista) return json({ erro: 'Lista de aparelhos ausente.' }, 400);
  let saida;
  try { saida = await visao(env, promptAparelhos(lista), imagens); }
  catch (e) {
    const msg = String(e && e.message || e);
    return json({ erro: msg === 'sem_ia' ? 'A leitura por IA ainda não está ligada neste app.' : 'A IA não conseguiu ler as fotos: ' + msg }, 502);
  }
  const m = saida.texto.match(/\{[\s\S]*\}/);
  let r = null; try { r = m && JSON.parse(m[0]); } catch (e) {}
  if (!r || !Array.isArray(r.aparelhos)) return json({ erro: 'A IA respondeu num formato inesperado. Tente com outras fotos.', bruto: saida.texto.slice(0, 500) }, 502);
  return json({
    aparelhos: r.aparelhos.filter((k) => Object.prototype.hasOwnProperty.call(lista, k)),
    outros: (Array.isArray(r.outros) ? r.outros : []).map(String).slice(0, 20),
    modelo: saida.modelo, fotos: imagens.length,
  });
}

// ===== roteador =====
async function api(req, env) {
  const url = new URL(req.url), rota = url.pathname, m = req.method, db = env.DB;
  await prepara(db);
  if (m !== 'GET' && m !== 'HEAD') {
    const origem = req.headers.get('Origin');
    if (origem && origem !== url.origin) return json({ erro: 'Origem não permitida.' }, 403);
  }
  if (rota === '/api/eu' && m === 'GET') return eu(req, db);
  if (rota === '/api/primeiro-acesso' && m === 'POST') return primeiroAcesso(req, db);
  if (rota === '/api/entrar' && m === 'POST') return entrar(req, db);
  if (rota === '/api/sair' && m === 'POST') return json({ ok: true }, 200, { 'Set-Cookie': SAIR });

  const u = await usuarioDaSessao(req, db);
  if (!u) return json({ erro: 'Sessão expirada. Entre de novo.' }, 401, { 'Set-Cookie': SAIR });

  if (rota === '/api/senha' && m === 'POST') return trocarSenha(req, db, u);
  if (rota === '/api/estado' && m === 'GET') return lerEstado(db, u);
  if (rota === '/api/estado' && m === 'PUT') return gravarEstado(req, db, u);
  if (rota === '/api/videos' && m === 'GET') return listaVideos(db);
  if (rota === '/api/aparelhos/ler' && m === 'POST') return lerAparelhos(req, env);

  const v = rota.match(/^\/api\/video\/([a-z0-9_]+)\/(F|M)$/);
  if (v && ID_OK.test(v[1])) {
    if (m === 'GET' || m === 'HEAD') return serveVideo(req, db, env.ARQ, v[1], v[2]);
    if (!u.admin) return json({ erro: 'Só o administrador envia vídeos.' }, 403);
    if (m === 'PUT') return gravaVideo(req, db, env.ARQ, v[1], v[2]);
    if (m === 'DELETE') return apagaVideo(db, env.ARQ, v[1], v[2]);
  }
  if (rota.startsWith('/api/pessoas')) {
    if (!u.admin) return json({ erro: 'Só o administrador gerencia pessoas.' }, 403);
    return pessoas(req, db, rota, m);
  }
  return json({ erro: 'Rota não encontrada.' }, 404);
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (url.pathname.startsWith('/api/')) {
      try { return await api(req, env); }
      catch (e) { console.error(e); return json({ erro: 'Erro no servidor: ' + String(e && e.message || e) }, 500); }
    }
    return env.ASSETS.fetch(req);
  },
};
