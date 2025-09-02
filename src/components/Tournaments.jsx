// src/components/Tournaments.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FaCalendarAlt,
    FaTrophy,
    FaPlayCircle,
    FaDoorOpen,
    FaSpinner,
    FaTimesCircle
} from 'react-icons/fa';

// Tournaments component to display a list of tournaments categorized by status
function Tournaments() {
    const [tournaments, setTournaments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const navigate = useNavigate();
    const API_BASE = import.meta.env.VITE_API_BASE;
    const TOURNAMENTS_API_URL = `${API_BASE}api/torneos?populate=club.logo&populate=partidos.pareja1&populate=partidos.pareja2&populate=partidos.ganador&populate=parejas_inscritas&populate=categoria`;

    useEffect(() => {
        const fetchTournaments = async () => {
            try {
                const response = await fetch(TOURNAMENTS_API_URL);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                console.log("Datos brutos de la API (Torneos):", data.data);

                if (data.data) {
                    setTournaments(data.data.filter(t => t !== null));
                } else {
                    setTournaments([]);
                }
            } catch (err) {
                setError("Error al cargar los torneos. Inténtalo de nuevo más tarde.");
                console.error("Error fetching tournaments:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchTournaments();
    }, [TOURNAMENTS_API_URL]);

    const groupTournamentsByStatus = (tournamentsList) => {
        const grouped = {
            'Abierto': [],
            'En Curso': [],
            'Finalizado': [],
            'Próximamente': []
        };

        tournamentsList.forEach(tournament => {
            if (grouped[tournament.estado]) {
                grouped[tournament.estado].push(tournament);
            }
        });
        return grouped;
    };

    const groupedTournaments = groupTournamentsByStatus(tournaments);

    const handleViewMatches = (tournamentId, tournamentName) => {
        navigate(`/tournaments/${tournamentId}/matches`);
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Abierto':
                return <FaDoorOpen className="text-green-500" />;
            case 'En Curso':
                return <FaPlayCircle className="text-yellow-500" />;
            case 'Finalizado':
                return <FaTrophy className="text-blue-500" />;
            case 'Próximamente':
                return <FaCalendarAlt className="text-purple-500" />;
            default:
                return null;
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-gray-600">
                <FaSpinner className="animate-spin text-4xl mb-2 text-blue-600" />
                <p className="text-lg">Cargando torneos...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-red-500">
                <FaTimesCircle className="text-4xl mb-2" />
                <p className="text-lg">{error}</p>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <h1 className="text-4xl font-extrabold text-gray-800 mb-8 text-center">Torneos</h1>

            {Object.keys(groupedTournaments).map(status => (
                <div key={status} role="region" aria-labelledby={`status-heading-${status}`} className="mb-10">
                    <h2 id={`status-heading-${status}`} className="text-3xl font-bold text-gray-700 mb-5 flex items-center gap-3 border-b-2 border-blue-500 pb-2">
                        {getStatusIcon(status)}
                        {status}
                    </h2>
                    {groupedTournaments[status].length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {groupedTournaments[status].map(tournament => (
                                <div
                                    key={tournament.id}
                                    className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden"
                                >
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-3">
                                            <h3 className="text-2xl font-bold text-gray-900 leading-tight">
                                                {tournament.nombre}
                                            </h3>
                                            {tournament.club?.logo?.url && (
                                                <div className="flex-shrink-0 ml-4">
                                                    <img
                                                        src={tournament.club.logo.url}
                                                        alt={`${tournament.club.nombre} Logo`}
                                                        className="w-12 h-12 object-contain rounded-full border-2 border-gray-200"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            <p className="flex items-center gap-2 mb-1">
                                                <FaCalendarAlt className="text-gray-400" />
                                                <strong className="font-semibold">Fechas:</strong>{" "}
                                                {new Date(tournament.fechaInicio).toLocaleDateString()} -{" "}
                                                {new Date(tournament.fechaFin).toLocaleDateString()}
                                            </p>
                                            <p className="flex items-center gap-2 mb-1">
                                                <FaTrophy className="text-gray-400" />
                                                <strong className="font-semibold">Categoría:</strong>{" "}
                                                {tournament.categoria?.nombre || "N/A"}
                                            </p>
                                            <p className="flex items-center gap-2 mb-1">
                                                <FaDoorOpen className="text-gray-400" />
                                                <strong className="font-semibold">Estado:</strong>{" "}
                                                <span className={`font-medium ${getStatusColor(tournament.estado)}`}>
                                                    {tournament.estado}
                                                </span>
                                            </p>
                                            <p className="flex items-center gap-2">
                                                <FaTrophy className="text-gray-400" />
                                                <strong className="font-semibold">Club:</strong>{" "}
                                                {tournament.club?.nombre || "N/A"}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleViewMatches(tournament.documentId, tournament.nombre)}
                                            className="mt-6 w-full py-3 px-4 font-bold rounded-lg shadow-md transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-opacity-50
                                            bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500"
                                            aria-label={`Ver partidos del torneo ${tournament.nombre}`}
                                        >
                                            Ver Partidos
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-600 italic">
                            No hay torneos en estado "{status}" en este momento.
                        </p>
                    )}
                </div>
            ))}
        </div>
    );
}

const getStatusColor = (status) => {
    switch (status) {
        case 'Abierto':
            return 'text-green-600';
        case 'En Curso':
            return 'text-yellow-600';
        case 'Finalizado':
            return 'text-blue-600';
        case 'Próximamente':
            return 'text-purple-600';
        default:
            return 'text-gray-600';
    }
};

export default Tournaments;