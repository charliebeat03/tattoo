import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import BotonWhatsApp from '../components/BotonWhatsApp';
import FavoriteButton from '../components/FavoriteButton';
import GalleryLightbox from '../components/GalleryLightbox';
import LazyImage from '../components/LazyImage';
import RevealSection from '../components/RevealSection';
import TatuajeCard from '../components/TatuajeCard';
import useFavoriteTattoos from '../hooks/useFavoriteTattoos';
import { getPublicStudio, getTatuaje, getTatuajes, resolveImageUrl } from '../services/api';

function DetalleTatuaje() {
  const { id } = useParams();
  const [tatuaje, setTatuaje] = useState(null);
  const [allTattoos, setAllTattoos] = useState([]);
  const [studio, setStudio] = useState({ whatsappNumber: '', studioName: 'AzojuanitoP41' });
  const [activeImage, setActiveImage] = useState('');
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isFavorite, toggleFavorite } = useFavoriteTattoos();

  useEffect(() => {
    const loadTatuaje = async () => {
      try {
        const [tattooData, studioData, tattooList] = await Promise.all([
          getTatuaje(id),
          getPublicStudio(),
          getTatuajes(),
        ]);
        setTatuaje(tattooData);
        setStudio(studioData);
        setAllTattoos(tattooList);
        setActiveImage(tattooData.fotoPrincipal);
      } catch (err) {
        setError(err.response?.data?.message || 'No se pudo cargar el tatuaje.');
      } finally {
        setLoading(false);
      }
    };

    loadTatuaje();
  }, [id]);

  const gallery = useMemo(() => {
    if (!tatuaje) {
      return [];
    }

    return [tatuaje.fotoPrincipal, ...(tatuaje.fotos || [])].filter(Boolean);
  }, [tatuaje]);

  const activeImageIndex = useMemo(
    () => gallery.findIndex((image) => image === activeImage),
    [activeImage, gallery]
  );

  const relatedTattoos = useMemo(() => {
    if (!tatuaje) {
      return [];
    }

    const sameCategory = allTattoos.filter(
      (item) => item.id !== tatuaje.id && item.category?.id && item.category?.id === tatuaje.category?.id
    );

    const fallback = allTattoos.filter((item) => item.id !== tatuaje.id);

    return (sameCategory.length ? sameCategory : fallback).slice(0, 4);
  }, [allTattoos, tatuaje]);

  const openLightboxAt = (index) => {
    setActiveImage(gallery[index] || gallery[0] || '');
    setIsLightboxOpen(true);
  };

  const selectLightboxImage = (index) => {
    setActiveImage(gallery[index] || gallery[0] || '');
  };

  const showPreviousLightboxImage = () => {
    if (!gallery.length) {
      return;
    }

    const currentIndex = activeImageIndex >= 0 ? activeImageIndex : 0;
    const nextIndex = (currentIndex - 1 + gallery.length) % gallery.length;
    setActiveImage(gallery[nextIndex]);
  };

  const showNextLightboxImage = () => {
    if (!gallery.length) {
      return;
    }

    const currentIndex = activeImageIndex >= 0 ? activeImageIndex : 0;
    const nextIndex = (currentIndex + 1) % gallery.length;
    setActiveImage(gallery[nextIndex]);
  };

  if (loading) {
    return <p className="status-message">Cargando detalle...</p>;
  }

  if (error) {
    return <p className="status-message error">{error}</p>;
  }

  if (!tatuaje) {
    return <p className="status-message">No se encontro el tatuaje.</p>;
  }

  return (
    <section className="page detail-page">
      <RevealSection as="div">
        <Link to="/" className="secondary-button back-link">
          Volver al catalogo
        </Link>
      </RevealSection>

      <RevealSection className="detail-layout" delay={50}>
        <div className="detail-gallery">
          <button
            type="button"
            className="detail-main-trigger"
            onClick={() => openLightboxAt(activeImageIndex >= 0 ? activeImageIndex : 0)}
            aria-label="Abrir galeria en pantalla completa"
          >
            <LazyImage
              src={resolveImageUrl(activeImage || tatuaje.fotoPrincipal)}
              alt={tatuaje.titulo}
              className="detail-main-image"
              wrapperClassName="detail-main-shell"
              loading="eager"
              sizes="(max-width: 860px) 100vw, 60vw"
            />
          </button>

          <div className="detail-thumbs">
            {gallery.map((image, index) => (
              <button
                key={`${image}-${index}`}
                type="button"
                className={`thumb-button ${activeImage === image ? 'active' : ''}`}
                onClick={() => setActiveImage(image)}
              >
                <LazyImage
                  src={resolveImageUrl(image)}
                  alt={`${tatuaje.titulo} ${index + 1}`}
                  className="thumb-image"
                  wrapperClassName="thumb-image-shell"
                  sizes="96px"
                />
              </button>
            ))}
          </div>
        </div>

        <div className="detail-info">
          <div className="detail-headline">
            <div>
              <p className="eyebrow">Ficha del tatuaje</p>
              <h1>{tatuaje.titulo}</h1>
            </div>
            <FavoriteButton active={isFavorite(tatuaje.id)} onClick={() => toggleFavorite(tatuaje.id)} />
          </div>

          <div className="detail-tags">
            {tatuaje.category?.nombre ? <span className="chip">{tatuaje.category.nombre}</span> : null}
            {tatuaje.ofertaVigente ? (
              <span className="chip chip--promo">{tatuaje.ofertaEtiqueta || 'Oferta especial'}</span>
            ) : null}
            <span className="chip chip--ghost">{gallery.length} fotos</span>
          </div>
          {tatuaje.ofertaVigente ? (
            <div className="detail-price-group">
              <span className="price-old">${Number(tatuaje.precio).toFixed(2)}</span>
              <p className="detail-price">${Number(tatuaje.precioFinal).toFixed(2)}</p>
            </div>
          ) : (
            <p className="detail-price">${Number(tatuaje.precioFinal ?? tatuaje.precio).toFixed(2)}</p>
          )}
          <p className="detail-description">{tatuaje.descripcion}</p>
          <p className="detail-helper">
            Reserva directa con {studio.studioName}. El mensaje ya incluye el titulo del tatuaje y el
            precio vigente.
          </p>
          <BotonWhatsApp
            titulo={tatuaje.titulo}
            precio={tatuaje.precioFinal ?? tatuaje.precio}
            whatsappNumber={studio.whatsappNumber}
          />
        </div>
      </RevealSection>

      {relatedTattoos.length ? (
        <RevealSection className="section-card" delay={120}>
          <div className="section-heading">
            <div>
              <p className="eyebrow">Relacionados</p>
              <h2>Mas piezas que pueden encajar con esta idea</h2>
            </div>
            <p>
              Si esta referencia te gustó, aquí tienes otras opciones cercanas por categoria o por estilo
              visual para seguir comparando sin volver atras.
            </p>
          </div>

          <div className="tattoo-grid tattoo-grid--related">
            {relatedTattoos.map((item, index) => (
              <RevealSection as="div" key={item.id} delay={150 + index * 25} className="card-reveal-wrap">
                <TatuajeCard
                  tatuaje={item}
                  whatsappNumber={studio.whatsappNumber}
                  isFavorite={isFavorite(item.id)}
                  onToggleFavorite={toggleFavorite}
                  compact
                />
              </RevealSection>
            ))}
          </div>
        </RevealSection>
      ) : null}

      <GalleryLightbox
        open={isLightboxOpen}
        title={tatuaje.titulo}
        images={gallery}
        activeIndex={activeImageIndex >= 0 ? activeImageIndex : 0}
        onClose={() => setIsLightboxOpen(false)}
        onPrev={showPreviousLightboxImage}
        onNext={showNextLightboxImage}
        onSelect={selectLightboxImage}
      />
    </section>
  );
}

export default DetalleTatuaje;
