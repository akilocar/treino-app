# Monta public/index.html a partir destes pedaços:  python3 fonte/build.py  (rodar na raiz do repositório)
import os, re, datetime
d = os.path.dirname(os.path.abspath(__file__))
L = lambda n: open(os.path.join(d, n), encoding='utf-8').read()
VERSAO = datetime.datetime.now().strftime('%Y%m%d-%H%M')
js = '  var VERSAO = "' + VERSAO + '";\n' + L('dados.js') + L('motor.js') + L('api.js') + L('app.js')
head = '''<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<title>Treino</title>
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#0F0F10">
<meta name="robots" content="noindex,nofollow">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Treino">
<link rel="manifest" href="/manifest.webmanifest">
<link rel="icon" href="/icone.svg" type="image/svg+xml">
<link rel="apple-touch-icon" sizes="180x180" href="/icone-180.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@75..100,500..900&family=Inter:wght@400;500;600;700&display=swap">
<style>[hidden]{display:none!important}
'''
out = head + L('style.css') + '</style>\n</head>\n<body>\n' + L('body.part') + '<script>\n' + js + '\n</script>\n</body>\n</html>\n'
pub = os.path.join(d, '..', 'public')
open(os.path.join(pub, 'index.html'), 'w', encoding='utf-8').write(out)
open(os.path.join(pub, 'versao.txt'), 'w', encoding='utf-8').write(VERSAO + '\n')
sw = os.path.join(pub, 'sw.js'); s = open(sw, encoding='utf-8').read()
open(sw, 'w', encoding='utf-8').write(re.sub(r"const CACHE = '[^']*'", "const CACHE = 'treino-" + VERSAO + "'", s))
print('versao', VERSAO, '| public/index.html', len(out), 'bytes')
