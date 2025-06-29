// src/components/PlayerDetailModal.jsx
import React from 'react';

// Helper function to get player initials
const getInitials = (nombre, apellido) => {
  const firstInitial = nombre ? nombre.charAt(0) : '';
  const lastInitial = apellido ? apellido.charAt(0) : '';
  return `${firstInitial}${lastInitial}`.toUpperCase();
};

// Define styles for different clubs based on their ID
const clubStyles = {
  8: { // Osaka Padel (assuming this ID represents the X3 logo/green theme from your image)
    cardBg: 'bg-gray-900',
    cardBorder: 'border-green-500', // Green border
    titleColor: 'text-green-400',
    accentColor: 'text-yellow-400', // Used for stats values
    statBlockBg: 'bg-gray-800',
    statBlockBorder: 'border-green-700',
    textColor: 'text-gray-100',
    initialBg: 'bg-green-600',
    winRateBg: 'bg-green-800',
    clubNameColor: 'text-green-200',
    playerTitleColor: 'text-yellow-400', // Used for "Ranking General", "Win Rate" titles
  },
  12: { // Hypothetical Club ID 12 for Red Theme (like Osaka Padel logo in your image)
    cardBg: 'bg-gray-900',
    cardBorder: 'border-red-500', // Red border
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
  1: { // Hypothetical Club ID 1 for Pink Theme
    cardBg: 'bg-gray-900',
    cardBorder: 'border-pink-500', // Pink border
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
  default: { // Default style for clubs not explicitly defined
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

// PlayerDetailModal component to display player statistics in a customized card
const PlayerDetailModal = ({ player, onClose }) => {
  // Add this critical line here for early exit
  if (!player) {
    return null;
  }

  // Access stats safely, providing an empty object as fallback if null
  // This ensures 'stats' is always an object with default numeric values
  const stats = player?.estadisticas || {
    partidosJugados: 0,
    partidosGanados: 0,
    torneosJugados: 0,
    torneosGanados: 0,
    partidosCuartosRonda: 0, // Ensure this new field is part of the fallback
  };

  const {
    partidosJugados,
    partidosGanados,
    torneosJugados,
    torneosGanados,
    partidosCuartosRonda, // Destructure the new stat directly from 'stats'
  } = stats;

  // Calculate win rate safely
  const winRate = partidosJugados > 0 ? ((partidosGanados / partidosJugados) * 100).toFixed(2) : '0.00';

  // Get styles based on player's club ID, defaulting if not found
  const style = clubStyles[player.club?.id] || clubStyles.default;

  // The logic for 'allPlayerMatches' and 'quarterFinalsCount' is removed
  // as the 'partidosCuartosRonda' from player.estadisticas is now authoritative.

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black bg-opacity-70`} onClick={onClose}>
      <div
        className={`relative ${style.cardBg} ${style.cardBorder} border-4 rounded-xl shadow-2xl p-6 w-full max-w-sm sm:max-w-md mx-auto flex flex-col items-center justify-between overflow-hidden`}
        onClick={(e) => e.stopPropagation()} // Prevent click inside card from closing modal
      >
        <button onClick={onClose} className={`absolute top-4 right-4 text-gray-400 hover:text-white transition-colors duration-200`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Player Initials Circle */}
        {/* <div className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl font-bold mb-4 ${style.initialBg} ${style.titleColor} z-10 border-2 ${style.cardBorder}`}>
          {getInitials(player?.nombre, player?.apellido)}
        </div> */}

        {/* Player Name */}
        <h2 className={`text-2xl sm:text-3xl font-extrabold ${style.titleColor} mb-2 text-center z-10`}>
          {player?.nombre}
        </h2>

        {/* Club Logo OR Name */}
        {player?.club ? ( // Checks if the club object exists
          player.club?.logo?.url ? ( // If club exists, checks if it has a logo URL
            <div className="mb-4 flex justify-center z-10"> {/* Container to center the logo */}
              <img
                src={player?.club?.logo?.url}
                alt={`${player?.club?.nombre} Logo`}
                className="h-16 w-16 sm:h-20 sm:w-20 object-contain rounded-full shadow-md bg-black" // Adjust logo size and visible style
                onError={(e) => { e.currentTarget.style.display = 'none'; }} // Hides image if load fails
              />
            </div>
          ) : ( // If no logo URL, but club object exists, display the name
            <p className={`text-lg ${style.clubNameColor} mb-4 text-center z-10`}>
              Club: {player?.club?.nombre}
            </p>
          )
        ) : null} {/* If no club object, nothing is rendered */}

        {/* Ranking General & Win Rate Block */}
        <div className="grid grid-cols-2 gap-3 w-full text-center mb-6 z-10">
          <div className={`p-3 rounded-lg ${style.winRateBg} ${style.cardBorder} border shadow-inner flex flex-col justify-center items-center`}>
            <span className={`text-base sm:text-lg font-semibold ${style.playerTitleColor}`}>Pts Ranking</span>
            <span className={`text-2xl sm:text-3xl font-extrabold ${style.accentColor}`}>{player?.rankingGeneral || 'N/A'}</span>
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
            { label: 'Cuartos', value: partidosCuartosRonda || 0 }, // Display the new stat
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
            src={player.club.logo.url} // Use direct URL as per API structure
            alt={`${player.club.nombre} Logo`}
            className="absolute bottom-4 left-1/2 transform -translate-x-1/2 p-2 h-40 sm:h-48 w-auto object-contain opacity-10 rounded-full z-0"
            onError={(e) => { e.currentTarget.style.display = 'none'; }} // Hide if image fails to load
          />
        )}
      </div>
    </div>
  );
};

export default PlayerDetailModal;
