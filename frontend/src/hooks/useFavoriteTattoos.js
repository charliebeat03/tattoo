import { useEffect, useMemo, useState } from 'react';
import { getFavoriteTattooIds, toggleFavoriteTattooId } from '../services/api';

function useFavoriteTattoos() {
  const [favoriteIds, setFavoriteIds] = useState(() => getFavoriteTattooIds());

  useEffect(() => {
    const syncFavorites = (event) => {
      if (Array.isArray(event?.detail)) {
        setFavoriteIds(event.detail);
        return;
      }

      setFavoriteIds(getFavoriteTattooIds());
    };

    window.addEventListener('tattoo-favorites-updated', syncFavorites);

    return () => {
      window.removeEventListener('tattoo-favorites-updated', syncFavorites);
    };
  }, []);

  const favoriteSet = useMemo(() => new Set(favoriteIds), [favoriteIds]);

  return {
    favoriteIds,
    favoriteSet,
    totalFavorites: favoriteIds.length,
    isFavorite: (id) => favoriteSet.has(id),
    toggleFavorite: (id) => {
      const nextFavorites = toggleFavoriteTattooId(id);
      setFavoriteIds(nextFavorites);
      return nextFavorites;
    },
  };
}

export default useFavoriteTattoos;
