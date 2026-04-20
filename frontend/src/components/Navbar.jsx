import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { getPublicStudio } from '../services/api';

const fallbackStudio = {
  studioName: 'AzojuanitoP41',
  slogan: 'Catalogo vivo, contacto directo y gestion profesional del estudio.',
};

const NAV_ITEMS = [
  { to: '/', label: 'Catalogo' },
  { to: '/promociones', label: 'Promociones' },
  { to: '/sobre-nosotros', label: 'Sobre nosotros' },
  { to: '/contacto', label: 'Contacto' },
  { to: '/admin', label: 'Acceso admin' },
];

const TOP_VISIBILITY_THRESHOLD = 12;
const COMPACT_THRESHOLD = 24;
const FLOATING_TRIGGER_THRESHOLD = 120;

function Navbar() {
  const location = useLocation();
  const [studio, setStudio] = useState(fallbackStudio);
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  const [isNavbarCompact, setIsNavbarCompact] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isFloatingVisible, setIsFloatingVisible] = useState(false);
  const [isFloatingMenuOpen, setIsFloatingMenuOpen] = useState(false);
  const floatingMenuRef = useRef(null);
  const rafRef = useRef(0);
  const scrollStateRef = useRef({
    visible: true,
    compact: false,
    floatingVisible: false,
  });

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
    setIsDrawerOpen(false);
    setIsFloatingMenuOpen(false);
    setIsNavbarVisible(true);
    setIsNavbarCompact(false);
    setIsFloatingVisible(false);
    scrollStateRef.current = {
      visible: true,
      compact: false,
      floatingVisible: false,
    };
  }, [location.pathname]);

  useEffect(() => {
    if (isDrawerOpen) {
      document.body.classList.add('body-nav-open');
    } else {
      document.body.classList.remove('body-nav-open');
    }

    return () => {
      document.body.classList.remove('body-nav-open');
    };
  }, [isDrawerOpen]);

  useEffect(() => {
    if (isNavbarVisible && isFloatingMenuOpen) {
      setIsFloatingMenuOpen(false);
    }
  }, [isFloatingMenuOpen, isNavbarVisible]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 640) {
        setIsDrawerOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    const syncScrollState = () => {
      const currentScrollY = window.scrollY || 0;
      const nextVisible = currentScrollY <= TOP_VISIBILITY_THRESHOLD || isDrawerOpen;
      const nextCompact = currentScrollY > COMPACT_THRESHOLD;
      const nextFloatingVisible = !isDrawerOpen && !nextVisible && currentScrollY > FLOATING_TRIGGER_THRESHOLD;
      const previousState = scrollStateRef.current;

      if (previousState.visible !== nextVisible) {
        setIsNavbarVisible(nextVisible);
      }

      if (previousState.compact !== nextCompact) {
        setIsNavbarCompact(nextCompact);
      }

      if (previousState.floatingVisible !== nextFloatingVisible) {
        setIsFloatingVisible(nextFloatingVisible);
      }

      scrollStateRef.current = {
        visible: nextVisible,
        compact: nextCompact,
        floatingVisible: nextFloatingVisible,
      };

      rafRef.current = 0;
    };

    const handleScroll = () => {
      if (!rafRef.current) {
        rafRef.current = window.requestAnimationFrame(syncScrollState);
      }
    };

    syncScrollState();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      if (rafRef.current) {
        window.cancelAnimationFrame(rafRef.current);
      }

      window.removeEventListener('scroll', handleScroll);
    };
  }, [isDrawerOpen]);

  useEffect(() => {
    if (!isFloatingMenuOpen) {
      return undefined;
    }

    const handlePointerDown = (event) => {
      if (!floatingMenuRef.current?.contains(event.target)) {
        setIsFloatingMenuOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsFloatingMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown, { passive: true });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFloatingMenuOpen]);

  const closeDrawer = () => setIsDrawerOpen(false);
  const closeFloatingMenu = () => setIsFloatingMenuOpen(false);
  const closeAllMenus = () => {
    closeDrawer();
    closeFloatingMenu();
  };

  const renderNavItems = (handleClose) =>
    NAV_ITEMS.map((item) => (
      <NavLink
        key={item.to}
        to={item.to}
        onClick={handleClose}
        className={({ isActive }) => (isActive ? 'active' : undefined)}
      >
        {item.label}
      </NavLink>
    ));

  const navbarClasses = ['navbar', isNavbarVisible ? '' : 'navbar--hidden', isNavbarCompact ? 'navbar--compact' : '']
    .filter(Boolean)
    .join(' ');

  const floatingShellClasses = [
    'nav-floating-shell',
    isFloatingVisible ? 'nav-floating-shell--visible' : '',
    isFloatingMenuOpen ? 'nav-floating-shell--open' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <>
      <header className={navbarClasses}>
        <div className="brand-block">
          <p className="eyebrow">Estudio de tatuajes</p>
          <NavLink to="/" className="brand">
            {studio.studioName}
          </NavLink>
          <p className="brand-note">{studio.slogan}</p>
        </div>

        <nav className="nav-links nav-links--desktop">{renderNavItems(closeAllMenus)}</nav>

        <button
          type="button"
          className={`nav-toggle ${isDrawerOpen ? 'nav-toggle--active' : ''}`}
          onClick={() => setIsDrawerOpen((current) => !current)}
          aria-label={isDrawerOpen ? 'Cerrar menu' : 'Abrir menu'}
          aria-expanded={isDrawerOpen}
        >
          <span />
          <span />
          <span />
        </button>

        <div className={`nav-drawer ${isDrawerOpen ? 'nav-drawer--open' : ''}`}>
          <button
            type="button"
            className="nav-drawer__backdrop"
            onClick={closeDrawer}
            aria-label="Cerrar menu"
            tabIndex={isDrawerOpen ? 0 : -1}
          />

          <nav className="nav-links nav-links--drawer">
            <div className="nav-links__header">
              <div>
                <p className="eyebrow">Navegacion</p>
                <p className="nav-links__copy">Explora el catalogo, promociones y datos del estudio sin perder el contexto.</p>
              </div>
              <button type="button" className="nav-close" onClick={closeDrawer} aria-label="Cerrar menu">
                <span />
                <span />
              </button>
            </div>
            {renderNavItems(closeDrawer)}
          </nav>
        </div>
      </header>

      <div className={floatingShellClasses} ref={floatingMenuRef}>
        <button
          type="button"
          className={`nav-floating ${isFloatingMenuOpen ? 'nav-floating--active' : ''}`}
          onClick={() => setIsFloatingMenuOpen((current) => !current)}
          aria-label={isFloatingMenuOpen ? 'Cerrar menu flotante' : 'Abrir menu flotante'}
          aria-expanded={isFloatingMenuOpen}
        >
          <span className="nav-floating__icon" />
          <span className="nav-floating__label">Menu</span>
        </button>

        <div className={`nav-floating-panel ${isFloatingMenuOpen ? 'nav-floating-panel--open' : ''}`}>
          <div className="nav-floating-panel__header">
            <div>
              <p className="eyebrow">Acceso rapido</p>
              <strong>{studio.studioName}</strong>
            </div>
            <button type="button" className="nav-close" onClick={closeFloatingMenu} aria-label="Cerrar menu flotante">
              <span />
              <span />
            </button>
          </div>

          <nav className="nav-floating-links">{renderNavItems(closeFloatingMenu)}</nav>
        </div>
      </div>
    </>
  );
}

export default Navbar;
