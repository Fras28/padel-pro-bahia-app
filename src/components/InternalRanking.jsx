// src/components/InternalRanking.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CountUp from "react-countup";
import { useInView } from "react-intersection-observer";
import PlayerDetailModal from './PlayerDetailModal'; // Import PlayerDetailModal

// New component for animating points, mirroring RankingGlobal's approach
const AnimatedPoints = ({ points }) => {
    const { ref, inView } = useInView({
        threshold: 0.1,
        triggerOnce: true,
    });

    return (
        <span ref={ref}>
            {inView && points !== undefined && points !== null ? (
                <CountUp end={points} duration={2} separator="." />
            ) : points || 'N/A'}
        </span>
    );
};

function InternalRanking() {
    const { clubId, categoryId } = useParams();
    const navigate = useNavigate();

    const [rankingEntries, setRankingEntries] = useState([]);
    const [categoryName, setCategoryName] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // State for managing the PlayerDetailModal
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const API_BASE = import.meta.env.VITE_API_BASE;

    // The main useInView for the overall ranking table container
    const { ref: tableRef, inView: tableInView } = useInView({
        threshold: 0.1,
        triggerOnce: true,
    });

    // Function to handle player click and open modal
    const handlePlayerClick = (playerData) => {
        setSelectedPlayer(playerData);
        setIsModalOpen(true);
    };

    // Function to close the modal
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedPlayer(null);
    };

    useEffect(() => {
        const fetchInternalRanking = async () => {
            console.log("clubId recibido (InternalRanking):", clubId);
            console.log("categoryId recibido (InternalRanking):", categoryId);

            if (!clubId || !categoryId) {
                setError("No se han proporcionado todos los parámetros necesarios (ID de club o categoría).");
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`${API_BASE}api/ranking-categorias?populate=club.logo&populate=categoria&populate=entradasRanking.jugador.estadisticas&filters[club][documentId][$eq]=${clubId}&filters[categoria][documentId][$eq]=${categoryId}`);
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const responseData = await response.json();
                console.log("Datos de la API (InternalRanking):", responseData.data);

                const foundRanking = responseData.data[0];

                if (foundRanking) {
                    setCategoryName(foundRanking.categoria?.nombre || 'Categoría Desconocida');
                    
                    // Get the club's logo URL from the foundRanking object
                    const clubLogoUrl = foundRanking.club?.logo?.url;

                    const sortedEntries = foundRanking.entradasRanking
                        .map(entry => {
                            const player = entry.jugador;
                            let formattedName = "Desconocido";

                            if (player && player.nombre) {
                                const fullName = player.nombre;
                                const parts = fullName.split(" ");
                                
                                if (parts.length > 0) {
                                    const nombreInicial = parts[0] ? `${parts[0][0]}.` : "";
                                    const apellido = parts.slice(1).join(" ");
                                    formattedName = `${nombreInicial} ${apellido}`.trim();
                                }
                            }
                           
                            return {
                                ...entry,
                                jugador: player,
                                nombreJugadorTabla: formattedName.toUpperCase(),
                                puntos: entry.puntos,
                                clubLogoUrl: clubLogoUrl, // Add the club logo URL to each entry
                            };
                        })
                        .sort((a, b) => b.puntos - a.puntos);
                    
                    setRankingEntries(sortedEntries);
                } else {
                    setRankingEntries([]);
                    setCategoryName('');
                    setError("No se encontraron entradas de ranking para esta categoría en este club.");
                }

            } catch (e) {
                console.error("Error fetching internal ranking:", e);
                setError("Error al cargar el ranking interno. Inténtalo de nuevo más tarde.");
            } finally {
                setLoading(false);
            }
        };
        fetchInternalRanking();
    }, [API_BASE, clubId, categoryId]); 

    if (loading) {
        return (
            <div className="text-center py-4 text-gray-600">
                Cargando ranking interno...
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-4 text-red-600">
                {error}
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4">
            <h2 className="text-2xl font-semibold text-blue-900 mb-4 border-b-2 border-blue-200 pb-2">
                Ranking Interno: {categoryName}
            </h2>
            <div className="mt-6 flex justify-center">
                <button
                    onClick={() => navigate(`/clubs/${clubId}/categories`)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg shadow-md hover:bg-gray-300 transition duration-300 text-sm"
                >
                    Volver a Categorías
                </button>
            </div>
            {rankingEntries.length > 0 ? (
                <div ref={tableRef} className="overflow-x-auto  bg-white rounded-lg shadow-md">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Rank
                                </th>
                                <th scope="col" className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Jugador
                                </th>
                                <th scope="col" className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Puntos
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {rankingEntries.map((entry, playerIndex) => (
                                <tr 
                                    key={entry.id} 
                                    onClick={() => handlePlayerClick(entry.jugador)}
                                    className="cursor-pointer hover:bg-gray-100"
                                >
                                    <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {playerIndex + 1}
                                    </td>
                                    <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-700">
                                        <div className="flex items-center">
                                            {/* Display the club logo here */}
                                            <img
                                                src={entry.clubLogoUrl || "https://placehold.co/32x32/cccccc/333333?text=Club"} // Use clubLogoUrl
                                                alt={entry.jugador?.nombre || "Club Logo"} // Alt text for accessibility
                                                className="h-6 w-6 rounded-full mr-2 object-cover bg-black p-1 "
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = "https://placehold.co/32x32/cccccc/333333?text=Club";
                                                }}
                                            />
                                            {entry.nombreJugadorTabla}
                                        </div>
                                    </td>
                                    <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-700">
                                        <AnimatedPoints points={entry.puntos} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="px-6 py-4 text-center text-sm text-gray-600">No se encontraron entradas de ranking para esta categoría en este club.</p>
            )}

            <div className="mt-6 flex justify-center">
                <button
                    onClick={() => navigate(`/clubs/${clubId}/categories`)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg shadow-md hover:bg-gray-300 transition duration-300 text-sm"
                >
                    Volver a Categorías
                </button>
            </div>

            {isModalOpen && selectedPlayer && (
                <PlayerDetailModal player={selectedPlayer} onClose={handleCloseModal} />
            )}
        </div>
    );
}

export default InternalRanking;