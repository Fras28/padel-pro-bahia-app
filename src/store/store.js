// src/store/store.js
import { configureStore } from '@reduxjs/toolkit';
import rankingReducer from '../features/ranking/rankingSlice';
import playersReducer from '../features/players/playersSlice';


export const store = configureStore({
  reducer: {
    ranking: rankingReducer,
    players: playersReducer,
  },
});