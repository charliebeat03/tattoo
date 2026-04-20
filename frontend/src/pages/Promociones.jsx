import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import CatalogSkeleton from '../components/CatalogSkeleton';
import RevealSection from '../components/RevealSection';
import TatuajeCard from '../components/TatuajeCard';
import useFavoriteTattoos from '../hooks/useFavoriteTattoos';
import { getPublicStudio, getTatuajes } from '../services/api';

function Promociones() {
  const [tatuajes, setTatuajes] = useState([]);
  const [studio, setStudio] = useState({ studioName: 'AzojuanitoP41', whatsappNumber: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isFavorite, toggleFavorite } = useFavoriteTattoos();

  useEffect(() => {
    const loadPromotions = async () => {
      try {
        const [tattooData, studioData] = await Promise.all([getTatuajes(), getPublicStudio()]);
        setTatuajes(tattooData);
        setStudio(studioData);
      } catch (err) {
        setError(err.response?.data?.message || 'No se pudieron cargar las promociones.');
      } finally {
        setLoading(false);
      }
    };

    loadPromotions();
  }, []);

  const promotions = useMemo(
    () => tatuajes.filter((tatuaje) => tatuaje.ofertaVigente),
    [tatuajes]
  );

  return (
    <section className="page section-stack">
      <RevealSection className="section-card section-card--accent">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Promociones activas</p>
            <h1>Ofertas visibles del estudio</h1>
          </div>
          <p>
            Este bloque agrupa las piezas que hoy tienen precio rebajado para que un cliente pueda llegar,
            comparar y reservar por WhatsApp en pocos toques.
          </p>
        </div>

        <div className="promo-hero-row">
          <div className="promo-hero-copy">
            <strong>{promotions.length || 0}</strong>
            <span>tatuajes con precio especial ahora mismo</span>
          </div>
          <Link to="/" className="secondary-button">
            Volver al catalogo completo
          </Link>
        </div>
      </RevealSection>

      {loading ? <CatalogSkeleton count={6} /> : null}
      {error ? <p className="status-message error">{error}</p> : null}

      {!loading && !error ? (
        <RevealSection className="section-card">
          {promotions.length > 0 ? (
            <div className="tattoo-grid">
              {promotions.map((tatuaje) => (
                <div key={tatuaje.id} className="card-reveal-wrap">
                  <TatuajeCard
                    tatuaje={tatuaje}
                    whatsappNumber={studio.whatsappNumber}
                    isFavorite={isFavorite(tatuaje.id)}
                    onToggleFavorite={toggleFavorite}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <h3>No hay promociones activas ahora mismo</h3>
              <p>
                Cuando el estudio active una oferta con fecha vigente, esta pagina se llenara automaticamente
                con las piezas rebajadas.
              </p>
            </div>
          )}
        </RevealSection>
      ) : null}
    </section>
  );
}

export default Promociones;
