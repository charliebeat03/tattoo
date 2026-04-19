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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
    setIsMenuOpen(false);
    setIsNavbarVisible(true);
  }, [location.pathname]);

  useEffect(() => {
    if (isMenuOpen) {
      setIsNavbarVisible(true);
      document.body.classList.add('body-nav-open');
    } else {
      document.body.classList.remove('body-nav-open');
    }

    return () => {
      document.body.classList.remove('body-nav-open');
    };
  }, [isMenuOpen]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 640) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    let ticking = false;

    const updateNavbar = () => {
      if (isMenuOpen) {
        setIsNavbarVisible(true);
        ticking = false;
        return;
      }

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
  }, [isMenuOpen]);

  const navbarClasses = [
    'navbar',
    isNavbarVisible ? '' : 'navbar--hidden',
    isNavbarCompact ? 'navbar--compact' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const closeMenu = () => setIsMenuOpen(false);

  const navLinks = (
    <>
      <div className="nav-links__header">
        <p className="eyebrow">Navegacion</p>
        <button type="button" className="nav-close" onClick={closeMenu} aria-label="Cerrar menu">
          <span />
          <span />
        </button>
      </div>
      <NavLink to="/" onClick={closeMenu}>
        Catalogo
      </NavLink>
      <NavLink to="/sobre-nosotros" onClick={closeMenu}>
        Sobre nosotros
      </NavLink>
      <NavLink to="/contacto" onClick={closeMenu}>
        Contacto
      </NavLink>
      <NavLink to="/admin" onClick={closeMenu}>
        Acceso admin
      </NavLink>
    </>
  );

  return (
    <header className={navbarClasses}>
      <div className="brand-block">
        <p className="eyebrow">Estudio de tatuajes</p>
        <NavLink to="/" className="brand">
          {studio.studioName}
        </NavLink>
        <p className="brand-note">{studio.slogan}</p>
      </div>

      <button
        type="button"
        className={`nav-toggle ${isMenuOpen ? 'nav-toggle--active' : ''}`}
        onClick={() => setIsMenuOpen((current) => !current)}
        aria-label={isMenuOpen ? 'Cerrar menu' : 'Abrir menu'}
        aria-expanded={isMenuOpen}
      >
        <span />
        <span />
        <span />
      </button>

      <div className={`nav-drawer ${isMenuOpen ? 'nav-drawer--open' : ''}`}>
        <button
          type="button"
          className="nav-drawer__backdrop"
          onClick={closeMenu}
          aria-label="Cerrar menu"
          tabIndex={isMenuOpen ? 0 : -1}
        />
        <nav className="nav-links">{navLinks}</nav>
      </div>
    </header>
  );
}

export default Navbar;
