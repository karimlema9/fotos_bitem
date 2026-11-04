'use strict';
const gallery = document.getElementById('gallery');
const sentinel = document.getElementById('sentinel');
const counter = document.getElementById('counter');
const lightbox = document.getElementById('lightbox');
const largeImage = document.getElementById('large-image');
const photoName = document.getElementById('photo-name');
const position = document.getElementById('position');
const downloadLarge = document.getElementById('download-large');
const hoverPreview = document.getElementById('hover-preview');
const hoverImage = document.getElementById('hover-image');
const PAGE_SIZE = 16;
const canHover = window.matchMedia('(hover: hover) and (pointer: fine)');
let photos = [], loaded = 0, active = 0;

function filenameFor(path) { return path.split('/').pop(); }
function labelFor(path) {
  try { return decodeURIComponent(filenameFor(path)).replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '); }
  catch { return filenameFor(path); }
}
function hidePreview() { hoverPreview.hidden = true; hoverImage.removeAttribute('src'); }
function positionPreview(x, y) {
  const gap = 22;
  const rect = hoverPreview.getBoundingClientRect();
  const width = rect.width || 430, height = rect.height || 490;
  let left = x + gap;
  if (left + width > window.innerWidth - 12) left = x - width - gap;
  left = Math.max(12, Math.min(left, window.innerWidth - width - 12));
  let top = y - height * 0.45;
  top = Math.max(12, Math.min(top, window.innerHeight - height - 12));
  hoverPreview.style.left = `${left}px`;
  hoverPreview.style.top = `${top}px`;
}
function showPreview(path, event) {
  if (!canHover.matches || lightbox.open) return;
  hoverImage.src = path;
  hoverPreview.hidden = false;
  positionPreview(event.clientX, event.clientY);
}
function showPhoto(index) {
  hidePreview();
  active = (index + photos.length) % photos.length;
  const path = photos[active];
  largeImage.src = path;
  largeImage.alt = labelFor(path);
  photoName.textContent = labelFor(path);
  position.textContent = `${active + 1} / ${photos.length}`;
  downloadLarge.href = path;
  downloadLarge.download = filenameFor(path);
  if (!lightbox.open) lightbox.showModal();
}
function loadMore() {
  if (loaded >= photos.length) return;
  const until = Math.min(loaded + PAGE_SIZE, photos.length);
  const fragment = document.createDocumentFragment();
  for (let i = loaded; i < until; i++) {
    const path = photos[i];
    const tile = document.createElement('article');
    tile.className = 'tile';
    const imageButton = document.createElement('button');
    imageButton.type = 'button';
    imageButton.className = 'tile-open';
    imageButton.setAttribute('aria-label', `Ver ${labelFor(path)} en grande`);
    const img = document.createElement('img');
    img.src = path;
    img.alt = labelFor(path);
    img.loading = 'lazy';
    img.decoding = 'async';
    imageButton.appendChild(img);
    imageButton.addEventListener('click', () => showPhoto(i));
    tile.addEventListener('pointerenter', event => showPreview(path, event));
    tile.addEventListener('pointermove', event => { if (!hoverPreview.hidden) positionPreview(event.clientX, event.clientY); });
    tile.addEventListener('pointerleave', hidePreview);
    const download = document.createElement('a');
    download.className = 'tile-download';
    download.href = path;
    download.download = filenameFor(path);
    download.setAttribute('aria-label', `Descargar ${labelFor(path)}`);
    download.textContent = '↓ Descargar';
    download.addEventListener('pointerenter', hidePreview);
    download.addEventListener('focus', hidePreview);
    tile.append(imageButton, download);
    fragment.appendChild(tile);
  }
  gallery.appendChild(fragment);
  loaded = until;
  counter.textContent = `${photos.length} ${photos.length === 1 ? 'foto' : 'fotos'}`;
  if (loaded >= photos.length) observer.disconnect();
}
const observer = new IntersectionObserver(entries => {
  if (entries.some(entry => entry.isIntersecting)) loadMore();
}, { rootMargin: '700px' });
document.getElementById('close').addEventListener('click', () => lightbox.close());
document.getElementById('prev').addEventListener('click', () => showPhoto(active - 1));
document.getElementById('next').addEventListener('click', () => showPhoto(active + 1));
lightbox.addEventListener('click', event => { if (event.target === lightbox) lightbox.close(); });
document.addEventListener('keydown', event => {
  if (!lightbox.open) return;
  if (event.key === 'ArrowLeft') showPhoto(active - 1);
  if (event.key === 'ArrowRight') showPhoto(active + 1);
});
let touchStart = 0;
lightbox.addEventListener('touchstart', event => { touchStart = event.changedTouches[0].screenX; }, { passive: true });
lightbox.addEventListener('touchend', event => {
  const distance = event.changedTouches[0].screenX - touchStart;
  if (Math.abs(distance) > 60) showPhoto(active + (distance < 0 ? 1 : -1));
}, { passive: true });
window.addEventListener('scroll', hidePreview, { passive: true });
window.addEventListener('resize', hidePreview);
canHover.addEventListener('change', hidePreview);
fetch(`fotos.json?v=2&t=${Date.now()}`, { cache: 'no-store' })
  .then(response => { if (!response.ok) throw Error('No se pudo leer fotos.json'); return response.json(); })
  .then(data => {
    if (!Array.isArray(data)) throw Error('fotos.json debe contener una lista');
    photos = data.filter(path => typeof path === 'string' && /^fotos\/[\w\-.%/ ]+$/i.test(path) && !path.includes('..'));
    if (!photos.length) {
      counter.textContent = '0 fotos';
      document.getElementById('empty').hidden = false;
      return;
    }
    loadMore();
    observer.observe(sentinel);
  })
  .catch(error => {
    counter.textContent = 'Error al cargar las fotos';
    document.getElementById('empty').hidden = false;
    console.error(error);
  });
