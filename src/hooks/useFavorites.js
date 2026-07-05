import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getFavorites, toggleFavorite as toggleFavoriteApi } from '../utils/storage';

const FAVORITES_EVENT = 'favoritesUpdated';

export function useFavorites() {
  const { currentUser } = useAuth();
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    if (!currentUser) { setFavorites([]); return; }
    getFavorites(currentUser.id).then(setFavorites);

    const onUpdate = (e) => {
      if (e.detail?.userId === currentUser.id) setFavorites(e.detail.favorites);
    };
    window.addEventListener(FAVORITES_EVENT, onUpdate);
    return () => window.removeEventListener(FAVORITES_EVENT, onUpdate);
  }, [currentUser?.id]);

  const toggleFavorite = useCallback((propertyId) => {
    if (!currentUser) return;
    const userId = currentUser.id;
    const prev = favorites;
    const updated = prev.includes(propertyId)
      ? prev.filter(id => id !== propertyId)
      : [...prev, propertyId];

    setFavorites(updated);
    window.dispatchEvent(new CustomEvent(FAVORITES_EVENT, { detail: { userId, favorites: updated } }));

    toggleFavoriteApi(userId, propertyId, prev).catch(() => {
      setFavorites(prev);
      window.dispatchEvent(new CustomEvent(FAVORITES_EVENT, { detail: { userId, favorites: prev } }));
    });
  }, [currentUser, favorites]);

  return { favorites, toggleFavorite };
}
