#!/usr/bin/env python3
"""Minimal PNG crop: pngcrop.py in.png out.png y0 y1 [scale]  (y in source px)."""
import sys, zlib, struct

def read_png(p):
    d = open(p, 'rb').read()
    assert d[:8] == b'\x89PNG\r\n\x1a\n'
    i = 8; idat = b''; w = h = bd = ct = None
    while i < len(d):
        ln, typ = struct.unpack('>I4s', d[i:i+8])
        body = d[i+8:i+8+ln]
        if typ == b'IHDR':
            w, h, bd, ct = struct.unpack('>IIBB', body[:10])
        elif typ == b'IDAT':
            idat += body
        i += 12 + ln
    raw = zlib.decompress(idat)
    ch = {0:1, 2:3, 4:2, 6:4}[ct]
    assert bd == 8
    stride = w * ch
    out = bytearray(); prev = bytearray(stride)
    pos = 0
    for _ in range(h):
        f = raw[pos]; pos += 1
        line = bytearray(raw[pos:pos+stride]); pos += stride
        if f == 1:
            for x in range(ch, stride): line[x] = (line[x] + line[x-ch]) & 255
        elif f == 2:
            for x in range(stride): line[x] = (line[x] + prev[x]) & 255
        elif f == 3:
            for x in range(stride):
                a = line[x-ch] if x >= ch else 0
                line[x] = (line[x] + ((a + prev[x]) >> 1)) & 255
        elif f == 4:
            for x in range(stride):
                a = line[x-ch] if x >= ch else 0
                b = prev[x]; c = prev[x-ch] if x >= ch else 0
                pp = a + b - c
                pa, pb, pc = abs(pp-a), abs(pp-b), abs(pp-c)
                pr = a if (pa <= pb and pa <= pc) else (b if pb <= pc else c)
                line[x] = (line[x] + pr) & 255
        out += line; prev = line
    return w, h, ch, bytes(out)

def write_png(p, w, h, ch, data):
    ct = {1:0, 2:4, 3:2, 4:6}[ch]
    raw = bytearray()
    stride = w * ch
    for y in range(h):
        raw.append(0)
        raw += data[y*stride:(y+1)*stride]
    def chunk(t, b):
        c = struct.pack('>I', len(b)) + t + b
        return c + struct.pack('>I', zlib.crc32(t + b) & 0xffffffff)
    out = b'\x89PNG\r\n\x1a\n'
    out += chunk(b'IHDR', struct.pack('>IIBBBBB', w, h, 8, ct, 0, 0, 0))
    out += chunk(b'IDAT', zlib.compress(bytes(raw), 6))
    out += chunk(b'IEND', b'')
    open(p, 'wb').write(out)

if __name__ == '__main__':
    src, dst, y0, y1 = sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4])
    w, h, ch, data = read_png(src)
    y0 = max(0, y0); y1 = min(h, y1)
    stride = w * ch
    write_png(dst, w, y1 - y0, ch, data[y0*stride:y1*stride])
    print(f'{src} {w}x{h} -> {dst} {w}x{y1-y0}')
