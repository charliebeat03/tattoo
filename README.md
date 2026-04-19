# Catalogo Web de Tatuajes

Aplicacion full-stack para gestionar y mostrar un catalogo de tatuajes.

## Stack

- Backend: Node.js, Express, PostgreSQL, Sequelize, Multer
- Frontend: React con Vite, React Router, Axios
- Integracion: Boton de cita por WhatsApp usando `wa.me`
- Admin: login protegido con JWT, multi-admin y panel de gestion interno
- Analitica: registro de visitas unicas y pageviews para dia, semana y mes
- Catalogo: categorias, promociones temporales y seccion publica "Sobre nosotros"
- Estudio: perfil publico del tatuador, datos del estudio y enlaces sociales configurables
- Produccion: preparado para Render + Supabase Storage

## Estructura

```text
.
├── backend
│   ├── .env.example
│   ├── package.json
│   ├── server.js
│   ├── uploads
│   │   └── .gitkeep
│   └── src
│       ├── config
│       │   └── database.js
│       ├── controllers
│       │   └── tatuajeController.js
│       ├── middlewares
│       │   ├── authMiddleware.js
│       │   └── upload.js
│       ├── models
│       │   └── Tatuaje.js
│       ├── routes
│       │   └── tatuajeRoutes.js
│       └── utils
│           └── whatsappHelper.js
├── frontend
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src
│       ├── App.jsx
│       ├── main.jsx
│       ├── components
│       │   ├── BotonWhatsApp.jsx
│       │   ├── Navbar.jsx
│       │   └── TatuajeCard.jsx
│       ├── pages
│       │   ├── AdminPanel.jsx
│       │   ├── DetalleTatuaje.jsx
│       │   └── Home.jsx
│       ├── services
│       │   └── api.js
│       └── styles
│           └── global.css
└── .gitignore
```

## Variables de entorno

### Backend

1. Copia `backend/.env.example` a `backend/.env`.
2. Ajusta las credenciales de PostgreSQL.

Variables principales:

- `PORT`: puerto del backend.
- `CLIENT_URL`: origen permitido para CORS.
- `DATABASE_URL`: cadena completa de conexion a PostgreSQL.
- `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`: alternativa si no usas `DATABASE_URL`.
- `WHATSAPP_NUMBER`: numero para generar enlaces `wa.me`.
- `ADMIN_SECRET`: secret opcional para proteger crear/editar/eliminar.
- `STORAGE_PROVIDER`: `local` en desarrollo o `supabase` en produccion.
- `SUPABASE_URL`: URL del proyecto Supabase.
- `SUPABASE_SERVICE_ROLE_KEY`: clave de servicio para subir y borrar imagenes.
- `SUPABASE_BUCKET`: bucket publico de imagenes.

### Frontend

1. Copia `frontend/.env.example` a `frontend/.env`.
2. Configura la URL del backend y el numero de WhatsApp.

## Instalacion

### Arranque rapido desde la raiz

```bash
npm install
npm run db:start
npm run dev
```

Scripts disponibles en la raiz:

- `npm run db:start`: inicia PostgreSQL local en la VM.
- `npm run dev:backend`: inicia solo el backend.
- `npm run dev:frontend`: inicia solo el frontend.
- `npm run dev`: inicia PostgreSQL, backend y frontend juntos.
- `npm run build`: compila el frontend.

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Al iniciar el backend:

- se conecta a PostgreSQL,
- sincroniza los modelos,
- crea tablas si no existen,
- inserta 3 tatuajes de ejemplo si la tabla `tatuajes` esta vacia,
- expone archivos subidos en `http://localhost:4000/uploads/...`.

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

La app frontend queda disponible normalmente en `http://localhost:5173`.

## Acceso Admin

La ruta `/admin` ya no expone el panel directamente. Si no existe una sesion valida, muestra un formulario de login.

Credenciales iniciales del primer admin:

- `DEFAULT_ADMIN_EMAIL`: por defecto `admin@inkportfolio.com`
- `DEFAULT_ADMIN_PASSWORD`: por defecto `admin12345`

Si no defines `DEFAULT_ADMIN_PASSWORD`, el backend usa `ADMIN_SECRET` como password inicial del admin semilla.

Desde el panel admin puedes:

- iniciar y cerrar sesion,
- crear, editar y eliminar tatuajes,
- asignar categorias a cada tatuaje,
- activar promociones y rebajas con rango de fechas,
- editar el nombre del estudio, su descripcion, direccion y enlaces,
- crear, editar y eliminar otros administradores,
- marcar perfiles publicos de tatuador para la seccion "Sobre nosotros",
- revisar visitas unicas y paginas vistas.

## PostgreSQL En GitHub Codespaces O VM

Si trabajas dentro de una VM o Codespace, `localhost:5432` apunta a esa maquina remota, no a tu PC local.

### Instalacion inicial

```bash
sudo apt-get -o Dir::Etc::sourcelist=/etc/apt/sources.list.d/ubuntu.sources -o Dir::Etc::sourceparts='-' update
sudo apt-get -o Dir::Etc::sourcelist=/etc/apt/sources.list.d/ubuntu.sources -o Dir::Etc::sourceparts='-' install -y postgresql postgresql-contrib
sudo pg_ctlcluster 16 main start
sudo bash -lc "su - postgres -c \"psql -c \\\"ALTER USER postgres WITH PASSWORD 'postgres';\\\"\""
sudo bash -lc "su - postgres -c \"psql -tc \\\"SELECT 1 FROM pg_database WHERE datname = 'tattoo_catalogo'\\\"\" | grep -q 1 || su - postgres -c \"createdb tattoo_catalogo\""
```

### Reinicios posteriores

Despues de reiniciar la VM normalmente solo necesitas:

```bash
sudo pg_ctlcluster 16 main start
pg_lsclusters
```

Si `16/main` aparece en estado `online`, el backend ya puede conectarse usando el `.env` de ejemplo.

## Despliegue En Render Y Supabase

Arquitectura recomendada:

- Render Static Site para `frontend`
- Render Web Service para `backend`
- Supabase Postgres para base de datos
- Supabase Storage para fotos de tatuajes

### Preparacion

1. Crea un bucket publico en Supabase llamado `tatuajes`.
2. Usa la cadena `DATABASE_URL` de Supabase Postgres para el backend.
3. En Render importa el archivo [`render.yaml`](/workspaces/tattoo/render.yaml) desde tu repo.
4. Configura manualmente estas variables al crear los servicios:

- Backend:
  - `CLIENT_URL`
  - `DATABASE_URL`
  - `ADMIN_JWT_SECRET`
  - `DEFAULT_ADMIN_PASSWORD`
  - `DEFAULT_ARTIST_PASSWORD`
  - `WHATSAPP_NUMBER`
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
- Frontend:
  - `VITE_API_URL`
  - `VITE_WHATSAPP_NUMBER`

### Notas de produccion

- En produccion el backend usa `SUPABASE_STORAGE` mediante `STORAGE_PROVIDER=supabase`.
- Las imagenes nuevas ya no dependen de `backend/uploads`, asi que no se pierden al reiniciar Render.
- El archivo [`frontend/public/_redirects`](/workspaces/tattoo/frontend/public/_redirects) ayuda a mantener el enrutado SPA en hosts compatibles.

## Endpoints REST

- `GET /api/tatuajes`: listar tatuajes.
- `GET /api/tatuajes/:id`: detalle de un tatuaje.
- `POST /api/tatuajes`: crear tatuaje con `multipart/form-data`.
- `PUT /api/tatuajes/:id`: actualizar tatuaje.
- `DELETE /api/tatuajes/:id`: eliminar tatuaje.
- `POST /api/admin/auth/login`: login de administrador.
- `GET /api/admin/auth/me`: perfil del admin autenticado.
- `GET /api/admin/users`: listar administradores.
- `POST /api/admin/users`: crear administrador.
- `PUT /api/admin/users/:id`: editar administrador.
- `DELETE /api/admin/users/:id`: eliminar administrador.
- `GET /api/categories`: listar categorias del catalogo.
- `POST /api/categories`: crear categoria.
- `PUT /api/categories/:id`: editar categoria.
- `DELETE /api/categories/:id`: eliminar categoria.
- `GET /api/studio`: ver datos publicos del estudio y tatuadores visibles.
- `GET /api/studio/admin`: ver configuracion interna del estudio.
- `PUT /api/studio/admin`: actualizar configuracion del estudio.
- `POST /api/analytics/visit`: registrar una visita desde frontend.
- `GET /api/analytics/dashboard`: resumen de metricas del panel.

Para rutas protegidas, envia el header:

```http
Authorization: Bearer tu_jwt
```

## Campos esperados en `multipart/form-data`

- `titulo`: texto.
- `descripcion`: texto.
- `precio`: numero decimal.
- `precioOferta`: numero decimal opcional.
- `ofertaActiva`: booleano para activar la promo.
- `ofertaEtiqueta`: texto opcional de marketing.
- `ofertaInicio`: fecha y hora opcional.
- `ofertaFin`: fecha y hora opcional.
- `categoryId`: categoria opcional para clasificar el tatuaje.
- `fotoPrincipal`: una imagen.
- `fotos`: hasta 12 imagenes extra.
- `fotosExistentes`: JSON string con rutas que se mantienen al editar.

## Flujo principal

- El admin puede crear, editar y eliminar tatuajes desde `/admin`.
- El acceso admin exige login real antes de mostrar el panel.
- Los administradores pueden dar de alta a otros admins del estudio y marcar si son tatuadores visibles o desarrolladores.
- El catalogo publico muestra categorias para filtrar piezas y soportar mejor un volumen grande de tatuajes.
- La seccion publica "Sobre nosotros" toma los datos del estudio y los admins con perfil `tatuador`.
- El panel incluye metricas de visitas dia/semana/mes y paginas mas vistas.
- Las promociones pueden ser permanentes o por rango de fechas especiales.
- El usuario final ve el catalogo en `/`.
- Cada tarjeta y detalle incluye un boton para abrir WhatsApp con el titulo y el precio final vigente del tatuaje.

## Notas

- Las imagenes subidas se guardan en `backend/uploads` con rutas relativas como `/uploads/archivo.jpg`.
- Los datos de ejemplo solo se insertan cuando la tabla no tiene registros.
- Multer acepta una imagen principal y hasta 5 imagenes extra; los nombres ahora incluyen un sufijo unico para evitar colisiones.
- El selector de archivos del panel admin usa el almacenamiento del dispositivo desde el navegador del administrador.
