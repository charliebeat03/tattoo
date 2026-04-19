const Tatuaje = require('./Tatuaje');
const Category = require('./Category');

Category.hasMany(Tatuaje, {
  foreignKey: 'categoryId',
  as: 'tatuajes',
});

Tatuaje.belongsTo(Category, {
  foreignKey: 'categoryId',
  as: 'category',
});

module.exports = {
  Tatuaje,
  Category,
};
