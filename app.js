const gallery = document.getElementById('gallery');
const sentinel = document.getElementById('sentinel');
const counter = document.getElementById('counter');
const lightbox = document.getElementById('lightbox');
const largeImage = document.getElementById('large-image');
const photoName = document.getElementById('photo-name');
const position = document.getElementById('position');
const PAGE_SIZE = 16;
let photos = [], loaded = 0, active = 0;

function labelFor(path) { return decodeURIComponent(path.split('/').pop()).replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '); }
function showPhoto(index) {
  active = (index + photos.length) % photos.length;
  largeImage.src = photos[active];
  largeImage.alt = labelFor(photos[active]);
  photoName.textContent = labelFor(photos[active]);
  position.textContent = `${active + 1} / ${photos.length}`;
  if (!lightbox.open) lightbox.showModal();
}
function loadMore() {
  if (loaded >= photos.length) return;
  const until = Math.min(loaded + PAGE_SIZE, photos.length);
  const fragment = document.createDocumentFragment();
  for (let i = loaded; i < until; i++) {
    const tile = document.createElement('button');
    tile.className = 'tile'; tile.type = 'button'; tile.setAttribute('aria-label', `Abrir ${labelFor(photos[i])}`);
    tile.style.padding = '0'; tile.style.border = '0'; tile.style.width = '100%';
    const img = document.createElement('img'); img.src = photos[i]; img.alt = labelFor(photos[i]); img.loading = 'lazy'; img.decoding = 'async';
    tile.appendChild(img); tile.addEventListener('click', () => showPhoto(i)); fragment.appendChild(tile);
  }
  gallery.appendChild(fragment); loaded = until;
  counter.textContent = `${photos.length} FOTOGRAFÍAS · MOSTRANDO ${loaded}`;
  if (loaded >= photos.length) { document.getElementById('end-note').hidden = false; observer.disconnect(); }
}
const observer = new IntersectionObserver(entries => { if (entries[0].isIntersecting) loadMore(); }, { rootMargin: '700px' });
document.getElementById('close').addEventListener('click', () => lightbox.close());
document.getElementById('prev').addEventListener('click', () => showPhoto(active - 1));
document.getElementById('next').addEventListener('click', () => showPhoto(active + 1));
lightbox.addEventListener('click', e => { if (e.target === lightbox) lightbox.close(); });
document.addEventListener('keydown', e => { if (!lightbox.open) return; if (e.key === 'ArrowLeft') showPhoto(active - 1); if (e.key === 'ArrowRight') showPhoto(active + 1); });
let touchStart = 0;
lightbox.addEventListener('touchstart', e => { touchStart = e.changedTouches[0].screenX; }, {passive:true});
lightbox.addEventListener('touchend', e => { const d = e.changedTouches[0].screenX - touchStart; if (Math.abs(d) > 60) showPhoto(active + (d < 0 ? 1 : -1)); }, {passive:true});
fetch('fotos.json').then(r => { if (!r.ok) throw Error('No se pudo leer fotos.json'); return r.json(); }).then(data => {
  photos = data.filter(p => typeof p === 'string' && p.startsWith('fotos/') && !p.includes('..'));
  if (!photos.length) { counter.textContent = '0 FOTOGRAFÍAS'; document.getElementById('empty').hidden = false; return; }
  loadMore(); observer.observe(sentinel);
}).catch(err => { counter.textContent = 'No se pudo cargar la galería'; document.getElementById('empty').hidden = false; console.error(err); });
