# Galería de fotos — GitHub Pages

Versión 2. Diseño oscuro con detalles azules, carga progresiva, vista flotante de gran tamaño al pasar el ratón por una fotografía, descarga individual y visor opcional a pantalla completa al hacer clic. En móviles se puede tocar la foto para ampliarla.

## Actualizar la web existente

En el repositorio `karimlema9/fotos_bitem`, reemplaza los archivos `index.html`, `styles.css` y `app.js` por los del ZIP. El archivo `fotos.json` de este ZIP ya contiene las cuatro rutas facilitadas. **No borres las fotos que ya tienes en `fotos/`**: el ZIP no incluye las fotos reales.

## Añadir fotografías

Sube las fotos a la carpeta `fotos/` y actualiza `fotos.json` con la ruta de cada una, o ejecuta `python scripts/actualizar_fotos.py` desde la carpeta del proyecto y sube el resultado. Puedes editar el listado en GitHub sin usar Python.

## Caché

Los enlaces a CSS y JS llevan `?v=2` para ayudar a que se vea la versión nueva. El listado se solicita sin caché para detectar cambios. Si el navegador sigue mostrando una versión anterior, usa Ctrl+F5.

## Publicar

En GitHub: Settings > Pages > Deploy from a branch > main > /(root). La URL del proyecto es `https://karimlema9.github.io/fotos_bitem/`.

**Privacidad:** GitHub Pages público no restringe quién puede ver las fotos.
