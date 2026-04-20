import { memo } from 'react';
import { Link } from 'react-router-dom';
import BotonWhatsApp from './BotonWhatsApp';
import FavoriteButton from './FavoriteButton';
import LazyImage from './LazyImage';
import { resolveImageUrl } from '../services/api';

function TatuajeCard({ tatuaje, whatsappNumber, isFavorite = false, onToggleFavorite, compact = false }) {
  const galleryTotal = 1 + (tatuaje.fotos?.length || 0);
  const cardClassName = ['tattoo-card', compact ? 'tattoo-card--compact' : ''].filter(Boolean).join(' ');
  const detailHref = `/tatuajes/${tatuaje.id}`;
  const finalPrice = Number(tatuaje.precioFinal ?? tatuaje.precio).toFixed(2);
  const basePrice = Number(tatuaje.precio).toFixed(2);

  return (
    <article className={cardClassName}>
      <div className="tattoo-card__media-wrap">
        <FavoriteButton
          active={isFavorite}
          onClick={() => onToggleFavorite?.(tatuaje.id)}
          compact={compact}
          className="tattoo-card__favorite"
        />

        <Link to={detailHref} className="tattoo-card__media-link" aria-label={`Ver detalle de ${tatuaje.titulo}`}>
          <LazyImage
            src={resolveImageUrl(tatuaje.fotoPrincipal)}
            alt={tatuaje.titulo}
            className="tattoo-card__image"
            wrapperClassName="tattoo-card__media"
            sizes="(max-width: 640px) 46vw, (max-width: 1100px) 50vw, 33vw"
            fallbackLabel="Imagen del tatuaje"
          />

          <div className="tattoo-card__media-overlay">
            <div className="tattoo-card__topline">
              {tatuaje.category?.nombre ? <span className="chip">{tatuaje.category.nombre}</span> : null}
              <span className="chip chip--ghost">{galleryTotal} fotos</span>
              {tatuaje.ofertaVigente ? (
                <span className="chip chip--promo">{tatuaje.ofertaEtiqueta || 'Oferta activa'}</span>
              ) : null}
            </div>
          </div>
        </Link>
      </div>

      <div className="tattoo-card__content">
        <div className="tattoo-card__meta">
          <div className="tattoo-card__headline">
            <h3>
              <Link to={detailHref} className="tattoo-card__title-link">
                {tatuaje.titulo}
              </Link>
            </h3>
            <p className="tattoo-card__summary">{tatuaje.descripcion}</p>
          </div>

          <div className="price-stack">
            {tatuaje.ofertaVigente ? <span className="price-old">${basePrice}</span> : null}
            <span className="price-current">${finalPrice}</span>
          </div>
        </div>

        <div className="tattoo-card__footer">
          <div className="tattoo-card__actions">
            <Link to={detailHref} className="secondary-button">
              {compact ? 'Abrir' : 'Ver detalle'}
            </Link>
            <BotonWhatsApp
              titulo={tatuaje.titulo}
              precio={tatuaje.precioFinal ?? tatuaje.precio}
              whatsappNumber={whatsappNumber}
              label={compact ? 'WhatsApp' : 'Reservar'}
            />
          </div>
        </div>
      </div>
    </article>
  );
}

export default memo(TatuajeCard);
