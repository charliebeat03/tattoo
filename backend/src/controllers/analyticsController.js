const Tatuaje = require('../models/Tatuaje');
const AdminUser = require('../models/AdminUser');
const Category = require('../models/Category');
const Visit = require('../models/Visit');
const { getVisitSummary } = require('../utils/visitHelper');

const trackVisit = async (req, res, next) => {
  try {
    const { visitorId, page } = req.body;

    if (!visitorId) {
      return res.status(400).json({ message: 'visitorId es obligatorio.' });
    }

    await Visit.create({
      visitorId,
      page: page || '/',
      userAgent: req.headers['user-agent'] || null,
      ip: req.ip,
    });

    res.status(201).json({ ok: true });
  } catch (error) {
    next(error);
  }
};

const getDashboardStats = async (_req, res, next) => {
  try {
    const [visitSummary, tatuajes, admins, categories, activeOffers, latestVisits, artists] = await Promise.all([
      getVisitSummary(),
      Tatuaje.count(),
      AdminUser.count(),
      Category.count(),
      Tatuaje.count({ where: { ofertaActiva: true } }),
      Visit.findAll({ order: [['createdAt', 'DESC']], limit: 8 }),
      AdminUser.count({ where: { profileType: 'tatuador', activo: true } }),
    ]);

    res.json({
      tatuajes,
      admins,
      categories,
      artists,
      activeOffers,
      visits: visitSummary,
      latestVisits: latestVisits.map((visit) => ({
        id: visit.id,
        page: visit.page,
        visitorId: visit.visitorId,
        createdAt: visit.createdAt,
      })),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  trackVisit,
  getDashboardStats,
};
