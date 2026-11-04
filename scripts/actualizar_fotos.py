#!/usr/bin/env python3
"""Genera fotos.json con las imágenes de la carpeta fotos/ (incluidas subcarpetas)."""
from pathlib import Path
import json
from urllib.parse import quote

root = Path(__file__).resolve().parent.parent
folder = root / 'fotos'
extensions = {'.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif'}
files = sorted((p for p in folder.rglob('*') if p.is_file() and p.suffix.lower() in extensions), key=lambda p: p.name.lower())
paths = ['fotos/' + '/'.join(quote(part) for part in p.relative_to(folder).parts) for p in files]
(root / 'fotos.json').write_text(json.dumps(paths, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
print(f'Listado actualizado: {len(paths)} fotografías.')
