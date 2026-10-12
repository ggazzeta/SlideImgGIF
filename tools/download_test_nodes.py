"""Download official Windows Node runtimes to a workspace-only test cache, verifying SHA-256."""
import hashlib,json,urllib.request,zipfile
from pathlib import Path
ROOT=Path(__file__).resolve().parent.parent
CACHE=ROOT/'.test-runtimes'
def fetch(url):
    with urllib.request.urlopen(url,timeout=60) as response:return response.read()
def main():
    releases=json.loads(fetch('https://nodejs.org/dist/index.json'))
    current=next(r['version'] for r in releases if r['version'].startswith('v24.') and r.get('lts'))
    for version in ['v20.12.2',current]:
        name=f'node-{version}-win-x64.zip';base=f'https://nodejs.org/dist/{version}/'
        checks=fetch(base+'SHASUMS256.txt').decode();expected=next(line.split()[0] for line in checks.splitlines() if line.split()[-1]==name)
        target=CACHE/name;CACHE.mkdir(exist_ok=True)
        if not target.exists():target.write_bytes(fetch(base+name))
        if hashlib.sha256(target.read_bytes()).hexdigest()!=expected:raise RuntimeError('Official runtime checksum mismatch')
        folder=CACHE/f'node-{version}-win-x64'
        if not folder.exists():
            with zipfile.ZipFile(target) as archive:
                for item in archive.infolist():
                    if not (CACHE/(item.filename)).resolve().is_relative_to(CACHE.resolve()):raise RuntimeError('Unsafe runtime archive')
                archive.extractall(CACHE)
        print(version+' '+expected)
    (ROOT/'docs/TEST_RUNTIMES.json').write_text(json.dumps({'baseline':'v20.12.2','currentLTS':current},indent=2)+'\n',encoding='utf-8')
if __name__=='__main__':main()
