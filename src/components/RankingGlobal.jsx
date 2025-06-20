// src/components/RankingGlobal.jsx
import React, { useEffect, useState } from 'react';
// Importa el componente PlayerDetailModal, asegurando que la ruta sea correcta
import PlayerDetailModal from './PlayerDetailModal'; 

// RankingGlobal component to display the global player ranking
function RankingGlobal() {
    // State to store ranking data
    const [ranking, setRanking] = useState([]);
    // State to manage loading status
    const [loading, setLoading] = useState(true);
    // State to store any error messages
    const [error, setError] = useState(null);
    // State to control modal visibility
    const [isModalOpen, setIsModalOpen] = useState(false);
    // State to store data of the player selected for the modal
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const API_BASE = import.meta.env.VITE_API_BASE
    // API URL for global ranking - ensures all necessary data is populated
    const RANKING_API_URL = API_BASE+'api/ranking-global?populate=entradasRankingGlobal.jugador.estadisticas&populate=entradasRankingGlobal.jugador.club.logo&populate=entradasRankingGlobal.jugador.pareja';

    // Fetch ranking data on component mount
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
                    setRanking(sortedRanking);
                } else {
                    setRanking([]); 
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

    // Function to open the player detail modal
    const openPlayerModal = (playerData) => {
        setSelectedPlayer(playerData);
        setIsModalOpen(true);
    };

    // Function to close the player detail modal
    const closePlayerModal = () => {
        setIsModalOpen(false);
        setSelectedPlayer(null);
    };

    return (
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 sm:mb-6 text-center">Ranking Global</h2>
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
                        ) : ranking.length > 0 ? (
                            ranking.map((entry, index) => {
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
                                <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-600">No se encontraron entradas en el ranking.</td>
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
