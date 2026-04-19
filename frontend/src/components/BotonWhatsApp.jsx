import { buildWhatsAppHref } from '../services/api';

function BotonWhatsApp({ titulo, precio, whatsappNumber, label = 'Pedir cita por WhatsApp' }) {
  const href = buildWhatsAppHref(titulo, precio, whatsappNumber);

  return (
    <a
      className="whatsapp-button"
      href={href || '#'}
      target="_blank"
      rel="noreferrer"
      aria-disabled={!href}
    >
      {label}
    </a>
  );
}

export default BotonWhatsApp;
