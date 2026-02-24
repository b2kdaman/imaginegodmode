import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface FavoritePrompt {
  id: string;
  text: string;
  rating: number;
  packId: string;
  packName: string;
  postId: string;
  createdAt: number;
}

interface FavoritesState {
  favorites: FavoritePrompt[];
  addFavorite: (prompt: Omit<FavoritePrompt, 'id' | 'createdAt'>) => void;
  removeFavorite: (id: string) => void;
  isFavorite: (text: string) => boolean;
  getFavorites: () => FavoritePrompt[];
  clearFavorites: () => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],

      addFavorite: (prompt) => {
        const id = `fav-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        set((state) => ({
          favorites: [
            ...state.favorites,
            {
              ...prompt,
              id,
              createdAt: Date.now(),
            },
          ],
        }));
      },

      removeFavorite: (id) => {
        set((state) => ({
          favorites: state.favorites.filter((f) => f.id !== id),
        }));
      },

      isFavorite: (text) => {
        const { favorites } = get();
        return favorites.some((f) => f.text === text);
      },

      getFavorites: () => {
        return get().favorites;
      },

      clearFavorites: () => {
        set({ favorites: [] });
      },
    }),
    {
      name: 'imaginegodmode-favorites',
    }
  )
);
