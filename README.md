# Galería de fotos para GitHub Pages

Web estática con mosaico adaptable, zoom al pasar el ratón, visor ampliado, navegación y carga progresiva de 16 imágenes por bloque.

## Añadir fotos

1. Copia las imágenes a `fotos/` (puedes crear subcarpetas).
2. Ejecuta `python scripts/actualizar_fotos.py` desde la carpeta del proyecto. En Windows también puedes usar `py scripts/actualizar_fotos.py`.
3. Sube los cambios a GitHub, **incluido `fotos.json`**.

No hace falta cambiar HTML ni JavaScript. Si no puedes ejecutar Python, puedes editar `fotos.json` manualmente:

```json
["fotos/foto1.jpg", "fotos/foto2.webp"]
```

## Publicar en GitHub Pages

1. Crea un repositorio nuevo en GitHub (por ejemplo, `fotos-amigos`).
2. Sube **el contenido** de esta carpeta a la raíz del repositorio: `index.html`, `styles.css`, `app.js`, `fotos.json`, `fotos/` y `scripts/`.
3. En el repositorio, abre **Settings → Pages**.
4. En **Build and deployment**, elige **Deploy from a branch**, rama `main`, carpeta `/(root)` y guarda.
5. La dirección será normalmente `https://TU-USUARIO.github.io/fotos-amigos/`. El despliegue puede tardar unos minutos.

## Importante sobre privacidad

GitHub Pages **no ofrece protección por contraseña** para este sitio. Las fotos serán accesibles a cualquiera que tenga la URL y, en un repositorio público, también desde el repositorio. No subas fotos privadas o sensibles si no quieres que puedan difundirse.

## Personalizar

Edita los textos de `index.html`, y los colores y diseño de `styles.css`. La web no necesita Node, npm ni dependencias de compilación. Las fuentes se descargan de Google Fonts si hay conexión.

## Probar en tu ordenador

Desde la carpeta del proyecto ejecuta `python -m http.server 8000` y abre `http://localhost:8000`. No abras directamente `index.html` como archivo porque algunos navegadores bloquean la lectura local de `fotos.json`.
