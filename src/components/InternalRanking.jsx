// src/components/InternalRanking.jsx
import React, { useEffect, useState } from 'react';
// Importa el componente PlayerDetailModal. Asegúrate de que este archivo esté
// en la misma carpeta (src/components/) que InternalRanking.jsx
import PlayerDetailModal from './PlayerDetailModal'; 

function InternalRanking({ category, onBack }) {
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPlayer, setSelectedPlayer] = useState(null);

    // API URL for internal ranking based on category ID
    // Ensure all necessary player data (stats, club, logo) is populated
    const API_BASE = import.meta.env.VITE_API_BASE
    const INTERNAL_RANKING_API_URL = API_BASE+`api/categorias/${category.documentId}?populate=jugadors.estadisticas&populate=jugadors.club.logo`;

    useEffect(() => {
        const fetchInternalRanking = async () => {
            try {
                const response = await fetch(INTERNAL_RANKING_API_URL);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                console.log(`Datos del Ranking Interno para categoría ${category.nombre}:`, data);

                if (data.data && data.data.jugadors) {
                    // Filter out any empty or malformed player objects
                    const validPlayers = data.data.jugadors.filter(player => player && player.id);
                    console.log(`Jugadores válidos obtenidos para ${category.nombre}:`, validPlayers);

                    // Sort players by rankingGeneral (descending, if higher is better) or ascending
                    const sortedPlayers = validPlayers.sort((a, b) => (b.rankingGeneral || 0) - (a.rankingGeneral || 0));
                    setPlayers(sortedPlayers);
                } else {
                    setPlayers([]);
                    console.warn(`No se encontraron jugadores válidos para la categoría ${category.nombre}.`);
                }
            } catch (err) {
                setError(`Error al cargar el ranking interno para ${category.nombre}.`);
                console.error("Error fetching internal ranking:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchInternalRanking();
    }, [category.documentId]); // Re-fetch when category documentId changes

    const openPlayerModal = (playerData) => {
        setSelectedPlayer(playerData);
        setIsModalOpen(true);
    };

    const closePlayerModal = () => {
        setIsModalOpen(false);
        setSelectedPlayer(null);
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 text-center">
                <p className="text-gray-600">Cargando ranking de {category.nombre}...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 text-center">
                <p className="text-red-500">{error}</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
            <button
                onClick={onBack} // This button now takes you back to the categories list (and global ranking)
                className="mb-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition duration-200"
            >
                &larr; Volver a Categorías
            </button>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 sm:mb-6 text-center">
                Ranking de Categoría: {category.nombre}
            </h2>
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
                        {players.length > 0 ? (
                            players.map((player, index) => {
                                const playerName = player ? `${player.nombre || ''} ${player.apellido || ''}`.trim() : 'Desconocido';
                                const clubName = player?.club?.nombre || 'N/A';
                                const clubLogoUrl = player?.club?.logo?.url || 'https://placehold.co/32x32/cccccc/333333?text=Club';
                                const rankingGeneral = player?.rankingGeneral || 0; 

                                return (
                                    <tr
                                        key={player.id}
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
                                        <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-700">{rankingGeneral}</td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-600">No se encontraron jugadores para esta categoría.</td>
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

export default InternalRanking;
