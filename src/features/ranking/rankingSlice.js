import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// La URL base es un placeholder aquí. En tu proyecto real, esto debe provenir del entorno.
const API_BASE = "https://back-padelpro.onrender.com/"; 
const GLOBAL_RANKING_CATEGORIES_URL = `${API_BASE}api/ranking-global-categorias`;

// Definición del orden de categorías (Mantenido de la lógica anterior)
const CATEGORY_ORDER = [
  "3RA LIBRE", "4TA LIBRE", "5TA LIBRE", "6TA LIBRE", "7MA LIBRE","8VA LIBRE",
  "4TA DAMAS", "5TA DAMAS", "6TA DAMAS", "7MA DAMAS",
  "AJPP"
];

// Función auxiliar para obtener el índice de orden
const getCategoryOrderIndex = (categoryName) => {
  const index = CATEGORY_ORDER.findIndex(name => name === categoryName?.toUpperCase());
  return index !== -1 ? index : CATEGORY_ORDER.length + 1; 
};


// Thunk para cargar el ranking global y categorizado
export const fetchCategorizedRanking = createAsyncThunk(
  'ranking/fetchCategorizedRanking',
  async (_, { rejectWithValue }) => {
    try {
      // 1. Una SOLA petición al nuevo endpoint optimizado
      // Ya no necesitamos ?populate=... porque el controlador se encarga de todo
      const response = await fetch(`${GLOBAL_RANKING_CATEGORIES_URL}`);
      
      if (!response.ok) {
        throw new Error('Error al obtener el ranking unificado.');
      }
      
      const result = await response.json();

      // 2. Mapear al formato que espera tu estado de Redux
      const orderedCategories = {};
      
      // El resultado ya viene con 'name' y 'players' procesados desde Strapi
      result.data
        .sort((a, b) => getCategoryOrderIndex(a.name) - getCategoryOrderIndex(b.name))
        .forEach(category => {
          orderedCategories[category.id] = category;
        });

      return orderedCategories;

    } catch (error) {
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
  reducers: {
    resetRankingState: (state) => {
        state.data = {};
        state.loading = 'idle';
        state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategorizedRanking.pending, (state) => {
        // Solo cambiar a 'pending' si el estado no es 'succeeded' (para no perder datos mientras se carga en segundo plano)
        if (state.loading === 'idle' || state.loading === 'failed') {
            state.loading = 'pending';
        }
      })
      .addCase(fetchCategorizedRanking.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        state.data = action.payload;
        state.error = null;
      })
      .addCase(fetchCategorizedRanking.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload || action.error.message;
      });
  },
});

export default rankingSlice.reducer;
