#!/usr/bin/env python3
"""Genera miniaturas/, medianas/ y fotos.json a partir de la carpeta fotos/ (incluidas subcarpetas).

Requiere Pillow:  pip install pillow
Solo procesa las fotos nuevas o modificadas, así que volver a ejecutarlo es rápido.
"""
from pathlib import Path
import json
from urllib.parse import quote

try:
    from PIL import Image, ImageOps
except ImportError:
    raise SystemExit('Falta Pillow. Instálalo con: pip install pillow')

root = Path(__file__).resolve().parent.parent
folder = root / 'fotos'
thumbs_dir = root / 'miniaturas'   # ~600 px de ancho, para la cuadrícula
medium_dir = root / 'medianas'     # ~1800 px, para la lupa y la vista ampliada
extensions = {'.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif'}
THUMB_W, THUMB_Q = 600, 78
MEDIUM_W, MEDIUM_Q = 1800, 82

files = sorted((p for p in folder.rglob('*') if p.is_file() and p.suffix.lower() in extensions),
               key=lambda p: p.name.lower())


def url(prefix, relative):
    return prefix + '/' + '/'.join(quote(part) for part in relative.parts)


def build(source, target, max_side, quality):
    """Crea una versión redimensionada en WebP si no existe o está desactualizada."""
    if target.exists() and target.stat().st_mtime >= source.stat().st_mtime:
        return
    target.parent.mkdir(parents=True, exist_ok=True)
    with Image.open(source) as im:
        im = ImageOps.exif_transpose(im)
        if im.mode not in ('RGB', 'RGBA'):
            im = im.convert('RGB')
        im.thumbnail((max_side, max_side * 4), Image.LANCZOS)  # limita el ancho
        im.save(target, 'WEBP', quality=quality, method=4)


entries = []
for n, p in enumerate(files, 1):
    rel = p.relative_to(folder)
    webp = rel.with_suffix('.webp')
    entry = {'src': url('fotos', rel)}
    try:
        build(p, thumbs_dir / webp, THUMB_W, THUMB_Q)
        build(p, medium_dir / webp, MEDIUM_W, MEDIUM_Q)
        with Image.open(thumbs_dir / webp) as t:
            entry.update(thumb=url('miniaturas', webp), medium=url('medianas', webp),
                         w=t.width, h=t.height)
    except Exception as error:  # imagen no soportada: se usa el original
        print(f'  aviso: {rel} sin miniatura ({error})')
    entries.append(entry)
    if n % 20 == 0:
        print(f'  {n}/{len(files)}…')

(root / 'fotos.json').write_text(json.dumps(entries, indent=1, ensure_ascii=False) + '\n', encoding='utf-8')
print(f'Listado actualizado: {len(entries)} fotografías.')
