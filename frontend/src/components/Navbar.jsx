import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { getPublicStudio } from '../services/api';

const fallbackStudio = {
  studioName: 'AzojuanitoP41',
  slogan: 'Catalogo vivo, contacto directo y gestion profesional del estudio.',
};

function Navbar() {
  const location = useLocation();
  const [studio, setStudio] = useState(fallbackStudio);
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  const [isNavbarCompact, setIsNavbarCompact] = useState(false);
  const lastScrollYRef = useRef(0);

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

  useEffect(() => {
    setIsNavbarVisible(true);
  }, [location.pathname]);

  useEffect(() => {
    let ticking = false;

    const updateNavbar = () => {
      const currentScrollY = window.scrollY || 0;
      const previousScrollY = lastScrollYRef.current;
      const scrollDelta = currentScrollY - previousScrollY;

      setIsNavbarCompact(currentScrollY > 24);

      if (currentScrollY <= 24) {
        setIsNavbarVisible(true);
      } else if (scrollDelta < -6) {
        setIsNavbarVisible(true);
      } else if (scrollDelta > 6 && currentScrollY > 110) {
        setIsNavbarVisible(false);
      }

      lastScrollYRef.current = currentScrollY;
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateNavbar);
        ticking = true;
      }
    };

    lastScrollYRef.current = window.scrollY || 0;
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const navbarClasses = [
    'navbar',
    isNavbarVisible ? '' : 'navbar--hidden',
    isNavbarCompact ? 'navbar--compact' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <header className={navbarClasses}>
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
