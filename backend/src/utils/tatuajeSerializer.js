const { buildWhatsAppLink } = require('./whatsappHelper');

const isOfferActive = (tatuaje) => {
  if (!tatuaje.ofertaActiva || !tatuaje.precioOferta) {
    return false;
  }

  const now = new Date();
  const startsOk = !tatuaje.ofertaInicio || new Date(tatuaje.ofertaInicio) <= now;
  const endsOk = !tatuaje.ofertaFin || new Date(tatuaje.ofertaFin) >= now;

  return startsOk && endsOk;
};

const serializeCategory = (category) => {
  if (!category) {
    return null;
  }

  return {
    id: category.id,
    nombre: category.nombre,
    slug: category.slug,
    descripcion: category.descripcion,
  };
};

const serializeTatuaje = (tatuaje, options = {}) => {
  const precioBase = Number(tatuaje.precio);
  const ofertaVigente = isOfferActive(tatuaje);
  const precioFinal = ofertaVigente ? Number(tatuaje.precioOferta) : precioBase;
  const whatsappNumber = options.whatsappNumber || tatuaje.whatsappNumber;

  return {
    id: tatuaje.id,
    titulo: tatuaje.titulo,
    descripcion: tatuaje.descripcion,
    precio: precioBase,
    precioOferta: tatuaje.precioOferta ? Number(tatuaje.precioOferta) : null,
    precioFinal,
    ofertaActiva: tatuaje.ofertaActiva,
    ofertaVigente,
    ofertaEtiqueta: tatuaje.ofertaEtiqueta,
    ofertaInicio: tatuaje.ofertaInicio,
    ofertaFin: tatuaje.ofertaFin,
    fotoPrincipal: tatuaje.fotoPrincipal,
    fotos: tatuaje.fotos || [],
    categoryId: tatuaje.categoryId || tatuaje.category?.id || null,
    category: serializeCategory(tatuaje.category),
    whatsappUrl: buildWhatsAppLink(tatuaje.titulo, precioFinal, whatsappNumber),
    createdAt: tatuaje.createdAt,
    updatedAt: tatuaje.updatedAt,
  };
};

module.exports = {
  serializeTatuaje,
  isOfferActive,
};
