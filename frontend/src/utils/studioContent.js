export const DEFAULT_DEVELOPER_NAME = 'Carlos Alejandro Arcia Miranda';
export const DEFAULT_ARTIST_LABEL = 'el equipo del estudio';

const DEVELOPER_PLACEHOLDERS = new Set(['', 'Cuenta desarrollador', 'Desarrollador principal']);

export const resolveDeveloperName = (value) => {
  const normalized = String(value || '').trim();
  return DEVELOPER_PLACEHOLDERS.has(normalized) ? DEFAULT_DEVELOPER_NAME : normalized;
};

export const resolveLeadArtistName = (artists = []) => {
  const visibleArtist = artists.find((artist) => String(artist?.nombre || '').trim());
  return visibleArtist?.nombre || DEFAULT_ARTIST_LABEL;
};
