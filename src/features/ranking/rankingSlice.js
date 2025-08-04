// src/features/ranking/rankingSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_BASE = import.meta.env.VITE_API_BASE;
const CATEGORIZED_PLAYERS_API_URL = `${API_BASE}api/categorias?populate=jugadors.club.logo&populate=jugadors.pareja_drive.partidos_ganados&populate=jugadors.pareja_drive.partidos_perdidos&populate=jugadors.estadisticas&populate=jugadors.pareja_revez.partidos_ganados&populate=jugadors.pareja_revez.partidos_perdidos&sort=nombre:asc&pagination[pageSize]=1000`;

// El thunk se encargará de la petición asíncrona y del pre-procesamiento de los datos.
export const fetchCategorizedRanking = createAsyncThunk(
  'ranking/fetchCategorizedRanking',
  async () => {
    const response = await fetch(CATEGORIZED_PLAYERS_API_URL);
    if (!response.ok) {
      throw new Error('Failed to fetch ranking data');
    }
    const data = await response.json();

    const tempCategorizedRanking = {};
    data.data.forEach((category) => {
      const categoryName = category?.nombre;
      const sortedPlayers = (category.jugadors || []).sort(
        (a, b) => (b.rankingGeneral || 0) - (a.rankingGeneral || 0)
      );
      tempCategorizedRanking[category.id] = {
        name: categoryName,
        players: sortedPlayers,
      };
    });
    return tempCategorizedRanking;
  }
);

// El slice define cómo el estado cambia en respuesta a las acciones.
const rankingSlice = createSlice({
  name: 'ranking',
  initialState: {
    data: {},
    loading: 'idle', // 'idle' | 'pending' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategorizedRanking.pending, (state) => {
        state.loading = 'pending';
      })
      .addCase(fetchCategorizedRanking.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        state.data = action.payload;
      })
      .addCase(fetchCategorizedRanking.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.error.message;
      });
  },
});

export default rankingSlice.reducer;