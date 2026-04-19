import { useEffect, useState } from 'react';
import RevealSection from '../components/RevealSection';
import { getPublicStudio } from '../services/api';

const fallbackStudio = {
  studioName: 'AzojuanitoP41',
  slogan: 'Tatuajes con identidad, agenda directa y portafolio vivo.',
  aboutStudio:
    'AzojuanitoP41 es un estudio pensado para mostrar piezas reales, organizar el catalogo por estilos y convertir el interes del cliente en una cita clara por WhatsApp.',
  direccion: 'Direccion pendiente de confirmar por el estudio',
  developerName: 'Cuenta desarrollador',
  artists: [],
};

function SobreNosotros() {
  const [studio, setStudio] = useState(fallbackStudio);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadStudio = async () => {
      try {
        const data = await getPublicStudio();
        setStudio(data);
      } catch (err) {
        setError(err.response?.data?.message || 'No se pudo cargar la informacion del estudio.');
      } finally {
        setLoading(false);
      }
    };

    loadStudio();
  }, []);

  const visibleArtists = studio.artists || [];

  if (loading) {
    return <p className="status-message">Cargando informacion del estudio...</p>;
  }

  if (error) {
    return <p className="status-message error">{error}</p>;
  }

  return (
    <section className="page section-stack">
      <RevealSection className="section-card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Sobre nosotros</p>
            <h1>{studio.studioName}</h1>
          </div>
          <p>{studio.slogan}</p>
        </div>

        <div className="about-grid">
          <article className="about-card">
            <h3>El estudio</h3>
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
                <p className="eyebrow">Tatuador</p>
                <h3>Alfredo Abel Sanchez Hidalgo</h3>
                <p>El perfil publico del tatuador aparecera aqui cuando haya un admin visible con perfil de tatuador.</p>
              </article>
            )}
          </div>
        </div>
      </RevealSection>
    </section>
  );
}

export default SobreNosotros;
