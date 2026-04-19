import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import BotonWhatsApp from '../components/BotonWhatsApp';
import { getPublicStudio, getTatuaje, resolveImageUrl } from '../services/api';

function DetalleTatuaje() {
  const { id } = useParams();
  const [tatuaje, setTatuaje] = useState(null);
  const [studio, setStudio] = useState({ whatsappNumber: '', studioName: 'AzojuanitoP41' });
  const [activeImage, setActiveImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadTatuaje = async () => {
      try {
        const [tattooData, studioData] = await Promise.all([getTatuaje(id), getPublicStudio()]);
        setTatuaje(tattooData);
        setStudio(studioData);
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
      <Link to="/" className="secondary-button back-link">
        Volver al catalogo
      </Link>

      <div className="detail-layout">
        <div className="detail-gallery">
          <img
            src={resolveImageUrl(activeImage || tatuaje.fotoPrincipal)}
            alt={tatuaje.titulo}
            className="detail-main-image"
          />

          <div className="detail-thumbs">
            {gallery.map((image, index) => (
              <button
                key={`${image}-${index}`}
                type="button"
                className={`thumb-button ${activeImage === image ? 'active' : ''}`}
                onClick={() => setActiveImage(image)}
              >
                <img src={resolveImageUrl(image)} alt={`${tatuaje.titulo} ${index + 1}`} />
              </button>
            ))}
          </div>
        </div>

        <div className="detail-info">
          <p className="eyebrow">Ficha del tatuaje</p>
          <h1>{tatuaje.titulo}</h1>
          <div className="detail-tags">
            {tatuaje.category?.nombre ? <span className="chip">{tatuaje.category.nombre}</span> : null}
            {tatuaje.ofertaVigente ? (
              <span className="chip chip--promo">{tatuaje.ofertaEtiqueta || 'Oferta especial'}</span>
            ) : null}
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
      </div>
    </section>
  );
}

export default DetalleTatuaje;
