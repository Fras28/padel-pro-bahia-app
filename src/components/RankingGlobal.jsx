import React, { useEffect, useState, useCallback } from "react";
import Dternera from "../assets/DeTernera.png";
import DonAlf from "../assets/donalf.jpg";
import Morton from "../assets/morton.png";
import Rucca from "../assets/ruca.png";
import PadelPro from "../assets/PadelProArg.png";

// =========================================================================
// FUNCIÓN DE UTILIDAD AÑADIDA
// =========================================================================
/**
 * Trunca una cadena de texto a una longitud máxima y añade "..." si es más larga.
 * @param {string} name - La cadena a truncar.
 * @param {number} maxLength - La longitud máxima (por defecto 16).
 * @returns {string} El nombre truncado o el nombre original.
 */
const truncateName = (name, maxLength = 16) => {
    if (!name) return 'N/A';
    const trimmedName = String(name).trim(); // Asegurarse de que es una cadena
    if (trimmedName.length <= maxLength) {
        return trimmedName;
    }
    // Trunca, elimina espacios finales que queden del truncado y añade "..."
    return trimmedName.substring(0, maxLength).trim() + '...';
};
// =========================================================================


// --- IMPLEMENTACIÓN DE REDUX DENTRO DEL COMPONENTE (MOCK) ---
// Usaremos un patrón de estado simple que simula la persistencia de Redux Toolkit.
// ESTA ES LA CLAVE PARA QUE LOS DATOS NO SE RECARGUEN EN CADA VISITA.

// Variables y lógica del rankingSlice.js
const API_BASE = import.meta.env.VITE_API_BASE; 
const GLOBAL_RANKING_CATEGORIES_URL = `${API_BASE}api/ranking-global-categorias`;

// Años disponibles para el selector
const AVAILABLE_YEARS = [2026, 2025];
const DEFAULT_YEAR = new Date().getFullYear(); // Usa el año actual por defecto

// ********************************************
// CORRECCIÓN FINAL: Orden de categorías garantizado (3RA a 8VA Libre)
// ********************************************
const CATEGORY_ORDER = [
  "3RA LIBRE", "4TA LIBRE", "5TA LIBRE", "6TA LIBRE", "7MA LIBRE", "8VA LIBRE", // Orden secuencial
  "4TA DAMAS", "5TA DAMAS", "6TA DAMAS", "7MA DAMAS",
  "AJPP" 
];

const getCategoryOrderIndex = (categoryName) => {
  // Limpiamos el nombre: mayúsculas, quitamos espacios al inicio/fin, y comparamos.
  const cleanName = categoryName?.toUpperCase().trim();
  const index = CATEGORY_ORDER.findIndex(name => name === cleanName);
  return index !== -1 ? index : CATEGORY_ORDER.length + 1; 
};

// --- ESTADO GLOBAL SIMULADO (caché por año) ---
const globalRankingStateByYear = {};
let setGlobalStateUpdater = null;
let currentYear = DEFAULT_YEAR;

const getInitialStateForYear = () => ({
    data: {},
    loading: 'idle',
    error: null,
    lastUpdated: null,
});

const dispatch = (action, year) => {
    if (!setGlobalStateUpdater) return;
    if (!globalRankingStateByYear[year]) {
        globalRankingStateByYear[year] = getInitialStateForYear();
    }
    const next = { ...globalRankingStateByYear[year] };

    if (action.type === 'ranking/fetchCategorizedRanking/pending') {
        if (next.loading === 'idle' || next.loading === 'failed') {
            next.loading = 'pending';
        }
    } else if (action.type === 'ranking/fetchCategorizedRanking/fulfilled') {
        next.loading = 'succeeded';
        next.data = action.payload.categories;
        next.lastUpdated = action.payload.lastUpdated;
        next.error = null;
    } else if (action.type === 'ranking/fetchCategorizedRanking/rejected') {
        next.loading = 'failed';
        next.error = action.payload;
    }

    globalRankingStateByYear[year] = next;
    if (year === currentYear) {
        setGlobalStateUpdater({ ...next });
    }
};

// Thunk con filtro por campo anio (biginteger en Strapi)
const fetchCategorizedRanking = (year = DEFAULT_YEAR) => async () => {
  dispatch({ type: 'ranking/fetchCategorizedRanking/pending' }, year);
  try {
      const url = `${GLOBAL_RANKING_CATEGORIES_URL}?filters[anio][$eq]=${year}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error('Error al obtener el ranking.');
      
      const result = await response.json();

      const orderedCategories = {};
      result.data
          .sort((a, b) => getCategoryOrderIndex(a.name) - getCategoryOrderIndex(b.name))
          .forEach(category => {
              orderedCategories[category.id] = category;
          });

      // Tomar la fechaActualizacion más reciente entre las categorías devueltas
      const allDates = result.data
          .map(cat => cat.fechaActualizacion)
          .filter(Boolean)
          .map(d => new Date(d));
      const lastUpdated = allDates.length > 0
          ? new Date(Math.max(...allDates)).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
          : null;

      dispatch({ type: 'ranking/fetchCategorizedRanking/fulfilled', payload: { categories: orderedCategories, lastUpdated } }, year);
  } catch (error) {
      dispatch({ type: 'ranking/fetchCategorizedRanking/rejected', payload: error.message }, year);
  }
};

// --- FIN IMPLEMENTACIÓN DE REDUX MOCK ---


// --- COMPONENTES INLINE ---

// 1. PlayerDetailModal (Integrado)
const getInitials = (nombre, apellido) => {
  const firstInitial = nombre ? nombre.charAt(0) : '';
  const lastInitial = apellido ? apellido.charAt(0) : '';
  return `${firstInitial}${lastInitial}`.toUpperCase();
};

const clubStyles = {
  8: { 
    cardBg: 'bg-gray-900',
    cardBorder: 'border-green-500', 
    titleColor: 'text-green-400',
    accentColor: 'text-yellow-400', 
    statBlockBg: 'bg-gray-800',
    statBlockBorder: 'border-green-700',
    textColor: 'text-gray-100',
    initialBg: 'bg-green-600',
    winRateBg: 'bg-green-800',
    clubNameColor: 'text-green-200',
    playerTitleColor: 'text-yellow-400', 
  },
  12: { 
    cardBg: 'bg-gray-900',
    cardBorder: 'border-red-500', 
    titleColor: 'text-red-500',
    accentColor: 'text-yellow-500',
    statBlockBg: 'bg-gray-800',
    statBlockBorder: 'border-red-700',
    textColor: 'text-gray-100',
    initialBg: 'bg-red-600',
    winRateBg: 'bg-red-800',
    clubNameColor: 'text-red-200',
    playerTitleColor: 'text-yellow-500',
  },
  1: { 
    cardBg: 'bg-gray-900',
    cardBorder: 'border-pink-500', 
    titleColor: 'text-pink-400',
    accentColor: 'text-purple-400',
    statBlockBg: 'bg-gray-800',
    statBlockBorder: 'border-pink-700',
    textColor: 'text-gray-100',
    initialBg: 'bg-pink-600',
    winRateBg: 'bg-pink-800',
    clubNameColor: 'text-pink-200',
    playerTitleColor: 'text-purple-400',
  },
  default: { 
    cardBg: 'bg-gray-800',
    cardBorder: 'border-gray-600',
    titleColor: 'text-gray-100',
    accentColor: 'text-blue-400',
    statBlockBg: 'bg-gray-700',
    statBlockBorder: 'border-gray-500',
    textColor: 'text-gray-200',
    initialBg: 'bg-blue-600',
    winRateBg: 'bg-blue-800',
    clubNameColor: 'text-gray-200',
    playerTitleColor: 'text-blue-400',
  },
};


const PlayerDetailModal = ({ player, onClose }) => {
  if (!player) {
    return null;
  }

  const cleanPlayerName = player?.nombre?.replace(/-\s*\w+$/, '').trim() || 'Jugador Desconocido';
  
  const stats = player?.estadisticas || {
    partidosJugados: 0,
    partidosGanados: 0,
    torneosJugados: 0,
    torneosGanados: 0,
    partidosCuartosRonda: 0, 
  };

  const {
    partidosJugados,
    partidosGanados,
    torneosJugados,
    torneosGanados,
    partidosCuartosRonda, 
  } = stats;

  const winRate = partidosJugados > 0 ? ((partidosGanados / partidosJugados) * 100).toFixed(2) : '0.00';
  const style = clubStyles[player.club?.id] || clubStyles.default;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black bg-opacity-70`} onClick={onClose}>
      <div
        className={`relative ${style.cardBg} ${style.cardBorder} border-4 rounded-xl shadow-2xl p-6 w-full max-w-sm sm:max-w-md mx-auto flex flex-col items-center justify-between overflow-hidden`}
        onClick={(e) => e.stopPropagation()} 
      >
        <button onClick={onClose} className={`absolute top-4 right-4 text-gray-400 hover:text-white transition-colors duration-200 z-50`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Player Name */}
        <h2 className={`text-2xl sm:text-2xl font-extrabold ${style.titleColor} mb-2 text-left z-10 mt-4`}>
          {cleanPlayerName} {player?.apellido}
        </h2>

        {/* Club Logo OR Name */}
        {player?.club ? ( 
          player.club?.logo?.url ? ( 
            <div className="mb-4 flex justify-center z-10"> 
              <img
                src={player?.club?.logo?.url}
                alt={`${player?.club?.nombre} Logo`}
                className="h-16 w-16 sm:h-20 sm:w-20 object-contain rounded-full shadow-md bg-black" 
                onError={(e) => { e.currentTarget.style.display = 'none'; }} 
              />
            </div>
          ) : ( 
            <p className={`text-base ${style.clubNameColor} mb-4 text-center z-10`}>
              Club: {player?.club?.nombre}
            </p>
          )
        ) : null} 

        {/* Ranking General & Win Rate Block */}
        <div className="grid grid-cols-2 gap-3 w-full text-center mb-6 z-10">
          <div className={`p-3 rounded-lg ${style.winRateBg} ${style.cardBorder} border shadow-inner flex flex-col justify-center items-center`}>
            <span className={`text-base sm:text-lg font-semibold ${style.playerTitleColor}`}>Pts Globales</span>
            <span className={`text-2xl sm:text-3xl font-extrabold ${style.accentColor}`}>{player?.puntosGlobales || player?.rankingGeneral || 'N/A'}</span>
          </div>
          <div className={`p-3 rounded-lg ${style.winRateBg} ${style.cardBorder} border shadow-inner flex flex-col justify-center items-center`}>
            <span className={`text-base sm:text-lg font-semibold ${style.playerTitleColor}`}>Win Rate</span>
            <span className={`text-2xl sm:text-3xl font-extrabold ${winRate === '0.00' ? style.textColor : style.accentColor}`}>{winRate}%</span>
          </div>
        </div>

        {/* Stats Blocks (Partidos Jugados, Ganados, Torneos) */}
        <div className="grid grid-cols-2 gap-3 w-full text-center mt-auto z-10">
          {[
            { label: 'Partidos Jugados', value: partidosJugados },
            { label: 'Partidos Ganados', value: partidosGanados },
            { label: 'Torneos Jugados', value: torneosJugados },
            { label: 'Cuartos', value: partidosCuartosRonda || 0 }, 
            { label: 'Torneos Ganados', value: torneosGanados },
          ].map(stat => (
            <div
              key={stat.label}
              className={`p-2 rounded-lg ${style.statBlockBg} ${style.statBlockBorder} border shadow-inner ${
                stat.label === 'Torneos Ganados' ? 'col-span-2' : ''
              }`}
            >
              <p className={`text-sm sm:text-base font-medium ${style.textColor}`}>{stat.label}</p>
              <p className={`text-lg sm:text-xl font-bold ${style.accentColor}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Club Logo as Background */}
        {player.club?.logo?.url && (
          <img
            src={player.club.logo.url} 
            alt={`${player.club.nombre} Logo`}
            className="absolute bottom-4 left-1/2 transform -translate-x-1/2 p-2 h-40 sm:h-48 w-auto object-contain opacity-10 rounded-full z-0"
            onError={(e) => { e.currentTarget.style.display = 'none'; }} 
          />
        )}
      </div>
    </div>
  );
};


// 2. Componente SponsorBanner completo (Integrado)
const SponsorBanner = ({ sponsorImages }) => {
    const duplicatedImages = [...sponsorImages, ...sponsorImages, ...sponsorImages];

    return (
        <div className="mb-6">
            <style>
                {`
                    @keyframes marquee {
                        0% { transform: translateX(0); }
                        100% { transform: translateX(-50%); }
                    }
                    .marquee-container {
                        display: flex;
                        width: fit-content;
                        animation: marquee 30s linear infinite;
                        will-change: transform;
                    }
                    .marquee-item {
                        flex-shrink: 0;
                        margin-right: 2rem;
                    }
                    .marquee-item img {
                        height: 60px;
                        width: auto;
                        object-fit: contain;
                        filter: grayscale(100%); 
                        transition: filter 0.3s ease-in-out; 
                    }
                    .marquee-item img.blurred {
                        filter: blur(5px) grayscale(100%); 
                    }
                    @media (max-width: 768px) {
                        .marquee-item {
                            margin-right: 1rem;
                        }
                        .marquee-item img {
                            height: 40px;
                        }
                        .marquee-container {
                            animation-duration: 20s;
                        }
                    }
                    .marquee-item img:hover:not(.blurred) { 
                        filter: grayscale(0%); 
                    }
                `}
            </style>
            <div className="bg-gradient-to-r from-gray-100 to-gray-200 py-4 rounded-lg shadow-inner overflow-hidden">
                <div className="marquee-container">
                    {duplicatedImages.map((sponsor, index) => (
                        <div key={index} className="marquee-item">
                            <a href={sponsor.url} target="_blank" rel="noopener noreferrer">
                                <img
                                    src={sponsor.src}
                                    alt={`Sponsor ${index}`}
                                    className={`rounded-md ${sponsor.blurred ? 'blurred' : ''}`}
                                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/100x50/CCCCCC/666666?text=Error'; }}
                                />
                            </a>
                        </div>
                    ))}
                    {sponsorImages.length === 0 && (
                        <p key="no-sponsors" className="flex-shrink-0 text-center text-gray-500 text-xs self-center ml-4">No hay sponsors disponibles en este momento.</p>
                    )}
                </div>
            </div>
        </div>
    );
};


// 3. Placeholder para SkeletonRankingTable
const SkeletonRankingTable = () => (
  <div className="animate-pulse p-4 space-y-6">
    {[...Array(3)].map((_, catIndex) => (
      <div key={catIndex} className="space-y-3">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-100 h-10 w-full"></div>
          {[...Array(5)].map((_, index) => (
            <div key={index} className="flex items-center space-x-4 p-3 border-t">
              <div className="h-4 bg-gray-200 rounded w-8"></div>
              <div className="h-4 bg-gray-200 rounded w-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-12 ml-auto"></div>
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

// Función de utilidad para manejar la animación simple (reemplaza react-countup)
const AnimatedPoints = ({ points }) => {
    return <span className="font-bold">{points}</span>;
};


// --- COMPONENTE PRINCIPAL ---

function RankingGlobal() {
  const [selectedYear, setSelectedYear] = useState(DEFAULT_YEAR);

  const [reduxState, setReduxState] = useState(() => {
    if (!globalRankingStateByYear[DEFAULT_YEAR]) {
      globalRankingStateByYear[DEFAULT_YEAR] = getInitialStateForYear();
    }
    return { ...globalRankingStateByYear[DEFAULT_YEAR] };
  });

  const categorizedRanking = reduxState.data;
  const loading = reduxState.loading;
  const error = reduxState.error;
  const lastUpdated = reduxState.lastUpdated;

  // Registrar el actualizador global al montar
  useEffect(() => {
    setGlobalStateUpdater = setReduxState;
    return () => { setGlobalStateUpdater = null; };
  }, []);

  // Al cambiar de año: sincronizar estado con el caché
  useEffect(() => {
    currentYear = selectedYear;
    if (!globalRankingStateByYear[selectedYear]) {
      globalRankingStateByYear[selectedYear] = getInitialStateForYear();
    }
    setReduxState({ ...globalRankingStateByYear[selectedYear] });
  }, [selectedYear]);

  // URLs de imágenes reales simuladas para los sponsors (usando PLACEHOLDERS)
  const sponsorImages = [
    { src: Dternera, url: "https://www.deternera.com.ar/", blurred: false },
    {
      src: DonAlf,
      url: "https://www.instagram.com/donalfredocentro/",
      blurred: false,
    },
    { src: Morton, url: "https://www.morton.com.ar/", blurred: false },
    { src: Rucca, url: "https://www.ruccabahia.com/", blurred: false },
  ];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  // Disparar fetch si el año no tiene datos cargados
  useEffect(() => {
    if (loading === 'idle' || loading === 'failed') {
      fetchCategorizedRanking(selectedYear)();
    }
  }, [loading, selectedYear]);

  const openPlayerModal = (playerData) => {
    setSelectedPlayer(playerData);
    setIsModalOpen(true);
  };

  const closePlayerModal = () => {
    setIsModalOpen(false);
    setSelectedPlayer(null);
  };

  // Función auxiliar para determinar si el jugador tiene una racha de 4 o más partidos ganados
  const getFireIcon = (historial) => {
    if (!historial || historial.length === 0) return null;
    const historialOrdenado = [...historial].sort(
        (a, b) => new Date(b.fecha) - new Date(a.fecha)
    );
    let consecutiveWins = 0;
    for (const item of historialOrdenado) {
        if (item.esGanador === true) {
            consecutiveWins++;
        } else {
            break;
        }
    }
    if (consecutiveWins >= 4) {
        return <span className="text-orange-500 ml-1 text-base leading-none">🔥</span>;
    }
    return null;
  };


// Función principal para determinar la insignia según la lógica definida
const getInsignia = (player) => {
  const historial = player?.historialRanking; 

  if (!historial || historial.length === 0) return null;

  const historialOrdenado = [...historial].sort(
    (a, b) => new Date(b.fecha) - new Date(a.fecha)
  );
  
  const ultimoResultado = historialOrdenado[0];
  const fireIcon = getFireIcon(historial); 
  let mainInsignia = null; 

  // --- LÓGICA DE LOGRO PRINCIPAL (Prioridad por Fecha) ---
  if (ultimoResultado) {
    const { ronda, esGanador } = ultimoResultado;

    if ((ronda === "Final" && !esGanador) || ronda === "Semifinal") {
      mainInsignia = <span className="text-green-500 ml-1 text-base leading-none">▲</span>;
    }
    else if (ronda === "Cuartos" || ronda === "Octavos" || ronda === "16avos") { 
      mainInsignia = <span className="text-yellow-400 ml-1 text-base leading-none">◆</span>;
    }
  }

  // 2. PRIORIDAD MEDIA: Corona Histórica
  if (!mainInsignia) {
    const fueCampeon = historial.some(
      (item) => item.ronda === "Final" && item.esGanador
    );
    if (fueCampeon) {
      mainInsignia = <span className="text-yellow-500 ml-1 text-base leading-none">👑</span>;
    }
  }

  // 3. PRIORIDAD BAJA: Eliminación Temprana Reciente
  if (!mainInsignia && ultimoResultado && ultimoResultado.ronda === "Zona" && ultimoResultado.esGanador !== true) {
    mainInsignia = <span className="text-red-500 ml-1 text-base leading-none">▼</span>;
  }

  // --- COMBINACIÓN Y RETORNO FINAL ---
  if (mainInsignia || fireIcon) {
      return (
          <>
              {mainInsignia}
              {fireIcon}
          </>
      );
  }

  return null;
};


  return (
    <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
      {/* Colocamos el SponsorBanner al principio del componente RankingGlobal */}
    

      <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-3 text-center">
        Ranking Global por Categoría
      </h2>

      {/* Selector de año */}
      <div className="flex flex-col items-center gap-2 mb-5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-500">Temporada:</span>
          {AVAILABLE_YEARS.map((year) => (
            <button
              key={year}
              onClick={() => setSelectedYear(year)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-300
                ${selectedYear === year
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md scale-105'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-400 hover:text-indigo-600'
                }`}
            >
              {year}
            </button>
          ))}
        </div>
        {/* Fecha de última actualización */}
        {lastUpdated && loading === 'succeeded' && (
          <p className="text-xs text-gray-400 flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Última actualización: <span className="font-medium text-gray-500">{lastUpdated}</span>
          </p>
        )}
      </div>
      {loading === 'pending' ? ( // Usamos el estado 'loading' de Redux
        <SkeletonRankingTable />
      ) : error ? (
        <div className="text-center text-sm text-red-500 p-8 border border-red-200 rounded-lg bg-red-50">
          {error}
        </div>
      ) : Object.values(categorizedRanking).length > 0 ? (
        Object.values(categorizedRanking)
          .sort((a, b) => {
            // Aplicamos el ordenamiento limpio aquí también
            return getCategoryOrderIndex(a.name) - getCategoryOrderIndex(b.name);
          })
          .map((categoryData, catIndex) => (
    <><div key={catIndex} className="mb-8 border border-gray-100 rounded-lg shadow-sm"> 
      
              <h3 className="text-lg sm:text-xl font-bold text-indigo-700 mb-4 border-b pb-2">
                {categoryData.name}
              </h3>
              {categoryData.players.length > 0 ? (
                <div className="overflow-x-auto rounded-lg shadow-md border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-blue-100">
                      <tr>
                        <th className="px-3 py-2 sm:px-6 sm:py-3 text-center text-xs font-medium text-blue-700 uppercase tracking-wider">
                          Rank
                        </th>
                        <th className="px-3 py-2 sm:px-6 sm:py-3 text-center text-xs font-medium text-blue-700 uppercase tracking-wider">
                       
                        </th>
                        <th className="px-3 py-2 sm:px-6 sm:py-3  text-xs font-medium text-blue-700 uppercase tracking-wider justify-center text-left">
                          Jugador
                        </th>
                        <th className="px-3 py-2 sm:px-6 sm:py-3 text-center text-xs font-medium text-blue-700 uppercase tracking-wider">
                          Pts
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {/* Mostrar los primeros 16 jugadores */}
                      {categoryData.players.slice(0, 20).map((player, index) => { 
                        const rawName = player // Renombramos para clarity, manteniendo la lógica
                          ? (() => {
                              let fullName = player.nombre || "";
                              // Limpieza del sufijo de categoría y retorno del nombre limpio completo.
                              return fullName.replace(/-\s*\w+$/, '').trim(); 
                            })()
                          : "Desconocido";

                        // APLICACIÓN DEL TRUNCADO DE 16 CARACTERES
                        const playerName = truncateName(rawName, 16);
                        
                        const globalPoints = player?.puntosGlobales || 0; 
                        const insignia = getInsignia(player);

                        return (
                          <tr
                            key={player.rankingEntryId || player.id} 
                            className="hover:bg-blue-50 cursor-pointer transition-colors duration-200"
                            onClick={() => openPlayerModal(player)}
                          >
                            <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-center">
                              <div className="flex items-center justify-center">
                                {/* Mostrar posición secuencial (1-16) */}
                                <span>{index + 1}</span> 
                              </div>
                            </td>
                            <td className=" py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-700 text-center">
                              {insignia}
                            </td>
                            <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-700 text-left">
                              {/* Muestra el nombre limpio y truncado */}
                              <span className="font-medium text-gray-800">{playerName}</span>
                            </td>
                            <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-700 text-center">
                              <AnimatedPoints points={globalPoints} />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="px-6 py-4 text-center text-sm text-gray-600">
                  No se encontraron jugadores en esta categoría.
                </p>
              )}
   
              {/* Bloque de información si la lista es incompleta */}
              {categoryData.players.length > 0 && (
                <p className="mt-4 text-center text-xs text-gray-500">
                  Mostrando las primeras {Math.min(categoryData.players.length, 16)} posiciones de {categoryData.players.length} jugadores.
                </p>
              )}

            </div>
            <SponsorBanner sponsorImages={sponsorImages} />
            </>
          ))
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <span className="text-5xl mb-4">📅</span>
          <p className="text-gray-500 font-medium text-base">No hay datos disponibles para {selectedYear}.</p>
          <p className="text-gray-400 text-sm mt-1">Las tablas de esta temporada aún no fueron cargadas.</p>
        </div>
      )}

      {isModalOpen && selectedPlayer && (
        <PlayerDetailModal player={selectedPlayer} onClose={closePlayerModal} />
      )}
    </div>
  );
}

export default RankingGlobal;