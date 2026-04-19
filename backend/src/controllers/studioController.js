const AdminUser = require('../models/AdminUser');
const StudioSettings = require('../models/StudioSettings');

const defaultStudioValues = {
  studioName: 'AzojuanitoP41',
  slogan: 'Tatuajes con identidad, agenda directa y portafolio vivo.',
  aboutStudio:
    'AzojuanitoP41 es un estudio pensado para mostrar piezas reales, organizar el catalogo por estilos y convertir el interes del cliente en una cita clara por WhatsApp.',
  direccion: 'Direccion pendiente de confirmar por el estudio',
  instagramUrl: '',
  facebookUrl: '',
  whatsappNumber: process.env.WHATSAPP_NUMBER || '5215512345678',
  mapUrl: '',
  developerName: 'Cuenta desarrollador',
};

const serializeArtist = (artist) => ({
  id: artist.id,
  nombre: artist.nombre,
  role: artist.role,
  profileType: artist.profileType,
  publicBio: artist.publicBio,
  instagramUrl: artist.instagramUrl,
  facebookUrl: artist.facebookUrl,
  telefonoPublico: artist.telefonoPublico,
  direccionPublica: artist.direccionPublica,
  avatarUrl: artist.avatarUrl,
});

const serializeStudio = (studio, artists = []) => ({
  id: studio.id,
  studioName: studio.studioName,
  slogan: studio.slogan,
  aboutStudio: studio.aboutStudio,
  direccion: studio.direccion,
  instagramUrl: studio.instagramUrl,
  facebookUrl: studio.facebookUrl,
  whatsappNumber: studio.whatsappNumber,
  mapUrl: studio.mapUrl,
  developerName: studio.developerName,
  artists,
});

const getOrCreateStudio = async () => {
  const existing = await StudioSettings.findOne({ order: [['id', 'ASC']] });

  if (existing) {
    return existing;
  }

  return StudioSettings.create(defaultStudioValues);
};

const getPublicStudio = async (_req, res, next) => {
  try {
    const [studio, artists] = await Promise.all([
      getOrCreateStudio(),
      AdminUser.findAll({
        where: { publicVisible: true, profileType: 'tatuador', activo: true },
        order: [['createdAt', 'ASC']],
      }),
    ]);

    res.json(serializeStudio(studio, artists.map(serializeArtist)));
  } catch (error) {
    next(error);
  }
};

const getAdminStudio = async (_req, res, next) => {
  try {
    const studio = await getOrCreateStudio();
    res.json(serializeStudio(studio));
  } catch (error) {
    next(error);
  }
};

const updateStudio = async (req, res, next) => {
  try {
    const studio = await getOrCreateStudio();

    await studio.update({
      studioName: req.body.studioName || studio.studioName,
      slogan: req.body.slogan !== undefined ? req.body.slogan : studio.slogan,
      aboutStudio: req.body.aboutStudio !== undefined ? req.body.aboutStudio : studio.aboutStudio,
      direccion: req.body.direccion !== undefined ? req.body.direccion : studio.direccion,
      instagramUrl: req.body.instagramUrl !== undefined ? req.body.instagramUrl : studio.instagramUrl,
      facebookUrl: req.body.facebookUrl !== undefined ? req.body.facebookUrl : studio.facebookUrl,
      whatsappNumber: req.body.whatsappNumber !== undefined ? req.body.whatsappNumber : studio.whatsappNumber,
      mapUrl: req.body.mapUrl !== undefined ? req.body.mapUrl : studio.mapUrl,
      developerName: req.body.developerName !== undefined ? req.body.developerName : studio.developerName,
    });

    res.json(serializeStudio(studio));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPublicStudio,
  getAdminStudio,
  updateStudio,
  serializeArtist,
  serializeStudio,
};
