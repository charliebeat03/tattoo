import { useEffect, useMemo, useState } from 'react';
import TatuajeCard from '../components/TatuajeCard';
import { getCategories, getPublicStudio, getTatuajes } from '../services/api';

const fallbackStudio = {
  studioName: 'AzojuanitoP41',
  slogan: 'Tatuajes con identidad, agenda directa y portafolio vivo.',
  aboutStudio:
    'AzojuanitoP41 es un estudio pensado para mostrar piezas reales, organizar el catalogo por estilos y convertir el interes del cliente en una cita clara por WhatsApp.',
  direccion: 'Direccion pendiente de confirmar por el estudio',
  instagramUrl: '',
  facebookUrl: '',
  whatsappNumber: '',
  mapUrl: '',
  developerName: 'Cuenta desarrollador',
  artists: [],
};

function Home() {
  const [tatuajes, setTatuajes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [studio, setStudio] = useState(fallbackStudio);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadHome = async () => {
      try {
        const [tattoos, studioData, categoryData] = await Promise.all([
          getTatuajes(),
          getPublicStudio(),
          getCategories(),
        ]);

        setTatuajes(tattoos);
        setStudio(studioData);
        setCategories(categoryData.filter((category) => category.activa));
      } catch (err) {
        setError(err.response?.data?.message || 'No se pudo cargar el catalogo.');
      } finally {
        setLoading(false);
      }
    };

    loadHome();
  }, []);

  const filteredTattoos = useMemo(() => {
    if (selectedCategory === 'all') {
      return tatuajes;
    }

    return tatuajes.filter((tatuaje) => tatuaje.category?.slug === selectedCategory);
  }, [selectedCategory, tatuajes]);

  const averagePrice = useMemo(() => {
    if (!filteredTattoos.length) {
      return 0;
    }

    const total = filteredTattoos.reduce(
      (sum, tatuaje) => sum + Number(tatuaje.precioFinal ?? tatuaje.precio),
      0
    );

    return total / filteredTattoos.length;
  }, [filteredTattoos]);

  const activeOffers = tatuajes.filter((tatuaje) => tatuaje.ofertaVigente).length;
  const visibleArtists = studio.artists || [];

  return (
    <section className="page page-home section-stack">
      <div className="hero" id="catalogo">
        <div className="hero-copy-block">
          <p className="eyebrow">Estudio residente</p>
          <h1>{studio.studioName}</h1>
          <p className="hero-copy">{studio.slogan}</p>
          <p className="hero-support">
            Catalogo clasificado por categoria, precios claros, promociones temporales y reserva directa
            por WhatsApp con el trabajo de {visibleArtists[0]?.nombre || 'Alfredo Abel Sanchez Hidalgo'}.
          </p>

          <div className="hero-tags">
            {categories.slice(0, 4).map((category) => (
              <span key={category.id} className="chip">
                {category.nombre}
              </span>
            ))}
          </div>
        </div>

        <aside className="hero-panel">
          <p className="hero-panel__label">Radar del estudio</p>
          <div className="hero-stats">
            <div className="hero-stat">
              <span>{tatuajes.length || '--'}</span>
              <p>Piezas publicadas</p>
            </div>
            <div className="hero-stat">
              <span>{averagePrice ? `$${averagePrice.toFixed(0)}` : '--'}</span>
              <p>Precio medio visible</p>
            </div>
            <div className="hero-stat">
              <span>{activeOffers || '--'}</span>
              <p>Promos activas</p>
            </div>
            <div className="hero-stat">
              <span>{categories.length || '--'}</span>
              <p>Categorias de catalogo</p>
            </div>
          </div>
        </aside>
      </div>

      {loading ? <p className="status-message">Cargando tatuajes...</p> : null}
      {error ? <p className="status-message error">{error}</p> : null}

      {!loading && !error ? (
        <>
          <section className="section-card">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Catalogo curado</p>
                <h2>Tatuajes por categoria</h2>
              </div>
              <p>
                Filtra por estilo para recorrer mejor un catalogo grande y localizar rapido las piezas que
                mas se parecen a la idea del cliente.
              </p>
            </div>

            <div className="category-filter-bar">
              <button
                type="button"
                className={`filter-chip ${selectedCategory === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('all')}
              >
                Todas
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  className={`filter-chip ${selectedCategory === category.slug ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(category.slug)}
                >
                  {category.nombre}
                </button>
              ))}
            </div>

            <div className="tattoo-grid">
              {filteredTattoos.length > 0 ? (
                filteredTattoos.map((tatuaje) => (
                  <TatuajeCard
                    key={tatuaje.id}
                    tatuaje={tatuaje}
                    whatsappNumber={studio.whatsappNumber}
                  />
                ))
              ) : (
                <p className="status-message">No hay tatuajes en esa categoria todavia.</p>
              )}
            </div>
          </section>

          <section className="section-card" id="sobre-nosotros">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Sobre nosotros</p>
                <h2>El estudio y su tatuador</h2>
              </div>
              <p>
                Esta seccion toma la informacion publica del estudio y de los admins marcados como
                tatuadores visibles, para que puedas cambiar el equipo sin rehacer el frontend.
              </p>
            </div>

            <div className="about-grid">
              <article className="about-card">
                <h3>{studio.studioName}</h3>
                <p>{studio.aboutStudio}</p>
                <ul className="info-list">
                  <li>
                    <strong>Direccion:</strong> {studio.direccion || 'Pendiente'}
                  </li>
                  <li>
                    <strong>Desarrollador:</strong> {studio.developerName || 'Cuenta desarrollador'}
                  </li>
                </ul>
              </article>

              <div className="artist-grid">
                {visibleArtists.length > 0 ? (
                  visibleArtists.map((artist) => (
                    <article key={artist.id} className="artist-card">
                      <p className="eyebrow">Tatuador</p>
                      <h3>{artist.nombre}</h3>
                      <p>{artist.publicBio || 'Perfil publico pendiente de completar.'}</p>
                      <ul className="info-list compact-list">
                        {artist.telefonoPublico ? (
                          <li>
                            <strong>Contacto:</strong> {artist.telefonoPublico}
                          </li>
                        ) : null}
                        {artist.direccionPublica ? (
                          <li>
                            <strong>Ubicacion:</strong> {artist.direccionPublica}
                          </li>
                        ) : null}
                      </ul>
                      <div className="inline-links">
                        {artist.instagramUrl ? (
                          <a href={artist.instagramUrl} target="_blank" rel="noreferrer">
                            Instagram
                          </a>
                        ) : null}
                        {artist.facebookUrl ? (
                          <a href={artist.facebookUrl} target="_blank" rel="noreferrer">
                            Facebook
                          </a>
                        ) : null}
                      </div>
                    </article>
                  ))
                ) : (
                  <article className="artist-card">
                    <p className="eyebrow">Perfil publico</p>
                    <h3>Alfredo Abel Sanchez Hidalgo</h3>
                    <p>El perfil publico del tatuador aparecera aqui cuando haya un admin visible con rol de tatuador.</p>
                  </article>
                )}
              </div>
            </div>
          </section>

          <section className="section-card" id="contacto">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Localizacion</p>
                <h2>Contacta y reserva</h2>
              </div>
              <p>
                Puedes dejar direccion, redes sociales y enlace de mapa desde el panel admin para que al
                cliente le resulte mas facil encontrar el estudio.
              </p>
            </div>

            <div className="contact-grid">
              <article className="contact-card">
                <h3>Datos del estudio</h3>
                <ul className="info-list">
                  <li>
                    <strong>Direccion:</strong> {studio.direccion || 'Pendiente'}
                  </li>
                  <li>
                    <strong>WhatsApp:</strong> {studio.whatsappNumber || 'Pendiente'}
                  </li>
                </ul>
                <div className="inline-links">
                  {studio.instagramUrl ? (
                    <a href={studio.instagramUrl} target="_blank" rel="noreferrer">
                      Instagram del estudio
                    </a>
                  ) : null}
                  {studio.facebookUrl ? (
                    <a href={studio.facebookUrl} target="_blank" rel="noreferrer">
                      Facebook del estudio
                    </a>
                  ) : null}
                  {studio.mapUrl ? (
                    <a href={studio.mapUrl} target="_blank" rel="noreferrer">
                      Ver mapa
                    </a>
                  ) : null}
                </div>
              </article>
            </div>
          </section>
        </>
      ) : null}
    </section>
  );
}

export default Home;
