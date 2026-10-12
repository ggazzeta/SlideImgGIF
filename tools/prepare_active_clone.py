"""Prepare only a local private clone candidate from read-only saved-profile snapshots.

Not an official Studio export: a manual export remains the recommended rollback authority.
Never imports, installs or modifies any saved profile. Never prints private bindings.
"""
import contextlib,io,json,os,zipfile,hashlib
from pathlib import Path
import profile_tool as tool
ROOT=Path(__file__).resolve().parent.parent
def main():
    base=Path(os.environ['APPDATA'])/'Ulanzi/UlanziDeck'
    state=json.loads((base/'Config/setting_source.json').read_text(encoding='utf-8-sig'));found={}
    for device in state.get('Devices',[]):
        store=base/'ProfilesV2'
        if not store.is_dir():continue
        for group in store.iterdir():
            if not group.is_dir() or group.is_symlink():continue
            try:
                profile=json.loads((group/'manifest.json').read_text(encoding='utf-8-sig'))
                if profile.get('Name')!=device.get('CurrentProfile') or profile.get('Device',{}).get('UUID')!=device.get('CurrentDevice') or profile.get('Device',{}).get('Model')!='D200':continue
                page=profile.get('Pages',{}).get('Current')
                if not isinstance(page,str) or Path(page).name!=page or '/' in page or '\\' in page:continue
                doc=json.loads((group/'Profiles'/page/'manifest.json').read_text(encoding='utf-8-sig'))
                candidates=[c['Actions']['3_2'] for c in doc.get('Controllers',[]) if c.get('Type')=='Keypad' and '3_2' in c.get('Actions',{})]
                if len(candidates)==1 and candidates[0].get('Action')==tool.BUILTIN_ACTION:found[str(group.resolve())]=(group,page)
            except (OSError,ValueError):continue
    if len(found)!=1:raise RuntimeError('No unique active D200 built-in-slot clone candidate; require an explicit original export')
    group,page=next(iter(found.values()));destination=ROOT/'.local-profile-preparation'
    destination.mkdir(exist_ok=True)
    source=destination/'original-saved-snapshot.ulanziDeckProfile';clone=destination/'ImageSlideGIF-clone.ulanziDeckProfile'
    if source.exists() or clone.exists():raise RuntimeError('Existing prepared snapshots preserved; inspect them instead of overwriting')
    bodies={}
    for path in sorted(group.rglob('*')):
        if path.is_symlink():raise RuntimeError('Refusing a linked saved-profile member')
        if path.is_file():
            if not path.resolve().is_relative_to(group.resolve()):raise RuntimeError('Unsafe saved-profile path')
            bodies[path.relative_to(group).as_posix()]=path.read_bytes()
    if sum(map(len,bodies.values()))>128*1024*1024:raise RuntimeError('Profile snapshot exceeds local preparation budget')
    for name,body in bodies.items():
        if (group/name).read_bytes()!=body:raise RuntimeError('Saved profile changed during read-only snapshot; retry later')
    stream=io.BytesIO()
    with zipfile.ZipFile(stream,'w',zipfile.ZIP_DEFLATED) as archive:
        for name,body in bodies.items():archive.writestr(group.name+'.ulanziProfile/'+name,body)
    source.write_bytes(tool.HEADER+stream.getvalue())
    try:
        with contextlib.redirect_stdout(io.StringIO()):tool.patch(source,clone,page,clone_name='ImageSlide GIF')
    except tool.ProfileError:
        (destination/'REVIEW.md').write_text('''# Clone preparation refused — no import or installed change

The current saved-profile snapshot contains a profile reference that cannot be
resolved within this package. The clone tool refused instead of changing that
reference or loosening its integrity check. The untouched byte-preserved snapshot
remains here for local inspection, but it is not an official Studio export.

Export the original D200 profile through Studio with its referenced pages/profile
dependencies intact, then inspect that export before preparing a fresh independent
clone. Keep the original export as rollback authority. Do not import this snapshot.
No clone, installed profile/button modification or device delivery occurred.
These personal files are excluded from Git and release/source archives.
''',encoding='utf-8')
        print(json.dumps({'prepared':False,'imported':False,'reason':'unresolved external profile reference; original Studio export required','review':'.local-profile-preparation/REVIEW.md'}));return
    checksums=''.join(hashlib.sha256(path.read_bytes()).hexdigest()+'  '+path.name+'\n' for path in [source,clone,Path(str(clone)+'.receipt.json')])
    (destination/'SHA256SUMS.txt').write_text(checksums,encoding='utf-8')
    (destination/'REVIEW.md').write_text('''# Local clone candidate — not installed/imported

The source is a byte-preserved read-only saved-profile snapshot, not an official
Studio export. Export the original profile through Studio before any import;
that original export is the recommended rollback authority. The candidate's
source/root/member bytes were checked for changes during preparation. The clone
tool regenerated independent package/page/action IDs, preserved device identity
and unrelated semantics, and replaced only the built-in 3_2 action in the clone
with the fork slideshow using SmallViewMode:2. Original installed profiles and
buttons are untouched. Review the local receipt's semantic diff and identity map.

These files contain personal profiles. They are ignored by Git and excluded from
all release/source archives. No import, installed-profile modification or device
delivery is approved merely by preparing this candidate. Prefer regenerating the
clone from the official untouched export before requesting import approval.
''',encoding='utf-8')
    print(json.dumps({'prepared':True,'imported':False,'source':'read-only saved-file snapshot; official Studio export still recommended','review':'.local-profile-preparation/REVIEW.md','members':len(bodies),'bytes':sum(map(len,bodies.values()))}))
if __name__=='__main__':main()
