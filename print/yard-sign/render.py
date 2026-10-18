import sys, pathlib
from playwright.sync_api import sync_playwright
src = pathlib.Path(sys.argv[1]).resolve()
out = sys.argv[2]
with sync_playwright() as p:
    b = p.chromium.launch(executable_path="/opt/pw-browsers/chromium-1194/chrome-linux/chrome")
    pg = b.new_page(viewport={"width":2304,"height":1728}, device_scale_factor=1)
    pg.goto(src.as_uri()); pg.wait_for_timeout(1200)
    pg.pdf(path=out+".pdf", width="24in", height="18in", print_background=True, margin={"top":"0","bottom":"0","left":"0","right":"0"}, prefer_css_page_size=True)
    # 150 dpi preview: 24in*150 = 3600 px  -> scale 3600/2304 = 1.5625
    pg2 = b.new_page(viewport={"width":2304,"height":1728}, device_scale_factor=1.5625)
    pg2.goto(src.as_uri()); pg2.wait_for_timeout(1200)
    pg2.screenshot(path=out+".png", clip={"x":0,"y":0,"width":2304,"height":1728})
    b.close()
print("done")
