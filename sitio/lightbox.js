// Lightbox mínimo para las capturas: abre la imagen sobre la página con <dialog>
(() => {
  const dlg = document.createElement('dialog');
  dlg.className = 'lightbox';
  dlg.innerHTML = '<button class="lb-close" aria-label="Cerrar">✕</button><img alt=""><p class="lb-cap"></p>';
  document.body.append(dlg);
  const img = dlg.querySelector('img'), cap = dlg.querySelector('.lb-cap');
  document.querySelectorAll('a[data-lightbox]').forEach(a => a.addEventListener('click', e => {
    e.preventDefault();
    img.src = a.href;
    img.alt = a.querySelector('img')?.alt || '';
    cap.innerHTML = a.closest('figure')?.querySelector('figcaption')?.innerHTML || '';
    dlg.showModal();
  }));
  dlg.addEventListener('click', () => dlg.close());   // cualquier clic cierra (también Esc, nativo)
})();
