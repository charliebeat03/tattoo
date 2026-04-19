import { useEffect } from 'react';
import LazyImage from './LazyImage';
import { resolveImageUrl } from '../services/api';

function GalleryLightbox({ open, title, images, activeIndex, onClose, onPrev, onNext, onSelect }) {
  useEffect(() => {
    if (!open) {
      return undefined;
    }

    document.body.classList.add('body-lightbox-open');

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }

      if (event.key === 'ArrowLeft') {
        onPrev();
      }

      if (event.key === 'ArrowRight') {
        onNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.classList.remove('body-lightbox-open');
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose, onNext, onPrev]);

  if (!open || !images.length) {
    return null;
  }

  const currentImage = images[activeIndex] || images[0];

  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-label={`Galeria de ${title}`}>
      <button type="button" className="lightbox__backdrop" onClick={onClose} aria-label="Cerrar galeria" />

      <div className="lightbox__panel">
        <div className="lightbox__toolbar">
          <div>
            <p className="eyebrow">Vista ampliada</p>
            <h2>{title}</h2>
          </div>

          <button type="button" className="lightbox__close" onClick={onClose} aria-label="Cerrar galeria">
            <span />
            <span />
          </button>
        </div>

        <div className="lightbox__viewer">
          <button type="button" className="lightbox__nav" onClick={onPrev} aria-label="Imagen anterior">
            ‹
          </button>

          <LazyImage
            src={resolveImageUrl(currentImage)}
            alt={`${title} ampliado`}
            className="lightbox__image"
            wrapperClassName="lightbox__image-shell"
            loading="eager"
          />

          <button type="button" className="lightbox__nav" onClick={onNext} aria-label="Siguiente imagen">
            ›
          </button>
        </div>

        <div className="lightbox__thumbs">
          {images.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              className={`lightbox__thumb ${activeIndex === index ? 'is-active' : ''}`}
              onClick={() => onSelect(index)}
            >
              <LazyImage
                src={resolveImageUrl(image)}
                alt={`${title} miniatura ${index + 1}`}
                className="lightbox__thumb-image"
                wrapperClassName="lightbox__thumb-shell"
                sizes="100px"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default GalleryLightbox;
