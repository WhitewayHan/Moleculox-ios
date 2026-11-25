#!/usr/bin/env python3
"""Export a real single-thread Godot game and make an itch root-index ZIP."""
import argparse
import hashlib
import json
import os
import re
from pathlib import Path
import shutil
import subprocess
import tempfile
import zipfile

ROOT = Path(__file__).resolve().parents[1]
PROJECT = ROOT if (ROOT / 'project.godot').is_file() else ROOT / 'godot'

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--output', type=Path, default=ROOT.parent / 'artifacts/Moleculox-Godot-Itch.zip')
    args = parser.parse_args()
    output = args.output.resolve()
    output.parent.mkdir(parents=True, exist_ok=True)
    env = dict(os.environ)
    env.setdefault('XDG_DATA_HOME', str(ROOT.parent / '.godot-runtime'))
    env.setdefault('XDG_CONFIG_HOME', str(Path(env['XDG_DATA_HOME']) / 'config'))
    executable = env.get('GODOT_BIN', 'godot')
    with tempfile.TemporaryDirectory(prefix='moleculox-godot-web-', dir=ROOT.parent) as temporary:
        stage = Path(temporary)
        # Imports are required before CLI export from a fresh project checkout.
        subprocess.run([executable, '--headless', '--path', str(PROJECT), '--editor', '--import'], env=env, check=True)
        subprocess.run([executable, '--headless', '--path', str(PROJECT), '--export-release', 'Web', str(stage / 'index.html')], env=env, check=True)
        # ZIP is a native Godot pack format. Preserve original PNG/WebP files
        # rather than the much larger losslessly re-encoded .ctex resources.
        subprocess.run([executable, '--headless', '--path', str(PROJECT), '--export-pack', 'Web', str(stage / 'imported.zip')], env=env, check=True)
        with zipfile.ZipFile(stage / 'imported.zip') as imported, zipfile.ZipFile(stage / 'index.zip','w',zipfile.ZIP_DEFLATED,compresslevel=6) as packed:
            for item in imported.infolist():
                if item.filename.endswith('.ctex') or item.filename.endswith(('.png.import','.webp.import','.jpg.import','.jpeg.import')):
                    if 'icon-192.png-' not in item.filename and item.filename != 'assets/icons/icon-192.png.import':
                        continue
                packed.writestr(item.filename,imported.read(item))
            for image in sorted((PROJECT / 'assets').rglob('*')):
                if image.suffix.lower() in ['.png','.webp','.jpg','.jpeg']:
                    name = str(image.relative_to(PROJECT))
                    if name not in packed.namelist(): packed.write(image,name)
        (stage / 'imported.zip').unlink()
        (stage / 'index.pck').unlink()
        html = (stage / 'index.html').read_text()
        match = re.search(r'const GODOT_CONFIG = (\{[^\n]+\});',html)
        if not match: raise SystemExit('Godot HTML configuration marker missing')
        config = json.loads(match.group(1))
        config['mainPack'] = 'index.zip'
        config['fileSizes'].pop('index.pck',None)
        config['fileSizes']['index.zip'] = (stage / 'index.zip').stat().st_size
        html = html[:match.start(1)] + json.dumps(config,separators=(',',':')) + html[match.end(1):]
        html = html.replace('</head>','<script defer src="offline-adapter.js"></script>\n</head>')
        (stage / 'index.html').write_text(html)
        shutil.copyfile(PROJECT / 'bridge/offline-adapter.js',stage / 'offline-adapter.js')
        cache_files = [p.name for p in sorted(stage.iterdir()) if p.is_file()]
        worker = (PROJECT / 'web/offline-sw.js').read_text()
        worker = worker.replace('__CACHE_NAME__',json.dumps('moleculox-godot-'+hashlib.sha256((stage/'index.zip').read_bytes()).hexdigest()[:16])).replace('__CACHE_FILES__',json.dumps(cache_files))
        (stage / 'offline-sw.js').write_text(worker)
        expected = ['index.html', 'index.js', 'index.wasm', 'index.zip']
        for name in expected:
            if not (stage / name).is_file():
                raise SystemExit('Missing Godot export member: ' + name)
        if 'SharedArrayBuffer' in html or 'coi-serviceworker' in html:
            raise SystemExit('Unexpected thread/isolation requirement in itch shell')
        # Godot's single-thread template runs in itch without host COOP/COEP headers.
        # The engine itself remains untouched; no old game renderer is embedded.
        try:
            commit = subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT,text=True,stderr=subprocess.DEVNULL).strip()
        except (OSError,subprocess.CalledProcessError):
            commit = 'unversioned-source-project'
        info = {'engine': 'Godot 4.6.3', 'threadSupport': False, 'renderer': 'Compatibility',
                'sourceBranch': 'feat/godot-port', 'baseline': '8.7.239-web-smooth1',
                'codeCommit': commit,
                'artworkEncoding': 'original source PNG/WebP bytes', 'resourcePack': 'index.zip',
                'files': {p.name: hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted(stage.iterdir()) if p.is_file()}}
        (stage / 'BUILD-INFO.json').write_text(json.dumps(info, indent=2) + '\n')
        readme = ('Moleculox — Godot Web\n\n'
                  'itch.io: Kind of project = HTML; upload this ZIP intact and select "This file will be played in the browser".\n'
                  'Use fullscreen support and a responsive viewport (480 x 900 portrait is the reference).\n'
                  'The archive has index.html at its root. Do not upload the Godot source-project ZIP as an HTML game.\n'
                  'Run over HTTP/HTTPS; opening index.html directly as file:// cannot load WebAssembly/PCK correctly.\n'
                  'No SharedArrayBuffer, multithreading, COOP or COEP configuration is required.\n'
                  'Account/online features require the original Firebase service and network access.\n')
        (stage / 'ITCH-README.txt').write_text(readme)
        files = [p for p in sorted(stage.rglob('*')) if p.is_file()]
        total = sum(p.stat().st_size for p in files)
        assert len(files) <= 1000 and total <= 500 * 1024 * 1024
        assert all(p.stat().st_size <= 200 * 1024 * 1024 and len(str(p.relative_to(stage))) <= 240 for p in files)
        temporary_zip = output.with_suffix('.tmp.zip')
        with zipfile.ZipFile(temporary_zip, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
            for path in files:
                archive.write(path, str(path.relative_to(stage)))
        temporary_zip.replace(output)
        extracted = output.with_suffix('')
        if extracted.exists():
            shutil.rmtree(extracted)
        shutil.copytree(stage, extracted)
    digest = hashlib.sha256(output.read_bytes()).hexdigest()
    output.with_suffix(output.suffix + '.sha256').write_text(digest + '  ' + output.name + '\n')
    print(json.dumps({'zip': str(output), 'bytes': output.stat().st_size, 'unpacked': total, 'files': len(files), 'sha256': digest}))

if __name__ == '__main__':
    main()
