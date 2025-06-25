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
            if (!clubId || !categoryId) {
                setError("No se han proporcionado todos los parámetros necesarios (ID de club o categoría).");
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                // Primero, obtenemos la categoría para asegurarnos de que existe y obtener su nombre si es necesario
                const categoryResponse = await fetch(`${API_BASE}api/categorias/${categoryId}`);
                if (!categoryResponse.ok) {
                    throw new Error(`HTTP error! status: ${categoryResponse.status} for category ${categoryId}`);
                }
                const categoryData = await categoryResponse.json();
                
                if (!categoryData.data) {
                    setError(`Categoría con ID ${categoryId} no encontrada.`);
                    setLoading(false);
                    return;
                }
                
                const categoryName = categoryData.data.attributes.nombre; // Obtener el nombre de la categoría

                // Luego, obtenemos el ranking interno para esa categoría y club
                // Ajusta la URL de la API según cómo se expone el ranking interno en Strapi.
                // Si el ranking está anidado bajo categoría o club, la consulta será diferente.
                // Suponemos una API que permite filtrar por club y categoría.
                const INTERNAL_RANKING_API_URL = `${API_BASE}api/jugadors?populate=club.logo&populate=estadisticas&filters[club][id][$eq]=${clubId}&filters[categorias][id][$eq]=${categoryId}&sort[0]=estadisticas.ranking_general:asc`;

                const response = await fetch(INTERNAL_RANKING_API_URL);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                console.log(`Datos del Ranking Interno para club ${clubId}, categoría ${categoryId}:`, data.data);

                if (data.data && Array.isArray(data.data)) {
                    // Filter players to ensure they have stats for the specific category
                    // (This might not be necessary if the API filter is precise)
                    const filteredPlayers = data.data.filter(player => 
                        player.attributes.estadisticas && 
                        player.attributes.estadisticas.find(stat => 
                            stat.categoria === categoryName && stat.club_id === parseInt(clubId)
                        )
                    ).map(player => {
                        const categoryStats = player.attributes.estadisticas.find(stat => 
                            stat.categoria === categoryName && stat.club_id === parseInt(clubId)
                        );
                        return {
                            id: player.id,
                            nombre: player.attributes.nombre,
                            apellido: player.attributes.apellido,
                            ranking_general: categoryStats ? categoryStats.ranking_general : 'N/A',
                            club: player.attributes.club?.data?.attributes?.nombre || 'N/A',
                            clubLogo: player.attributes.club?.data?.attributes?.logo?.data?.attributes?.url || null,
                            // Add other player details if needed for the modal
                        };
                    });
                    setPlayers(filteredPlayers);
                } else {
                    setPlayers([]);
                }
            } catch (e) {
                console.error("Error fetching internal ranking:", e);
                setError("Error al cargar el ranking interno. Inténtalo de nuevo más tarde.");
            } finally {
                setLoading(false);
            }
        };

        fetchInternalRanking();
    }, [clubId, categoryId, API_BASE]); // Dependencias: clubId, categoryId, API_BASE

    if (loading) {
        return <div className="text-center py-4 text-gray-500">Cargando ranking interno...</div>;
    }

    if (error) {
        return <div className="text-center py-4 text-red-500">Error: {error}</div>;
    }

    return (
        <div className="bg-gray-50 p-4 sm:p-6 rounded-lg shadow-inner mt-6">
            <h2 className="text-2xl font-semibold text-blue-900 mb-4 border-b-2 border-blue-200 pb-2">
                Ranking Interno
                {/* Opcional: mostrar nombre del club y categoría si se han obtenido */}
                {clubId && categoryId && (
                    <span className="text-lg font-normal text-gray-700 block mt-1">
                        Club ID: {clubId}, Categoría ID: {categoryId}
                    </span>
                )}
            </h2>
            {players.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 shadow-md rounded-lg overflow-hidden">
                        <thead className="bg-blue-800 text-white">
                            <tr>
                                <th scope="col" className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium uppercase tracking-wider">
                                    Posición
                                </th>
                                <th scope="col" className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium uppercase tracking-wider">
                                    Club
                                </th>
                                <th scope="col" className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium uppercase tracking-wider">
                                    Jugador
                                </th>
                                <th scope="col" className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium uppercase tracking-wider">
                                    Puntos
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {players.map((player, index) => {
                                const clubName = player.club || 'N/A';
                                const clubLogo = player.clubLogo;
                                const playerName = `${player.nombre} ${player.apellido}`;
                                const rankingGeneral = player.ranking_general;

                                return (
                                    <tr
                                        key={player.id}
                                        onClick={() => openPlayerModal(player)}
                                        className="hover:bg-gray-50 cursor-pointer transition-colors duration-150 ease-in-out"
                                    >
                                        <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {index + 1}
                                        </td>
                                        <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                {clubLogo && (
                                                    <img
                                                        src={clubLogo}
                                                        alt={`${clubName} Logo`}
                                                        className="w-8 h-8 rounded-full mr-1 sm:mr-2 shadow-sm"
                                                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/32x32/cccccc/333333?text=Club'; }}
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