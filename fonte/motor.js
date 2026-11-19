// ===== Motor do treino: funções puras, usadas por todas as telas =====

// Variações do mesmo movimento: só uma por treino (ex.: não repetir elevação pélvica na máquina e com barra no mesmo dia).
var FAMILIA = {
  elev_pelvica_maq: 'hip', elev_pelvica: 'hip', elev_pelvica_h: 'hip', stiff: 'stiff', stiff_barra: 'stiff',
  supino_halter: 'sup', supino_barra: 'sup', supino_maq: 'sup', desenv_halter: 'des', desenv_maq: 'des',
  puxada_frente: 'pux', graviton: 'pux', barra_fixa: 'pux', mesa_flexora: 'flex', cadeira_flexora: 'flex', flexora_polia: 'flex',
  agach_livre: 'agach', agach_smith: 'agach', hack: 'agach', agach_corpo: 'agach', goblet: 'agach'
};
function familia(id) { return FAMILIA[id] || id; }

function podeFazer(ex, equip) {
  return ex.eq.every(function (a) { return equip.indexOf(a) >= 0; });
}

// Lista de candidatos de um grupo, na ordem de prioridade, respeitando aparelhos e nível.
function candidatos(grupo, equip, nivel, pref) {
  var ok = EXERCICIOS.filter(function (e) { return e.g === grupo && podeFazer(e, equip); });
  var noNivel = ok.filter(function (e) { return e.lv <= nivel; });
  var lista = noNivel.length ? noNivel : ok;
  if (pref) {
    var a = lista.filter(function (e) { return e.t === pref; });
    var b = lista.filter(function (e) { return e.t !== pref; });
    lista = a.concat(b);
  }
  return lista;
}

// Séries, repetições e descanso conforme objetivo, nível e tipo de exercício.
function prescricao(ex, objetivo, nivel) {
  if (ex.tempo) return { series: 3, reps: '30–45 s', min: 30, max: 45, desc: 45, tempo: true };
  if (ex.g === 'abdomen') return { series: 3, reps: '15–20', min: 15, max: 20, desc: 45 };
  if (ex.g === 'panturrilha') return objetivo === 'emagrecer' ? { series: 3, reps: '15–20', min: 15, max: 20, desc: 45 } : { series: 4, reps: '12–15', min: 12, max: 15, desc: 60 };
  var c = ex.t === 'c';
  if (objetivo === 'emagrecer') return c ? { series: 3, reps: '12–15', min: 12, max: 15, desc: 60 } : { series: 3, reps: '12–15', min: 12, max: 15, desc: 45 };
  if (objetivo === 'forca') {
    if (!c) return { series: 3, reps: '10–12', min: 10, max: 12, desc: 60 };
    return nivel === 1 ? { series: 3, reps: '8–10', min: 8, max: 10, desc: 120 } : { series: 4, reps: '6–8', min: 6, max: 8, desc: 120 };
  }
  // hipertrofia
  if (!c) return { series: 3, reps: '10–12', min: 10, max: 12, desc: 60 };
  return nivel === 1 ? { series: 3, reps: '10–12', min: 10, max: 12, desc: 90 } : { series: 4, reps: '8–10', min: 8, max: 10, desc: 90 };
}

// Monta a ficha completa. Devolve também os avisos de vaga que ficou sem exercício (nunca some calado).
function gerarPlano(perfil, variacao) {
  variacao = variacao || 0;
  var chaves = DIVISOES[perfil.sexo][perfil.dias];
  var vagas = { 1: 5, 2: 6, 3: 7 }[perfil.nivel];
  var vistos = {};
  var avisos = [];
  var dias = chaves.map(function (k, i) {
    var def = D[k];
    var repet = vistos[k] || 0; vistos[k] = repet + 1;
    var giro = repet + variacao;
    var usados = [];
    var itens = [];
    var faltou = {};
    def[1].slice(0, vagas).forEach(function (vaga) {
      var p = vaga.split(':');
      var lista = candidatos(p[0], perfil.equip, perfil.nivel, p[1]);
      var livres = lista.filter(function (e) { return usados.indexOf(familia(e.id)) < 0; });
      if (!livres.length) { faltou[p[0]] = true; return; }
      var ex = livres[giro % livres.length];
      usados.push(familia(ex.id));
      itens.push(Object.assign({ id: ex.id }, prescricao(ex, perfil.objetivo, perfil.nivel)));
    });
    // só avisa quando o músculo ficou sem nenhum exercício no dia (vaga repetida que não coube não é falta)
    Object.keys(faltou).forEach(function (g) {
      if (!itens.some(function (it) { return EX[it.id].g === g; }))
        avisos.push('Treino ' + String.fromCharCode(65 + i) + ': nenhum exercício de ' + GRUPOS[g].toLowerCase() + ' com os aparelhos marcados.');
    });
    return { letra: String.fromCharCode(65 + i), nome: def[0], itens: itens };
  });
  return { criadoEm: new Date().toISOString(), variacao: variacao, dias: dias, avisos: avisos };
}

// Outras opções para o mesmo músculo, com os aparelhos da pessoa.
function alternativas(id, equip, excluir) {
  var ex = EX[id];
  return EXERCICIOS.filter(function (e) {
    return e.g === ex.g && e.id !== id && podeFazer(e, equip) && (excluir || []).indexOf(e.id) < 0;
  });
}

function minutosTreino(dia) {
  var s = 0;
  dia.itens.forEach(function (it) { s += it.series * (45 + it.desc); });
  return Math.round(s / 60) + 8; // + aquecimento
}

function promptFlow(ex, sexo) {
  var quem = sexo === 'M' ? 'an athletic man' : 'an athletic woman';
  return 'Vertical 9:16 video. ' + quem.charAt(0).toUpperCase() + quem.slice(1) + ' in plain dark workout clothes demonstrates the ' + ex.en +
    ' with perfect form in a clean, modern gym. Side view, full body always visible, static camera. Slow and controlled tempo, 3 full repetitions, ' +
    'clear full range of motion. Soft natural light, neutral background, no text, no logos, no music.';
}

// Último registro de um exercício no histórico (carga e repetições por série).
function ultimoRegistro(historico, id) {
  for (var i = historico.length - 1; i >= 0; i--) {
    var r = historico[i].exercicios.filter(function (x) { return x.id === id; })[0];
    if (r && r.series.some(function (s) { return s.feito; })) return { data: historico[i].data, series: r.series };
  }
  return null;
}

// Sugere subir a carga quando a última vez bateu o máximo de repetições em todas as séries.
function sugereSubir(historico, item) {
  var u = ultimoRegistro(historico, item.id);
  if (!u || item.tempo) return false;
  var feitas = u.series.filter(function (s) { return s.feito; });
  return feitas.length >= item.series && feitas.every(function (s) { return +s.reps >= item.max; });
}

function proximoTreino(plano, historico) {
  if (!historico.length) return 0;
  var ult = historico[historico.length - 1].letra;
  var i = plano.dias.findIndex(function (d) { return d.letra === ult; });
  return i < 0 ? 0 : (i + 1) % plano.dias.length;
}
