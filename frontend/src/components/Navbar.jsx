import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { getPublicStudio } from '../services/api';

const fallbackStudio = {
  studioName: 'AzojuanitoP41',
  slogan: 'Catalogo vivo, contacto directo y gestion profesional del estudio.',
};

function Navbar() {
  const [studio, setStudio] = useState(fallbackStudio);

  useEffect(() => {
    const loadStudio = async () => {
      try {
        const data = await getPublicStudio();
        setStudio(data);
      } catch (_error) {
        setStudio(fallbackStudio);
      }
    };

    loadStudio();
  }, []);

  return (
    <header className="navbar">
      <div className="brand-block">
        <p className="eyebrow">Estudio de tatuajes</p>
        <NavLink to="/" className="brand">
          {studio.studioName}
        </NavLink>
        <p className="brand-note">{studio.slogan}</p>
      </div>

      <nav className="nav-links">
        <NavLink to="/">Catalogo</NavLink>
        <NavLink to="/sobre-nosotros">Sobre nosotros</NavLink>
        <NavLink to="/contacto">Contacto</NavLink>
        <NavLink to="/admin">Acceso admin</NavLink>
      </nav>
    </header>
  );
}

export default Navbar;
