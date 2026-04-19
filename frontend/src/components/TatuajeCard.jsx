import { Link } from 'react-router-dom';
import BotonWhatsApp from './BotonWhatsApp';
import { resolveImageUrl } from '../services/api';

function TatuajeCard({ tatuaje, whatsappNumber }) {
  const galleryTotal = 1 + (tatuaje.fotos?.length || 0);

  return (
    <article className="tattoo-card">
      <img
        src={resolveImageUrl(tatuaje.fotoPrincipal)}
        alt={tatuaje.titulo}
        className="tattoo-card__image"
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
            Ver detalle
          </Link>
          <BotonWhatsApp
            titulo={tatuaje.titulo}
            precio={tatuaje.precioFinal ?? tatuaje.precio}
            whatsappNumber={whatsappNumber}
          />
        </div>
      </div>
    </article>
  );
}

export default TatuajeCard;
