const buildWhatsAppLink = (titulo, precio, whatsappNumber = process.env.WHATSAPP_NUMBER || '') => {
  const numero = String(whatsappNumber || '').replace(/\D/g, '');
  const mensaje = `Hola, quiero agendar una cita para el tatuaje \"${titulo}\" con precio de $${Number(precio).toFixed(2)}.`;

  if (!numero) {
    return '';
  }

  return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
};

module.exports = {
  buildWhatsAppLink,
};
