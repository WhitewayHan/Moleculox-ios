#!/usr/bin/env python3
"""Content checks against the source manifest, without starting the old renderer."""
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / 'godot'
DATA = ROOT / 'data'
def read(name):
    return json.loads((DATA / (name + '.json')).read_text())

levels = read('levels')
parity = read('parity')['levels']
molecules = read('molecules')['byLang']
catalog = read('catalog')
languages = catalog['languages']
assert len(levels['campaign']) == len(parity) == 801
assert len(levels['daily']) == 832
assert len(languages) == 11 and set(molecules) == set(languages)
assert len(levels['tutorials']) == 2
localization = read('localization')['byLang']
stories = read('story')['byLang']
for language in languages:
    assert len(stories[language]) == 801
    assert localization[language]
    assert not any('NaN' in str(v) or '=>' in str(v) for v in localization[language].values())
    for index, level in enumerate(levels['campaign']):
        molecule = molecules[language][level['m']]
        assert molecule['key'] == parity[index]['initial']['targetKey']
        assert molecule['n'] and molecule['f']
for legend in read('science')['legends']:
    for key in ['field', 'bio', 'contribution', 'connection']:
        assert set(legend[key]) == set(languages) and all(legend[key].values()), (legend['id'], key)
    assert (ROOT / ('assets/images/science-legends/' + legend['art'] + '.webp')).is_file()
for group in ['mechanics', 'supports', 'labs']:
    assert set(catalog['guides'][group]) == set(languages)
    assert all(catalog['guides'][group].values())
assert len(catalog['audio']['tracks']) == 23
assert len(catalog['audio']['voicePacks']) == 11
assert len(catalog['audio']['sfx']) == 29
modes = read('modes')
for kind, expected in [('classic', 123), ('crystal', 110), ('chain', 107), ('reactor', 109)]:
    assert sum(bool(x) for x in modes['modes'][kind]) == expected
    assert all(bool(record) == bool(flags[kind]) for record, flags in zip(modes['modes'][kind], modes['eligible']))
missing = set()
def scan(value):
    if isinstance(value, dict):
        for item in value.values(): scan(item)
    elif isinstance(value, list):
        for item in value: scan(item)
    elif isinstance(value, str) and value.startswith(('assets/', 'res://assets/')) and len(value) < 240:
        path = value.removeprefix('res://').split('?')[0]
        if not (ROOT / path).is_file(): missing.add(path)
for file in DATA.glob('*.json'):
    scan(json.loads(file.read_text()))
assert not missing, sorted(missing)
provenance = read('provenance')
for file, digest in provenance['hashes'].items():
    assert hashlib.sha256((DATA / file).read_bytes()).hexdigest() == digest, file
report = {'passed': True, 'campaign': 801, 'daily': 832, 'languages': 11,
          'tutorials': 2, 'tracks': 23, 'voicePacks': 11, 'sfx': 29,
          'missingAssetReferences': len(missing), 'modeCounts': {kind: sum(bool(x) for x in rows) for kind, rows in modes['modes'].items()}}
print(json.dumps(report))
