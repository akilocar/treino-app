// ===== Conversa com o servidor: login, salvar e carregar, vídeos =====
// Os dados ficam no servidor (D1). Uma cópia fica no aparelho para o treino funcionar sem internet;
// o que foi feito sem internet sobe sozinho quando a conexão volta.
var API = {
  req: function (metodo, rota, corpo) {
    return fetch(rota, { method: metodo, headers: corpo ? { 'Content-Type': 'application/json' } : {}, body: corpo ? JSON.stringify(corpo) : undefined, credentials: 'same-origin' })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { j._status = r.status; return j; }); });
  }
};
var LOCAL = 'treino.local.v1';
var sinc = { versao: 0, pendente: false, enviando: false, erro: '', timer: null };

function lerLocal(uid) { try { var l = JSON.parse(localStorage.getItem(LOCAL)); return l && l.uid === uid ? l : null; } catch (e) { return null; } }
function gravarLocal() { try { localStorage.setItem(LOCAL, JSON.stringify({ uid: USR.id, dados: st, versao: sinc.versao, pendente: sinc.pendente })); } catch (e) {} }

function salva() {
  st.atualizadoEm = Date.now();
  sinc.pendente = true; gravarLocal();
  clearTimeout(sinc.timer); sinc.timer = setTimeout(envia, 700);
}
function envia() {
  if (!sinc.pendente || sinc.enviando || !USR) return;
  sinc.enviando = true;
  API.req('PUT', '/api/estado', { dados: st, versao: sinc.versao }).then(function (r) {
    sinc.enviando = false;
    if (r._status === 200) { sinc.versao = r.versao; sinc.pendente = false; sinc.erro = ''; gravarLocal(); pintaSinc(); return; }
    if (r._status === 409) {
      // outro aparelho salvou antes: fica com o mais recente
      if (r.dados && (r.dados.atualizadoEm || 0) > (st.atualizadoEm || 0)) { st = normaliza(r.dados); sinc.versao = r.versao; sinc.pendente = false; gravarLocal(); desenha(); toast('Atualizado com o que foi salvo em outro aparelho'); }
      else { sinc.versao = r.versao; envia(); }
      return;
    }
    if (r._status === 401) { sinc.erro = 'Sessão expirada'; pintaSinc(); telaLogin('Sua sessão expirou. Entre de novo.'); return; }
    sinc.erro = r.erro || 'Sem conexão'; pintaSinc();
  }).catch(function () { sinc.enviando = false; sinc.erro = 'Sem internet — salvo no aparelho'; pintaSinc(); });
}
setInterval(function () { if (sinc.pendente) envia(); }, 20000);
window.addEventListener('online', function () { if (sinc.pendente) envia(); });

function pintaSinc() {
  var el = document.getElementById('sinc'); if (!el) return;
  el.textContent = sinc.erro ? sinc.erro : sinc.pendente ? 'Salvando…' : '';
  el.hidden = !(sinc.erro || sinc.pendente);
}

function normaliza(d) {
  d = d || {};
  var p = d.perfil;
  var ok = p && (p.sexo === 'F' || p.sexo === 'M') && DIVISOES[p.sexo][p.dias] && OBJ[p.objetivo] && NIV[p.nivel] && Array.isArray(p.equip);
  var r = { perfil: ok ? p : null, plano: ok ? d.plano || null : null, historico: d.historico || [], treino: ok ? d.treino || null : null, atualizadoEm: d.atualizadoEm || 0 };
  if (r.perfil && (!r.plano || !Array.isArray(r.plano.dias) || !r.plano.dias.length)) r.plano = gerarPlano(r.perfil, 0); // perfil sem ficha: monta de novo
  return r;
}

function carregaDados() {
  var loc = lerLocal(USR.id);
  return API.req('GET', '/api/estado').then(function (r) {
    if (r._status !== 200) throw new Error(r.erro || 'Falha ao carregar');
    var srv = normaliza(r.dados);
    if (loc && loc.pendente && (loc.dados.atualizadoEm || 0) >= (srv.atualizadoEm || 0)) {
      st = normaliza(loc.dados); sinc.versao = r.versao; sinc.pendente = true; envia();
    } else { st = srv; sinc.versao = r.versao; sinc.pendente = false; gravarLocal(); }
  }).catch(function (e) {
    if (loc) { st = normaliza(loc.dados); sinc.versao = loc.versao; sinc.pendente = loc.pendente; sinc.erro = 'Sem internet — usando a cópia do aparelho'; return; }
    throw e;
  });
}

var VIDEOS = {};
function carregaVideos() {
  return API.req('GET', '/api/videos').then(function (r) {
    VIDEOS = {}; (r.videos || []).forEach(function (v) { VIDEOS[v.ex_id + '|' + v.sexo] = v.enviado_em; });
  }).catch(function () {});
}
// Vídeos: o enviado pelo admin (R2) tem prioridade; senão usa o vídeo padrão que vem junto com o app (public/videos).
function temVideoEnviado(id, sexo) { return !!VIDEOS[id + '|' + (sexo || st.perfil.sexo)]; }
function temVideoPadrao(id, sexo) { return VIDEOS_PADRAO.indexOf(id + '-' + (sexo || st.perfil.sexo)) >= 0; }
function temVideoDoSexo(id, sexo) { return temVideoEnviado(id, sexo) || temVideoPadrao(id, sexo); }
// Sem vídeo do sexo do perfil, usa o do outro sexo (melhor que ficar sem demonstração).
function sexoDoVideo(id, sexo) { sexo = sexo || st.perfil.sexo; var outro = sexo === 'F' ? 'M' : 'F'; return temVideoDoSexo(id, sexo) ? sexo : (temVideoDoSexo(id, outro) ? outro : null); }
function temVideo(id, sexo) { return !!sexoDoVideo(id, sexo); }
function urlVideo(id, sexo) {
  sexo = sexoDoVideo(id, sexo) || sexo || st.perfil.sexo;
  if (temVideoEnviado(id, sexo)) return '/api/video/' + id + '/' + sexo + '?v=' + encodeURIComponent(VIDEOS[id + '|' + sexo]);
  return '/videos/' + id + '-' + sexo + '.mp4';
}

function enviaVideo(id, sexo, arq, progresso) {
  return new Promise(function (ok, falha) {
    var x = new XMLHttpRequest();
    x.open('PUT', '/api/video/' + id + '/' + sexo);
    x.setRequestHeader('Content-Type', arq.type || 'video/mp4');
    x.upload.onprogress = function (e) { if (e.lengthComputable) progresso(e.loaded / e.total); };
    x.onload = function () { var j = {}; try { j = JSON.parse(x.responseText); } catch (e) {} if (x.status === 200) ok(j); else falha(new Error(j.erro || ('Erro ' + x.status))); };
    x.onerror = function () { falha(new Error('Sem conexão')); };
    x.send(arq);
  });
}

// Fotos e vídeos da academia viram imagens pequenas (1024 px) antes de ir para a IA.
function reduzImagem(arq) {
  return new Promise(function (ok, falha) {
    var img = new Image(); var u = URL.createObjectURL(arq);
    img.onload = function () { ok(desenhaQuadro(img, img.naturalWidth, img.naturalHeight)); URL.revokeObjectURL(u); };
    img.onerror = function () { URL.revokeObjectURL(u); falha(new Error('Não deu para abrir ' + arq.name)); };
    img.src = u;
  });
}
function desenhaQuadro(fonte, w, h) {
  var s = Math.min(1, 1024 / Math.max(w, h)), c = document.createElement('canvas');
  c.width = Math.round(w * s); c.height = Math.round(h * s);
  c.getContext('2d').drawImage(fonte, 0, 0, c.width, c.height);
  return c.toDataURL('image/jpeg', 0.72);
}
function quadrosDoVideo(arq, n) {
  return new Promise(function (ok, falha) {
    var v = document.createElement('video'), u = URL.createObjectURL(arq), out = [], i = 0;
    v.muted = true; v.playsInline = true; v.preload = 'auto'; v.src = u;
    v.onerror = function () { URL.revokeObjectURL(u); falha(new Error('Não deu para abrir o vídeo ' + arq.name)); };
    v.onloadedmetadata = function () {
      var dur = v.duration || 1;
      function prox() { if (i >= n) { URL.revokeObjectURL(u); ok(out); return; } v.currentTime = Math.min(dur - 0.1, dur * (i + 0.5) / n); }
      v.onseeked = function () { out.push(desenhaQuadro(v, v.videoWidth, v.videoHeight)); i++; prox(); };
      prox();
    };
  });
}
function lerAparelhosIA(arquivos) {
  var fotos = [], videos = [];
  Array.prototype.forEach.call(arquivos, function (a) { (/^video\//.test(a.type) ? videos : fotos).push(a); });
  var porVideo = videos.length ? Math.max(3, Math.floor((12 - Math.min(fotos.length, 12)) / videos.length)) : 0;
  return Promise.all(fotos.slice(0, 12).map(reduzImagem).concat(videos.map(function (v) { return quadrosDoVideo(v, porVideo); })))
    .then(function (lst) {
      var imgs = [].concat.apply([], lst).slice(0, 12);
      var lista = {}; Object.keys(APARELHOS).forEach(function (k) { lista[k] = APARELHOS[k]; }); Object.keys(CARDIO).forEach(function (k) { lista[k] = CARDIO[k]; });
      return API.req('POST', '/api/aparelhos/ler', { imagens: imgs, lista: lista });
    });
}
