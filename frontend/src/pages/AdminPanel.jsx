import { useEffect, useMemo, useState } from 'react';
import {
  clearAdminSession,
  createAdminUser,
  createCategory,
  createTatuaje,
  deleteAdminUser,
  deleteCategory,
  deleteTatuaje,
  getAdminSession,
  getAdminStudio,
  getAdmins,
  getCategories,
  getCurrentAdmin,
  getDashboardStats,
  getTatuajes,
  loginAdmin,
  resolveImageUrl,
  updateAdminUser,
  updateCategory,
  updateStudio,
  updateTatuaje,
} from '../services/api';

const initialTattooForm = {
  titulo: '',
  descripcion: '',
  precio: '',
  precioOferta: '',
  ofertaActiva: false,
  ofertaEtiqueta: '',
  ofertaInicio: '',
  ofertaFin: '',
  categoryId: '',
  fotoPrincipal: null,
  fotos: [],
};

const initialAdminForm = {
  nombre: '',
  email: '',
  password: '',
  role: 'admin',
  profileType: 'admin',
  publicVisible: false,
  publicBio: '',
  instagramUrl: '',
  facebookUrl: '',
  telefonoPublico: '',
  direccionPublica: '',
  avatarUrl: '',
  activo: true,
};

const initialCategoryForm = {
  nombre: '',
  slug: '',
  descripcion: '',
  activa: true,
  sortOrder: 0,
};

const initialStudioForm = {
  studioName: 'AzojuanitoP41',
  slogan: '',
  aboutStudio: '',
  direccion: '',
  instagramUrl: '',
  facebookUrl: '',
  whatsappNumber: '',
  mapUrl: '',
  developerName: '',
};

const initialLoginForm = {
  email: '',
  password: '',
};

const toDatetimeLocal = (value) => {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 16);
};

function AdminPanel() {
  const [session, setSession] = useState(() => getAdminSession());
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [loginForm, setLoginForm] = useState(initialLoginForm);
  const [tattooForm, setTattooForm] = useState(initialTattooForm);
  const [adminForm, setAdminForm] = useState(initialAdminForm);
  const [categoryForm, setCategoryForm] = useState(initialCategoryForm);
  const [studioForm, setStudioForm] = useState(initialStudioForm);
  const [tatuajes, setTatuajes] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState(null);
  const [tab, setTab] = useState('dashboard');
  const [editTattooId, setEditTattooId] = useState(null);
  const [editAdminId, setEditAdminId] = useState(null);
  const [editCategoryId, setEditCategoryId] = useState(null);
  const [existingGallery, setExistingGallery] = useState([]);
  const [existingMain, setExistingMain] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [loggingIn, setLoggingIn] = useState(false);
  const [savingTattoo, setSavingTattoo] = useState(false);
  const [savingAdmin, setSavingAdmin] = useState(false);
  const [savingCategory, setSavingCategory] = useState(false);
  const [savingStudio, setSavingStudio] = useState(false);

  const fotoPrincipalPreview = useMemo(() => {
    if (tattooForm.fotoPrincipal instanceof File) {
      return URL.createObjectURL(tattooForm.fotoPrincipal);
    }

    return existingMain ? resolveImageUrl(existingMain) : '';
  }, [tattooForm.fotoPrincipal, existingMain]);

  const galleryPreviews = useMemo(() => {
    const nuevos = tattooForm.fotos.map((file) => ({
      source: URL.createObjectURL(file),
      local: true,
    }));
    const existentes = existingGallery.map((image) => ({
      source: resolveImageUrl(image),
      local: false,
      original: image,
    }));

    return [...existentes, ...nuevos];
  }, [tattooForm.fotos, existingGallery]);

  useEffect(() => {
    return () => {
      if (tattooForm.fotoPrincipal instanceof File) {
        URL.revokeObjectURL(fotoPrincipalPreview);
      }

      galleryPreviews.forEach((item) => {
        if (item.local) {
          URL.revokeObjectURL(item.source);
        }
      });
    };
  }, [fotoPrincipalPreview, galleryPreviews, tattooForm.fotoPrincipal]);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [admin, tattoos, dashboard, adminUsers, categoryData, studioData] = await Promise.all([
        getCurrentAdmin(),
        getTatuajes(),
        getDashboardStats(),
        getAdmins(),
        getCategories(),
        getAdminStudio(),
      ]);

      setCurrentAdmin(admin);
      setTatuajes(tattoos);
      setStats(dashboard);
      setAdmins(adminUsers);
      setCategories(categoryData);
      setStudioForm({
        studioName: studioData.studioName || 'AzojuanitoP41',
        slogan: studioData.slogan || '',
        aboutStudio: studioData.aboutStudio || '',
        direccion: studioData.direccion || '',
        instagramUrl: studioData.instagramUrl || '',
        facebookUrl: studioData.facebookUrl || '',
        whatsappNumber: studioData.whatsappNumber || '',
        mapUrl: studioData.mapUrl || '',
        developerName: studioData.developerName || '',
      });
      setError('');
    } catch (err) {
      clearAdminSession();
      setSession(null);
      setCurrentAdmin(null);
      setError(err.response?.data?.message || 'No se pudo cargar el panel admin.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.token) {
      loadAdminData();
      return;
    }

    setLoading(false);
  }, [session?.token]);

  const activeOffers = tatuajes.filter((tatuaje) => tatuaje.ofertaActiva || tatuaje.ofertaVigente);
  const visibleArtists = admins.filter((admin) => admin.profileType === 'tatuador' && admin.publicVisible);

  const resetTattooForm = () => {
    setTattooForm(initialTattooForm);
    setEditTattooId(null);
    setExistingGallery([]);
    setExistingMain('');
  };

  const resetAdminForm = () => {
    setAdminForm(initialAdminForm);
    setEditAdminId(null);
  };

  const resetCategoryForm = () => {
    setCategoryForm(initialCategoryForm);
    setEditCategoryId(null);
  };

  const handleLoginChange = (event) => {
    const { name, value } = event.target;
    setLoginForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleTattooChange = (event) => {
    const { name, value, type, checked } = event.target;
    setTattooForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleAdminChange = (event) => {
    const { name, value, type, checked } = event.target;
    setAdminForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleCategoryChange = (event) => {
    const { name, value, type, checked } = event.target;
    setCategoryForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleStudioChange = (event) => {
    const { name, value } = event.target;
    setStudioForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTattooFileChange = (event) => {
    const { name, files } = event.target;

    if (name === 'fotoPrincipal') {
      setTattooForm((prev) => ({ ...prev, fotoPrincipal: files[0] || null }));
      return;
    }

    setTattooForm((prev) => ({ ...prev, fotos: Array.from(files).slice(0, 12) }));
  };

  const removeExistingImage = (image) => {
    setExistingGallery((prev) => prev.filter((item) => item !== image));
  };

  const buildTattooFormData = () => {
    const formData = new FormData();
    formData.append('titulo', tattooForm.titulo);
    formData.append('descripcion', tattooForm.descripcion);
    formData.append('precio', tattooForm.precio);
    formData.append('ofertaActiva', tattooForm.ofertaActiva);
    formData.append('precioOferta', tattooForm.precioOferta);
    formData.append('ofertaEtiqueta', tattooForm.ofertaEtiqueta);
    formData.append('ofertaInicio', tattooForm.ofertaInicio);
    formData.append('ofertaFin', tattooForm.ofertaFin);
    formData.append('categoryId', tattooForm.categoryId);

    if (tattooForm.fotoPrincipal) {
      formData.append('fotoPrincipal', tattooForm.fotoPrincipal);
    } else if (existingMain) {
      formData.append('fotoPrincipal', existingMain);
    }

    tattooForm.fotos.forEach((file) => {
      formData.append('fotos', file);
    });

    formData.append('fotosExistentes', JSON.stringify(existingGallery));

    return formData;
  };

  const handleLoginSubmit = async (event) => {
    event.preventDefault();
    setLoggingIn(true);
    setError('');
    setStatus('');

    try {
      const nextSession = await loginAdmin(loginForm);
      setSession(nextSession);
      setLoginForm(initialLoginForm);
      setStatus('Sesion iniciada correctamente.');
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo iniciar sesion.');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleTattooSubmit = async (event) => {
    event.preventDefault();
    setSavingTattoo(true);
    setStatus('');
    setError('');

    try {
      const formData = buildTattooFormData();

      if (editTattooId) {
        await updateTatuaje(editTattooId, formData);
        setStatus('Tatuaje actualizado correctamente.');
      } else {
        await createTatuaje(formData);
        setStatus('Tatuaje creado correctamente.');
      }

      resetTattooForm();
      await loadAdminData();
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo guardar el tatuaje.');
    } finally {
      setSavingTattoo(false);
    }
  };

  const handleTattooEdit = (tatuaje) => {
    setTab('catalogo');
    setEditTattooId(tatuaje.id);
    setExistingMain(tatuaje.fotoPrincipal);
    setExistingGallery(tatuaje.fotos || []);
    setTattooForm({
      titulo: tatuaje.titulo,
      descripcion: tatuaje.descripcion,
      precio: tatuaje.precio,
      precioOferta: tatuaje.precioOferta || '',
      ofertaActiva: tatuaje.ofertaActiva,
      ofertaEtiqueta: tatuaje.ofertaEtiqueta || '',
      ofertaInicio: toDatetimeLocal(tatuaje.ofertaInicio),
      ofertaFin: toDatetimeLocal(tatuaje.ofertaFin),
      categoryId: tatuaje.categoryId || '',
      fotoPrincipal: null,
      fotos: [],
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTattooDelete = async (id) => {
    try {
      setStatus('');
      setError('');
      await deleteTatuaje(id);

      if (editTattooId === id) {
        resetTattooForm();
      }

      setStatus('Tatuaje eliminado correctamente.');
      await loadAdminData();
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo eliminar el tatuaje.');
    }
  };

  const handleAdminSubmit = async (event) => {
    event.preventDefault();
    setSavingAdmin(true);
    setStatus('');
    setError('');

    try {
      const payload = {
        ...adminForm,
        activo: Boolean(adminForm.activo),
        publicVisible: adminForm.profileType === 'desarrollador' ? false : Boolean(adminForm.publicVisible),
      };

      if (editAdminId) {
        await updateAdminUser(editAdminId, payload);
        setStatus('Usuario administrador actualizado correctamente.');
      } else {
        await createAdminUser(payload);
        setStatus('Usuario administrador creado correctamente.');
      }

      resetAdminForm();
      await loadAdminData();
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo guardar el usuario administrador.');
    } finally {
      setSavingAdmin(false);
    }
  };

  const handleAdminEdit = (admin) => {
    setTab('admins');
    setEditAdminId(admin.id);
    setAdminForm({
      nombre: admin.nombre,
      email: admin.email,
      password: '',
      role: admin.role,
      profileType: admin.profileType || 'admin',
      publicVisible: Boolean(admin.publicVisible),
      publicBio: admin.publicBio || '',
      instagramUrl: admin.instagramUrl || '',
      facebookUrl: admin.facebookUrl || '',
      telefonoPublico: admin.telefonoPublico || '',
      direccionPublica: admin.direccionPublica || '',
      avatarUrl: admin.avatarUrl || '',
      activo: admin.activo,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAdminDelete = async (id) => {
    try {
      setStatus('');
      setError('');
      await deleteAdminUser(id);

      if (editAdminId === id) {
        resetAdminForm();
      }

      setStatus('Usuario administrador eliminado correctamente.');
      await loadAdminData();
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo eliminar el usuario administrador.');
    }
  };

  const handleCategorySubmit = async (event) => {
    event.preventDefault();
    setSavingCategory(true);
    setStatus('');
    setError('');

    try {
      const payload = {
        ...categoryForm,
        sortOrder: Number(categoryForm.sortOrder || 0),
      };

      if (editCategoryId) {
        await updateCategory(editCategoryId, payload);
        setStatus('Categoria actualizada correctamente.');
      } else {
        await createCategory(payload);
        setStatus('Categoria creada correctamente.');
      }

      resetCategoryForm();
      await loadAdminData();
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo guardar la categoria.');
    } finally {
      setSavingCategory(false);
    }
  };

  const handleCategoryEdit = (category) => {
    setTab('categorias');
    setEditCategoryId(category.id);
    setCategoryForm({
      nombre: category.nombre,
      slug: category.slug,
      descripcion: category.descripcion || '',
      activa: category.activa,
      sortOrder: category.sortOrder || 0,
    });
  };

  const handleCategoryDelete = async (id) => {
    try {
      setStatus('');
      setError('');
      await deleteCategory(id);

      if (editCategoryId === id) {
        resetCategoryForm();
      }

      setStatus('Categoria eliminada correctamente.');
      await loadAdminData();
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo eliminar la categoria.');
    }
  };

  const handleStudioSubmit = async (event) => {
    event.preventDefault();
    setSavingStudio(true);
    setStatus('');
    setError('');

    try {
      await updateStudio(studioForm);
      setStatus('Datos del estudio actualizados correctamente.');
      await loadAdminData();
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo actualizar el estudio.');
    } finally {
      setSavingStudio(false);
    }
  };

  const handleLogout = () => {
    clearAdminSession();
    setSession(null);
    setCurrentAdmin(null);
    setAdmins([]);
    setCategories([]);
    setStatus('Sesion cerrada.');
  };

  if (!session?.token) {
    return (
      <section className="page auth-page">
        <div className="login-shell">
          <div className="login-card">
            <p className="eyebrow">Acceso protegido</p>
            <h1>Panel admin de {studioForm.studioName}</h1>
            <p className="hero-copy">
              Solo tatuadores o administradores autorizados pueden gestionar el catalogo, las ofertas,
              el perfil del estudio y los nuevos usuarios del panel.
            </p>

            <form className="admin-form" onSubmit={handleLoginSubmit}>
              <label>
                Email
                <input
                  type="email"
                  name="email"
                  value={loginForm.email}
                  onChange={handleLoginChange}
                  placeholder="admin@inkportfolio.com"
                  required
                />
              </label>

              <label>
                Password
                <input
                  type="password"
                  name="password"
                  value={loginForm.password}
                  onChange={handleLoginChange}
                  placeholder="Tu password de administrador"
                  required
                />
              </label>

              <button type="submit" className="primary-button" disabled={loggingIn}>
                {loggingIn ? 'Entrando...' : 'Iniciar sesion'}
              </button>
            </form>

            {error ? <p className="status-message error">{error}</p> : null}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="page admin-page admin-shell">
      <div className="admin-header admin-header--dashboard">
        <div>
          <p className="eyebrow">Backoffice del estudio</p>
          <h1>{studioForm.studioName}</h1>
          <p className="brand-note">
            Sesion activa como <strong>{currentAdmin?.nombre}</strong> · {currentAdmin?.profileType || currentAdmin?.role}
          </p>
        </div>

        <div className="admin-toolbar">
          <button type="button" className="secondary-button" onClick={() => loadAdminData()}>
            Recargar panel
          </button>
          <button type="button" className="danger-button" onClick={handleLogout}>
            Cerrar sesion
          </button>
        </div>
      </div>

      <div className="admin-tabs">
        {[
          ['dashboard', 'Dashboard'],
          ['catalogo', 'Catalogo'],
          ['promos', 'Promociones'],
          ['categorias', 'Categorias'],
          ['estudio', 'Estudio'],
          ['admins', 'Admins'],
        ].map(([key, label]) => (
          <button
            key={key}
            type="button"
            className={`tab-button ${tab === key ? 'active' : ''}`}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {status ? <p className="status-message success">{status}</p> : null}
      {error ? <p className="status-message error">{error}</p> : null}

      {loading ? (
        <p className="status-message">Cargando panel...</p>
      ) : (
        <>
          {tab === 'dashboard' && stats ? (
            <div className="dashboard-grid">
              <article className="dashboard-card">
                <p className="eyebrow">Hoy</p>
                <h3>{stats.visits.day.uniqueVisitors}</h3>
                <p>{stats.visits.day.pageViews} paginas vistas</p>
              </article>
              <article className="dashboard-card">
                <p className="eyebrow">Semana</p>
                <h3>{stats.visits.week.uniqueVisitors}</h3>
                <p>{stats.visits.week.pageViews} paginas vistas</p>
              </article>
              <article className="dashboard-card">
                <p className="eyebrow">Mes</p>
                <h3>{stats.visits.month.uniqueVisitors}</h3>
                <p>{stats.visits.month.pageViews} paginas vistas</p>
              </article>
              <article className="dashboard-card">
                <p className="eyebrow">Catalogo</p>
                <h3>{stats.tatuajes}</h3>
                <p>{stats.activeOffers} promos activas</p>
              </article>
              <article className="dashboard-card">
                <p className="eyebrow">Categorias</p>
                <h3>{stats.categories}</h3>
                <p>Clasificacion del catalogo</p>
              </article>
              <article className="dashboard-card">
                <p className="eyebrow">Equipo</p>
                <h3>{stats.artists}</h3>
                <p>Tatuadores activos visibles</p>
              </article>
              <article className="dashboard-panel dashboard-panel--wide">
                <div className="section-heading compact">
                  <div>
                    <p className="eyebrow">Top paginas</p>
                    <h2>Rutas mas visitadas</h2>
                  </div>
                </div>
                <div className="metric-list">
                  {stats.visits.topPages.map((item) => (
                    <div key={item.page} className="metric-row">
                      <span>{item.page}</span>
                      <strong>{item.visitas}</strong>
                    </div>
                  ))}
                </div>
              </article>
              <article className="dashboard-panel dashboard-panel--wide">
                <div className="section-heading compact">
                  <div>
                    <p className="eyebrow">Actividad reciente</p>
                    <h2>Ultimas visitas registradas</h2>
                  </div>
                </div>
                <div className="metric-list">
                  {stats.latestVisits.map((visit) => (
                    <div key={visit.id} className="metric-row">
                      <span>{visit.page}</span>
                      <strong>{new Date(visit.createdAt).toLocaleString()}</strong>
                    </div>
                  ))}
                </div>
              </article>
            </div>
          ) : null}

          {tab === 'catalogo' ? (
            <div className="admin-section-grid">
              <form className="admin-form admin-panel-card" onSubmit={handleTattooSubmit}>
                <div className="section-heading compact">
                  <div>
                    <p className="eyebrow">Gestion de tatuajes</p>
                    <h2>{editTattooId ? 'Editar tatuaje' : 'Nuevo tatuaje'}</h2>
                  </div>
                  {editTattooId ? (
                    <button type="button" className="secondary-button" onClick={resetTattooForm}>
                      Cancelar
                    </button>
                  ) : null}
                </div>

                <label>
                  Titulo
                  <input type="text" name="titulo" value={tattooForm.titulo} onChange={handleTattooChange} required />
                </label>

                <label>
                  Categoria
                  <select name="categoryId" value={tattooForm.categoryId} onChange={handleTattooChange}>
                    <option value="">Sin categoria</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.nombre}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Descripcion
                  <textarea name="descripcion" rows="4" value={tattooForm.descripcion} onChange={handleTattooChange} required />
                </label>

                <div className="form-split">
                  <label>
                    Precio base
                    <input type="number" min="0" step="0.01" name="precio" value={tattooForm.precio} onChange={handleTattooChange} required />
                  </label>

                  <label>
                    Precio oferta
                    <input type="number" min="0" step="0.01" name="precioOferta" value={tattooForm.precioOferta} onChange={handleTattooChange} />
                  </label>
                </div>

                <label className="checkbox-row checkbox-row--boxed">
                  <input type="checkbox" name="ofertaActiva" checked={tattooForm.ofertaActiva} onChange={handleTattooChange} />
                  Activar rebaja temporal o promocion especial
                </label>

                <label>
                  Etiqueta promocional
                  <input type="text" name="ofertaEtiqueta" value={tattooForm.ofertaEtiqueta} onChange={handleTattooChange} placeholder="Oferta del dia, Promo Halloween, Rebaja especial..." />
                </label>

                <div className="form-split">
                  <label>
                    Inicio promo
                    <input type="datetime-local" name="ofertaInicio" value={tattooForm.ofertaInicio} onChange={handleTattooChange} />
                  </label>
                  <label>
                    Fin promo
                    <input type="datetime-local" name="ofertaFin" value={tattooForm.ofertaFin} onChange={handleTattooChange} />
                  </label>
                </div>

                <label>
                  Foto principal
                  <input type="file" name="fotoPrincipal" accept="image/*" onChange={handleTattooFileChange} />
                  <small className="helper-text">Se abre el selector de archivos del dispositivo del administrador.</small>
                </label>

                {fotoPrincipalPreview ? (
                  <div className="preview-block">
                    <p>Vista previa de foto principal</p>
                    <img src={fotoPrincipalPreview} alt="Vista previa principal" className="preview-main" />
                  </div>
                ) : null}

                <label>
                  Galeria secundaria
                  <input type="file" name="fotos" accept="image/*" multiple onChange={handleTattooFileChange} />
                  <small className="helper-text">Hasta 12 imagenes extra por tatuaje para soportar catalogos mas amplios.</small>
                </label>

                {galleryPreviews.length > 0 ? (
                  <div className="preview-block">
                    <p>Galeria actual</p>
                    <div className="preview-grid">
                      {galleryPreviews.map((item, index) => (
                        <div className="preview-card" key={`${item.source}-${index}`}>
                          <img src={item.source} alt={`Preview ${index + 1}`} />
                          {!item.local && item.original ? (
                            <button type="button" className="danger-button" onClick={() => removeExistingImage(item.original)}>
                              Quitar
                            </button>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                <button type="submit" className="primary-button" disabled={savingTattoo}>
                  {savingTattoo ? 'Guardando...' : editTattooId ? 'Actualizar tatuaje' : 'Crear tatuaje'}
                </button>
              </form>

              <section className="admin-panel-card panel-scroll">
                <div className="section-heading compact">
                  <div>
                    <p className="eyebrow">Inventario visible</p>
                    <h2>Tatuajes publicados</h2>
                  </div>
                </div>
                <div className="admin-cards">
                  {tatuajes.map((tatuaje) => (
                    <article key={tatuaje.id} className="admin-card">
                      <img src={resolveImageUrl(tatuaje.fotoPrincipal)} alt={tatuaje.titulo} />
                      <div>
                        <h3>{tatuaje.titulo}</h3>
                        <p>${Number(tatuaje.precioFinal ?? tatuaje.precio).toFixed(2)}</p>
                        <p className="card-note">{tatuaje.category?.nombre || 'Sin categoria'}</p>
                        {tatuaje.ofertaVigente ? <span className="chip chip--promo">{tatuaje.ofertaEtiqueta || 'Oferta activa'}</span> : null}
                      </div>
                      <div className="admin-card__actions">
                        <button type="button" className="secondary-button" onClick={() => handleTattooEdit(tatuaje)}>
                          Editar
                        </button>
                        <button type="button" className="danger-button" onClick={() => handleTattooDelete(tatuaje.id)}>
                          Eliminar
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            </div>
          ) : null}

          {tab === 'promos' ? (
            <section className="admin-panel-card panel-scroll">
              <div className="section-heading compact">
                <div>
                  <p className="eyebrow">Promociones</p>
                  <h2>Ofertas activas o programadas</h2>
                </div>
              </div>
              <div className="stack-list">
                {activeOffers.length > 0 ? (
                  activeOffers.map((tatuaje) => (
                    <article key={tatuaje.id} className="stack-list-card">
                      <div>
                        <h3>{tatuaje.titulo}</h3>
                        <p className="card-note">{tatuaje.ofertaEtiqueta || 'Promocion sin etiqueta'}</p>
                        <p className="card-note">{tatuaje.category?.nombre || 'Sin categoria'}</p>
                      </div>
                      <div className="price-stack">
                        {tatuaje.precioOferta ? <span className="price-old">${Number(tatuaje.precio).toFixed(2)}</span> : null}
                        <strong>${Number(tatuaje.precioFinal ?? tatuaje.precio).toFixed(2)}</strong>
                      </div>
                      <button type="button" className="secondary-button" onClick={() => handleTattooEdit(tatuaje)}>
                        Editar promo
                      </button>
                    </article>
                  ))
                ) : (
                  <p className="status-message">No hay promociones activas o programadas.</p>
                )}
              </div>
            </section>
          ) : null}

          {tab === 'categorias' ? (
            <div className="admin-section-grid">
              <form className="admin-form admin-panel-card" onSubmit={handleCategorySubmit}>
                <div className="section-heading compact">
                  <div>
                    <p className="eyebrow">Categorias</p>
                    <h2>{editCategoryId ? 'Editar categoria' : 'Nueva categoria'}</h2>
                  </div>
                  {editCategoryId ? (
                    <button type="button" className="secondary-button" onClick={resetCategoryForm}>
                      Cancelar
                    </button>
                  ) : null}
                </div>

                <label>
                  Nombre
                  <input type="text" name="nombre" value={categoryForm.nombre} onChange={handleCategoryChange} required />
                </label>

                <label>
                  Slug
                  <input type="text" name="slug" value={categoryForm.slug} onChange={handleCategoryChange} placeholder="Se genera automaticamente si lo dejas vacio" />
                </label>

                <label>
                  Descripcion
                  <textarea name="descripcion" rows="4" value={categoryForm.descripcion} onChange={handleCategoryChange} />
                </label>

                <div className="form-split">
                  <label>
                    Orden visual
                    <input type="number" min="0" name="sortOrder" value={categoryForm.sortOrder} onChange={handleCategoryChange} />
                  </label>

                  <label className="checkbox-row checkbox-row--boxed">
                    <input type="checkbox" name="activa" checked={categoryForm.activa} onChange={handleCategoryChange} />
                    Categoria activa en el catalogo
                  </label>
                </div>

                <button type="submit" className="primary-button" disabled={savingCategory}>
                  {savingCategory ? 'Guardando...' : editCategoryId ? 'Actualizar categoria' : 'Crear categoria'}
                </button>
              </form>

              <section className="admin-panel-card panel-scroll">
                <div className="section-heading compact">
                  <div>
                    <p className="eyebrow">Mapa del catalogo</p>
                    <h2>Categorias creadas</h2>
                  </div>
                </div>
                <div className="stack-list">
                  {categories.map((category) => (
                    <article key={category.id} className="stack-list-card">
                      <div>
                        <h3>{category.nombre}</h3>
                        <p className="card-note">/{category.slug}</p>
                        <p className="card-note">{category.descripcion || 'Sin descripcion'}</p>
                      </div>
                      <div className="inline-actions">
                        <span className={`chip ${category.activa ? '' : 'chip--ghost'}`}>{category.activa ? 'Activa' : 'Oculta'}</span>
                        <button type="button" className="secondary-button" onClick={() => handleCategoryEdit(category)}>
                          Editar
                        </button>
                        <button type="button" className="danger-button" onClick={() => handleCategoryDelete(category.id)}>
                          Eliminar
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            </div>
          ) : null}

          {tab === 'estudio' ? (
            <div className="admin-section-grid">
              <form className="admin-form admin-panel-card" onSubmit={handleStudioSubmit}>
                <div className="section-heading compact">
                  <div>
                    <p className="eyebrow">Datos del estudio</p>
                    <h2>Informacion publica</h2>
                  </div>
                </div>

                <label>
                  Nombre del estudio
                  <input type="text" name="studioName" value={studioForm.studioName} onChange={handleStudioChange} required />
                </label>

                <label>
                  Slogan
                  <input type="text" name="slogan" value={studioForm.slogan} onChange={handleStudioChange} />
                </label>

                <label>
                  Sobre el estudio
                  <textarea name="aboutStudio" rows="5" value={studioForm.aboutStudio} onChange={handleStudioChange} />
                </label>

                <label>
                  Direccion
                  <input type="text" name="direccion" value={studioForm.direccion} onChange={handleStudioChange} />
                </label>

                <div className="form-split">
                  <label>
                    Instagram
                    <input type="url" name="instagramUrl" value={studioForm.instagramUrl} onChange={handleStudioChange} />
                  </label>
                  <label>
                    Facebook
                    <input type="url" name="facebookUrl" value={studioForm.facebookUrl} onChange={handleStudioChange} />
                  </label>
                </div>

                <div className="form-split">
                  <label>
                    WhatsApp publico
                    <input type="text" name="whatsappNumber" value={studioForm.whatsappNumber} onChange={handleStudioChange} />
                  </label>
                  <label>
                    Enlace de mapa
                    <input type="url" name="mapUrl" value={studioForm.mapUrl} onChange={handleStudioChange} />
                  </label>
                </div>

                <label>
                  Nombre del desarrollador
                  <input type="text" name="developerName" value={studioForm.developerName} onChange={handleStudioChange} />
                </label>

                <button type="submit" className="primary-button" disabled={savingStudio}>
                  {savingStudio ? 'Guardando...' : 'Actualizar estudio'}
                </button>
              </form>

              <section className="admin-panel-card panel-scroll">
                <div className="section-heading compact">
                  <div>
                    <p className="eyebrow">Vista publica</p>
                    <h2>Resumen del estudio</h2>
                  </div>
                </div>

                <article className="stack-list-card">
                  <div>
                    <h3>{studioForm.studioName}</h3>
                    <p className="card-note">{studioForm.slogan}</p>
                    <p className="card-note">{studioForm.aboutStudio}</p>
                  </div>
                </article>

                <article className="stack-list-card">
                  <div>
                    <h3>Ubicacion y enlaces</h3>
                    <p className="card-note">Direccion: {studioForm.direccion || 'Pendiente'}</p>
                    <p className="card-note">WhatsApp: {studioForm.whatsappNumber || 'Pendiente'}</p>
                    <p className="card-note">Desarrollador: {studioForm.developerName || 'Pendiente'}</p>
                  </div>
                </article>

                <article className="stack-list-card">
                  <div>
                    <h3>Tatuadores visibles</h3>
                    <p className="card-note">Marca a los admins tatuadores como visibles para que aparezcan en “Sobre nosotros”.</p>
                  </div>
                </article>
                <div className="stack-list">
                  {visibleArtists.map((artist) => (
                    <article key={artist.id} className="stack-list-card">
                      <div>
                        <h3>{artist.nombre}</h3>
                        <p className="card-note">{artist.publicBio || 'Sin bio publica'}</p>
                        <p className="card-note">{artist.telefonoPublico || 'Sin telefono publico'}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            </div>
          ) : null}

          {tab === 'admins' ? (
            <div className="admin-section-grid">
              <form className="admin-form admin-panel-card" onSubmit={handleAdminSubmit}>
                <div className="section-heading compact">
                  <div>
                    <p className="eyebrow">Usuarios del panel</p>
                    <h2>{editAdminId ? 'Editar usuario' : 'Nuevo usuario'}</h2>
                  </div>
                  {editAdminId ? (
                    <button type="button" className="secondary-button" onClick={resetAdminForm}>
                      Cancelar
                    </button>
                  ) : null}
                </div>

                <label>
                  Nombre
                  <input type="text" name="nombre" value={adminForm.nombre} onChange={handleAdminChange} required />
                </label>

                <div className="form-split">
                  <label>
                    Email
                    <input type="email" name="email" value={adminForm.email} onChange={handleAdminChange} required />
                  </label>
                  <label>
                    Password
                    <input type="password" name="password" value={adminForm.password} onChange={handleAdminChange} placeholder={editAdminId ? 'Solo si quieres cambiarla' : 'Password inicial'} />
                  </label>
                </div>

                <div className="form-split">
                  <label>
                    Rol interno
                    <select name="role" value={adminForm.role} onChange={handleAdminChange}>
                      <option value="admin">Admin</option>
                      <option value="superadmin">Superadmin</option>
                    </select>
                  </label>

                  <label>
                    Perfil publico
                    <select name="profileType" value={adminForm.profileType} onChange={handleAdminChange}>
                      <option value="admin">Admin interno</option>
                      <option value="tatuador">Tatuador</option>
                      <option value="desarrollador">Desarrollador</option>
                    </select>
                  </label>
                </div>

                <label className="checkbox-row checkbox-row--boxed">
                  <input type="checkbox" name="activo" checked={adminForm.activo} onChange={handleAdminChange} />
                  Usuario activo para entrar al panel
                </label>

                {adminForm.profileType !== 'desarrollador' ? (
                  <label className="checkbox-row checkbox-row--boxed">
                    <input type="checkbox" name="publicVisible" checked={adminForm.publicVisible} onChange={handleAdminChange} />
                    Mostrar este perfil en la web publica
                  </label>
                ) : null}

                <label>
                  Bio publica
                  <textarea name="publicBio" rows="4" value={adminForm.publicBio} onChange={handleAdminChange} placeholder="Ideal para tatuadores visibles en Sobre nosotros" />
                </label>

                <div className="form-split">
                  <label>
                    Instagram
                    <input type="url" name="instagramUrl" value={adminForm.instagramUrl} onChange={handleAdminChange} />
                  </label>
                  <label>
                    Facebook
                    <input type="url" name="facebookUrl" value={adminForm.facebookUrl} onChange={handleAdminChange} />
                  </label>
                </div>

                <div className="form-split">
                  <label>
                    Telefono publico
                    <input type="text" name="telefonoPublico" value={adminForm.telefonoPublico} onChange={handleAdminChange} />
                  </label>
                  <label>
                    Direccion publica
                    <input type="text" name="direccionPublica" value={adminForm.direccionPublica} onChange={handleAdminChange} />
                  </label>
                </div>

                <label>
                  Avatar URL
                  <input type="url" name="avatarUrl" value={adminForm.avatarUrl} onChange={handleAdminChange} />
                </label>

                <button type="submit" className="primary-button" disabled={savingAdmin}>
                  {savingAdmin ? 'Guardando...' : editAdminId ? 'Actualizar usuario' : 'Crear usuario'}
                </button>
              </form>

              <section className="admin-panel-card panel-scroll">
                <div className="section-heading compact">
                  <div>
                    <p className="eyebrow">Equipo del panel</p>
                    <h2>Usuarios administradores</h2>
                  </div>
                </div>
                <div className="stack-list">
                  {admins.map((admin) => (
                    <article key={admin.id} className="stack-list-card">
                      <div>
                        <h3>{admin.nombre}</h3>
                        <p className="card-note">{admin.email}</p>
                        <p className="card-note">{admin.profileType} · {admin.role}</p>
                        <p className="card-note">{admin.publicVisible ? 'Visible en web publica' : 'No visible en web publica'}</p>
                      </div>
                      <div className="inline-actions">
                        <span className={`chip ${admin.activo ? '' : 'chip--ghost'}`}>{admin.activo ? 'Activo' : 'Inactivo'}</span>
                        <button type="button" className="secondary-button" onClick={() => handleAdminEdit(admin)}>
                          Editar
                        </button>
                        <button type="button" className="danger-button" onClick={() => handleAdminDelete(admin.id)}>
                          Eliminar
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}

export default AdminPanel;
