// src/components/InternalRanking.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CountUp from "react-countup";
import { useInView } from "react-intersection-observer";
import PlayerDetailModal from './PlayerDetailModal';

// AnimatedPoints component remains unchanged
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

// New function to format the date
const formatUpdateDate = (dateString) => {
    if (!dateString) return 'Fecha de actualización no disponible';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `Última actualización: ${day}/${month}/${year} ${hours}:${minutes}`;
};

function InternalRanking() {
    const { clubId, categoryId } = useParams();
    const navigate = useNavigate();

    const [rankingEntries, setRankingEntries] = useState([]);
    const [categoryName, setCategoryName] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [clubOwnerLogoUrl, setClubOwnerLogoUrl] = useState('');
    const [lastUpdatedDate, setLastUpdatedDate] = useState(null);

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

    const getInsignia = (player) => {
        const historial = player?.historialRanking;

        if (!historial || historial.length === 0) return null;

        const historialOrdenado = [...historial].sort(
            (a, b) => new Date(b.fecha) - new Date(a.fecha)
        );
        const ultimoResultado = historialOrdenado[0];
        const { ronda, esGanador } = ultimoResultado;

        // Using more descriptive icons for better UX
        if (ronda === "Final" && esGanador) {
            return <span className="text-yellow-500 ml-1 text-base leading-none" title="Campeón">👑</span>;
        }
        if ((ronda === "Final" && !esGanador) || ronda === "Semifinal") {
            // Revertir a la flecha verde como se solicitó
            return <span className="text-green-500 ml-1 text-base leading-none" title="Finalista o Semifinalista">▲</span>;
        }
        if (ronda === "Cuartos" || ronda === "Octavos") {
            return <span className="text-yellow-500 ml-1 text-base leading-none" title="Cuartos o Octavos de Final">◆</span>;
        }
        if (ronda === "Zona") {
            return <span className="text-red-500 ml-1 text-base leading-none" title="Fase de Grupos">▼</span>;
        }
        return null;
    };

    useEffect(() => {
        const fetchRanking = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(
                       `${API_BASE}api/ranking-categorias?populate=club.logo&populate=categoria&populate=entradasRanking.jugador.estadisticas&populate=entradasRanking.jugador.club.logo&filters[club][documentId][$eq]=${clubId}&filters[categoria][documentId][$eq]=${categoryId}`
                );

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();

                if (data.data && data.data.length > 0) {
                    const rankingData = data.data[0];
                    setCategoryName(rankingData.categoria?.nombre || 'Categoría Desconocida');
                    setLastUpdatedDate(rankingData.fechaActualizacion);
                    setClubOwnerLogoUrl(rankingData.club?.logo?.url || `https://placehold.co/32x32/cccccc/333333?text=Club`);

                    const sortedEntries = rankingData.entradasRanking.sort((a, b) => b.puntos - a.puntos);

                    const formattedEntries = sortedEntries.map(entry => {
                        let formattedName = "Desconocido";
                        if (entry.jugador && entry.jugador.nombre) {
                            const fullName = entry.jugador.nombre;
                            const cleanedName = fullName.replace(/-\s*\w+$/, '').trim();
                            const parts = cleanedName.split(" ");
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
                    setCategoryName('Categoría Desconocida');
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

    // Loading State with Spinner
    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-screen bg-gray-100">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mb-4"></div>
                <div className="text-blue-600 text-lg font-medium">Cargando ranking interno...</div>
            </div>
        );
    }

    // Error State
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-screen p-4 bg-gray-100">
                <div className="text-center text-red-600 p-8 bg-white rounded-lg shadow-md">
                    <p className="text-lg font-semibold">{error}</p>
                    <button
                        onClick={() => navigate(`/clubs/${clubId}/categories`)}
                        className="mt-6 px-6 py-2 bg-gray-200 text-gray-800 rounded-lg shadow-md hover:bg-gray-300 transition duration-300 font-medium"
                    >
                        Volver a Categorías
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 max-w-4xl">
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center mb-1">
                    Ranking Interno
                </h2>
                <h3 className="text-lg text-blue-600 font-medium text-center mb-2">{categoryName}</h3>
                {lastUpdatedDate && (
                    <p className="text-center text-gray-500 text-xs sm:text-sm">
                        {formatUpdateDate(lastUpdatedDate)}
                    </p>
                )}
            </div>

            <div className="mt-2 flex justify-start pb-4">
                <button
                    onClick={() => navigate(`/clubs/${clubId}/categories`)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg shadow-md hover:bg-gray-300 transition duration-300 text-sm"
                >
                    Volver a Categorías
                </button>
            </div>

            {rankingEntries.length > 0 ? (
                <div className="overflow-x-auto bg-white rounded-xl shadow-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Rank
                                </th>
                                <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                </th>
                                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Jugador
                                </th>
                                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Puntos
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {rankingEntries?.map((entry, playerIndex) => {
                                const insignia = getInsignia(entry?.jugador);
                                return (
                                    <tr
                                        key={entry?.jugador?.id}
                                        onClick={() => handlePlayerClick(entry?.jugador)}
                                        className="cursor-pointer transition duration-200 ease-in-out transform hover:scale-101 hover:bg-gray-50"
                                    >
                                        <td className="px-3 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                            <div className="flex items-center">
                                                <span className='m-auto'>{playerIndex + 1}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 whitespace-nowrap text-sm text-gray-700 text-center">
                                          {insignia}
                                        </td>
                                        <td className="px-3 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <img
                                                    className="h-9 w-9 rounded-full object-cover mr-3 border border-gray-200"
                                                    src={clubOwnerLogoUrl}
                                                    alt={entry.club?.nombre || "Club Logo"}
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = `https://placehold.co/36x36/cccccc/333333?text=Club`;
                                                    }}
                                                />
                                                <p className='text-gray-800 font-medium text-sm'>{entry.nombreJugadorTabla}</p>
                                            </div>
                                        </td>
                                        <td className="px-3 py-4 whitespace-nowrap text-sm font-semibold text-gray-700">
                                            <AnimatedPoints points={entry.puntos} />
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            ) : (
                // Empty State with better UX
                <div className="text-center p-12 bg-white rounded-xl shadow-lg mt-6">
                    <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Sin datos de ranking</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        No se encontraron entradas de ranking para esta categoría en este club.
                    </p>
                </div>
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