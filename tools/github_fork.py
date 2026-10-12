"""Use the existing Git credential helper; never persist or print its secret."""
import json, subprocess, urllib.request, urllib.error, sys
from pathlib import Path

def main():
    credential=subprocess.run(['git','credential','fill'],input='protocol=https\nhost=github.com\nusername=ggazzeta\n\n',text=True,capture_output=True,check=True)
    fields=dict(line.split('=',1) for line in credential.stdout.splitlines() if '=' in line)
    token=fields.get('password')
    if not token: raise RuntimeError('GitHub credential unavailable')
    def api(path,body=None):
        request=urllib.request.Request('https://api.github.com'+path,data=json.dumps(body).encode() if body is not None else None,headers={'Authorization':'Bearer '+token,'Accept':'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','User-Agent':'SlideImgGIF-local-build','Content-Type':'application/json'})
        try:
            with urllib.request.urlopen(request,timeout=30) as response:return json.load(response)
        except urllib.error.HTTPError as error:raise RuntimeError('GitHub API status '+str(error.code)) from None
    account=api('/user')
    if account['login'].lower()!='ggazzeta':raise RuntimeError('Authenticated account is not ggazzeta')
    existing=[]
    for page in range(1,11):
        repos=api(f'/users/ggazzeta/repos?per_page=100&page={page}')
        for repo in repos:
            if repo.get('fork'):
                details=api('/repos/'+repo['full_name'])
                if details.get('parent',{}).get('full_name','').lower()=='arkamax404-max/slideimgplugin':existing.append(details)
            elif repo['name'].lower()=='slideimggif':raise RuntimeError('SlideImgGIF name occupied by a non-fork; preserve it')
        if len(repos)<100:break
    if len(existing)>1:raise RuntimeError('Multiple existing upstream forks; inspect before selecting')
    if existing:
        repo=existing[0];result={'operation':'preserved-existing','url':repo['html_url'],'clone_url':repo['clone_url'],'branch':repo['default_branch']}
    else:
        repo=api('/repos/arkamax404-max/SlideImgPlugin/forks',{'name':'SlideImgGIF','default_branch_only':False})
        result={'operation':'created','url':repo['html_url'],'clone_url':repo['clone_url'],'branch':repo['default_branch']}
    root=Path(__file__).resolve().parent.parent
    (root/'docs/FORK_REMOTE.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8')
    print(json.dumps(result))

if __name__=='__main__':
    try: main()
    except Exception as error: print(str(error),file=sys.stderr);sys.exit(1)
