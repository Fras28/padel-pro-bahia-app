// src/components/InternalRanking.jsx (already good)
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CountUp from "react-countup";
import { useInView } from "react-intersection-observer";
import PlayerDetailModal from './PlayerDetailModal';

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

    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const API_BASE = import.meta.env.VITE_API_BASE;

    const handlePlayerClick = (playerData) => {
        setSelectedPlayer(playerData);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedPlayer(null);
    };

    useEffect(() => {
        const fetchRanking = async () => {
            setLoading(true);
            setError(null);
            try {
                // Fetch the specific ranking-categoria for this club and category
                const response = await fetch(
                    `${API_BASE}api/ranking-categorias?populate=club.logo&populate=categoria&populate=entradasRanking.jugador.estadisticas&populate=entradasRanking.jugador.club.logo&filters[club][documentId][$eq]=${clubId}&filters[categoria][documentId][$eq]=${categoryId}`
                );

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                console.log(data, "data");
                

                if (data.data && data.data.length > 0) {
                    const rankingData = data.data[0]; // Assuming there's only one ranking per club/category pair
                    setCategoryName(rankingData.categoria?.nombre || 'Categoría Desconocida');

                    // Sort the entries based on points (descending)
                    const sortedEntries = rankingData.entradasRanking.sort((a, b) => b.puntos - a.puntos);

                    // Format player names for display and assign rank
                    const formattedEntries = sortedEntries.map(entry => {
                        console.log(entry, "entry");
                        
                        let formattedName = "Desconocido";
                        if (entry.jugador && entry.jugador.nombre) {
                            const fullName = entry.jugador.nombre;
                            const parts = fullName.split(" ");
                            if (parts.length > 0) {
                                const nombreInicial = parts[0] ? `${parts[0][0]}.` : "";
                                const apellido = parts.slice(1).join(" ");
                                formattedName = `${nombreInicial} ${apellido}`.trim();
                            }
                        }
                        return {
                            ...entry,
                            nombreJugadorTabla: formattedName.toUpperCase()
                        };
                    });
                    setRankingEntries(formattedEntries);
                } else {
                    setRankingEntries([]);
                    setCategoryName('Categoría Desconocida'); // No ranking data found for this specific club/category
                }
            } catch (e) {
                console.error("Error fetching internal ranking:", e);
                setError("Error al cargar el ranking interno. Inténtalo de nuevo más tarde.");
            } finally {
                setLoading(false);
            }
        };
        fetchRanking();
    }, [API_BASE, clubId, categoryId]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-blue-500 text-lg">Cargando ranking interno...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center text-red-600 p-4">
                <p>{error}</p>
                <button
                    onClick={() => navigate(`/clubs/${clubId}/categories`)}
                    className="mt-4 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg shadow-md hover:bg-gray-300 transition duration-300"
                >
                    Volver a Categorías
                </button>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 max-w-4xl">
            <h2 className="text-2xl font-semibold text-blue-900 mb-4 border-b-2 border-blue-200 pb-2 text-center">
                Ranking Interno: {categoryName}
            </h2>
            {rankingEntries.length > 0 ? (
                <div className="overflow-x-auto bg-white rounded-lg shadow-md">
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
                            {rankingEntries?.map((entry, playerIndex) => (
                                <tr
                                    key={entry?.jugador?.id}
                                    onClick={() => handlePlayerClick(entry?.jugador)}
                                    className="cursor-pointer hover:bg-gray-100"
                                >
                                    <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {playerIndex + 1}
                                    </td>
                                    <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            {/* Usa el logo del club de la entrada del ranking */}
                                            <img
                                                className="h-8 w-8 rounded-full object-cover mr-2"
                                                src={entry.jugador?.club?.logo?.url || `https://placehold.co/32x32/cccccc/333333?text=Club`}
                                                alt={entry.club?.nombre || "Club Logo"}
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = `https://placehold.co/32x32/cccccc/333333?text=Club`;
                                                }}
                                            />
                                            <p className='text-black'>{entry.nombreJugadorTabla}</p> 
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