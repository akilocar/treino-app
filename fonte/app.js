{
// ===== Estado =====
var st = normaliza(null);
var USR = null;
var ui = { tab: 'hoje', passo: 0, rasc: null, grupo: 'todos', busca: '', fichaDia: 0, sheet: null };
var descanso = null, relogio = null;

var $ = function (s) { return document.querySelector(s); };
function esc(t) { return String(t == null ? '' : t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
function toast(t) { var d = document.createElement('div'); d.className = 'toast'; d.textContent = t; document.body.appendChild(d); setTimeout(function () { d.remove(); }, 2200); }
function hojeISO(d) { d = d || new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
function inicioSemana(d) { d = new Date(d); var w = (d.getDay() + 6) % 7; d.setDate(d.getDate() - w); d.setHours(0, 0, 0, 0); return d; }
var OBJ = { hipertrofia: ['Ganhar massa', 'Definir e crescer músculo'], emagrecer: ['Emagrecer', 'Mais ritmo, menos descanso'], forca: ['Ficar mais forte', 'Cargas maiores, menos repetições'] };
var NIV = { 1: ['Iniciante', 'Até 6 meses de academia'], 2: ['Intermediária', '6 meses a 2 anos'], 3: ['Avançada', 'Mais de 2 anos'] };
var IC = {
  gear: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>',
  check: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l5 5L20 7"/></svg>',
  swap: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 4L3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7"/></svg>',
  play: '<svg class="ico" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>',
  info: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/></svg>',
  x: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  cam: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 8a2 2 0 0 1 2-2h2l2-2h6l2 2h2a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><circle cx="12" cy="13" r="4"/></svg>'
};
var FOTO_GRUPO = { quadriceps: 'pernas', panturrilha: 'pernas', gluteo: 'gluteo', abdutor: 'corpo', adutor: 'corpo', posterior: 'gluteo', costas: 'costas', ombro_post: 'costas', peito: 'peito', ombro: 'ombros', biceps: 'bracos', triceps: 'bracos', abdomen: 'abdomen' };
function thumb(id) { var e = EX[id]; return '<div class="thumb' + (temVideo(id) ? ' v' : '') + '" style="background-image:url(/fundos/m-' + FOTO_GRUPO[e.g] + '.webp)" aria-hidden="true"></div>'; }
// foto de fundo: troca com fade conforme a tela e o músculo do dia
var fundoAtual = '';
function poeFundo(nome, modo) {
  var f = document.getElementById('fundo'); if (!f) return;
  f.className = 'fundo' + (modo ? ' ' + modo : '');
  if (nome === fundoAtual) return; fundoAtual = nome;
  var cam = f.querySelectorAll('i'), on = f.querySelector('i.on'), prox = on === cam[0] ? cam[1] : cam[0];
  var img = new Image(); img.onload = function () { prox.style.backgroundImage = 'url(' + img.src + ')'; prox.classList.add('on'); if (on) on.classList.remove('on'); };
  img.src = '/fundos/' + nome + '.webp';
}
function fotoDoDia(dia) { var c = {}; dia.itens.forEach(function (it, i) { var g = FOTO_GRUPO[EX[it.id].g]; c[g] = (c[g] || 0) + (i < 2 ? 3 : 1); }); return Object.keys(c).sort(function (a, b) { return c[b] - c[a]; })[0] || 'corpo'; }

// ===== Boas-vindas (perfil) =====
function telaPerfil() {
  var r = ui.rasc, p = ui.passo;
  var ind = '<div class="passo-ind">' + [0, 1, 2, 3].map(function (i) { return '<i class="' + (i <= p ? 'on' : '') + '"></i>'; }).join('') + '</div>';
  var h = '<div class="top"><span class="mut sm">Passo ' + (p + 1) + ' de 4</span>' + (st.perfil ? '<button class="iconbtn" data-a="fecha-perfil" aria-label="Fechar">' + IC.x + '</button>' : '') + '</div>' + ind;
  if (p === 0) {
    h += '<h1>Seu personal no bolso.</h1><p class="mut">Conte um pouco sobre você e o app monta sua ficha.</p>' +
      '<label class="sm" for="nome">Como você se chama?</label><input id="nome" class="campo-txt" value="' + esc(r.nome) + '" placeholder="Seu nome" autocomplete="given-name" style="margin:6px 0 14px">' +
      '<div class="sm">Sexo</div><div class="opcoes">' +
      op('sexo', 'F', 'Mulher', 'Ênfase em glúteo e pernas') + op('sexo', 'M', 'Homem', 'Divisão clássica por músculo') + '</div>';
  } else if (p === 1) {
    h += '<h1>Quantas vezes por semana você vai?</h1><p class="mut">O app divide os músculos para caber nesses dias.</p><div class="num">' +
      [2, 3, 4, 5, 6].map(function (n) { return '<button class="op ' + (r.dias === n ? 'on' : '') + '" data-a="set" data-k="dias" data-v="' + n + '">' + n + '</button>'; }).join('') + '</div>' +
      '<p class="mut sm">' + resumoDivisao(r) + '</p>';
  } else if (p === 2) {
    h += '<h1>Qual é o objetivo?</h1><div class="opcoes" style="grid-template-columns:1fr">' +
      Object.keys(OBJ).map(function (k) { return op('objetivo', k, OBJ[k][0], OBJ[k][1]); }).join('') + '</div>' +
      '<h3 style="margin-top:18px">Experiência</h3><div class="opcoes" style="grid-template-columns:1fr">' +
      [1, 2, 3].map(function (k) { return op('nivel', k, r.sexo === 'M' ? NIV[k][0].replace('ária', 'ário').replace('Avançada', 'Avançado') : NIV[k][0], NIV[k][1]); }).join('') + '</div>';
  } else {
    h += '<h1>O que tem na sua academia?</h1><p class="mut">O treino usa só esses aparelhos. Faltou algum? O app troca por outro exercício do mesmo músculo.</p>' +
      '<div class="chips">' + Object.keys(PRESETS).map(function (k) { return '<button class="chip" data-a="preset" data-v="' + k + '">' + PRESETS[k].nome + '</button>'; }).join('') + '</div>' +
      '<div class="fotos">' + IC.cam + '<div><b>Mandar fotos ou vídeo dos aparelhos</b></div><div class="mut sm">A IA reconhece cada aparelho e marca a lista sozinha. Você confere e ajusta.</div>' +
      (ui.lendo ? '<p class="sm"><b>Lendo as fotos…</b> isso leva uns 20 segundos.</p>' : '<label class="btn lin" style="margin-top:10px">Escolher fotos ou vídeo<input type="file" accept="image/*,video/*" multiple hidden data-a="fotos-academia"></label>') +
      (ui.leitura ? '<div class="' + (ui.leitura.erro ? 'aviso' : 'ok-box') + '" style="text-align:left;margin-top:10px">' + esc(ui.leitura.texto) + '</div>' : '') + '</div>' +
      '<h3 style="margin-top:14px">Musculação</h3>' + chk(APARELHOS, r) + '<h3 style="margin-top:18px">Cardio</h3>' + chk(CARDIO, r) +
      '<p class="mut sm" style="margin-top:12px">Exercícios com peso do corpo, colchonete e banco de casa sempre entram.</p>';
  }
  var ok = p === 0 ? r.sexo : p === 1 ? r.dias : p === 2 ? (r.objetivo && r.nivel) : true;
  h += '<div style="display:flex;gap:10px;margin-top:20px">' + (p > 0 ? '<button class="btn lin" data-a="voltar" style="min-height:54px">Voltar</button>' : '') +
    '<button class="btn pri full" data-a="avancar" ' + (ok ? '' : 'disabled style="opacity:.4"') + '>' + (p === 3 ? 'Montar meu treino' : 'Continuar') + '</button></div>';
  return h;
}
function chk(lista, r) { return Object.keys(lista).map(function (k) { var on = r.equip.indexOf(k) >= 0; return '<button class="check ' + (on ? 'on' : '') + '" data-a="equip" data-v="' + k + '"><i>' + (on ? IC.check : '') + '</i>' + lista[k] + '</button>'; }).join(''); }
function cardios() { var c = Object.keys(CARDIO).filter(function (k) { return st.perfil.equip.indexOf(k) >= 0; }).map(function (k) { return CARDIO[k].toLowerCase(); }); return c.length ? c.join(', ').replace(/, ([^,]*)$/, ' ou $1') : 'caminhada rápida ou polichinelo'; }
function op(k, v, t, s) { var on = String(ui.rasc[k]) === String(v); return '<button class="op ' + (on ? 'on' : '') + '" data-a="set" data-k="' + k + '" data-v="' + v + '"><b>' + t + '</b><span>' + s + '</span></button>'; }
function resumoDivisao(r) {
  if (!r.dias || !r.sexo) return '';
  return DIVISOES[r.sexo][r.dias].map(function (k, i) { return '<b>' + String.fromCharCode(65 + i) + '</b> ' + D[k][0]; }).join(' · ');
}

// ===== Hoje =====
function telaHoje() {
  var pl = st.plano, i = ui.escolhido != null ? ui.escolhido : proximoTreino(pl, st.historico), dia = pl.dias[i];
  var h = '<div class="top"><div><div class="marca">TREINO</div><div class="mut sm" style="margin-top:6px">' + saudacao() + '</div><h2>' + esc(st.perfil.nome || 'Bora treinar') + '</h2></div><button class="iconbtn" data-a="ajustes" aria-label="Ajustes">' + IC.gear + '</button></div><div class="respiro"></div>';
  if (st.treino) {
    var t = st.treino, feitos = t.ex.filter(fim).length;
    h += '<div class="card hero"><div class="mut sm">Treino em andamento</div><h2>' + esc(t.letra + ' · ' + t.nome) + '</h2><p class="mut sm">' + feitos + ' de ' + t.ex.length + ' exercícios</p><button class="btn pri full" data-a="abre-treino">Continuar treino</button></div>';
  } else {
    h += '<div class="card hero"><div class="letra">' + dia.letra + '</div><div class="mut sm">' + (ui.escolhido != null ? 'Treino escolhido' : 'Seu próximo treino') + '</div><h2>' + esc(dia.nome) + '</h2>' +
      '<p class="mut sm">' + dia.itens.length + ' exercícios · cerca de ' + minutosTreino(dia) + ' min</p>' +
      '<div class="sm" style="margin:12px 0 16px;opacity:.85">' + dia.itens.map(function (it) { return esc(EX[it.id].n); }).join(' · ') + '</div>' +
      '<button class="btn pri full" data-a="comecar" data-v="' + i + '">' + IC.play + ' Começar treino</button></div>';
    h += '<div class="sm mut">Outro treino hoje?</div><div class="chips" style="margin-top:6px">' + pl.dias.map(function (d, k) { return '<button class="chip ' + (k === i ? 'on' : '') + '" data-a="escolhe" data-v="' + k + '">' + d.letra + ' · ' + esc(d.nome) + '</button>'; }).join('') + '</div>';
  }
  h += '<div class="card"><div style="display:flex;justify-content:space-between;align-items:baseline"><h3>Esta semana</h3><span class="sm"><b>' + treinosSemana(new Date()) + '</b> de ' + st.perfil.dias + '</span></div>' + semanaDots() + '</div>';
  h += '<div class="card"><h3>Antes de começar</h3><p class="sm mut" style="margin:6px 0 0">5 minutos leves de ' + cardios() + ', depois 1 série leve do primeiro exercício com metade da carga.' +
    (st.perfil.objetivo === 'emagrecer' ? ' No final: 20 a 30 minutos de ' + cardios() + ' em ritmo moderado.' : '') + '</p></div>';
  return h;
}
function saudacao() { var h = new Date().getHours(); return h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite'; }
function treinosSemana(d) { var ini = inicioSemana(d), fimS = new Date(ini); fimS.setDate(fimS.getDate() + 7); return st.historico.filter(function (x) { var t = new Date(x.data + 'T12:00'); return t >= ini && t < fimS; }).length; }
function semanaDots() {
  var ini = inicioSemana(new Date()), nomes = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'], hj = hojeISO();
  return '<div class="semana">' + nomes.map(function (n, k) {
    var d = new Date(ini); d.setDate(d.getDate() + k); var iso = hojeISO(d);
    var r = st.historico.filter(function (x) { return x.data === iso; })[0];
    return '<div class="dia ' + (r ? 'feito ' : '') + (iso === hj ? 'hoje' : '') + '">' + n + '<b>' + (r ? r.letra : d.getDate()) + '</b></div>';
  }).join('') + '</div>';
}

// ===== Treino em andamento =====
function fim(e) { return e.series.every(function (s) { return s.feito; }); }
function comecar(i) {
  var dia = st.plano.dias[i];
  st.treino = { letra: dia.letra, nome: dia.nome, inicio: Date.now(), aberto: 0, ex: dia.itens.map(function (it) { return novoEx(it); }) };
  salva(); ui.escolhido = null; ui.tela = 'treino'; desenha();
}
function novoEx(it) {
  var u = ultimoRegistro(st.historico, it.id);
  var series = [];
  for (var k = 0; k < it.series; k++) {
    var ant = u && u.series[k];
    series.push({ peso: ant ? ant.peso : '', reps: it.tempo ? it.max : it.max, feito: false });
  }
  return { id: it.id, item: it, series: series };
}
function telaTreino() {
  var t = st.treino, feitos = t.ex.filter(fim).length;
  var h = '<div class="top"><button class="iconbtn" data-a="sai-treino" aria-label="Voltar">' + IC.x + '</button><div style="text-align:right"><div class="mut xs">Treino ' + t.letra + '</div><b id="crono">' + cronometro() + '</b></div></div>' +
    '<h1>' + esc(t.nome) + '</h1><div class="barra"><i style="width:' + (feitos / t.ex.length * 100) + '%"></i></div><p class="mut sm">' + feitos + ' de ' + t.ex.length + ' exercícios</p>';
  t.ex.forEach(function (e, i) {
    var ex = EX[e.id], it = e.item, aberto = t.aberto === i, sobe = sugereSubir(st.historico, it);
    var u = ultimoRegistro(st.historico, e.id);
    h += '<div class="exbox ' + (fim(e) ? 'ok' : '') + '"><button class="exhead" data-a="abre-ex" data-v="' + i + '">' + thumb(e.id) +
      '<div><div class="nome">' + esc(ex.n) + '</div><div class="mut sm">' + it.series + ' × ' + it.reps + ' · descanso ' + it.desc + ' s</div>' +
      (sobe ? '<span class="tag up">Suba a carga hoje</span>' : u ? '<span class="tag">Última: ' + esc(u.series.filter(function (s) { return s.feito; }).map(function (s) { return s.peso ? s.peso + ' kg' : '–'; }).join(' / ')) + '</span>' : '') +
      '</div></button>';
    if (aberto) {
      if (temVideo(e.id)) h += '<div class="video-serie"><video src="' + urlVideo(e.id) + '" data-vid="' + e.id + '" autoplay loop muted playsinline preload="auto"></video></div>';
      h += e.series.map(function (s, k) {
        return '<div class="serie"><div class="n">' + (k + 1) + '</div>' +
          (it.tempo ? '<div class="campo" style="grid-column:span 2"><input inputmode="numeric" value="' + esc(s.reps) + '" data-a="campo" data-i="' + i + '" data-s="' + k + '" data-f="reps" aria-label="Segundos"><span>seg</span></div>'
            : '<div class="campo"><input inputmode="decimal" placeholder="—" value="' + esc(s.peso) + '" data-a="campo" data-i="' + i + '" data-s="' + k + '" data-f="peso" aria-label="Carga"><span>kg</span></div>' +
              '<div class="campo"><input inputmode="numeric" value="' + esc(s.reps) + '" data-a="campo" data-i="' + i + '" data-s="' + k + '" data-f="reps" aria-label="Repetições"><span>reps</span></div>') +
          '<button class="tick ' + (s.feito ? 'on' : '') + '" data-a="tick" data-i="' + i + '" data-s="' + k + '" aria-label="Série feita">' + IC.check + '</button></div>';
      }).join('');
      h += '<div class="acoes"><button class="btn" data-a="detalhe" data-v="' + e.id + '">' + IC.info + ' Como fazer</button><button class="btn" data-a="trocar" data-i="' + i + '">' + IC.swap + ' Trocar</button></div>';
    }
    h += '</div>';
  });
  h += '<button class="btn pri full" data-a="finalizar" style="margin-top:10px">Finalizar treino</button>';
  return h;
}
function cronometro() { var s = Math.floor((Date.now() - st.treino.inicio) / 1000); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }
function iniciaDescanso(seg) { descanso = { fim: Date.now() + seg * 1000 }; pintaDescanso(); }
function pintaDescanso() {
  var el = $('#extra .descanso');
  if (!descanso || ui.tela !== 'treino') { if (el) el.remove(); return; }
  var r = Math.max(0, Math.ceil((descanso.fim - Date.now()) / 1000));
  if (!el) { el = document.createElement('div'); el.className = 'descanso'; $('#extra').appendChild(el); }
  el.innerHTML = '<div><div class="xs" style="opacity:.7">' + (r ? 'Descanso' : 'Bora!') + '</div><div class="t">' + Math.floor(r / 60) + ':' + String(r % 60).padStart(2, '0') + '</div></div><div style="flex:1"></div><button data-a="mais15">+15 s</button><button data-a="pula">Pular</button>';
  if (!r && !descanso.avisou) { descanso.avisou = true; try { navigator.vibrate && navigator.vibrate([200, 100, 200]); } catch (e) {} setTimeout(function () { descanso = null; pintaDescanso(); }, 2500); }
}
function finalizar() {
  var t = st.treino;
  var reg = { data: hojeISO(), letra: t.letra, nome: t.nome, minutos: Math.max(1, Math.round((Date.now() - t.inicio) / 60000)), exercicios: t.ex.map(function (e) { return { id: e.id, series: e.series }; }) };
  st.historico.push(reg); st.treino = null; descanso = null; salva(); ui.tela = null;
  var series = 0, vol = 0; reg.exercicios.forEach(function (e) { e.series.forEach(function (s) { if (s.feito) { series++; vol += (+s.peso || 0) * (+s.reps || 0); } }); });
  ui.sheet = '<div class="puxa"></div><div style="text-align:center;padding:10px 0"><div class="letra" style="position:static;font-size:96px">' + reg.letra + '</div><h1 style="margin-top:8px">Treino feito!</h1><p class="mut">' + esc(reg.nome) + '</p></div>' +
    '<div class="stat"><div><b>' + reg.minutos + '</b><span class="xs mut">minutos</span></div><div><b>' + series + '</b><span class="xs mut">séries</span></div><div><b>' + Math.round(vol) + '</b><span class="xs mut">kg levantados</span></div></div>' +
    '<p class="sm mut" style="text-align:center">' + treinosSemana(new Date()) + ' de ' + st.perfil.dias + ' treinos nesta semana.</p><button class="btn pri full" data-a="fecha">Fechar</button>';
  desenha();
}

// ===== Ficha =====
function telaFicha() {
  var pl = st.plano, d = pl.dias[ui.fichaDia] || pl.dias[0];
  var h = '<div class="top"><h1>Sua ficha</h1><button class="iconbtn" data-a="ajustes" aria-label="Ajustes">' + IC.gear + '</button></div>' +
    '<p class="mut sm" style="margin:0">' + st.perfil.dias + 'x por semana · ' + OBJ[st.perfil.objetivo][0].toLowerCase() + ' · montada em ' + new Date(pl.criadoEm).toLocaleDateString('pt-BR') + '</p>';
  pl.avisos.forEach(function (a) { h += '<div class="aviso">' + esc(a) + '</div>'; });
  h += '<div class="chips" style="margin-top:12px">' + pl.dias.map(function (x, k) { return '<button class="chip ' + (x === d ? 'on' : '') + '" data-a="fichadia" data-v="' + k + '">' + x.letra + ' · ' + esc(x.nome) + '</button>'; }).join('') + '</div>';
  h += '<div class="lista" style="margin-top:8px">' + d.itens.map(function (it, k) {
    var ex = EX[it.id];
    return '<div class="ex">' + thumb(it.id) + '<button style="text-align:left;padding:0" data-a="detalhe" data-v="' + it.id + '"><div class="nome">' + esc(ex.n) + '</div><div class="mut sm">' + it.series + ' × ' + it.reps + ' · ' + esc(GRUPOS[ex.g]) + '</div></button>' +
      '<button class="iconbtn" data-a="trocar-ficha" data-k="' + k + '" aria-label="Trocar exercício">' + IC.swap + '</button></div>';
  }).join('') + '</div>';
  h += '<div style="display:flex;gap:10px;margin-top:16px"><button class="btn lin" style="flex:1" data-a="variacao">Gerar variação</button><button class="btn lin" style="flex:1" data-a="refaz">Refazer perfil</button></div>' +
    '<p class="nota">Troque de variação a cada 6 a 8 semanas para o corpo continuar respondendo.</p>';
  return h;
}

// ===== Biblioteca =====
function telaBiblio() {
  var h = '<div class="top"><h1>Exercícios</h1><button class="iconbtn" data-a="ajustes" aria-label="Ajustes">' + IC.gear + '</button></div>' +
    '<input class="campo-txt" placeholder="Buscar exercício" value="' + esc(ui.busca) + '" data-a="busca" aria-label="Buscar">' +
    '<div class="chips" style="margin-top:10px"><button class="chip ' + (ui.grupo === 'todos' ? 'on' : '') + '" data-a="grupo" data-v="todos">Todos</button>' +
    Object.keys(GRUPOS).map(function (g) { return '<button class="chip ' + (ui.grupo === g ? 'on' : '') + '" data-a="grupo" data-v="' + g + '">' + GRUPOS[g] + '</button>'; }).join('') + '</div>';
  var b = ui.busca.toLowerCase();
  var lista = EXERCICIOS.filter(function (e) { return (ui.grupo === 'todos' || e.g === ui.grupo) && (!b || e.n.toLowerCase().indexOf(b) >= 0); });
  var tem = lista.filter(function (e) { return podeFazer(e, st.perfil.equip); }), falta = lista.filter(function (e) { return !podeFazer(e, st.perfil.equip); });
  var linha = function (e) { return '<button class="ex" data-a="detalhe" data-v="' + e.id + '">' + thumb(e.id) + '<div><div class="nome">' + esc(e.n) + '</div><div class="mut sm">' + esc(GRUPOS[e.g]) + (e.eq.length ? ' · ' + esc(e.eq.map(function (a) { return APARELHOS[a]; }).join(', ')) : ' · sem aparelho') + '</div></div><span></span></button>'; };
  h += '<p class="mut sm">' + tem.length + ' dá para fazer na sua academia' + (falta.length ? ' · ' + falta.length + ' precisam de aparelho que você não marcou' : '') + '</p>';
  h += '<div class="lista">' + tem.map(linha).join('') + '</div>';
  if (falta.length) h += '<h3 style="margin:20px 0 4px">Precisam de outro aparelho</h3><div class="lista" style="opacity:.6">' + falta.map(linha).join('') + '</div>';
  return h;
}

// ===== Evolução =====
function telaEvolucao() {
  var hs = st.historico;
  var h = '<div class="top"><h1>Evolução</h1><button class="iconbtn" data-a="ajustes" aria-label="Ajustes">' + IC.gear + '</button></div>';
  if (!hs.length) return h + '<div class="card"><h3>Nada por aqui ainda</h3><p class="mut sm">Termine o primeiro treino e o app começa a guardar sua frequência e suas cargas.</p></div>';
  var semanas = [];
  for (var k = 7; k >= 0; k--) { var d = new Date(); d.setDate(d.getDate() - k * 7); semanas.push({ ini: inicioSemana(d), n: treinosSemana(d) }); }
  var cumpridas = 0; for (var j = semanas.length - 2; j >= 0 && semanas[j].n >= st.perfil.dias; j--) cumpridas++;
  var maxN = Math.max(st.perfil.dias, Math.max.apply(null, semanas.map(function (s) { return s.n; })));
  h += '<div class="stat"><div><b>' + hs.length + '</b><span class="xs mut">treinos</span></div><div><b>' + treinosSemana(new Date()) + '/' + st.perfil.dias + '</b><span class="xs mut">nesta semana</span></div><div><b>' + cumpridas + '</b><span class="xs mut">semanas seguidas na meta</span></div></div>';
  h += '<div class="card"><h3>Treinos por semana</h3><div class="barras">' + semanas.map(function (s) {
    return '<div><i class="' + (s.n < st.perfil.dias ? 'baixo' : '') + '" style="height:' + (s.n / maxN * 100) + '%"></i>' + s.ini.getDate() + '/' + (s.ini.getMonth() + 1) + '</div>';
  }).join('') + '</div><p class="xs mut" style="margin:8px 0 0">Vermelho: semana em que bateu a meta de ' + st.perfil.dias + ' treinos.</p></div>';
  var rec = {};
  hs.forEach(function (x) { x.exercicios.forEach(function (e) { e.series.forEach(function (s) { if (s.feito && +s.peso) rec[e.id] = Math.max(rec[e.id] || 0, +s.peso); }); }); });
  var ids = Object.keys(rec).sort(function (a, b) { return rec[b] - rec[a]; }).slice(0, 8);
  if (ids.length) h += '<div class="card"><h3>Maiores cargas</h3>' + ids.map(function (id) { return '<div class="linha"><span>' + esc(EX[id].n) + '</span><b>' + rec[id] + ' kg</b></div>'; }).join('') + '</div>';
  h += '<div class="card"><h3>Histórico</h3>' + hs.slice().reverse().slice(0, 15).map(function (x) {
    return '<div class="linha"><span><b>' + x.letra + '</b> · ' + esc(x.nome) + '</span><span class="mut sm">' + x.data.split('-').reverse().slice(0, 2).join('/') + ' · ' + x.minutos + ' min</span></div>';
  }).join('') + '</div>';
  return h;
}

// ===== Folhas =====
function caixaVideo(id) {
  var e = EX[id], sx = st.perfil.sexo;
  if (temVideo(id, sx)) return '<div class="video"><video src="' + urlVideo(id, sx) + '" controls loop playsinline autoplay muted preload="metadata"></video></div>';
  if (!USR.admin) return '<div class="video"><b>Vídeo em produção</b><span class="sm mut">Enquanto isso, siga o passo a passo abaixo.</span></div>';
  return '<div class="video"><b>Vídeo ainda não enviado</b><span class="sm mut">Gere no Google Flow com o texto abaixo e envie aqui.</span></div>';
}
function painelVideoAdmin(id) {
  var e = EX[id];
  return '<div class="card"><h3>Vídeos deste exercício</h3>' + ['F', 'M'].map(function (sx) {
    var tem = temVideoDoSexo(id, sx), sub = ui.subindo && ui.subindo.id === id && ui.subindo.sx === sx;
    return '<div class="linha" style="align-items:center"><span><b>' + (sx === 'F' ? 'Mulher' : 'Homem') + '</b><br><span class="xs mut">' + (sub ? 'Enviando ' + Math.round(ui.subindo.p * 100) + '%' : temVideoEnviado(id, sx) ? 'Enviado por você' : temVideoPadrao(id, sx) ? 'Vídeo padrão do app' : 'Sem vídeo') + '</span></span>' +
      '<span style="display:flex;gap:6px"><button class="btn" data-a="copia-prompt" data-v="' + id + '" data-s="' + sx + '">Texto</button>' +
      '<label class="btn ' + (tem ? '' : 'pri') + '">' + (tem ? 'Trocar' : 'Enviar') + '<input type="file" accept="video/*" hidden data-a="video" data-v="' + id + '" data-s="' + sx + '"></label>' +
      (temVideoEnviado(id, sx) ? '<button class="iconbtn" data-a="apaga-video" data-v="' + id + '" data-s="' + sx + '" aria-label="Apagar vídeo enviado">' + IC.x + '</button>' : '') + '</span></div>';
  }).join('') + '<p class="xs mut">Texto para o Google Flow (mulher):</p><div class="prompt">' + esc(promptFlow(e, 'F')) + '</div></div>';
}
function folhaDetalhe(id) {
  var e = EX[id];
  var alt = alternativas(id, st.perfil.equip);
  return '<div class="puxa"></div><div style="display:flex;justify-content:space-between;gap:10px"><div><span class="tag">' + esc(GRUPOS[e.g]) + '</span><h2 style="margin-top:6px">' + esc(e.n) + '</h2></div><button class="iconbtn" data-a="fecha" aria-label="Fechar">' + IC.x + '</button></div>' +
    caixaVideo(id) +
    '<div class="sm mut">Músculos: ' + esc(e.m) + ' · ' + (e.eq.length ? esc(e.eq.map(function (a) { return APARELHOS[a]; }).join(', ')) : 'sem aparelho') + '</div>' +
    '<h3 style="margin-top:16px">Como fazer</h3><ol class="passos">' + e.p.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ol>' +
    '<div class="aviso"><b>Erro comum:</b> ' + esc(e.e) + '</div>' +
    (USR.admin ? painelVideoAdmin(id) : '') +
    (alt.length ? '<h3 style="margin-top:16px">Outras opções para o mesmo músculo</h3><div class="lista" style="margin-top:8px">' + alt.map(function (a) { return '<button class="ex" data-a="detalhe" data-v="' + a.id + '">' + thumb(a.id) + '<div><div class="nome">' + esc(a.n) + '</div><div class="mut sm">' + (a.eq.length ? esc(a.eq.map(function (q) { return APARELHOS[q]; }).join(', ')) : 'sem aparelho') + '</div></div><span></span></button>'; }).join('') + '</div>' : '');
}
function folhaTroca(lista, origem) {
  return '<div class="puxa"></div><h2>Trocar por</h2><p class="mut sm">Mesmo músculo, só com aparelhos da sua academia. Útil quando o aparelho está ocupado.</p><div class="lista">' +
    (lista.length ? lista.map(function (a) { return '<button class="ex" data-a="' + origem + '" data-v="' + a.id + '">' + thumb(a.id) + '<div><div class="nome">' + esc(a.n) + '</div><div class="mut sm">' + (a.eq.length ? esc(a.eq.map(function (q) { return APARELHOS[q]; }).join(', ')) : 'sem aparelho') + '</div></div><span></span></button>'; }).join('')
      : '<div class="aviso">Não há outro exercício para este músculo com os aparelhos marcados.</div>') + '</div>';
}
function folhaAjustes() {
  var p = st.perfil;
  var nAp = p.equip.filter(function (k) { return APARELHOS[k]; }).length;
  var h = '<div class="puxa"></div><div style="display:flex;justify-content:space-between"><h2>Ajustes</h2><button class="iconbtn" data-a="fecha" aria-label="Fechar">' + IC.x + '</button></div>' +
    '<div class="card"><div class="linha"><span>Nome</span><b>' + esc(p.nome || '—') + '</b></div><div class="linha"><span>Sexo</span><b>' + (p.sexo === 'F' ? 'Mulher' : 'Homem') + '</b></div><div class="linha"><span>Dias por semana</span><b>' + p.dias + '</b></div><div class="linha"><span>Objetivo</span><b>' + OBJ[p.objetivo][0] + '</b></div><div class="linha"><span>Aparelhos</span><b>' + nAp + ' marcados</b></div>' +
    '<button class="btn full" data-a="refaz" style="margin-top:8px">Mudar perfil e aparelhos</button></div>' +
    '<div class="card"><h3>Conta</h3><div class="linha"><span>E-mail</span><b>' + esc(USR.email) + '</b></div>' +
    '<div style="display:flex;gap:8px;margin-top:8px"><button class="btn" style="flex:1" data-a="tela-senha">Trocar senha</button><button class="btn lin" style="flex:1" data-a="sair">Sair</button></div></div>';
  if (USR.admin) h += '<div class="card"><h3>Administração</h3><p class="sm mut">Só você vê esta parte.</p>' +
    '<button class="btn full" data-a="adm-pessoas" style="margin-bottom:8px">Pessoas que usam o app</button>' +
    '<button class="btn full" data-a="adm-videos" style="margin-bottom:8px">Vídeos dos exercícios</button>' +
    '<button class="btn lin full" data-a="copia-todos">Copiar textos do Flow da minha ficha</button></div>';
  return h;
}
function folhaPessoas(lista, msg) {
  return '<div class="puxa"></div><div style="display:flex;justify-content:space-between"><h2>Pessoas</h2><button class="iconbtn" data-a="ajustes" aria-label="Voltar">' + IC.x + '</button></div>' +
    (msg ? '<div class="' + (msg.erro ? 'aviso' : 'ok-box') + '">' + esc(msg.texto) + '</div>' : '') +
    '<div class="card">' + (lista ? lista.map(function (u) {
      return '<div class="linha" style="align-items:center"><span><b>' + esc(u.nome || u.email) + '</b>' + (u.admin ? ' <span class="tag">admin</span>' : '') + '<br><span class="xs mut">' + esc(u.email) + (u.senha_provisoria ? ' · ainda não trocou a senha provisória' : u.ultimo_uso ? ' · usou em ' + u.ultimo_uso.slice(8, 10) + '/' + u.ultimo_uso.slice(5, 7) : '') + '</span></span>' +
        (u.admin ? '' : '<span style="display:flex;gap:6px"><button class="btn" data-a="adm-reset" data-v="' + u.id + '" data-n="' + esc(u.nome || u.email) + '">Senha</button><button class="iconbtn" data-a="adm-apaga" data-v="' + u.id + '" data-n="' + esc(u.nome || u.email) + '" aria-label="Remover">' + IC.x + '</button></span>') + '</div>';
    }).join('') : '<p class="mut sm">Carregando…</p>') + '</div>' +
    '<div class="card"><h3>Adicionar pessoa</h3><p class="sm mut">Crie uma senha provisória e passe para a pessoa. No primeiro acesso ela troca por uma senha dela.</p>' +
    '<form data-f="nova-pessoa"><input class="campo-txt" name="nome" placeholder="Nome" style="margin:6px 0"><input class="campo-txt" name="email" type="email" placeholder="E-mail" required style="margin:6px 0"><input class="campo-txt" name="senha" placeholder="Senha provisória (mín. 8)" minlength="8" required style="margin:6px 0"><button class="btn pri full">Adicionar</button></form></div>';
}
function folhaVideosAdmin() {
  var lst = EXERCICIOS.slice().sort(function (a, b) { return (temVideoDoSexo(a.id, 'F') + temVideoDoSexo(a.id, 'M')) - (temVideoDoSexo(b.id, 'F') + temVideoDoSexo(b.id, 'M')); });
  var feitos = EXERCICIOS.filter(function (e) { return temVideoDoSexo(e.id, 'F'); }).length, feitosM = EXERCICIOS.filter(function (e) { return temVideoDoSexo(e.id, 'M'); }).length;
  return '<div class="puxa"></div><div style="display:flex;justify-content:space-between"><h2>Vídeos</h2><button class="iconbtn" data-a="ajustes" aria-label="Voltar">' + IC.x + '</button></div>' +
    '<p class="mut sm">Mulher: ' + feitos + ' de ' + EXERCICIOS.length + ' · Homem: ' + feitosM + ' de ' + EXERCICIOS.length + '. Toque num exercício para copiar o texto do Flow e enviar o vídeo.</p><div class="lista">' +
    lst.map(function (e) { return '<button class="ex" data-a="detalhe" data-v="' + e.id + '">' + thumb(e.id) + '<div><div class="nome">' + esc(e.n) + '</div><div class="mut sm">Mulher ' + (temVideoDoSexo(e.id, 'F') ? '✓' : '—') + ' · Homem ' + (temVideoDoSexo(e.id, 'M') ? '✓' : '—') + '</div></div><span></span></button>'; }).join('') + '</div>';
}
function folhaConfirma(texto, acao, v) {
  return '<div class="puxa"></div><h2>Tem certeza?</h2><p>' + esc(texto) + '</p><div style="display:flex;gap:10px"><button class="btn lin" style="flex:1" data-a="fecha">Cancelar</button><button class="btn pri" style="flex:1" data-a="' + acao + '" data-v="' + v + '">Confirmar</button></div>';
}
function folhaReset(id, nome) {
  return '<div class="puxa"></div><h2>Nova senha provisória</h2><p class="sm mut">Para ' + esc(nome) + '. Ela vai trocar no próximo acesso.</p><form data-f="reset" data-v="' + id + '"><input class="campo-txt" name="senha" minlength="8" required placeholder="Senha provisória (mín. 8)" style="margin:6px 0 12px"><button class="btn pri full">Salvar</button></form>';
}

// ===== Entrada (login, primeiro acesso, troca de senha) =====
function telaEntrada() {
  var t = ui.tela, m = ui.msg ? '<div class="aviso">' + esc(ui.msg) + '</div>' : '';
  var h = '<div class="capa"><div class="marca">TREINO</div>';
  if (t === 'primeiro') return h + '<h1 style="margin-top:12px">Primeiro acesso</h1><p class="mut">Crie a conta do administrador. Depois você adiciona as outras pessoas pelo app.</p>' + m +
    '<form data-f="primeiro"><input class="campo-txt" name="nome" placeholder="Seu nome" autocomplete="name" style="margin:6px 0"><input class="campo-txt" name="email" type="email" placeholder="E-mail" autocomplete="username" required style="margin:6px 0">' +
    '<input class="campo-txt" name="senha" type="password" placeholder="Crie uma senha (mín. 8)" minlength="8" autocomplete="new-password" required style="margin:6px 0 14px"><button class="btn pri full">Criar conta</button></form></div>';
  if (t === 'senha') return h + '<h1 style="margin-top:12px">' + (USR && USR.senha_provisoria ? 'Crie sua senha' : 'Trocar senha') + '</h1><p class="mut">' + (USR && USR.senha_provisoria ? 'Você entrou com uma senha provisória. Escolha uma senha só sua.' : '') + '</p>' + m +
    '<form data-f="senha"><input class="campo-txt" name="atual" type="password" placeholder="Senha ' + (USR && USR.senha_provisoria ? 'provisória' : 'atual') + '" autocomplete="current-password" required style="margin:6px 0"><input class="campo-txt" name="nova" type="password" placeholder="Nova senha (mín. 8)" minlength="8" autocomplete="new-password" required style="margin:6px 0 14px"><button class="btn pri full">Salvar senha</button></form>' +
    (USR && !USR.senha_provisoria ? '<p class="nota"><button class="btn lin" data-a="volta-app">Voltar</button></p>' : '') + '</div>';
  return h + '<h1 style="margin-top:10px">Seu personal no bolso.</h1><p class="mut">Entre com seu e-mail e senha.</p>' + m +
    '<form data-f="entrar"><input class="campo-txt" name="email" type="email" placeholder="E-mail" autocomplete="username" required style="margin:6px 0"><input class="campo-txt" name="senha" type="password" placeholder="Senha" autocomplete="current-password" required style="margin:6px 0 14px"><button class="btn pri full">Entrar</button></form>' +
    '<p class="nota">Esqueceu a senha? Peça para quem te cadastrou criar uma nova.</p></div>';
}
function telaLogin(msg) { USR = null; ui.tela = 'login'; ui.msg = msg || ''; ui.sheet = null; desenha(); }

// ===== Desenho =====
function desenha() {
  var a = $('#app'), tabs = $('#tabs');
  var tempos = {}; a.querySelectorAll('video[data-vid]').forEach(function (v) { tempos[v.dataset.vid] = v.currentTime; });
  escolheFundo();
  if (ui.tela === 'carregando') { tabs.hidden = true; a.innerHTML = '<div style="padding-top:30vh;text-align:center" class="mut">Carregando…</div>'; }
  else if (['login', 'primeiro', 'senha'].indexOf(ui.tela) >= 0) { tabs.hidden = true; a.innerHTML = telaEntrada(); }
  else if (!st.perfil || ui.tela === 'perfil') { tabs.hidden = true; a.innerHTML = telaPerfil(); }
  else if (ui.tela === 'treino' && st.treino) { tabs.hidden = true; a.innerHTML = telaTreino(); }
  else {
    tabs.hidden = false;
    a.innerHTML = { hoje: telaHoje, ficha: telaFicha, biblio: telaBiblio, evolucao: telaEvolucao }[ui.tab]();
    tabs.querySelectorAll('button').forEach(function (b) { b.classList.toggle('on', b.dataset.tab === ui.tab); });
  }
  var ex = $('#extra'); var v = ex.querySelector('.veu');
  if (ui.sheet) { if (!v) { v = document.createElement('div'); v.className = 'veu'; v.dataset.a = 'veu'; ex.appendChild(v); } v.innerHTML = '<div class="folha">' + ui.sheet + '</div>'; }
  else if (v) v.remove();
  a.querySelectorAll('video[data-vid]').forEach(function (v) { if (tempos[v.dataset.vid]) { try { v.currentTime = tempos[v.dataset.vid]; } catch (e) {} } });
  pintaDescanso(); pintaSinc();
}
function escolheFundo() {
  var t = ui.tela;
  if (t === 'carregando' || t === 'login' || t === 'primeiro' || t === 'senha') return poeFundo('entrada', 'cheio');
  if (!st.perfil || t === 'perfil') return poeFundo('corpo', 'leve');
  if (t === 'treino' && st.treino) { var d = st.plano.dias.filter(function (x) { return x.letra === st.treino.letra; })[0]; return poeFundo(d ? fotoDoDia(d) : 'corpo', 'leve'); }
  if (ui.tab === 'hoje') { var i = st.treino ? st.plano.dias.findIndex(function (x) { return x.letra === st.treino.letra; }) : (ui.escolhido != null ? ui.escolhido : proximoTreino(st.plano, st.historico)); return poeFundo(fotoDoDia(st.plano.dias[Math.max(0, i)]), 'cheio'); }
  if (ui.tab === 'ficha') return poeFundo(fotoDoDia(st.plano.dias[ui.fichaDia] || st.plano.dias[0]), 'leve');
  if (ui.tab === 'biblio') return poeFundo('aparelhos', 'leve');
  if (ui.tab === 'evolucao') return poeFundo('evolucao', 'leve');
}
function abreSheet(html) { ui.sheet = html; desenha(); }

// ===== Ações =====
function novoRascunho() { return st.perfil ? JSON.parse(JSON.stringify(st.perfil)) : { nome: (USR && USR.nome) || '', sexo: null, dias: null, objetivo: null, nivel: null, equip: PRESETS.vivere.eq.slice() }; }
function fechaPerfil() {
  var mudou = !st.perfil || ['sexo', 'dias', 'objetivo', 'nivel'].some(function (k) { return st.perfil[k] !== ui.rasc[k]; }) || st.perfil.equip.join() !== ui.rasc.equip.join();
  st.perfil = ui.rasc; if (mudou) st.plano = gerarPlano(st.perfil, 0);
  salva(); ui.tela = null; ui.tab = 'hoje'; desenha(); window.scrollTo(0, 0);
  if (st.plano.avisos.length) toast('Atenção: veja os avisos na Ficha');
}
function copia(t) {
  var ok = function () { toast('Copiado'); };
  try { navigator.clipboard.writeText(t).then(ok, function () { abreSheet('<div class="puxa"></div><h2>Copie o texto</h2><textarea class="campo-txt" style="height:50vh;padding:12px;font-size:14px" readonly>' + esc(t) + '</textarea><button class="btn full" data-a="fecha">Fechar</button>'); }); }
  catch (e) { toast('Não deu para copiar'); }
}

document.addEventListener('click', function (ev) {
  var el = ev.target.closest('[data-a],[data-tab]'); if (!el) return;
  if (el.dataset.tab) { ui.tab = el.dataset.tab; ui.escolhido = null; window.scrollTo(0, 0); desenha(); return; }
  var a = el.dataset.a, v = el.dataset.v;
  if (a === 'veu' && ev.target === el) { ui.sheet = null; desenha(); return; }
  if (a === 'set') { ui.rasc[el.dataset.k] = isNaN(+v) ? v : +v; desenha(); }
  else if (a === 'avancar') { if (ui.passo === 0) ui.rasc.nome = $('#nome').value.trim(); if (ui.passo < 3) { ui.passo++; desenha(); window.scrollTo(0, 0); } else fechaPerfil(); }
  else if (a === 'voltar') { ui.passo--; desenha(); }
  else if (a === 'preset') { ui.rasc.equip = PRESETS[v].eq.slice(); desenha(); }
  else if (a === 'equip') { var q = ui.rasc.equip, i = q.indexOf(v); if (i >= 0) q.splice(i, 1); else q.push(v); desenha(); }
  else if (a === 'fecha-perfil') { ui.tela = null; desenha(); }
  else if (a === 'escolhe') { ui.escolhido = +v; desenha(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  else if (a === 'comecar') comecar(+v);
  else if (a === 'abre-treino') { ui.tela = 'treino'; desenha(); }
  else if (a === 'sai-treino') { ui.tela = null; desenha(); }
  else if (a === 'abre-ex') { st.treino.aberto = st.treino.aberto === +v ? -1 : +v; salva(); desenha(); }
  else if (a === 'tick') {
    var e = st.treino.ex[+el.dataset.i], s = e.series[+el.dataset.s]; s.feito = !s.feito;
    if (s.feito) { iniciaDescanso(e.item.desc); if (fim(e)) { var prox = st.treino.ex.findIndex(function (x) { return !fim(x); }); st.treino.aberto = prox; } }
    salva(); desenha();
  }
  else if (a === 'mais15') { if (descanso) { descanso.fim += 15000; descanso.avisou = false; } pintaDescanso(); }
  else if (a === 'pula') { descanso = null; pintaDescanso(); }
  else if (a === 'trocar') { ui.trocaI = +el.dataset.i; var usados = st.treino.ex.map(function (x) { return x.id; }); abreSheet(folhaTroca(alternativas(st.treino.ex[ui.trocaI].id, st.perfil.equip, usados), 'troca-treino')); }
  else if (a === 'troca-treino') { var old = st.treino.ex[ui.trocaI]; var it = Object.assign({ id: v }, prescricao(EX[v], st.perfil.objetivo, st.perfil.nivel)); st.treino.ex[ui.trocaI] = novoEx(it); ui.sheet = null; salva(); desenha(); toast(EX[old.id].n + ' → ' + EX[v].n + ' (só hoje)'); }
  else if (a === 'trocar-ficha') { ui.trocaK = +el.dataset.k; var dia = st.plano.dias[ui.fichaDia]; abreSheet(folhaTroca(alternativas(dia.itens[ui.trocaK].id, st.perfil.equip, dia.itens.map(function (x) { return x.id; })), 'troca-ficha')); }
  else if (a === 'troca-ficha') { st.plano.dias[ui.fichaDia].itens[ui.trocaK] = Object.assign({ id: v }, prescricao(EX[v], st.perfil.objetivo, st.perfil.nivel)); ui.sheet = null; salva(); desenha(); toast('Ficha atualizada'); }
  else if (a === 'finalizar') { if (!st.treino.ex.some(function (x) { return x.series.some(function (s) { return s.feito; }); })) { toast('Marque pelo menos uma série'); return; } finalizar(); }
  else if (a === 'detalhe') abreSheet(folhaDetalhe(v));
  else if (a === 'fecha') { ui.sheet = null; desenha(); }
  else if (a === 'fichadia') { ui.fichaDia = +v; desenha(); }
  else if (a === 'variacao') { st.plano = gerarPlano(st.perfil, (st.plano.variacao || 0) + 1); salva(); desenha(); toast('Nova variação montada'); }
  else if (a === 'refaz') { ui.rasc = novoRascunho(); ui.passo = 0; ui.tela = 'perfil'; ui.sheet = null; desenha(); }
  else if (a === 'ajustes') abreSheet(folhaAjustes());
  else if (a === 'grupo') { ui.grupo = v; desenha(); }
  else if (a === 'copia-prompt') copia(promptFlow(EX[v], el.dataset.s || st.perfil.sexo));
  else if (a === 'copia-todos') {
    var ids = []; st.plano.dias.forEach(function (d) { d.itens.forEach(function (it) { if (ids.indexOf(it.id) < 0) ids.push(it.id); }); });
    copia(ids.map(function (id) { return EX[id].n + '\n' + promptFlow(EX[id], st.perfil.sexo); }).join('\n\n'));
  }
  else if (a === 'sair') { API.req('POST', '/api/sair').then(function () { try { localStorage.removeItem(LOCAL); } catch (e) {} st = normaliza(null); telaLogin(''); }); }
  else if (a === 'tela-senha') { ui.sheet = null; ui.msg = ''; ui.tela = 'senha'; desenha(); }
  else if (a === 'volta-app') { ui.tela = null; ui.msg = ''; desenha(); }
  else if (a === 'adm-pessoas') carregaPessoas();
  else if (a === 'adm-videos') abreSheet(folhaVideosAdmin());
  else if (a === 'adm-reset') abreSheet(folhaReset(v, el.dataset.n));
  else if (a === 'adm-apaga') abreSheet(folhaConfirma('Remover ' + el.dataset.n + '? A ficha e o histórico dessa pessoa serão apagados e não dá para desfazer.', 'adm-apaga-ok', v));
  else if (a === 'adm-apaga-ok') API.req('DELETE', '/api/pessoas/' + v).then(function (r) { carregaPessoas(r._status === 200 ? { texto: 'Pessoa removida.' } : { erro: true, texto: r.erro || 'Não deu para remover.' }); });
  else if (a === 'apaga-video') abreSheet(folhaConfirma('Apagar o vídeo de ' + EX[v].n + ' (' + (el.dataset.s === 'F' ? 'mulher' : 'homem') + ')?', 'apaga-video-ok', v + '|' + el.dataset.s));
  else if (a === 'apaga-video-ok') { var pv = v.split('|'); API.req('DELETE', '/api/video/' + pv[0] + '/' + pv[1]).then(function (r) { if (r._status !== 200) { toast(r.erro || 'Não deu para apagar'); return; } delete VIDEOS[pv[0] + '|' + pv[1]]; abreSheet(folhaDetalhe(pv[0])); toast('Vídeo apagado'); }); }
});
document.addEventListener('input', function (ev) {
  var el = ev.target;
  if (el.id === 'nome') { ui.rasc.nome = el.value; return; }
  if (el.dataset.a === 'campo') { st.treino.ex[+el.dataset.i].series[+el.dataset.s][el.dataset.f] = el.value; salva(); }
  else if (el.dataset.a === 'busca') { ui.busca = el.value; var pos = el.selectionStart; desenha(); var n = $('[data-a=busca]'); n.focus(); n.setSelectionRange(pos, pos); }
});
document.addEventListener('change', function (ev) {
  var el = ev.target;
  if (el.dataset.a === 'video' && el.files[0]) {
    var id = el.dataset.v, sx = el.dataset.s, arq = el.files[0];
    if (arq.size > 95 * 1024 * 1024) { toast('Vídeo grande demais (máx. 95 MB). Exporte em 720p.'); return; }
    ui.subindo = { id: id, sx: sx, p: 0 }; abreSheet(folhaDetalhe(id));
    enviaVideo(id, sx, arq, function (p) { ui.subindo.p = p; if (ui.sheet && ui.sheet.indexOf('data-v="' + id + '"') >= 0) abreSheet(folhaDetalhe(id)); })
      .then(function () { ui.subindo = null; VIDEOS[id + '|' + sx] = new Date().toISOString(); abreSheet(folhaDetalhe(id)); toast('Vídeo enviado'); })
      .catch(function (e) { ui.subindo = null; abreSheet(folhaDetalhe(id)); toast(e.message); });
  }
  else if (el.dataset.a === 'fotos-academia' && el.files.length) {
    ui.lendo = true; ui.leitura = null; desenha();
    lerAparelhosIA(el.files).then(function (r) {
      ui.lendo = false;
      if (r._status !== 200) { ui.leitura = { erro: true, texto: r.erro || 'Não deu para ler as fotos.' }; desenha(); return; }
      var cardio = ui.rasc.equip.filter(function (k) { return CARDIO[k] && r.aparelhos.indexOf(k) < 0; });
      ui.rasc.equip = r.aparelhos.concat(r.aparelhos.some(function (k) { return CARDIO[k]; }) ? [] : cardio);
      ui.leitura = { texto: 'A IA encontrou ' + r.aparelhos.filter(function (k) { return APARELHOS[k]; }).length + ' aparelhos em ' + r.fotos + ' imagens e já marcou abaixo. Confira e ajuste o que faltar.' + (r.outros.length ? ' Também viu, fora da lista: ' + r.outros.join(', ') + '.' : '') };
      desenha();
    }).catch(function (e) { ui.lendo = false; ui.leitura = { erro: true, texto: e.message || 'Não deu para ler as fotos.' }; desenha(); });
  }
});
relogio = setInterval(function () { var c = $('#crono'); if (c && st.treino) c.textContent = cronometro(); if (descanso) pintaDescanso(); }, 1000);

function carregaPessoas(msg) {
  abreSheet(folhaPessoas(null, msg));
  API.req('GET', '/api/pessoas').then(function (r) { if (ui.sheet && ui.sheet.indexOf('Adicionar pessoa') >= 0) abreSheet(folhaPessoas(r.pessoas || [], r._status === 200 ? msg : { erro: true, texto: r.erro })); });
}

// formulários
document.addEventListener('submit', function (ev) {
  var f = ev.target; if (!f.dataset.f) return; ev.preventDefault();
  var d = {}; Array.prototype.forEach.call(f.elements, function (i) { if (i.name) d[i.name] = i.value; });
  var bt = f.querySelector('button'); if (bt) { bt.disabled = true; bt.style.opacity = .5; }
  var tipo = f.dataset.f;
  if (tipo === 'entrar' || tipo === 'primeiro') {
    API.req('POST', tipo === 'entrar' ? '/api/entrar' : '/api/primeiro-acesso', d).then(function (r) {
      if (r._status !== 200) { ui.msg = r.erro || 'Não deu para entrar.'; desenha(); return; }
      entrou(r.usuario);
    }).catch(function () { ui.msg = 'Sem conexão com o servidor.'; desenha(); });
  } else if (tipo === 'senha') {
    API.req('POST', '/api/senha', d).then(function (r) {
      if (r._status !== 200) { ui.msg = r.erro || 'Não deu para trocar a senha.'; desenha(); return; }
      var era = USR && USR.senha_provisoria; USR = r.usuario; ui.msg = '';
      if (era) entrou(USR); else { ui.tela = null; desenha(); toast('Senha trocada'); }
    });
  } else if (tipo === 'nova-pessoa') {
    API.req('POST', '/api/pessoas', d).then(function (r) {
      carregaPessoas(r._status === 200 ? { texto: 'Pronto. Passe para ' + (d.nome || d.email) + ' o endereço do app, o e-mail e a senha provisória.' } : { erro: true, texto: r.erro || 'Não deu para adicionar.' });
    });
  } else if (tipo === 'reset') {
    API.req('POST', '/api/pessoas/' + f.dataset.v + '/senha', d).then(function (r) {
      carregaPessoas(r._status === 200 ? { texto: 'Senha provisória salva. Passe para a pessoa.' } : { erro: true, texto: r.erro || 'Não deu para salvar.' });
    });
  }
});

function entrou(u) {
  USR = u; ui.msg = '';
  if (u.senha_provisoria) { ui.tela = 'senha'; desenha(); return; }
  ui.tela = 'carregando'; desenha();
  Promise.all([carregaDados(), carregaVideos()]).then(function () {
    ui.tela = st.treino ? 'treino' : null; ui.rasc = novoRascunho(); desenha();
  }).catch(function (e) { ui.tela = 'login'; ui.msg = 'Não deu para carregar seus dados: ' + e.message; desenha(); });
}

ui.tela = 'carregando'; desenha();
API.req('GET', '/api/eu').then(function (r) {
  if (r.usuario) entrou(r.usuario);
  else if (r.primeiro_acesso) { ui.tela = 'primeiro'; desenha(); }
  else telaLogin('');
}).catch(function () {
  // sem internet: abre com a cópia do aparelho, se houver
  try { var l = JSON.parse(localStorage.getItem(LOCAL)); if (l && l.dados) { USR = { id: l.uid, email: '', admin: false }; st = normaliza(l.dados); sinc.versao = l.versao; sinc.pendente = l.pendente; sinc.erro = 'Sem internet — usando a cópia do aparelho'; ui.rasc = novoRascunho(); ui.tela = st.treino ? 'treino' : null; desenha(); return; } } catch (e) {}
  telaLogin('Sem conexão com o servidor.');
});
if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(function () {});
}
