// src/components/PlayerCardContent.jsx
import React from 'react';

const PlayerCardContent = ({ playerData, style }) => {
  if (!playerData) {
    return null;
  }

  // Helper para obtener las iniciales (copiado del Profile.jsx)
  const getInitials = (nombre, apellido) => {
    const firstInitial = nombre ? nombre.charAt(0) : '';
    const lastInitial = apellido ? apellido.charAt(0) : '';
    return `${firstInitial}${lastInitial}`.toUpperCase();
  };

  const initials = getInitials(playerData.nombre, playerData.apellido);

  return (
    <div className={`
      relative p-4 rounded-xl shadow-xl border-2
      ${style.cardBg || 'bg-gray-800'}
      ${style.cardBorder || 'border-gray-600'}
      text-center
      w-48 h-72 // Tamaño fijo para la tarjeta
      flex flex-col justify-between items-center
      pointer-events-auto // Permite interacciones si es necesario dentro de la tarjeta
    `}>
      {/* Círculo de Iniciales */}
      <div className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold
        ${style.initialBg || 'bg-blue-600'}
        ${style.titleColor || 'text-white'}
        mb-2`}>
        {initials}
      </div>

      {/* Nombre Completo */}
      <h4 className={`text-lg font-bold ${style.titleColor || 'text-white'} mb-1`}>
        {playerData.nombre} {playerData.apellido}
      </h4>

      {/* Ranking General */}
      <p className={`text-sm ${style.textColor || 'text-gray-200'}`}>
        Ranking: <span className={`font-semibold ${style.accentColor || 'text-blue-400'}`}>{playerData.rankingGeneral || 'N/A'}</span>
      </p>

      {/* Logo del Club (si existe) */}
      {playerData.club && playerData.club.logo?.url && (
        <img src={playerData.club.logo.url} alt={playerData.club.nombre} className="w-12 h-12 mt-2" />
      )}
      <p className={`text-xs ${style.textColor || 'text-gray-300'}`}>
        {playerData.club?.nombre || 'Sin Club'}
      </p>

      {/* Puedes añadir más información del jugador aquí */}
    </div>
  );
};

export default PlayerCardContent;