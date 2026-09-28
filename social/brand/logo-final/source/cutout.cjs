// Cut the truck out of its black square: flood-fill from the edges through
// near-black pixels only, so the black grille and tyres inside the white
// outline stay put. Upscale 4x with high-quality smoothing on the way.
const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  const src = 'data:image/jpeg;base64,' + fs.readFileSync(process.argv[2]).toString('base64');
  const out = await p.evaluate(async (src) => {
    const img = new Image(); img.src = src; await img.decode();
    const S = 4, W = img.width * S, H = img.height * S;
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const x = c.getContext('2d'); x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high';
    x.drawImage(img, 0, 0, W, H);
    const d = x.getImageData(0, 0, W, H), a = d.data, seen = new Uint8Array(W * H);
    const dark = i => a[i * 4] + a[i * 4 + 1] + a[i * 4 + 2] < 3 * 46;
    const st = [];
    for (let i = 0; i < W; i++) { st.push(i, (H - 1) * W + i); }
    for (let j = 0; j < H; j++) { st.push(j * W, j * W + W - 1); }
    while (st.length) {
      const i = st.pop(); if (seen[i] || !dark(i)) continue; seen[i] = 1;
      const px = i % W, py = (i / W) | 0;
      if (px > 0) st.push(i - 1); if (px < W - 1) st.push(i + 1); if (py > 0) st.push(i - W); if (py < H - 1) st.push(i + W);
    }
    // soften the cut: pixels next to removed ones fade by how dark they are
    for (let i = 0; i < W * H; i++) {
      if (seen[i]) { a[i * 4 + 3] = 0; continue; }
      const px = i % W, py = (i / W) | 0;
      const near = (px > 0 && seen[i - 1]) || (px < W - 1 && seen[i + 1]) || (py > 0 && seen[i - W]) || (py < H - 1 && seen[i + W]);
      if (near) { const l = (a[i * 4] + a[i * 4 + 1] + a[i * 4 + 2]) / 3; a[i * 4 + 3] = Math.min(255, Math.max(0, (l - 30) * 3)); }
    }
    x.putImageData(d, 0, 0);
    // trim to content
    let x0 = W, y0 = H, x1 = 0, y1 = 0;
    for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) if (a[(j * W + i) * 4 + 3] > 10) { if (i < x0) x0 = i; if (i > x1) x1 = i; if (j < y0) y0 = j; if (j > y1) y1 = j; }
    const t = document.createElement('canvas'); t.width = x1 - x0 + 1; t.height = y1 - y0 + 1;
    t.getContext('2d').drawImage(c, -x0, -y0);
    return t.toDataURL('image/png');
  }, src);
  fs.writeFileSync(process.argv[3], Buffer.from(out.split(',')[1], 'base64'));
  await b.close();
})();
