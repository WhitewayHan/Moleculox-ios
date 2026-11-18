#!/usr/bin/env python3
"""Export the verified web bundle as a reproducible, root-index itch.io HTML ZIP."""
import argparse
import hashlib
import json
import os
from pathlib import Path, PurePosixPath
import re
import tempfile
from urllib.parse import unquote, urlsplit
import zipfile

from web_bundle_patches import load_overrides, verify_bundle

ROOT = Path(__file__).resolve().parents[1]
BUILD_ID = '8.7.239-web-smooth1'
APP_VERSION = 'v8.7.239 · WEB · Smooth 1'
ORIGINAL_BUILD_ID = '8.7.238-r392-ios-auth3-release'
REGISTRATION = """
<script>
/* Web distribution: cache local game files only; rejected registration never blocks play. */
window.addEventListener('load', function () {
  if (!('serviceWorker' in navigator) || !window.isSecureContext) return;
  const register = function () {
    navigator.serviceWorker.register('./sw.js?v=8.7.239-web-smooth1', {scope:'./'}).catch(function () {});
  };
  if ('requestIdleCallback' in window) requestIdleCallback(register, {timeout:5000});
  else setTimeout(register, 2000);
}, {once:true});
</script>
"""
sha = lambda data: hashlib.sha256(data).hexdigest()


def replace_once(text, old, new, label):
    if text.count(old) != 1:
        raise ValueError('Expected one '+label+' marker')
    return text.replace(old,new,1)


def validate_index(files):
    source = files['index.html'].decode('utf-8')
    for reference in re.findall(r'(?:src|href)=["\']([^"\']+)["\']',source):
        parsed = urlsplit(reference)
        if parsed.scheme or parsed.netloc or not parsed.path:
            continue
        path = PurePosixPath(unquote(parsed.path))
        if path.is_absolute() or '..' in path.parts or str(path) not in files:
            raise ValueError('Missing or unsafe index reference: '+reference)
    for flag in ('window.MX_QA_TEST_GAME=false;', 'window.MX_QA_ALL_LEVELS_OPEN=false;', 'window.MX_QA_NO_CLOUD=false;'):
        if flag not in source:
            raise ValueError('Production QA flag changed: '+flag)


def export_files(root):
    manifest = json.loads((root/'WEB-BUNDLE-SHA256.json').read_text())
    overrides = load_overrides(root,manifest)
    verify_bundle(root/'www',manifest,overrides)
    # Exact manifest members only: local build junk and native sources cannot enter the ZIP.
    files = {name:(root/'www'/name).read_bytes() for name in manifest}
    index = files['index.html'].decode('utf-8')
    index = replace_once(index,"window.__MX_DISTRIBUTION__='ios';","window.__MX_DISTRIBUTION__='web';",'distribution')
    index = replace_once(index,'window.__MX_NATIVE_SHELL__=true;','window.__MX_NATIVE_SHELL__=false;','native-shell')
    if ORIGINAL_BUILD_ID not in index:
        raise ValueError('Original web cache version missing')
    index = index.replace(ORIGINAL_BUILD_ID,BUILD_ID)
    index = re.sub(r'([?&]v=)8\.7\.238(?=["\'])',lambda match:match.group(1)+BUILD_ID,index)
    index = replace_once(index,'</body>',REGISTRATION+'\n</body>','body')
    files['index.html'] = index.encode('utf-8')
    for name in ('js/game.js','js/game-r160.js'):
        source = files[name].decode('utf-8')
        source = replace_once(source,'const APP_VERSION="v8.7.238 · R392 · IOS";', 'const APP_VERSION="'+APP_VERSION+'";','visible app version')
        files[name] = source.encode('utf-8')
    # The optional offline pack includes all local assets; it never lists account endpoints.
    core = ['./'+name for name in sorted(files) if name.endswith(('.js','.css','.html','.webmanifest')) and name not in ('sw.js','sw-r160.js','offline-manifest-r193.js')]
    core += ['./assets/images/bg-default.webp','./assets/icons/icon-192.png','./assets/icons/icon-512.png']
    media = ['./'+name for name in sorted(files) if name.startswith('assets/')]
    for name in core+media:
        if name[2:] not in files:
            raise ValueError('Missing offline resource: '+name)
    files['offline-manifest-r193.js'] = ('/* Complete local-only manifest for '+BUILD_ID+'. */\nself.MX_OFFLINE_CORE='+json.dumps(core,separators=(',',':'))+';\nself.MX_OFFLINE_MEDIA='+json.dumps(media,separators=(',',':'))+';\n').encode('utf-8')
    worker = files['sw.js'].decode('utf-8')
    worker = replace_once(worker,"const CACHE_NAME='moleculox-r392-ios-v8-7-238';", "const CACHE_NAME='moleculox-web-smooth1-v8-7-239';",'shell cache')
    worker = replace_once(worker,"const MEDIA_CACHE='moleculox-media-r392-ios';", "const MEDIA_CACHE='moleculox-media-web-smooth1-v8-7-239';",'media cache')
    worker = replace_once(worker,"if(req.method!=='GET'||url.origin!==self.location.origin)return;", "if(req.method!=='GET'||url.origin!==self.location.origin||!url.pathname.startsWith(new URL(self.registration.scope).pathname))return;",'local GET-only scope guard')
    worker = worker.replace('Moleculox v8.7.238 R392 ios production distribution.', 'Moleculox '+BUILD_ID+' web production distribution.')
    files['sw.js'] = files['sw-r160.js'] = worker.encode('utf-8')
    validate_index(files)
    # Hashes attest the output, including generated worker/manifest, without a self-hash cycle.
    info = {'buildId':BUILD_ID,'appVersion':APP_VERSION,'distribution':'web','sourcePayloadManifestSHA256':sha((root/'WEB-BUNDLE-SHA256.json').read_bytes()),'reviewedOverridesManifestSHA256':sha((root/'WEB-OVERRIDES-SHA256.json').read_bytes()),'files':{name:sha(data) for name,data in sorted(files.items())}}
    files['BUILD-INFO.json'] = (json.dumps(info,indent=2,ensure_ascii=False)+'\n').encode('utf-8')
    return files


def write_archive(files, destination):
    destination = destination.resolve()
    destination.parent.mkdir(parents=True,exist_ok=True)
    descriptor,temporary = tempfile.mkstemp(prefix=destination.stem+'-',suffix='.zip.tmp',dir=destination.parent)
    os.close(descriptor)
    try:
        with zipfile.ZipFile(temporary,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=6) as archive:
            for name,data in sorted(files.items()):
                item = zipfile.ZipInfo(name,date_time=(2026,11,18,0,0,0))
                item.compress_type = zipfile.ZIP_DEFLATED
                item.external_attr = 0o100644 << 16
                archive.writestr(item,data,compress_type=zipfile.ZIP_DEFLATED,compresslevel=6)
        with zipfile.ZipFile(temporary) as archive:
            if archive.testzip() is not None or set(archive.namelist()) != set(files):
                raise ValueError('ZIP integrity verification failed')
            for name,data in files.items():
                if archive.read(name) != data:
                    raise ValueError('ZIP content verification failed: '+name)
        os.replace(temporary,destination)
    finally:
        if os.path.exists(temporary):os.unlink(temporary)
    digest = sha(destination.read_bytes())
    destination.with_suffix(destination.suffix+'.sha256').write_text(digest+'  '+destination.name+'\n')
    return digest


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output',type=Path,default=Path('/workspace/artifacts/Moleculox-Itch-Smooth.zip'))
    args = parser.parse_args()
    files = export_files(ROOT)
    digest = write_archive(files,args.output)
    print(json.dumps({'zip':str(args.output.resolve()),'buildId':BUILD_ID,'files':len(files),'bytes':args.output.stat().st_size,'sha256':digest},indent=2))

if __name__=='__main__':main()
