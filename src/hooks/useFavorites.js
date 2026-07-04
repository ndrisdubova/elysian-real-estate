import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getFavorites, toggleFavorite as toggleFavoriteApi } from '../utils/storage';

export function useFavorites() {
  const { currentUser } = useAuth();
  const [favorites, setFavorites] = useState([]);

  const refresh = useCallback(() => {
    getFavorites(currentUser?.id).then(setFavorites);
  }, [currentUser?.id]);

  useEffect(() => {
    refresh();
    window.addEventListener('favoritesUpdated', refresh);
    return () => window.removeEventListener('favoritesUpdated', refresh);
  }, [refresh]);

  const toggleFavorite = useCallback(async (propertyId) => {
    if (!currentUser) return;
    const updated = await toggleFavoriteApi(currentUser.id, propertyId);
    setFavorites(updated);
  }, [currentUser]);

  return { favorites, toggleFavorite };
}
