// ===== Biblioteca de exercícios, aparelhos e divisões de treino =====
// Cada exercício: id, nome, grupo, tipo (c = composto / i = isolado), nível mínimo (1-3),
// aparelhos exigidos, músculos, nome em inglês (prompt do Google Flow), passos, erro comum.

var GRUPOS = {
  quadriceps: 'Quadríceps', gluteo: 'Glúteo', abdutor: 'Glúteo médio', posterior: 'Posterior de coxa',
  panturrilha: 'Panturrilha', costas: 'Costas', peito: 'Peito', ombro: 'Ombros',
  ombro_post: 'Ombro posterior', adutor: 'Parte interna da coxa', biceps: 'Bíceps', triceps: 'Tríceps', abdomen: 'Abdômen'
};

var APARELHOS = {
  halteres: 'Halteres', kettlebell: 'Kettlebell', barra: 'Barra e anilhas', barraw: 'Barra W',
  banco: 'Banco ajustável', smith: 'Smith', legpress: 'Leg press', hack: 'Hack',
  extensora: 'Cadeira extensora', cadeiraflexora: 'Cadeira flexora', mesaflexora: 'Mesa flexora',
  abdutora: 'Cadeira abdutora / adutora', hipthrust: 'Máquina de elevação pélvica',
  puxador: 'Puxador alto (pulley)', remada: 'Remada baixa (polia baixa)', polia: 'Polia / crossover',
  voador: 'Voador (peck deck)', scott: 'Banco Scott', supmaq: 'Supino máquina', desmaq: 'Máquina de ombro (desenvolvimento)',
  graviton: 'Graviton', barrafixa: 'Barra fixa / espaldar', panturrilha: 'Panturrilha em pé (máquina)',
  pantsentado: 'Panturrilha sentado', bancoabd: 'Banco de abdominal', roda: 'Roda de abdominal',
  caixa: 'Caixa / step', caneleira: 'Caneleira', elastico: 'Elástico / mini band'
};

// Cardio: não entra na ficha de musculação, só na sugestão de aquecimento e cardio final.
var CARDIO = { esteira: 'Esteira', bike: 'Bike', eliptico: 'Elíptico', remoergo: 'Remo ergométrico' };

var PRESETS = {
  vivere: { nome: 'Vivere do Lago', eq: ['halteres', 'kettlebell', 'barra', 'barraw', 'banco', 'smith', 'legpress', 'extensora', 'cadeiraflexora',
    'abdutora', 'hipthrust', 'puxador', 'remada', 'polia', 'voador', 'scott', 'desmaq', 'barrafixa', 'pantsentado', 'bancoabd', 'roda', 'caixa', 'caneleira', 'elastico',
    'esteira', 'bike', 'eliptico', 'remoergo'] },
  completa: { nome: 'Academia completa', eq: Object.keys(APARELHOS).concat(Object.keys(CARDIO)) },
  casa: { nome: 'Em casa', eq: ['halteres', 'elastico'] },
  nada: { nome: 'Sem aparelho', eq: [] }
};

// Cuidados: o que muda na ficha quando a pessoa marca um incômodo.
// evitar = sai da montagem automática e do Trocar; reforco = 2 exercícios no começo de cada treino, leves.
var CUIDADOS = {
  quadril: {
    nome: 'Dor no quadril', curto: 'Quadril',
    sub: 'Começa cada treino fortalecendo o quadril e tira os exercícios que mais costumam incomodar',
    evitar: ['agach_livre', 'bulgaro', 'afundo', 'sumo', 'swing', 'elev_pernas', 'elev_pernas_barra'],
    reforco: ['ponte', 'abducao_deitada', 'caminhada_lateral', 'prancha_lateral', 'abducao_polia', 'coice_caneleira']
  }
};

function X(id, n, g, t, lv, eq, m, en, p, e, tempo) {
  return { id: id, n: n, g: g, t: t, lv: lv, eq: eq, m: m, en: en, p: p, e: e, tempo: !!tempo };
}

var EXERCICIOS = [
  // QUADRÍCEPS
  X('leg45', 'Leg press 45°', 'quadriceps', 'c', 1, ['legpress'], 'Quadríceps e glúteos', '45-degree leg press machine',
    ['Sente com as costas e o quadril bem apoiados no encosto.', 'Pés no meio da plataforma, na largura do quadril.', 'Destrave e desça até os joelhos formarem cerca de 90°.', 'Empurre com o pé inteiro, sem travar os joelhos no final.'],
    'Descer demais e deixar o quadril sair do encosto, arredondando a lombar.'),
  X('agach_livre', 'Agachamento livre com barra', 'quadriceps', 'c', 2, ['barra'], 'Quadríceps, glúteos e core', 'barbell back squat',
    ['Barra apoiada no trapézio, pés na largura dos ombros e pontas levemente para fora.', 'Respire fundo, trave o abdômen e leve o quadril para trás e para baixo.', 'Os joelhos acompanham a direção das pontas dos pés.', 'Desça até as coxas ficarem paralelas ao chão e suba com o tronco firme.'],
    'Calcanhar saindo do chão ou tronco caindo para a frente.'),
  X('agach_smith', 'Agachamento no Smith', 'quadriceps', 'c', 1, ['smith'], 'Quadríceps e glúteos', 'Smith machine squat',
    ['Barra no trapézio, pés um pouco à frente do corpo, na largura dos ombros.', 'Desça como se fosse sentar, com o peito aberto.', 'Vá até as coxas ficarem paralelas ao chão, ou até onde a lombar continuar reta.', 'Suba empurrando o chão com o pé inteiro.'],
    'Joelhos caindo para dentro na subida.'),
  X('hack', 'Agachamento no hack', 'quadriceps', 'c', 2, ['hack'], 'Quadríceps', 'hack squat machine',
    ['Costas e ombros bem apoiados na almofada.', 'Pés no meio da plataforma, na largura do quadril.', 'Desça devagar até cerca de 90° nos joelhos.', 'Suba sem travar os joelhos no topo.'],
    'Tirar a lombar do encosto no fundo do movimento.'),
  X('goblet', 'Agachamento goblet', 'quadriceps', 'c', 1, ['halteres'], 'Quadríceps, glúteos e core', 'goblet squat holding one dumbbell at the chest',
    ['Segure um halter em pé, junto ao peito, com as duas mãos.', 'Pés um pouco mais abertos que o quadril.', 'Desça entre as pernas, cotovelos por dentro dos joelhos, peito alto.', 'Suba empurrando o chão e contraindo os glúteos no topo.'],
    'Deixar o halter afastar do peito e o tronco tombar para a frente.'),
  X('cadeira_ext', 'Cadeira extensora', 'quadriceps', 'i', 1, ['extensora'], 'Quadríceps', 'leg extension machine',
    ['Ajuste o encosto para o joelho ficar alinhado ao eixo da máquina.', 'O rolo fica logo acima do tornozelo.', 'Estenda as pernas até quase esticar e segure 1 segundo.', 'Desça devagar, sem deixar o peso bater.'],
    'Jogar o peso com impulso e levantar o quadril do banco.'),
  X('afundo', 'Afundo (passada parada)', 'quadriceps', 'c', 1, [], 'Quadríceps e glúteos', 'stationary lunge holding dumbbells',
    ['Um pé à frente e outro atrás, tronco reto (com halteres, se tiver).', 'Desça o joelho de trás em direção ao chão.', 'O joelho da frente fica alinhado com o pé.', 'Suba empurrando com a perna da frente. Termine um lado e troque.'],
    'Passo curto demais, que joga o joelho da frente muito à frente do pé.'),
  X('agach_corpo', 'Agachamento com peso do corpo', 'quadriceps', 'c', 1, [], 'Quadríceps e glúteos', 'bodyweight air squat',
    ['Pés na largura dos ombros, braços à frente para equilibrar.', 'Leve o quadril para trás e para baixo.', 'Desça até onde a lombar continuar reta.', 'Suba contraindo os glúteos.'],
    'Joelhos fechando para dentro.'),

  // GLÚTEO
  X('elev_pelvica_maq', 'Elevação pélvica na máquina', 'gluteo', 'c', 1, ['hipthrust'], 'Glúteo máximo', 'hip thrust machine with padded bar over the hips',
    ['Sente no chão de costas para o banco da máquina e apoie a parte de cima das costas nele.', 'Passe a barra com o protetor sobre o quadril e apoie os pés na plataforma.', 'Suba o quadril contraindo os glúteos até o tronco ficar alinhado com as coxas.', 'Segure 1 segundo em cima e desça devagar.'],
    'Empurrar com a lombar e jogar a cabeça para trás.'),
  X('elev_pelvica', 'Elevação pélvica com barra', 'gluteo', 'c', 1, ['barra', 'banco'], 'Glúteo máximo', 'barbell hip thrust with upper back on a bench',
    ['Apoie a parte de cima das costas no banco, barra com proteção sobre o quadril.', 'Pés na largura do quadril; no topo os joelhos ficam a 90°.', 'Suba o quadril contraindo os glúteos, queixo levemente para o peito.', 'Segure 1 segundo em cima e desça controlando.'],
    'Arquear a lombar no topo em vez de subir com o glúteo.'),
  X('elev_pelvica_h', 'Elevação pélvica com halter', 'gluteo', 'c', 1, ['halteres', 'banco'], 'Glúteo máximo', 'dumbbell hip thrust with upper back on a bench',
    ['Costas apoiadas no banco, halter sobre o quadril segurado com as mãos.', 'Pés na largura do quadril.', 'Suba o quadril até o tronco ficar alinhado com as coxas.', 'Contraia 1 segundo no topo e desça devagar.'],
    'Empurrar com a ponta dos pés: o peso tem que sair do calcanhar.'),
  X('bulgaro', 'Agachamento búlgaro', 'gluteo', 'c', 2, ['halteres', 'banco'], 'Glúteos e quadríceps', 'Bulgarian split squat with dumbbells, rear foot on a bench',
    ['De costas para o banco, apoie o peito do pé de trás nele.', 'Com halteres ao lado do corpo, desça na vertical.', 'Incline levemente o tronco à frente para pegar mais glúteo.', 'Suba empurrando com o calcanhar da frente. Termine um lado e troque.'],
    'Pé da frente muito perto do banco.'),
  X('sumo', 'Agachamento sumô com halter', 'gluteo', 'c', 1, ['halteres'], 'Glúteos e adutores', 'dumbbell sumo squat',
    ['Pés bem afastados, pontas para fora, halter segurado entre as pernas.', 'Desça com o tronco ereto e os joelhos abertos na direção dos pés.', 'Suba contraindo glúteos e a parte interna da coxa.'],
    'Joelhos fechando na subida.'),
  X('step_up', 'Subida no banco (step-up)', 'gluteo', 'c', 1, ['banco'], 'Glúteos e quadríceps', 'dumbbell step-up onto a bench',
    ['Fique de frente para o banco, um pé inteiro em cima dele.', 'Suba empurrando com a perna de cima, sem dar impulso com a de baixo.', 'Desça devagar. Termine um lado e troque.'],
    'Pegar impulso com a perna que fica no chão.'),
  X('coice_polia', 'Glúteo na polia (coice)', 'gluteo', 'i', 1, ['polia'], 'Glúteo máximo', 'cable glute kickback with ankle strap',
    ['Prenda a tornozeleira na polia baixa e segure o aparelho.', 'Incline levemente o tronco à frente.', 'Leve a perna para trás e para cima, joelho quase estendido.', 'Contraia o glúteo no final, sem arquear a lombar, e volte devagar.'],
    'Jogar a perna usando a lombar.'),
  X('coice_caneleira', 'Glúteo 4 apoios com caneleira', 'gluteo', 'i', 1, ['caneleira'], 'Glúteo máximo', 'quadruped donkey kick with ankle weight on a mat',
    ['Em 4 apoios no colchonete, caneleira no tornozelo.', 'Leve a perna para cima com o joelho dobrado a 90°, sola do pé virada para o teto.', 'Contraia o glúteo no topo sem arquear a lombar e desça devagar. Termine um lado e troque.'],
    'Girar o quadril para subir mais.'),
  X('swing', 'Swing com kettlebell', 'gluteo', 'c', 2, ['kettlebell'], 'Glúteos e posterior de coxa', 'two-handed kettlebell swing',
    ['Pés um pouco mais abertos que o quadril, kettlebell segurado com as duas mãos.', 'Leve o quadril para trás deixando o kettlebell passar entre as pernas.', 'Empurre o quadril para a frente com força: o kettlebell sobe até a altura do peito pelo impulso.', 'Os braços só guiam; quem trabalha é o glúteo.'],
    'Agachar em vez de jogar o quadril para trás, ou levantar com os braços.'),
  X('ponte', 'Ponte de glúteo no chão', 'gluteo', 'i', 1, [], 'Glúteos', 'glute bridge on the floor',
    ['Deitada de barriga para cima, joelhos dobrados, pés no chão.', 'Suba o quadril contraindo os glúteos.', 'Segure 2 segundos em cima e desça devagar.'],
    'Subir arqueando a lombar.'),

  // GLÚTEO MÉDIO (abdução)
  X('abducao_maq', 'Cadeira abdutora', 'abdutor', 'i', 1, ['abdutora'], 'Glúteo médio', 'hip abduction machine',
    ['Sente com as costas apoiadas e as pernas encaixadas nas almofadas.', 'Abra as pernas até o máximo confortável.', 'Segure 1 segundo e feche devagar.', 'Dica: inclinar o tronco à frente pega mais glúteo.'],
    'Fechar rápido e deixar o peso bater.'),
  X('abducao_polia', 'Abdução de quadril na polia', 'abdutor', 'i', 1, ['polia'], 'Glúteo médio', 'standing cable hip abduction',
    ['Tornozeleira na polia baixa, de lado para o aparelho.', 'Leve a perna de fora para o lado, sem girar o quadril.', 'Volte devagar. Termine um lado e troque.'],
    'Inclinar o tronco para o lado para ganhar amplitude.'),
  X('caminhada_lateral', 'Caminhada lateral com mini band', 'abdutor', 'i', 1, ['elastico'], 'Glúteo médio', 'lateral band walk with mini band above the knees',
    ['Mini band acima dos joelhos, semi-agachada.', 'Dê passos laterais mantendo o elástico sempre esticado.', 'Ande 10 a 15 passos para cada lado.'],
    'Deixar os joelhos fecharem.'),
  X('abducao_deitada', 'Abdução deitada de lado', 'abdutor', 'i', 1, [], 'Glúteo médio', 'side-lying leg raise on a mat',
    ['Deitada de lado, pernas esticadas, uma sobre a outra (com caneleira, se tiver).', 'Suba a perna de cima, com a ponta do pé virada levemente para baixo.', 'Desça devagar. Termine um lado e troque.'],
    'Rolar o quadril para trás durante a subida.'),

  // POSTERIOR DE COXA
  X('aducao_maq', 'Cadeira adutora', 'adutor', 'i', 1, ['abdutora'], 'Parte interna da coxa', 'hip adduction machine',
    ['Sente com as costas apoiadas e as pernas abertas nas almofadas.', 'Feche as pernas até as almofadas quase se encostarem.', 'Abra devagar.'],
    'Abrir rápido e deixar o peso bater.'),

  X('stiff', 'Stiff com halteres', 'posterior', 'c', 1, ['halteres'], 'Posterior de coxa e glúteos', 'dumbbell Romanian deadlift',
    ['Pés na largura do quadril, joelhos levemente flexionados e fixos.', 'Leve o quadril para trás descendo os halteres rente às pernas.', 'Coluna sempre reta; desça até sentir alongar atrás da coxa.', 'Suba empurrando o quadril para a frente.'],
    'Arredondar as costas para descer mais.'),
  X('stiff_barra', 'Stiff com barra', 'posterior', 'c', 2, ['barra'], 'Posterior de coxa e glúteos', 'barbell Romanian deadlift',
    ['Barra na frente das coxas, pegada na largura dos ombros.', 'Joelhos levemente flexionados e fixos.', 'Leve o quadril para trás, barra raspando nas pernas.', 'Suba contraindo glúteos, sem jogar o tronco para trás.'],
    'Barra afastando do corpo.'),
  X('mesa_flexora', 'Mesa flexora', 'posterior', 'i', 1, ['mesaflexora'], 'Posterior de coxa', 'lying leg curl machine',
    ['Deite de bruços com o joelho logo depois do banco.', 'O rolo fica acima do calcanhar.', 'Dobre os joelhos trazendo o rolo em direção ao glúteo.', 'Não tire o quadril do banco e desça devagar.'],
    'Levantar o quadril para ajudar o movimento.'),
  X('cadeira_flexora', 'Cadeira flexora', 'posterior', 'i', 1, ['cadeiraflexora'], 'Posterior de coxa', 'seated leg curl machine',
    ['Sente com as costas apoiadas e o joelho alinhado ao eixo da máquina.', 'Rolo de baixo atrás do tornozelo; trave a almofada de cima sobre as coxas.', 'Dobre os joelhos puxando o rolo para baixo e para trás.', 'Volte devagar até quase esticar.'],
    'Deixar o quadril escorregar no banco.'),
  X('flexora_polia', 'Flexora em pé na polia', 'posterior', 'i', 1, ['polia'], 'Posterior de coxa', 'standing cable hamstring curl with ankle strap',
    ['Tornozeleira na polia baixa, de frente para o aparelho.', 'Dobre o joelho trazendo o calcanhar ao glúteo.', 'Volte devagar. Termine um lado e troque.'],
    'Levar o joelho para a frente durante a flexão.'),
  X('stiff_unilateral', 'Stiff unilateral sem peso', 'posterior', 'c', 1, [], 'Posterior de coxa e equilíbrio', 'single-leg bodyweight Romanian deadlift',
    ['Apoie-se numa perna, joelho levemente dobrado.', 'Incline o tronco à frente enquanto a outra perna sobe para trás.', 'Volte contraindo o glúteo. Termine um lado e troque.'],
    'Girar o quadril para o lado.'),

  // PANTURRILHA
  X('pant_pe', 'Panturrilha em pé', 'panturrilha', 'i', 1, ['panturrilha'], 'Panturrilha', 'standing calf raise machine',
    ['Ponta dos pés na borda da plataforma.', 'Desça o calcanhar até alongar bem.', 'Suba o máximo que conseguir e segure 1 segundo.'],
    'Fazer rápido, quicando no fundo.'),
  X('pant_sentado', 'Panturrilha sentado', 'panturrilha', 'i', 1, ['pantsentado'], 'Panturrilha (sóleo)', 'seated calf raise machine',
    ['Sente com a almofada sobre as coxas, perto dos joelhos.', 'Ponta dos pés na plataforma, calcanhar para fora.', 'Desça o calcanhar até alongar e suba o máximo, segurando 1 segundo.'],
    'Fazer rápido, quicando no fundo.'),
  X('pant_legpress', 'Panturrilha no leg press', 'panturrilha', 'i', 1, ['legpress'], 'Panturrilha', 'calf press on a leg press machine',
    ['Ponta dos pés na parte de baixo da plataforma, joelhos quase esticados.', 'Empurre com a ponta dos pés e volte alongando.'],
    'Dobrar os joelhos durante o movimento.'),
  X('pant_degrau', 'Panturrilha no degrau', 'panturrilha', 'i', 1, [], 'Panturrilha', 'single-step bodyweight calf raise',
    ['Ponta dos pés num degrau, segurando em algo para equilibrar.', 'Desça o calcanhar e suba o máximo, segurando 1 segundo.'],
    'Amplitude curta.'),

  // COSTAS
  X('puxada_frente', 'Puxada frontal', 'costas', 'c', 1, ['puxador'], 'Dorsais e bíceps', 'wide-grip lat pulldown',
    ['Ajuste a almofada para travar as coxas.', 'Pegue a barra um pouco mais aberta que os ombros.', 'Puxe até a parte de cima do peito, cotovelos para baixo e para trás.', 'Volte devagar até esticar os braços.'],
    'Jogar o tronco para trás ou puxar atrás da nuca.'),
  X('remada_baixa', 'Remada baixa com triângulo', 'costas', 'c', 1, ['remada'], 'Meio das costas e dorsais', 'seated cable row with V-handle',
    ['Sente com os joelhos levemente dobrados e a coluna reta.', 'Puxe o triângulo até o umbigo, cotovelos rentes ao corpo.', 'Aperte as escápulas no final e volte devagar.'],
    'Balançar o tronco para frente e para trás.'),
  X('graviton', 'Barra fixa assistida (graviton)', 'costas', 'c', 1, ['graviton'], 'Dorsais e bíceps', 'assisted pull-up machine',
    ['Ajuste o contrapeso: quanto mais peso, mais ajuda.', 'Pegada um pouco mais aberta que os ombros.', 'Suba até o queixo passar a barra, peito aberto.', 'Desça controlando até esticar os braços.'],
    'Subir só com os braços, encolhendo os ombros.'),
  X('remada_unilateral', 'Remada unilateral com halter', 'costas', 'c', 1, ['halteres'], 'Dorsais e meio das costas', 'one-arm dumbbell row with knee on a bench',
    ['Joelho e mão do mesmo lado apoiados no banco (ou mão numa cadeira), costas retas.', 'Puxe o halter em direção ao quadril.', 'Desça até esticar o braço. Termine um lado e troque.'],
    'Girar o tronco para subir mais o halter.'),
  X('barra_fixa', 'Barra fixa', 'costas', 'c', 2, ['barrafixa'], 'Dorsais e bíceps', 'pull-up on a wall-mounted bar',
    ['Segure a barra com as mãos um pouco mais abertas que os ombros.', 'Suba até o queixo passar a barra, levando os cotovelos para baixo.', 'Ainda não sobe? Faça só a descida: suba com ajuda de um degrau e desça em 4 a 5 segundos.', 'Desça até esticar os braços.'],
    'Balançar o corpo para subir.'),
  X('remada_curvada', 'Remada curvada com barra', 'costas', 'c', 2, ['barra'], 'Costas inteiras', 'bent-over barbell row',
    ['Tronco inclinado à frente, joelhos dobrados, coluna reta.', 'Puxe a barra até a parte baixa do abdômen.', 'Desça controlando, sem levantar o tronco.'],
    'Arredondar a lombar.'),
  X('puxada_triangulo', 'Puxada com triângulo', 'costas', 'c', 1, ['puxador'], 'Dorsais', 'close-grip lat pulldown with V-handle',
    ['Triângulo no puxador, coxas travadas.', 'Puxe até o peito com os cotovelos colados ao corpo.', 'Volte devagar.'],
    'Encolher os ombros no final.'),
  X('pulldown_reto', 'Pulldown com braços estendidos', 'costas', 'i', 2, ['polia'], 'Dorsais', 'straight-arm cable pulldown',
    ['Barra reta na polia alta, braços quase esticados.', 'Tronco levemente inclinado à frente.', 'Leve a barra até as coxas contraindo as costas e volte devagar.'],
    'Dobrar os cotovelos e virar um tríceps.'),
  X('remada_elastico', 'Remada com elástico', 'costas', 'c', 1, ['elastico'], 'Meio das costas', 'seated resistance band row',
    ['Sentada, elástico passado na sola dos pés.', 'Puxe as pontas até o abdômen, apertando as escápulas.', 'Volte devagar.'],
    'Curvar as costas.'),

  // PEITO
  X('supino_halter', 'Supino reto com halteres', 'peito', 'c', 1, ['halteres', 'banco'], 'Peitoral, ombro e tríceps', 'flat dumbbell bench press',
    ['Deite no banco, pés firmes no chão, halteres na altura do peito.', 'Escápulas encaixadas para trás.', 'Empurre os halteres para cima, aproximando no topo.', 'Desça devagar até a linha do peito.'],
    'Cotovelos muito abertos, a 90° do corpo.'),
  X('supino_barra', 'Supino reto com barra', 'peito', 'c', 2, ['barra', 'banco'], 'Peitoral, ombro e tríceps', 'flat barbell bench press',
    ['Olhos embaixo da barra, pegada um pouco mais aberta que os ombros.', 'Desça a barra até a linha do mamilo.', 'Empurre para cima sem tirar o quadril do banco.'],
    'Quicar a barra no peito.'),
  X('supino_incl', 'Supino inclinado com halteres', 'peito', 'c', 1, ['halteres', 'banco'], 'Parte de cima do peitoral', 'incline dumbbell bench press',
    ['Banco inclinado a cerca de 30°.', 'Halteres na linha da parte alta do peito.', 'Empurre para cima e desça devagar.'],
    'Banco inclinado demais, virando exercício de ombro.'),
  X('supino_maq', 'Supino na máquina', 'peito', 'c', 1, ['supmaq'], 'Peitoral e tríceps', 'seated chest press machine',
    ['Ajuste o banco para as pegadas ficarem na linha do peito.', 'Empurre até quase esticar os braços.', 'Volte devagar sem deixar o peso bater.'],
    'Tirar as costas do encosto.'),
  X('crucifixo', 'Crucifixo com halteres', 'peito', 'i', 1, ['halteres', 'banco'], 'Peitoral', 'flat dumbbell chest fly',
    ['Deitada no banco, halteres acima do peito, cotovelos levemente dobrados.', 'Abra os braços em arco até sentir alongar o peito.', 'Feche como se abraçasse uma árvore.'],
    'Descer demais e forçar o ombro.'),
  X('voador', 'Voador (peck deck)', 'peito', 'i', 1, ['voador'], 'Peitoral', 'pec deck fly machine',
    ['Banco ajustado para as pegadas ficarem na altura do peito.', 'Feche os braços à frente contraindo o peito.', 'Abra devagar até alongar.'],
    'Deixar os ombros subirem.'),
  X('crossover', 'Crossover na polia', 'peito', 'i', 2, ['polia'], 'Peitoral', 'cable crossover chest fly',
    ['Polias na altura dos ombros, um pé à frente.', 'Traga as mãos à frente do corpo em arco, cotovelos levemente dobrados.', 'Volte devagar.'],
    'Transformar o movimento em empurrar.'),
  X('flexao', 'Flexão de braço', 'peito', 'c', 1, [], 'Peitoral, ombro e tríceps', 'push-up (knees on the floor variation allowed)',
    ['Mãos um pouco mais abertas que os ombros (pode apoiar os joelhos).', 'Corpo em linha reta da cabeça aos pés ou joelhos.', 'Desça o peito perto do chão e empurre de volta.'],
    'Quadril caindo ou subindo demais.'),

  // OMBROS
  X('desenv_halter', 'Desenvolvimento com halteres', 'ombro', 'c', 1, ['halteres', 'banco'], 'Ombros e tríceps', 'seated dumbbell shoulder press',
    ['Sentada com as costas apoiadas, halteres na altura das orelhas.', 'Empurre para cima sem bater um no outro.', 'Desça até a altura das orelhas.'],
    'Arquear a lombar para empurrar.'),
  X('desenv_maq', 'Desenvolvimento na máquina', 'ombro', 'c', 1, ['desmaq'], 'Ombros e tríceps', 'seated shoulder press machine',
    ['Banco ajustado para as pegadas ficarem na altura dos ombros.', 'Empurre para cima e desça devagar.'],
    'Tirar as costas do encosto.'),
  X('elev_lateral', 'Elevação lateral', 'ombro', 'i', 1, ['halteres'], 'Lateral do ombro', 'dumbbell lateral raise',
    ['Em pé, halteres ao lado do corpo, cotovelos levemente dobrados.', 'Suba os braços para os lados até a altura dos ombros.', 'Desça devagar.'],
    'Subir com impulso do corpo ou acima da linha do ombro.'),
  X('elev_lateral_polia', 'Elevação lateral na polia', 'ombro', 'i', 2, ['polia'], 'Lateral do ombro', 'single-arm cable lateral raise',
    ['De lado para a polia baixa, pegue o puxador com a mão de fora.', 'Suba o braço para o lado até a altura do ombro.', 'Desça devagar. Termine um lado e troque.'],
    'Inclinar o tronco para o lado.'),
  X('elev_frontal', 'Elevação frontal', 'ombro', 'i', 1, ['halteres'], 'Frente do ombro', 'dumbbell front raise',
    ['Halteres à frente das coxas.', 'Suba um braço de cada vez até a altura dos ombros.', 'Desça devagar.'],
    'Balançar o corpo.'),
  X('elev_lateral_elastico', 'Elevação lateral com elástico', 'ombro', 'i', 1, ['elastico'], 'Lateral do ombro', 'resistance band lateral raise',
    ['Pise no meio do elástico e segure as pontas.', 'Suba os braços para os lados até a altura dos ombros.', 'Desça devagar.'],
    'Encolher os ombros.'),

  // OMBRO POSTERIOR
  X('crucifixo_inverso', 'Crucifixo inverso', 'ombro_post', 'i', 1, ['halteres'], 'Parte de trás do ombro', 'bent-over reverse dumbbell fly',
    ['Tronco inclinado à frente, halteres pendurados.', 'Abra os braços para os lados, cotovelos levemente dobrados.', 'Desça devagar.'],
    'Usar as costas e dar impulso com o tronco.'),
  X('voador_inverso', 'Voador invertido', 'ombro_post', 'i', 1, ['voador'], 'Parte de trás do ombro', 'reverse pec deck machine',
    ['Sente de frente para o encosto, braços esticados nas pegadas.', 'Abra os braços para trás.', 'Volte devagar.'],
    'Encolher os ombros.'),
  X('face_pull', 'Face pull na polia', 'ombro_post', 'i', 2, ['polia'], 'Ombro posterior e meio das costas', 'cable face pull with rope',
    ['Corda na polia alta.', 'Puxe em direção ao rosto, abrindo os cotovelos para os lados.', 'Volte devagar.'],
    'Puxar para o peito em vez do rosto.'),

  // BÍCEPS
  X('rosca_direta', 'Rosca direta com barra', 'biceps', 'i', 1, ['barra'], 'Bíceps', 'standing barbell biceps curl',
    ['Em pé, barra com pegada por baixo, cotovelos colados ao corpo.', 'Suba a barra dobrando os cotovelos.', 'Desça devagar até quase esticar.'],
    'Balançar o tronco para subir.'),
  X('rosca_alternada', 'Rosca alternada', 'biceps', 'i', 1, ['halteres'], 'Bíceps', 'alternating dumbbell biceps curl',
    ['Halteres ao lado do corpo.', 'Suba um braço de cada vez, girando a palma para cima.', 'Desça devagar.'],
    'Levar o cotovelo para a frente.'),
  X('rosca_martelo', 'Rosca martelo', 'biceps', 'i', 1, ['halteres'], 'Bíceps e antebraço', 'dumbbell hammer curl',
    ['Halteres com as palmas viradas uma para a outra.', 'Suba dobrando os cotovelos, sem girar o punho.', 'Desça devagar.'],
    'Dar impulso com o corpo.'),
  X('rosca_scott', 'Rosca Scott', 'biceps', 'i', 1, ['scott'], 'Bíceps', 'preacher curl with EZ bar on a preacher bench',
    ['Sente com a parte de trás dos braços apoiada na almofada.', 'Segure a barra W com a pegada por baixo.', 'Suba dobrando os cotovelos e desça devagar até quase esticar.'],
    'Esticar o braço de uma vez no fundo e forçar o cotovelo.'),
  X('rosca_polia', 'Rosca na polia', 'biceps', 'i', 1, ['polia'], 'Bíceps', 'cable biceps curl with straight bar',
    ['Barra na polia baixa, pegada por baixo.', 'Suba com os cotovelos fixos ao lado do corpo.', 'Desça devagar.'],
    'Cotovelos saindo do lugar.'),
  X('rosca_elastico', 'Rosca com elástico', 'biceps', 'i', 1, ['elastico'], 'Bíceps', 'resistance band biceps curl',
    ['Pise no elástico e segure as pontas, palmas para a frente.', 'Suba dobrando os cotovelos e desça devagar.'],
    'Soltar rápido na descida.'),

  // TRÍCEPS
  X('triceps_polia', 'Tríceps na polia', 'triceps', 'i', 1, ['polia'], 'Tríceps', 'cable triceps pushdown with rope',
    ['Corda ou barra na polia alta, cotovelos colados ao corpo.', 'Estenda os braços até esticar.', 'Volte devagar até 90°.'],
    'Cotovelos abrindo ou subindo.'),
  X('triceps_frances', 'Tríceps francês com halter', 'triceps', 'i', 1, ['halteres'], 'Tríceps', 'seated overhead dumbbell triceps extension',
    ['Sentada, um halter seguro com as duas mãos acima da cabeça.', 'Desça o halter atrás da cabeça dobrando os cotovelos.', 'Suba esticando os braços.'],
    'Cotovelos muito abertos.'),
  X('triceps_testa', 'Tríceps testa', 'triceps', 'i', 2, ['barraw', 'banco'], 'Tríceps', 'lying EZ-bar skull crusher',
    ['Deitada, barra acima do peito.', 'Dobre os cotovelos levando a barra em direção à testa.', 'Estenda de volta sem mexer os ombros.'],
    'Cotovelos abrindo para os lados.'),
  X('mergulho_banco', 'Mergulho no banco', 'triceps', 'c', 1, [], 'Tríceps', 'bench triceps dip',
    ['Mãos na borda de um banco ou cadeira firme, pernas à frente.', 'Desça dobrando os cotovelos até cerca de 90°.', 'Suba esticando os braços.'],
    'Descer demais e forçar o ombro.'),
  X('triceps_coice', 'Tríceps coice com halter', 'triceps', 'i', 1, ['halteres'], 'Tríceps', 'dumbbell triceps kickback',
    ['Tronco inclinado, cotovelo colado ao corpo.', 'Estenda o braço para trás.', 'Volte devagar até 90°.'],
    'Deixar o cotovelo cair.'),

  // ABDÔMEN
  X('prancha', 'Prancha', 'abdomen', 'i', 1, [], 'Abdômen e core', 'forearm plank on a mat',
    ['Antebraços e pontas dos pés no chão.', 'Corpo em linha reta, abdômen contraído.', 'Respire normalmente e segure o tempo indicado.'],
    'Quadril caindo ou empinado.', true),
  X('abd_supra', 'Abdominal supra', 'abdomen', 'i', 1, [], 'Reto abdominal', 'crunch on a mat',
    ['Deitada, joelhos dobrados, mãos atrás da cabeça sem puxar o pescoço.', 'Suba só as escápulas do chão, soltando o ar.', 'Desça devagar.'],
    'Puxar a cabeça com as mãos.'),
  X('elev_pernas', 'Elevação de pernas', 'abdomen', 'i', 1, [], 'Parte baixa do abdômen', 'lying leg raise on a mat',
    ['Deitada, mãos embaixo do quadril, pernas esticadas.', 'Suba as pernas até 90° sem tirar a lombar do chão.', 'Desça devagar sem encostar no chão.'],
    'Lombar descolando do chão.'),
  X('bicicleta', 'Abdominal bicicleta', 'abdomen', 'i', 1, [], 'Oblíquos', 'bicycle crunch on a mat',
    ['Deitada, mãos atrás da cabeça, pernas suspensas.', 'Leve o cotovelo em direção ao joelho oposto, alternando.', 'Movimento controlado, sem pressa.'],
    'Puxar o pescoço.'),
  X('abd_declinado', 'Abdominal no banco declinado', 'abdomen', 'i', 1, ['bancoabd'], 'Reto abdominal', 'decline bench sit-up',
    ['Prenda os pés nos rolos, mãos no peito ou atrás da cabeça.', 'Suba enrolando a coluna até o meio do caminho, soltando o ar.', 'Desça devagar sem encostar totalmente.'],
    'Puxar o pescoço com as mãos.'),
  X('elev_pernas_barra', 'Elevação de pernas no espaldar', 'abdomen', 'i', 2, ['barrafixa'], 'Parte baixa do abdômen', 'hanging knee raise on wall bars',
    ['Pendure-se na barra (ou apoie as costas no espaldar).', 'Suba os joelhos em direção ao peito, enrolando o quadril.', 'Desça devagar, sem balançar.'],
    'Usar o balanço do corpo.'),
  X('roda_abd', 'Roda de abdominal', 'abdomen', 'i', 2, ['roda'], 'Abdômen e core', 'kneeling ab wheel rollout',
    ['De joelhos no colchonete, mãos na roda.', 'Role à frente devagar até onde a lombar continuar reta.', 'Volte contraindo o abdômen.'],
    'Deixar a lombar afundar.'),
  X('prancha_lateral', 'Prancha lateral', 'abdomen', 'i', 1, [], 'Oblíquos', 'side forearm plank',
    ['Deitada de lado, antebraço no chão abaixo do ombro.', 'Suba o quadril até o corpo ficar reto.', 'Segure e troque de lado.'],
    'Quadril caindo.', true)
];

var EX = {};
EXERCICIOS.forEach(function (e) { EX[e.id] = e; });

// ===== Divisões de treino =====
// Cada dia: nome + vagas em ordem de importância. ":c" prefere composto, ":i" prefere isolado.
// Iniciante usa as 5 primeiras vagas, intermediário 6, avançado 7.
var D = {
  QG: ['Quadríceps e glúteo', ['quadriceps:c', 'gluteo:c', 'quadriceps:c', 'abdutor', 'quadriceps:i', 'panturrilha', 'abdomen']],
  CB: ['Costas e bíceps', ['costas:c', 'costas:c', 'costas:c', 'biceps', 'ombro_post', 'biceps', 'abdomen']],
  PG: ['Posterior e glúteo', ['gluteo:c', 'posterior:c', 'gluteo:c', 'posterior:i', 'abdutor', 'gluteo:i', 'abdomen']],
  POT: ['Peito, ombros e tríceps', ['peito:c', 'ombro:c', 'ombro:i', 'peito:i', 'triceps', 'triceps', 'abdomen']],
  SUP: ['Superiores', ['costas:c', 'peito:c', 'costas:c', 'ombro:c', 'ombro:i', 'biceps', 'triceps']],
  GA: ['Glúteo e abdômen', ['gluteo:c', 'abdutor', 'gluteo:i', 'gluteo:c', 'abdomen', 'abdomen', 'adutor']],
  FBA: ['Corpo inteiro A', ['quadriceps:c', 'costas:c', 'gluteo:c', 'peito:c', 'posterior:i', 'ombro:i', 'abdomen']],
  FBBf: ['Corpo inteiro B', ['gluteo:c', 'costas:c', 'quadriceps:c', 'ombro:c', 'posterior:c', 'triceps', 'abdomen']],
  FBBm: ['Corpo inteiro B', ['quadriceps:c', 'costas:c', 'peito:c', 'posterior:c', 'ombro:c', 'biceps', 'abdomen']],
  PT: ['Peito e tríceps', ['peito:c', 'peito:c', 'peito:i', 'triceps', 'triceps', 'peito:i', 'abdomen']],
  CBm: ['Costas e bíceps', ['costas:c', 'costas:c', 'costas:c', 'biceps', 'biceps', 'ombro_post', 'abdomen']],
  PER: ['Pernas', ['quadriceps:c', 'posterior:i', 'quadriceps:c', 'panturrilha', 'posterior:c', 'gluteo:c', 'quadriceps:i']],
  OA: ['Ombros e abdômen', ['ombro:c', 'ombro:i', 'ombro_post', 'ombro:i', 'abdomen', 'abdomen', 'abdomen']],
  POTm: ['Peito, ombros e tríceps', ['peito:c', 'ombro:c', 'peito:c', 'ombro:i', 'triceps', 'peito:i', 'triceps']],
  Pe: ['Peito', ['peito:c', 'peito:c', 'peito:i', 'peito:c', 'abdomen', 'abdomen', 'peito:i']],
  Co: ['Costas', ['costas:c', 'costas:c', 'costas:c', 'costas:c', 'ombro_post', 'costas:i', 'abdomen']],
  Om: ['Ombros', ['ombro:c', 'ombro:i', 'ombro_post', 'ombro:i', 'panturrilha', 'ombro:c', 'abdomen']],
  Br: ['Braços e abdômen', ['biceps', 'triceps', 'biceps', 'triceps', 'abdomen', 'biceps', 'triceps']]
};

var DIVISOES = {
  F: { 2: ['FBA', 'FBBf'], 3: ['QG', 'SUP', 'PG'], 4: ['QG', 'CB', 'PG', 'POT'], 5: ['QG', 'CB', 'PG', 'POT', 'GA'], 6: ['QG', 'CB', 'PG', 'POT', 'GA', 'SUP'] },
  M: { 2: ['FBA', 'FBBm'], 3: ['POTm', 'CBm', 'PER'], 4: ['PT', 'CBm', 'PER', 'OA'], 5: ['Pe', 'Co', 'PER', 'Om', 'Br'], 6: ['POTm', 'CBm', 'PER', 'POTm', 'CBm', 'PER'] }
};
