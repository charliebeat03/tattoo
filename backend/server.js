const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

const sequelize = require('./src/config/database');
const Tatuaje = require('./src/models/Tatuaje');
const Category = require('./src/models/Category');
const AdminUser = require('./src/models/AdminUser');
const StudioSettings = require('./src/models/StudioSettings');
require('./src/models/Visit');
require('./src/models/associations');

const tatuajeRoutes = require('./src/routes/tatuajeRoutes');
const adminAuthRoutes = require('./src/routes/adminAuthRoutes');
const adminUserRoutes = require('./src/routes/adminUserRoutes');
const analyticsRoutes = require('./src/routes/analyticsRoutes');
const categoryRoutes = require('./src/routes/categoryRoutes');
const studioRoutes = require('./src/routes/studioRoutes');
const { slugify } = require('./src/utils/slugHelper');
const { ensureStorageReady } = require('./src/utils/storageHelper');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const uploadsDir = path.join(__dirname, 'uploads');
const allowedOrigins = Array.from(
  new Set(
    [
      process.env.CLIENT_URL,
      'http://localhost:5173',
      'http://127.0.0.1:5173',
    ].filter(Boolean)
  )
);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('Origen no permitido por CORS.'));
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(uploadsDir));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, message: 'API de tatuajes funcionando' });
});

app.use('/api/tatuajes', tatuajeRoutes);
app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/admin/users', adminUserRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/studio', studioRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || 'Error interno del servidor',
  });
});

const seedStudioSettings = async () => {
  const studio = await StudioSettings.findOne({ order: [['id', 'ASC']] });

  if (studio) {
    return studio;
  }

  return StudioSettings.create({
    studioName: 'AzojuanitoP41',
    slogan: 'Tatuajes con identidad, agenda directa y portafolio vivo.',
    aboutStudio:
      'AzojuanitoP41 muestra el trabajo del estudio, organiza el catalogo por categorias y deja listo el contacto directo por WhatsApp para convertir visitas en citas.',
    direccion: 'Direccion pendiente de confirmar por el estudio',
    instagramUrl: '',
    facebookUrl: '',
    whatsappNumber: process.env.WHATSAPP_NUMBER || '5215512345678',
    mapUrl: '',
    developerName: 'Cuenta desarrollador',
  });
};

const seedCategories = async () => {
  const total = await Category.count();

  if (total > 0) {
    return Category.findAll({ order: [['sortOrder', 'ASC'], ['nombre', 'ASC']] });
  }

  const defaults = [
    {
      nombre: 'Blackwork',
      slug: slugify('Blackwork'),
      descripcion: 'Trazos negros, contrastes fuertes y composiciones de alto impacto.',
      sortOrder: 1,
    },
    {
      nombre: 'Fine Line',
      slug: slugify('Fine Line'),
      descripcion: 'Lineas finas, detalle limpio y piezas delicadas para proyectos elegantes.',
      sortOrder: 2,
    },
    {
      nombre: 'Neo Tradicional',
      slug: slugify('Neo Tradicional'),
      descripcion: 'Color, sombreado y presencia visual para piezas expresivas.',
      sortOrder: 3,
    },
  ];

  await Category.bulkCreate(defaults);
  return Category.findAll({ order: [['sortOrder', 'ASC'], ['nombre', 'ASC']] });
};

const seedTatuajes = async (categories) => {
  const total = await Tatuaje.count();

  if (total > 0) {
    return;
  }

  const categoriesBySlug = Object.fromEntries(categories.map((category) => [category.slug, category]));

  await Tatuaje.bulkCreate([
    {
      titulo: 'Blackwork Geometrico',
      descripcion:
        'Diseno de lineas limpias con patron geometrico para antebrazo, ideal para una pieza moderna y elegante.',
      precio: 180,
      precioOferta: 149,
      ofertaActiva: true,
      ofertaEtiqueta: 'Oferta flash',
      fotoPrincipal: 'https://images.unsplash.com/photo-1542727365-19732a80dcfd?auto=format&fit=crop&w=900&q=80',
      fotos: [
        'https://images.unsplash.com/photo-1590246815117-db6b6fa30c36?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?auto=format&fit=crop&w=900&q=80',
      ],
      categoryId: categoriesBySlug.blackwork?.id || null,
    },
    {
      titulo: 'Floral Fine Line',
      descripcion:
        'Composicion floral de trazo fino para brazo o clavicula, pensada para un acabado delicado y femenino.',
      precio: 140,
      fotoPrincipal: 'https://images.unsplash.com/photo-1565058379802-bbe93b2f703a?auto=format&fit=crop&w=900&q=80',
      fotos: [
        'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80',
      ],
      categoryId: categoriesBySlug['fine-line']?.id || null,
    },
    {
      titulo: 'Neo Tradicional Tigre',
      descripcion:
        'Pieza vibrante con sombreado intenso y color, recomendada para muslo o espalda.',
      precio: 260,
      precioOferta: 220,
      ofertaActiva: true,
      ofertaEtiqueta: 'Promo especial',
      fotoPrincipal: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80',
      fotos: [
        'https://images.unsplash.com/photo-1519452575417-564c1401ecc0?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80',
      ],
      categoryId: categoriesBySlug['neo-tradicional']?.id || null,
    },
  ]);

  console.log('Datos de ejemplo insertados en la base de datos.');
};

const backfillTattooCategories = async (categories) => {
  const categoriesBySlug = Object.fromEntries(categories.map((category) => [category.slug, category]));

  await Promise.all([
    Tatuaje.update(
      { categoryId: categoriesBySlug.blackwork?.id || null },
      {
        where: {
          titulo: 'Blackwork Geometrico',
          categoryId: null,
        },
      }
    ),
    Tatuaje.update(
      { categoryId: categoriesBySlug['fine-line']?.id || null },
      {
        where: {
          titulo: 'Floral Fine Line',
          categoryId: null,
        },
      }
    ),
    Tatuaje.update(
      { categoryId: categoriesBySlug['neo-tradicional']?.id || null },
      {
        where: {
          titulo: 'Neo Tradicional Tigre',
          categoryId: null,
        },
      }
    ),
  ]);
};

const seedDefaultUsers = async () => {
  const defaultDeveloperName = process.env.DEFAULT_ADMIN_NAME || 'Cuenta desarrollador';
  const defaultDeveloperEmail = (process.env.DEFAULT_ADMIN_EMAIL || 'admin@inkportfolio.com').toLowerCase();
  const defaultDeveloperPassword = process.env.DEFAULT_ADMIN_PASSWORD || process.env.ADMIN_SECRET || 'admin12345';

  let developer = await AdminUser.findOne({ where: { email: defaultDeveloperEmail } });

  if (!developer) {
    developer = await AdminUser.create({
      nombre: defaultDeveloperName,
      email: defaultDeveloperEmail,
      passwordHash: await bcrypt.hash(defaultDeveloperPassword, 10),
      role: 'superadmin',
      profileType: 'desarrollador',
      publicVisible: false,
      activo: true,
    });
    console.log(`Cuenta desarrollador creada: ${defaultDeveloperEmail}`);
  } else {
    await developer.update({
      nombre: defaultDeveloperName,
      role: 'superadmin',
      profileType: 'desarrollador',
      publicVisible: false,
      activo: true,
    });
  }

  const artistExists = await AdminUser.count({ where: { profileType: 'tatuador' } });

  if (artistExists > 0) {
    return;
  }

  const artistEmail = (process.env.DEFAULT_ARTIST_EMAIL || 'alfredo@azojuanitop41.com').toLowerCase();
  const artistPassword = process.env.DEFAULT_ARTIST_PASSWORD || 'alfredo12345';

  await AdminUser.create({
    nombre: 'Alfredo Abel Sanchez Hidalgo',
    email: artistEmail,
    passwordHash: await bcrypt.hash(artistPassword, 10),
    role: 'admin',
    profileType: 'tatuador',
    publicVisible: true,
    publicBio:
      'Tatuador residente en AzojuanitoP41. Trabaja piezas de autor, composiciones limpias y proyectos listos para reservar directamente desde el catalogo.',
    instagramUrl: '',
    facebookUrl: '',
    telefonoPublico: process.env.WHATSAPP_NUMBER || '',
    direccionPublica: 'Direccion pendiente de confirmar por el estudio',
    activo: true,
  });

  console.log(`Tatuador inicial creado: ${artistEmail}`);
};

const startServer = async () => {
  try {
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    await sequelize.authenticate();
    console.log('Conexion a PostgreSQL establecida correctamente.');

    await sequelize.sync({ alter: true });
    console.log('Modelos sincronizados correctamente.');

    await ensureStorageReady();
    await seedStudioSettings();
    const categories = await seedCategories();
    await backfillTattooCategories(categories);
    await seedDefaultUsers();
    await seedTatuajes(categories);

    app.listen(PORT, () => {
      console.log(`Servidor backend listo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('No se pudo iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer();
