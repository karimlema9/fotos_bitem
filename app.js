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
// Lupa estilo e-commerce: el recuadro marca la zona visible en el panel ampliado.
const ZOOM = 2.8;
let hoverTile = null;
let hoverSource = null;
const lens = document.createElement('div');
lens.className = 'zoom-lens';
lens.setAttribute('aria-hidden', 'true');

function hidePreview() {
  hoverPreview.hidden = true;
  hoverPreview.classList.remove('is-visible');
  hoverImage.removeAttribute('src');
  hoverImage.style.removeProperty('width');
  hoverImage.style.removeProperty('height');
  hoverImage.style.removeProperty('left');
  hoverImage.style.removeProperty('top');
  lens.remove();
  hoverTile = null;
  hoverSource = null;
}

function positionPreview(x, y, rect) {
  const gap = 20;
  const width = hoverPreview.offsetWidth || 430;
  const height = hoverPreview.offsetHeight || 490;
  // Priorizar la derecha de la fotografía; cambiar a la izquierda si no cabe.
  let left = rect.right + gap;
  if (left + width > window.innerWidth - 12) left = rect.left - width - gap;
  // Si la foto está centrada en una pantalla estrecha, elegir el lado con más espacio.
  if (left < 12) left = Math.max(12, Math.min(x + gap, window.innerWidth - width - 12));
  const top = Math.max(12, Math.min(rect.top, window.innerHeight - height - 12));
  hoverPreview.style.left = `${left}px`;
  hoverPreview.style.top = `${top}px`;
}

function updateZoom(event) {
  if (!hoverTile || !hoverSource || hoverPreview.hidden) return;
  const rect = hoverSource.getBoundingClientRect();
  if (!rect.width || !rect.height) return;

  const viewWidth = hoverPreview.clientWidth;
  const viewHeight = hoverPreview.clientHeight;
  // Se usa object-fit: cover para llenar el panel manteniendo proporciones.
  const naturalWidth = hoverSource.naturalWidth || rect.width;
  const naturalHeight = hoverSource.naturalHeight || rect.height;
  const scale = Math.max(viewWidth / naturalWidth, viewHeight / naturalHeight) * ZOOM;
  const displayedWidth = naturalWidth * scale;
  const displayedHeight = naturalHeight * scale;
  const regionWidth = Math.min(rect.width, rect.width * viewWidth / displayedWidth);
  const regionHeight = Math.min(rect.height, rect.height * viewHeight / displayedHeight);
  const x = Math.max(0, Math.min(event.clientX - rect.left, rect.width));
  const y = Math.max(0, Math.min(event.clientY - rect.top, rect.height));
  const lensX = Math.max(0, Math.min(x - regionWidth / 2, rect.width - regionWidth));
  const lensY = Math.max(0, Math.min(y - regionHeight / 2, rect.height - regionHeight));
  lens.style.width = `${regionWidth}px`;
  lens.style.height = `${regionHeight}px`;
  lens.style.left = `${lensX}px`;
  lens.style.top = `${lensY}px`;

  const fractionX = rect.width > regionWidth ? lensX / (rect.width - regionWidth) : 0.5;
  const fractionY = rect.height > regionHeight ? lensY / (rect.height - regionHeight) : 0.5;
  hoverImage.style.width = `${displayedWidth}px`;
  hoverImage.style.height = `${displayedHeight}px`;
  hoverImage.style.left = `${-fractionX * Math.max(0, displayedWidth - viewWidth)}px`;
  hoverImage.style.top = `${-fractionY * Math.max(0, displayedHeight - viewHeight)}px`;
}

function showPreview(path, event, tile, img) {
  if (!canHover.matches || lightbox.open || event.target.closest('.tile-download')) return;
  if (!img.complete || !img.naturalWidth) return;
  if (hoverTile !== tile) {
    hidePreview();
    hoverTile = tile;
    hoverSource = img;
    const button = img.parentElement;
    button.appendChild(lens);
    hoverImage.src = path;
    hoverPreview.hidden = false;
    hoverPreview.classList.add('is-visible');
  }
  positionPreview(event.clientX, event.clientY, img.getBoundingClientRect());
  updateZoom(event);
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
    tile.addEventListener('pointerenter', event => showPreview(path, event, tile, img));
    tile.addEventListener('pointermove', event => showPreview(path, event, tile, img));
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
