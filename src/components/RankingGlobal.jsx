// src/components/RankingGlobal.jsx
import React, { useEffect, useState } from 'react';
// Importa el componente PlayerDetailModal, asegurando que la ruta sea correcta
import PlayerDetailModal from './PlayerDetailModal'; 

// Componente para el switch de género con temática de Padel
const GenderSwitch = ({ selectedGender, onGenderChange }) => {
  return (
    <div className="flex bg-gray-200 rounded-full p-1 mb-6 shadow-inner">
      <button
        className={`flex-1 px-4 py-2 text-sm sm:text-base font-semibold rounded-full transition-all duration-300 ease-in-out
          ${selectedGender === 'Femenina' ? 'bg-green-600 text-white shadow-md' : 'text-gray-700 hover:bg-gray-300'}`
        }
        onClick={() => onGenderChange('Femenina')}
      >
        Femenino
      </button>
      <button
        className={`flex-1 px-4 py-2 text-sm sm:text-base font-semibold rounded-full transition-all duration-300 ease-in-out
          ${selectedGender === 'Masculina' ? 'bg-green-600 text-white shadow-md' : 'text-gray-700 hover:bg-gray-300'}`
        }
        onClick={() => onGenderChange('Masculina')}
      >
        Masculino
      </button>
      <button
        className={`flex-1 px-4 py-2 text-sm sm:text-base font-semibold rounded-full transition-all duration-300 ease-in-out
          ${selectedGender === 'all' ? 'bg-green-600 text-white shadow-md' : 'text-gray-700 hover:bg-gray-300'}`
        }
        onClick={() => onGenderChange('all')}
      >
        Todos
      </button>
    </div>
  );
};

// RankingGlobal component to display the global player ranking
function RankingGlobal() {
    // Estado para almacenar los datos brutos del ranking
    const [rawRanking, setRawRanking] = useState([]);
    // Estado para almacenar los datos del ranking filtrados por género
    const [filteredRanking, setFilteredRanking] = useState([]);
    // Estado para gestionar el estado de carga
    const [loading, setLoading] = useState(true);
    // Estado para almacenar cualquier mensaje de error
    const [error, setError] = useState(null);
    // Estado para controlar la visibilidad del modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    // Estado para almacenar los datos del jugador seleccionado para el modal
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    // Estado para el género seleccionado por el switch ('all', 'Femenina', 'Masculina')
    const [selectedGenderFilter, setSelectedGenderFilter] = useState('all');

    const API_BASE = import.meta.env.VITE_API_BASE;
    // URL de la API para el ranking global - asegura que todos los datos necesarios estén poblados
    const RANKING_API_URL = API_BASE + 'api/ranking-global?populate=entradasRankingGlobal.jugador.estadisticas&populate=entradasRankingGlobal.jugador.club.logo&populate=entradasRankingGlobal.jugador.pareja';

    // Obtener datos del ranking al montar el componente
    useEffect(() => {
        const fetchRanking = async () => {
            try {
                const response = await fetch(RANKING_API_URL);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                console.log("Datos brutos de la API (Ranking Global):", data); 
                
                if (data.data && data.data.entradasRankingGlobal) {
                    const sortedRanking = data.data.entradasRankingGlobal.sort((a, b) => b.puntosGlobales - a.puntosGlobales);
                    setRawRanking(sortedRanking); // Guardar el ranking sin filtrar
                } else {
                    setRawRanking([]); 
                    console.warn("La estructura de datos de la API de ranking no es la esperada (falta data.data o entradasRankingGlobal).");
                }
            } catch (err) {
                setError("Error al cargar el ranking. Inténtalo de nuevo más tarde."); 
                console.error("Error fetching ranking:", err);
            } finally {
                setLoading(false); 
            }
        };

        fetchRanking();
    }, []); 

    // Filtrar el ranking cada vez que cambian los datos brutos o el filtro de género
    useEffect(() => {
        if (selectedGenderFilter === 'all') {
            setFilteredRanking(rawRanking);
        } else {
            const filtered = rawRanking.filter(entry => 
                entry.jugador && entry.jugador.sexo === selectedGenderFilter
            );
            setFilteredRanking(filtered);
        }
    }, [rawRanking, selectedGenderFilter]);

    // Función para abrir el modal de detalles del jugador
    const openPlayerModal = (playerData) => {
        setSelectedPlayer(playerData);
        setIsModalOpen(true);
    };

    // Función para cerrar el modal de detalles del jugador
    const closePlayerModal = () => {
        setIsModalOpen(false);
        setSelectedPlayer(null);
    };

    return (
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 sm:mb-6 text-center">Ranking Global</h2>
            
            {/* Switch de Género */}
            <div className="flex justify-center mb-6">
                <GenderSwitch 
                    selectedGender={selectedGenderFilter} 
                    onGenderChange={setSelectedGenderFilter} 
                />
            </div>

            <div className="overflow-x-auto rounded-lg shadow-md border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Posición</th>
                            <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Club</th>
                            <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jugador</th>
                            <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Puntos</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr>
                                <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-600">Cargando ranking...</td>
                            </tr>
                        ) : error ? (
                            <tr>
                                <td colSpan="4" className="px-6 py-4 text-center text-sm text-red-500">{error}</td>
                            </tr>
                        ) : filteredRanking.length > 0 ? (
                            filteredRanking.map((entry, index) => {
                                const player = entry.jugador; 
                                const playerName = player ? `${player.nombre[0] || ''}. ${player.apellido || ''}`.trim() : 'Desconocido';
                                const clubName = player && player.club ? player.club.nombre : 'N/A';
                                const clubLogoUrl = player && player.club && player.club.logo && player.club.logo.url ? player.club.logo.url : 'https://placehold.co/32x32/cccccc/333333?text=Club';
                                const globalPoints = entry.puntosGlobales || 0;

                                return (
                                    <tr
                                        key={entry.id}
                                        className="hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                                        onClick={() => openPlayerModal(player)}
                                    >
                                        <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm font-medium text-gray-900">{index + 1}</td>
                                        <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-700">
                                            <div className="flex items-center">
                                                <img
                                                    src={clubLogoUrl}
                                                    alt={`${clubName} Logo`}
                                                    className="w-6 h-6 sm:w-8 sm:h-8 object-contain rounded-full mr-1 sm:mr-2 shadow-sm"
                                                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/32x32/cccccc/333333?text=Club'; }} // Fallback image on error
                                                />
                                                <span>{clubName}</span>
                                            </div>
                                        </td>
                                        <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-700">{playerName}</td>
                                        <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-700">{globalPoints}</td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-600">No se encontraron entradas en el ranking para el género seleccionado.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Player Detail Modal component rendered conditionally */}
            {isModalOpen && selectedPlayer && (
                <PlayerDetailModal player={selectedPlayer} onClose={closePlayerModal} />
            )}
        </div>
    );
}

export default RankingGlobal;
