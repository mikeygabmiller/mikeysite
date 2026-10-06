import sys,os
from PIL import Image,ImageChops
a,b=sys.argv[1:3]; bad=0
for f in sorted(os.listdir(a)):
    x=Image.open(f'{a}/{f}').convert('RGB'); y=Image.open(f'{b}/{f}').convert('RGB')
    if x.size!=y.size: print('SIZE',f,x.size,y.size); bad+=1; continue
    d=ImageChops.difference(x,y).getbbox()
    if d: print('DIFF',f,d); bad+=1
print(len(os.listdir(a)),'compared,',bad,'differ')
