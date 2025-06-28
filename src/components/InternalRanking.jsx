// src/components/InternalRanking.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Importa useParams y useNavigate
import PlayerDetailModal from './PlayerDetailModal';

function InternalRanking() {
    const { clubId, categoryId } = useParams(); // Obtiene clubId y categoryId de la URL
    const navigate = useNavigate(); // Hook para navegar programáticamente

    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPlayer, setSelectedPlayer] = useState(null);

    const API_BASE = import.meta.env.VITE_API_BASE;

    // Función para manejar la apertura del modal de detalles del jugador
    const openPlayerModal = useCallback((player) => {
        setSelectedPlayer(player);
        setIsModalOpen(true);
    }, []);

    // Función para manejar el cierre del modal de detalles del jugador
    const closePlayerModal = useCallback(() => {
        setIsModalOpen(false);
        setSelectedPlayer(null);
    }, []);

    useEffect(() => {
        const fetchInternalRanking = async () => {
            console.log("clubId recibido:", clubId);
            console.log("categoryId recibido:", categoryId);
            if (!clubId || !categoryId) {
                setError("No se han proporcionado todos los parámetros necesarios (ID de club o categoría).");
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);
            try {
                // URL for internal ranking data - filters by club and category, and sorts by ranking_general
                // MODIFICACIÓN: Cambiado filters[club][id] a filters[club][documentId]
                const INTERNAL_RANKING_API_URL = `${API_BASE}api/jugadors?populate=club.logo&populate=estadisticas&populate=categoria&filters[club][documentId][$eq]=${clubId}&filters[categoria][id][$eq]=${categoryId}&sort[0]=estadisticas.ranking_general:asc`;

                const response = await fetch(INTERNAL_RANKING_API_URL);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();

                // Assuming data.data contains the array of players directly
                // Filter and sort should already be handled by the API, but adding a fallback sort for safety
                const sortedPlayers = data.data
                    .map(player => ({
                        id: player.id,
                        ...player.attributes,
                        club: player.attributes.club?.data?.attributes, // Flatten club data
                        categoria: player.attributes.categoria?.data?.attributes, // Flatten categoria data
                    }))
                    .sort((a, b) => (a.estadisticas?.ranking_general || Infinity) - (b.estadisticas?.ranking_general || Infinity));

                setPlayers(sortedPlayers);

            } catch (e) {
                console.error("Error fetching internal ranking:", e);
                setError(`Error al cargar el ranking interno: ${e.message}`);
            } finally {
                setLoading(false);
            }
        };

        fetchInternalRanking();
    }, [clubId, categoryId, API_BASE]); // Dependencias del useEffect

    if (loading) {
        return <div className="text-center py-4 text-gray-600">Cargando ranking...</div>;
    }

    if (error) {
        return <div className="text-center py-4 text-red-600">Error: {error}</div>;
    }

    const categoryName = players.length > 0 ? players[0].categoria?.nombre : 'Categoría Desconocida';

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
                Ranking Interno: {categoryName}
            </h1>

            {players.length > 0 ? (
                <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sm:px-6">
                                    Posición
                                </th>
                                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sm:px-6">
                                    Club
                                </th>
                                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sm:px-6">
                                    Jugador
                                </th>
                                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sm:px-6">
                                    Puntos
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {players.map((player, index) => {
                                const clubLogoUrl = player.club?.logo?.url;
                                const clubName = player.club?.nombre || 'N/A';
                                const playerName = `${player.nombre} ${player.apellido}`;
                                const rankingGeneral = player.estadisticas?.ranking_general || 'N/A';

                                return (
                                    <tr key={player.id} className="hover:bg-gray-100 cursor-pointer" onClick={() => openPlayerModal(player)}>
                                        <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {index + 1}
                                        </td>
                                        <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                {clubLogoUrl && (
                                                    <img
                                                        className="h-8 w-8 rounded-full object-contain mr-2"
                                                        src={clubLogoUrl}
                                                        alt={`${clubName} logo`}
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = "https://placehold.co/32x32/cccccc/333333?text=Club";
                                                        }}
                                                    />
                                                )}
                                                <span>{clubName}</span>
                                            </div>
                                        </td>
                                        <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-700">{playerName}</td>
                                        <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-700">{rankingGeneral}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="px-6 py-4 text-center text-sm text-gray-600">No se encontraron jugadores para esta categoría en este club.</p>
            )}

            {/* Player Detail Modal component rendered conditionally */}
            {isModalOpen && selectedPlayer && (
                <PlayerDetailModal player={selectedPlayer} onClose={closePlayerModal} />
            )}

            <div className="mt-6 flex justify-center">
                <button
                    onClick={() => navigate(`/clubs/${clubId}/categories`)} // Vuelve a la lista de categorías del club actual
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg shadow-md hover:bg-gray-300 transition duration-300 text-sm"
                >
                    Volver a Categorías
                </button>
            </div>
        </div>
    );
}

export default InternalRanking;