"""Build data/staging/claude-zh/labels-zh.json from Claude's bare-title glossary (titles-zh.json).

Hierarchy prefixes such as "Chapitre Ier bis :" are rendered mechanically so numbering stays consistent.
"""
import json, re
from pathlib import Path
WORK=Path(__file__).resolve().parent.parent/'data/staging/claude-zh'
LEVELS={'Livre':'卷','Titre':'编','Sous-titre':'分编','Chapitre':'章','Section':'节','Sous-section':'分节','Paragraphe':'目','Sous-paragraphe':'分目'}
ROMAN={'I':1,'V':5,'X':10,'L':50}
SUFFIX={'bis':'之一','ter':'之二','quater':'之三','quinquies':'之四'}
HEAD=re.compile(r'^(Livre|Titre|Sous-titre|Chapitre|Section|Sous-section|Paragraphe|Sous-paragraphe) ([IVXL]+(?:er)?|\d+(?:er)?|préliminaire|unique)((?: (?:bis|ter|quater|quinquies))?)(?: : (.*))?$')
def cn(n):
 digits='零一二三四五六七八九'
 if n<10:return digits[n]
 return (digits[n//10] if n>=20 else '')+'十'+(digits[n%10] if n%10 else '')
def number(token):
 if token in ('préliminaire','unique'):return token
 token=token.removesuffix('er')
 if token.isdigit():return int(token)
 total=0
 for i,ch in enumerate(token):
  v=ROMAN[ch];total+=-v if i+1<len(token) and ROMAN[token[i+1]]>v else v
 return total
def split(label):
 m=HEAD.match(label)
 if not m:return None,label
 level,token,suffix,rest=m.groups();n=number(token)
 head={'préliminaire':'序'+LEVELS[level],'unique':'单一'+LEVELS[level]}.get(n) or f'第{cn(n)}{LEVELS[level]}'
 return head+SUFFIX.get(suffix.strip(),''),rest
def main():
 labels=json.loads((WORK/'labels-fr.json').read_text())
 titles=json.loads((WORK/'titles-zh.json').read_text()) if (WORK/'titles-zh.json').exists() else {}
 needed=[];out=[]
 for label in labels:
  head,rest=split(label);key=(rest or '').rstrip('.')
  if rest is not None and key not in titles and key not in needed:needed.append(key)
  out.append(None if rest is not None and key not in titles else (head+'　'+titles[key] if head and rest else head or titles[key]))
 (WORK/'titles-needed.json').write_text(json.dumps(needed,ensure_ascii=False,indent=0)+'\n')
 if needed:print(f'{len(needed)} bare titles still needed (titles-needed.json).');return
 (WORK/'labels-zh.json').write_text(json.dumps(out,ensure_ascii=False,indent=0)+'\n');print(f'{len(out)} labels written.')
if __name__=='__main__':main()
