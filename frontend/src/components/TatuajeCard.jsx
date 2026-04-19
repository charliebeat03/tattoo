import { Link } from 'react-router-dom';
import BotonWhatsApp from './BotonWhatsApp';
import FavoriteButton from './FavoriteButton';
import LazyImage from './LazyImage';
import { resolveImageUrl } from '../services/api';

function TatuajeCard({ tatuaje, whatsappNumber, isFavorite = false, onToggleFavorite, compact = false }) {
  const galleryTotal = 1 + (tatuaje.fotos?.length || 0);
  const cardClassName = ['tattoo-card', compact ? 'tattoo-card--compact' : ''].filter(Boolean).join(' ');

  return (
    <article className={cardClassName}>
      <FavoriteButton
        active={isFavorite}
        onClick={() => onToggleFavorite?.(tatuaje.id)}
        compact={compact}
        className="tattoo-card__favorite"
      />

      <LazyImage
        src={resolveImageUrl(tatuaje.fotoPrincipal)}
        alt={tatuaje.titulo}
        className="tattoo-card__image"
        wrapperClassName="tattoo-card__media"
        sizes="(max-width: 640px) 46vw, (max-width: 1100px) 50vw, 33vw"
      />

      <div className="tattoo-card__content">
        <div className="tattoo-card__topline">
          {tatuaje.category?.nombre ? <span className="chip">{tatuaje.category.nombre}</span> : null}
          <span className="chip chip--ghost">Galeria {galleryTotal} fotos</span>
          {tatuaje.ofertaVigente ? (
            <span className="chip chip--promo">{tatuaje.ofertaEtiqueta || 'Oferta activa'}</span>
          ) : null}
        </div>

        <div className="tattoo-card__meta">
          <h3>{tatuaje.titulo}</h3>
          <div className="price-stack">
            {tatuaje.ofertaVigente ? <span className="price-old">${Number(tatuaje.precio).toFixed(2)}</span> : null}
            <span>${Number(tatuaje.precioFinal ?? tatuaje.precio).toFixed(2)}</span>
          </div>
        </div>

        <p>{tatuaje.descripcion}</p>

        <div className="tattoo-card__actions">
          <Link to={`/tatuajes/${tatuaje.id}`} className="secondary-button">
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
    </article>
  );
}

export default TatuajeCard;
