import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import CatalogSkeleton from '../components/CatalogSkeleton';
import RevealSection from '../components/RevealSection';
import TatuajeCard from '../components/TatuajeCard';
import useFavoriteTattoos from '../hooks/useFavoriteTattoos';
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

const normalizeText = (value) => String(value || '').toLowerCase().trim();

function Home() {
  const [tatuajes, setTatuajes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [studio, setStudio] = useState(fallbackStudio);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isFavorite, toggleFavorite, totalFavorites, favoriteSet } = useFavoriteTattoos();

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

  const visibleArtists = studio.artists || [];
  const activeOffersList = useMemo(
    () => tatuajes.filter((tatuaje) => tatuaje.ofertaVigente),
    [tatuajes]
  );

  const filteredTattoos = useMemo(() => {
    const search = normalizeText(searchTerm);

    return tatuajes.filter((tatuaje) => {
      const matchesCategory =
        selectedCategory === 'all' || tatuaje.category?.slug === selectedCategory;
      const matchesFavorites = !showFavoritesOnly || favoriteSet.has(tatuaje.id);
      const searchableText = normalizeText(
        [
          tatuaje.titulo,
          tatuaje.descripcion,
          tatuaje.category?.nombre,
          tatuaje.ofertaEtiqueta,
        ].join(' ')
      );
      const matchesSearch = !search || searchableText.includes(search);

      return matchesCategory && matchesFavorites && matchesSearch;
    });
  }, [favoriteSet, searchTerm, selectedCategory, showFavoritesOnly, tatuajes]);

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

  const themedCollections = useMemo(() => {
    const collections = [];

    if (activeOffersList.length) {
      collections.push({
        id: 'promos-activas',
        title: 'Promos activas',
        description: 'Piezas con rebaja vigente para cerrar cita rapido.',
        items: activeOffersList.slice(0, 4),
      });
    }

    const selectedByStudio = tatuajes
      .filter((tatuaje) => tatuaje.destacado || tatuaje.ofertaVigente)
      .slice(0, 4);

    if (selectedByStudio.length) {
      collections.push({
        id: 'seleccion-estudio',
        title: 'Seleccion del estudio',
        description: 'Una mezcla de piezas fuertes, precios claros y estilos que representan el catalogo.',
        items: selectedByStudio,
      });
    }

    categories
      .map((category) => ({
        id: `category-${category.id}`,
        title: category.nombre,
        description: category.descripcion || `Recorrido rapido por ${category.nombre}.`,
        items: tatuajes.filter((tatuaje) => tatuaje.category?.id === category.id).slice(0, 4),
      }))
      .filter((collection) => collection.items.length >= 2)
      .slice(0, 2)
      .forEach((collection) => collections.push(collection));

    const favoritesCollection = tatuajes.filter((tatuaje) => favoriteSet.has(tatuaje.id)).slice(0, 4);

    if (favoritesCollection.length) {
      collections.push({
        id: 'favoritos-guardados',
        title: 'Tus favoritos',
        description: 'Las piezas que marcaste para comparar o revisar con calma.',
        items: favoritesCollection,
      });
    }

    return collections.slice(0, 4);
  }, [activeOffersList, categories, favoriteSet, tatuajes]);

  const collectionCount = themedCollections.length;

  return (
    <section className="page page-home section-stack">
      <RevealSection as="div" className="hero hero--home" id="catalogo">
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
              <span>{activeOffersList.length || '--'}</span>
              <p>Promos activas</p>
            </div>
            <div className="hero-stat">
              <span>{collectionCount || '--'}</span>
              <p>Colecciones tematicas</p>
            </div>
          </div>
        </aside>
      </RevealSection>

      {loading ? <CatalogSkeleton count={8} /> : null}
      {error ? <p className="status-message error">{error}</p> : null}

      {!loading && !error ? (
        <>
          <RevealSection className="section-card section-card--accent" delay={60}>
            <div className="section-heading section-heading--tight">
              <div>
                <p className="eyebrow">Promociones</p>
                <h2>Ofertas activas listas para cerrar cita</h2>
              </div>
              <p>
                Si el estudio activa una rebaja, aqui se concentra la salida mas rapida para clientes que ya
                vienen buscando precio y disponibilidad.
              </p>
            </div>

            <div className="promo-hero-row">
              <div className="promo-hero-copy">
                <strong>{activeOffersList.length}</strong>
                <span>piezas con oferta vigente</span>
              </div>

              <div className="promo-hero-actions">
                <Link to="/promociones" className="primary-button">
                  Ver promociones activas
                </Link>
                <button
                  type="button"
                  className={`secondary-button ${showFavoritesOnly ? 'is-active' : ''}`}
                  onClick={() => setShowFavoritesOnly((current) => !current)}
                >
                  Favoritos guardados: {totalFavorites}
                </button>
              </div>
            </div>
          </RevealSection>

          <RevealSection className="section-card" delay={110}>
            <div className="section-heading">
              <div>
                <p className="eyebrow">Colecciones tematicas</p>
                <h2>Explora el catalogo por bloques curados</h2>
              </div>
              <p>
                Ordenamos el portafolio en conjuntos rapidos para que el visitante encuentre estilo,
                promociones y referencias sin perderse en una lista larga.
              </p>
            </div>

            <div className="collection-grid">
              {themedCollections.map((collection, index) => (
                <RevealSection
                  as="article"
                  key={collection.id}
                  className="collection-card"
                  delay={140 + index * 70}
                >
                  <div className="collection-card__head">
                    <div>
                      <p className="eyebrow">Coleccion</p>
                      <h3>{collection.title}</h3>
                    </div>
                    <span className="chip chip--ghost">{collection.items.length} piezas</span>
                  </div>
                  <p className="card-note">{collection.description}</p>

                  <div className="collection-card__items">
                    {collection.items.map((tatuaje) => (
                      <TatuajeCard
                        key={tatuaje.id}
                        tatuaje={tatuaje}
                        whatsappNumber={studio.whatsappNumber}
                        isFavorite={isFavorite(tatuaje.id)}
                        onToggleFavorite={toggleFavorite}
                        compact
                      />
                    ))}
                  </div>
                </RevealSection>
              ))}
            </div>
          </RevealSection>

          <RevealSection className="section-card section-card--catalog" delay={170}>
            <div className="section-heading">
              <div>
                <p className="eyebrow">Catalogo curado</p>
                <h2>Tatuajes por categoria</h2>
              </div>
              <p>
                Filtra por estilo, busca por palabras y revisa tus favoritos sin salir del mismo bloque del
                catalogo.
              </p>
            </div>

            <div className="catalog-sticky-tools">
              <div className="catalog-search">
                <label className="catalog-search__field">
                  <span className="catalog-search__icon" aria-hidden="true">
                    ⌕
                  </span>
                  <input
                    type="search"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Busca por titulo, estilo o palabra clave"
                  />
                </label>
                {searchTerm ? (
                  <button type="button" className="catalog-search__clear" onClick={() => setSearchTerm('')}>
                    Limpiar
                  </button>
                ) : null}
              </div>

              <div className="catalog-sticky-tools__row">
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

                <button
                  type="button"
                  className={`filter-chip filter-chip--favorite ${showFavoritesOnly ? 'active' : ''}`}
                  onClick={() => setShowFavoritesOnly((current) => !current)}
                >
                  Favoritos {totalFavorites ? `(${totalFavorites})` : ''}
                </button>
              </div>
            </div>

            <div className="catalog-results-bar">
              <p className="catalog-results-note">
                Mostrando <strong>{filteredTattoos.length}</strong> piezas de <strong>{tatuajes.length}</strong>.
              </p>
              <p className="catalog-results-note catalog-results-note--muted">
                {showFavoritesOnly
                  ? 'Modo favoritos activo.'
                  : 'Activa favoritos para guardar ideas antes de escribir al estudio.'}
              </p>
            </div>

            <div className="tattoo-grid">
              {filteredTattoos.length > 0 ? (
                filteredTattoos.map((tatuaje, index) => (
                  <RevealSection as="div" key={tatuaje.id} delay={180 + index * 20} className="card-reveal-wrap">
                    <TatuajeCard
                      tatuaje={tatuaje}
                      whatsappNumber={studio.whatsappNumber}
                      isFavorite={isFavorite(tatuaje.id)}
                      onToggleFavorite={toggleFavorite}
                    />
                  </RevealSection>
                ))
              ) : (
                <div className="empty-state">
                  <h3>No encontramos tatuajes con ese cruce de filtros</h3>
                  <p>
                    Prueba limpiando la busqueda o quitando el modo favoritos para volver a recorrer todo el catalogo.
                  </p>
                </div>
              )}
            </div>
          </RevealSection>

          <RevealSection className="section-card" id="sobre-nosotros" delay={210}>
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
                    <p>
                      El perfil publico del tatuador aparecera aqui cuando haya un admin visible con rol de tatuador.
                    </p>
                  </article>
                )}
              </div>
            </div>
          </RevealSection>

          <RevealSection className="section-card" id="contacto" delay={250}>
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
          </RevealSection>
        </>
      ) : null}
    </section>
  );
}

export default Home;
