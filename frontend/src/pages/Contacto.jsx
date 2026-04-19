import { useEffect, useState } from 'react';
import RevealSection from '../components/RevealSection';
import { getPublicStudio } from '../services/api';

const fallbackStudio = {
  studioName: 'AzojuanitoP41',
  direccion: 'Direccion pendiente de confirmar por el estudio',
  instagramUrl: '',
  facebookUrl: '',
  whatsappNumber: '',
  mapUrl: '',
};

function Contacto() {
  const [studio, setStudio] = useState(fallbackStudio);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadStudio = async () => {
      try {
        const data = await getPublicStudio();
        setStudio(data);
      } catch (err) {
        setError(err.response?.data?.message || 'No se pudo cargar la informacion de contacto.');
      } finally {
        setLoading(false);
      }
    };

    loadStudio();
  }, []);

  if (loading) {
    return <p className="status-message">Cargando contacto...</p>;
  }

  if (error) {
    return <p className="status-message error">{error}</p>;
  }

  return (
    <section className="page section-stack">
      <RevealSection className="section-card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Contacto</p>
            <h1>Reserva y ubicacion</h1>
          </div>
          <p>Deja aqui los enlaces y datos del estudio para que al cliente le resulte facil encontrarte.</p>
        </div>

        <div className="contact-grid">
          <article className="contact-card">
            <h3>{studio.studioName}</h3>
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
    </section>
  );
}

export default Contacto;
