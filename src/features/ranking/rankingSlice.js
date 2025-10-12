// src/features/ranking/rankingSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_BASE = import.meta.env.VITE_API_BASE;
// Nueva URL para obtener la lista de todas las categorías de ranking global
const GLOBAL_RANKING_CATEGORIES_URL = `${API_BASE}api/ranking-global-categorias`;

// El thunk se encargará de la petición asíncrona y del pre-procesamiento de los datos.
export const fetchCategorizedRanking = createAsyncThunk(
  'ranking/fetchCategorizedRanking',
  async (_, { rejectWithValue }) => {
    try {
      // 1. Obtener la lista de todos los rankings globales (categorías)
      const response = await fetch(GLOBAL_RANKING_CATEGORIES_URL);
      if (!response.ok) {
        throw new Error('Failed to fetch global ranking categories list');
      }
      const categoriesData = await response.json();

      const tempCategorizedRanking = {};

      // 2. Iterar sobre las categorías para obtener los detalles de cada ranking
      for (const category of categoriesData.data) {
        // Asumiendo que el nombre de la categoría está en 'nombre' y el ID de detalle en 'documentId'
        const categoryDocumentId = category?.documentId;
        const categoryName = category?.nombre;

        if (!categoryDocumentId) continue; // Saltar si falta el documentId

        // URL para obtener los detalles de una categoría específica con jugadores
        const DETAIL_URL = `${GLOBAL_RANKING_CATEGORIES_URL}/${categoryDocumentId}?populate=entradasRankingGlobal.jugador`;

        const detailResponse = await fetch(DETAIL_URL);
        if (!detailResponse.ok) {
          console.error(`Failed to fetch ranking detail for ${categoryName}`);
          continue; // Continuar con la siguiente categoría si falla una
        }
        const detailData = await detailResponse.json();

        // 3. Procesar los datos de la categoría detallada
        const rankingEntries = detailData.data?.entradasRankingGlobal || [];

        // Mapear y clasificar las entradas (jugadores) por puntos globales
        const sortedPlayers = rankingEntries
          .map(entry => ({
            // Los campos 'posicionGlobal' y 'puntosGlobales' están directamente en la entrada del ranking
            posicionGlobal: entry.posicionGlobal,
            puntosGlobales: entry.puntosGlobales || 0,
            // Los datos del jugador están anidados en 'jugador'
            ...entry.jugador,
            // Sobreescribir rankingGeneral con puntosGlobales para usarlo en la UI existente
            rankingGeneral: entry.puntosGlobales || 0, 
            
            // Si quieres usar el ID de la entrada de ranking:
            rankingEntryId: entry.id, 
            
            // Mapear los campos anidados del jugador (si existen)
            id: entry.jugador?.id,
            documentId: entry.jugador?.documentId,
            nombre: entry.jugador?.nombre,
            apellido: entry.jugador?.apellido,
            historialRanking: entry.jugador?.historialRanking || [],
            // Aquí puedes agregar más campos anidados del jugador si los necesitas en la vista
          }))
          .sort((a, b) => b.rankingGeneral - a.rankingGeneral); // Ordenar de mayor a menor puntos

        // Asignar los datos al objeto temporal
        tempCategorizedRanking[category.id] = {
          name: categoryName,
          players: sortedPlayers,
        };
      }

      return tempCategorizedRanking;
    } catch (error) {
      // Devolver un error legible si la API falla
      return rejectWithValue(error.message);
    }
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
