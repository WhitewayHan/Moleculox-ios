from __future__ import annotations
import plistlib
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ipas = sorted((ROOT / 'build' / 'ios' / 'ipa').glob('*.ipa'))
if len(ipas) != 1:
    raise SystemExit(f'Expected exactly one IPA in build/ios/ipa, found {len(ipas)}: {ipas}')
ipa = ipas[0]
with zipfile.ZipFile(ipa) as archive:
    infos = [name for name in archive.namelist() if name.startswith('Payload/') and name.count('/') == 2 and name.endswith('.app/Info.plist')]
    if len(infos) != 1:
        raise SystemExit(f'Expected one app Info.plist in IPA, found {len(infos)}: {infos}')
    info = plistlib.loads(archive.read(infos[0]))

family = info.get('UIDeviceFamily')
try:
    normalized = [int(value) for value in family]
except Exception as exc:
    raise SystemExit(f'Invalid or missing UIDeviceFamily in built IPA: {family!r}') from exc
if normalized != [1]:
    raise SystemExit(f'Built IPA is not strictly iPhone-only: UIDeviceFamily={normalized!r}')
if info.get('CFBundleIdentifier') != 'com.whitewayhan.moleculox':
    raise SystemExit(f'Unexpected bundle identifier in built IPA: {info.get("CFBundleIdentifier")!r}')
if info.get('CFBundleShortVersionString') != '8.7.73':
    raise SystemExit(
        'Built IPA marketing version mismatch: '
        f'CFBundleShortVersionString={info.get("CFBundleShortVersionString")!r}, expected 8.7.73'
    )
build_version = str(info.get('CFBundleVersion') or '')
if not build_version.isdigit() or int(build_version) < 1:
    raise SystemExit(f'Built IPA has an invalid CFBundleVersion: {build_version!r}')

print(
    f'Validated built IPA: {ipa.name}, version=8.7.73, '
    f'build={build_version}, UIDeviceFamily={normalized}.'
)
