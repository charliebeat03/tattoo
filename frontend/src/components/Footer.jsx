import { DEFAULT_DEVELOPER_NAME } from '../utils/studioContent';

function Footer() {
  return (
    <footer className="site-footer" role="contentinfo">
      <div className="page site-footer__inner">
        <div className="site-footer__brand">
          <p className="eyebrow">Tattoo catalog</p>
          <strong>Portafolio profesional del estudio</strong>
        </div>

        <div className="site-footer__meta">
          <p>Copyright 2026. Todos los derechos reservados.</p>
          <p>Desarrollo web: {DEFAULT_DEVELOPER_NAME}</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
