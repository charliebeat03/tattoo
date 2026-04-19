import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const ADMIN_STORAGE_KEY = 'tattoo_admin_session';
const VISITOR_STORAGE_KEY = 'tattoo_visitor_id';
const FAVORITES_STORAGE_KEY = 'tattoo_favorite_ids';

export const api = axios.create({
  baseURL: `${API_URL}/api`,
});

api.interceptors.request.use((config) => {
  const session = getAdminSession();

  if (session?.token) {
    config.headers.Authorization = `Bearer ${session.token}`;
  }

  return config;
});

export const resolveImageUrl = (path) => {
  if (!path) {
    return '';
  }

  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  return `${API_URL}${path}`;
};

export const buildWhatsAppHref = (titulo, precio, whatsappNumber) => {
  const numero = String(whatsappNumber || '').replace(/\D/g, '');

  if (!numero) {
    return '';
  }

  const message = `Hola, quiero pedir una cita para el tatuaje \"${titulo}\" con precio de $${Number(precio).toFixed(2)}.`;
  return `https://wa.me/${numero}?text=${encodeURIComponent(message)}`;
};

export const getAdminSession = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = localStorage.getItem(ADMIN_STORAGE_KEY);
  return raw ? JSON.parse(raw) : null;
};

export const saveAdminSession = (session) => {
  localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(session));
};

export const clearAdminSession = () => {
  localStorage.removeItem(ADMIN_STORAGE_KEY);
};

export const getFavoriteTattooIds = () => {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = localStorage.getItem(FAVORITES_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((value) => Number.isInteger(Number(value))).map(Number) : [];
  } catch (_error) {
    return [];
  }
};

const syncFavoriteTattooIds = (ids) => {
  if (typeof window === 'undefined') {
    return ids;
  }

  localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(ids));
  window.dispatchEvent(new CustomEvent('tattoo-favorites-updated', { detail: ids }));
  return ids;
};

export const toggleFavoriteTattooId = (id) => {
  const numericId = Number(id);
  const currentIds = getFavoriteTattooIds();
  const nextIds = currentIds.includes(numericId)
    ? currentIds.filter((item) => item !== numericId)
    : [...currentIds, numericId];

  return syncFavoriteTattooIds(nextIds);
};

export const getVisitorId = () => {
  let visitorId = localStorage.getItem(VISITOR_STORAGE_KEY);

  if (!visitorId) {
    visitorId = `visitor-${crypto.randomUUID()}`;
    localStorage.setItem(VISITOR_STORAGE_KEY, visitorId);
  }

  return visitorId;
};

export const trackVisit = async (page) => {
  try {
    await api.post('/analytics/visit', {
      visitorId: getVisitorId(),
      page,
    });
  } catch (_error) {
    // Se ignora para no afectar la experiencia del catalogo.
  }
};

export const loginAdmin = async (credentials) => {
  const { data } = await api.post('/admin/auth/login', credentials);
  saveAdminSession(data);
  return data;
};

export const getCurrentAdmin = async () => {
  const { data } = await api.get('/admin/auth/me');
  return data.admin;
};

export const getDashboardStats = async () => {
  const { data } = await api.get('/analytics/dashboard');
  return data;
};

export const getPublicStudio = async () => {
  const { data } = await api.get('/studio');
  return data;
};

export const getAdminStudio = async () => {
  const { data } = await api.get('/studio/admin');
  return data;
};

export const updateStudio = async (payload) => {
  const { data } = await api.put('/studio/admin', payload);
  return data;
};

export const getAdmins = async () => {
  const { data } = await api.get('/admin/users');
  return data;
};

export const createAdminUser = async (payload) => {
  const { data } = await api.post('/admin/users', payload);
  return data;
};

export const updateAdminUser = async (id, payload) => {
  const { data } = await api.put(`/admin/users/${id}`, payload);
  return data;
};

export const deleteAdminUser = async (id) => {
  const { data } = await api.delete(`/admin/users/${id}`);
  return data;
};

export const getCategories = async () => {
  const { data } = await api.get('/categories');
  return data;
};

export const createCategory = async (payload) => {
  const { data } = await api.post('/categories', payload);
  return data;
};

export const updateCategory = async (id, payload) => {
  const { data } = await api.put(`/categories/${id}`, payload);
  return data;
};

export const deleteCategory = async (id) => {
  const { data } = await api.delete(`/categories/${id}`);
  return data;
};

export const getTatuajes = async (params = {}) => {
  const { data } = await api.get('/tatuajes', { params });
  return data;
};

export const getTatuaje = async (id) => {
  const { data } = await api.get(`/tatuajes/${id}`);
  return data;
};

export const createTatuaje = async (formData) => {
  const { data } = await api.post('/tatuajes', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return data;
};

export const updateTatuaje = async (id, formData) => {
  const { data } = await api.put(`/tatuajes/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return data;
};

export const deleteTatuaje = async (id) => {
  const { data } = await api.delete(`/tatuajes/${id}`);
  return data;
};
