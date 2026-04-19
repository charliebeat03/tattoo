const { Op, fn, col } = require('sequelize');
const Visit = require('../models/Visit');

const getPeriodStart = (type) => {
  const now = new Date();

  if (type === 'day') {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }

  if (type === 'week') {
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const day = today.getDay();
    const diff = day === 0 ? 6 : day - 1;
    today.setDate(today.getDate() - diff);
    return today;
  }

  return new Date(now.getFullYear(), now.getMonth(), 1);
};

const getVisitSummary = async () => {
  const [day, week, month] = await Promise.all(
    ['day', 'week', 'month'].map(async (period) => {
      const since = getPeriodStart(period);
      const [uniqueVisitors, pageViews] = await Promise.all([
        Visit.count({
          where: { createdAt: { [Op.gte]: since } },
          distinct: true,
          col: 'visitorId',
        }),
        Visit.count({
          where: { createdAt: { [Op.gte]: since } },
        }),
      ]);

      return { uniqueVisitors, pageViews };
    })
  );

  const topPages = await Visit.findAll({
    attributes: ['page', [fn('COUNT', col('id')), 'visitas']],
    group: ['page'],
    order: [[fn('COUNT', col('id')), 'DESC']],
    limit: 5,
  });

  return {
    day,
    week,
    month,
    topPages: topPages.map((page) => ({
      page: page.page,
      visitas: Number(page.get('visitas')),
    })),
  };
};

module.exports = {
  getVisitSummary,
};
