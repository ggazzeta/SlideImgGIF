"""Read-only Studio profile inventory; prints action/structure, never settings or personal identities."""
import os,json
from pathlib import Path
def main():
    root=Path(os.environ['APPDATA'])/'Ulanzi/UlanziDeck'
    state=json.loads((root/'Config/setting_source.json').read_text(encoding='utf-8-sig'))
    found=[]
    for device in state.get('Devices',[]):
        for store in ['ProfilesV2','ProfilesV1']:
            location=root/store
            if not location.is_dir():continue
            for group in location.iterdir():
                if not group.is_dir() or group.is_symlink():continue
                try:
                    profile=json.loads((group/'manifest.json').read_text(encoding='utf-8-sig'))
                    if profile.get('Name')!=device.get('CurrentProfile') or profile.get('Device',{}).get('UUID')!=device.get('CurrentDevice') or profile.get('Device',{}).get('Model')!='D200':continue
                    page=profile.get('Pages',{}).get('Current')
                    if not isinstance(page,str) or Path(page).name!=page or '/' in page or '\\' in page:continue
                    document=json.loads((group/'Profiles'/page/'manifest.json').read_text(encoding='utf-8-sig'))
                    slots=[c.get('Actions',{}).get('3_2') for c in document.get('Controllers',[]) if c.get('Type')=='Keypad' and '3_2' in c.get('Actions',{})]
                    found.append({'store':store,'slots':len(slots),'actions':[slot.get('Action','') for slot in slots],'cloneEligible':len(slots)==1 and slots[0].get('Action')=='com.ulanzi.ulanzideck.smallwindow.window'})
                except (OSError,ValueError):continue
    print(json.dumps({'readOnly':True,'matchingActiveD200Profiles':found}))
if __name__=='__main__':main()
