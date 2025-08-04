// src/features/players/playersSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_BASE = import.meta.env.VITE_API_BASE;

// Thunk para buscar jugadores con paginación y filtro
export const fetchPlayersByPageAndTerm = createAsyncThunk(
  'players/fetchPlayersByPageAndTerm',
  async ({ page, term }, { rejectWithValue }) => {
    try {
      const populateParams = [
          'club.logo',
          'estadisticas',
          'categoria',
          'torneos',
          'pareja_drive',
          'pareja_revez'
      ];
  
      const queryParams = new URLSearchParams({
          'pagination[page]': page,
          'pagination[pageSize]': 25,
      });
  
      populateParams.forEach(param => {
          queryParams.append('populate', param);
      });
  
      if (term) {
          queryParams.append('filters[$or][0][nombre][$containsi]', term);
          queryParams.append('filters[$or][1][apellido][$containsi]', term);
      }
  
      const PLAYERS_API_URL = `${API_BASE}api/jugadors?${queryParams.toString()}`;
  
      const response = await fetch(PLAYERS_API_URL);
      if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const playersSlice = createSlice({
  name: 'players',
  initialState: {
    players: [],
    meta: {
      pagination: {
        page: 1,
        pageSize: 25,
        pageCount: 1,
        total: 0,
      },
    },
    loading: 'idle', // 'idle' | 'pending' | 'succeeded' | 'failed'
    error: null,
    searchTerm: '',
    currentPage: 1,
  },
  reducers: {
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
      state.currentPage = 1; // Reset a la página 1 al buscar
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlayersByPageAndTerm.pending, (state) => {
        state.loading = 'pending';
        state.error = null;
      })
      .addCase(fetchPlayersByPageAndTerm.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        state.players = action.payload.data;
        state.meta = action.payload.meta;
      })
      .addCase(fetchPlayersByPageAndTerm.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload || action.error.message;
        state.players = [];
        state.meta.pagination.pageCount = 1;
      });
  },
});

export const { setSearchTerm, setCurrentPage } = playersSlice.actions;
export default playersSlice.reducer;