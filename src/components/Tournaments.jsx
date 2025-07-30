// src/components/Tournaments.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Importa useNavigate

// Tournaments component to display a list of tournaments categorized by status
function Tournaments() { // Ya no recibe onViewMatches como prop
    // State to store tournaments data
    const [tournaments, setTournaments] = useState([]);
    // State to manage loading status
    const [loading, setLoading] = useState(true);
    // State to store any error messages
    const [error, setError] = useState(null);

    const navigate = useNavigate(); // Hook para la navegación programática

    const API_BASE = import.meta.env.VITE_API_BASE ;
    // API URL for tournaments - Using the new API URL provided by the user
    // Se ha modificado populate para que sea más específico si populate=* es muy pesado
    const TOURNAMENTS_API_URL = `${API_BASE}api/torneos?populate=club.logo&populate=partidos.pareja1&populate=partidos.pareja2&populate=partidos.ganador&populate=parejas_inscritas&populate=categoria`;

    // Fetch tournaments data on component mount
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
                    // Filter out any null entries and set tournaments
                    setTournaments(data.data.filter(t => t !== null));
                } else {
                    setTournaments([]); // Ensure it's an empty array if no data
                }
            } catch (err) {
                setError("Error al cargar los torneos. Inténtalo de nuevo más tarde.");
                console.error("Error fetching tournaments:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchTournaments();
    }, [TOURNAMENTS_API_URL]); // Dependency array: re-run if API URL changes

    // Function to group tournaments by status
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

    if (loading) {
        return <div className="text-center p-4">Cargando torneos...</div>;
    }

    if (error) {
        return <div className="text-center p-4 text-red-500">{error}</div>;
    }

    // Handler for viewing matches for a specific tournament
    const handleViewMatches = (tournamentId) => {
        // Usa navigate para ir a la ruta de detalles de partidos con el ID del torneo
        navigate(`/tournaments/${tournamentId}/matches`);
    };

    return (
        <div className="p-4">
            <h1 className="text-3xl font-bold text-blue-900 mb-6 text-center">Torneos</h1>

            {Object.keys(groupedTournaments).map(status => (
                <div key={status} className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">
                        {status}
                    </h2>
                    {groupedTournaments[status].length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {groupedTournaments[status].map(tournament => (
                                <div
                                    key={tournament.id}
                                    className="bg-white rounded-lg shadow-md p-6 flex flex-col justify-between"
                                >
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                                            {tournament.nombre}
                                        </h3>
                                        <p className="text-gray-700 text-sm mb-1">
                                            <strong className="font-semibold">Estado:</strong> {tournament.estado}
                                        </p>
                                        <p className="text-gray-700 text-sm mb-1">
                                            <strong className="font-semibold">Inicio:</strong>{" "}
                                            {new Date(tournament.fechaInicio).toLocaleDateString()}
                                        </p>
                                        <p className="text-gray-700 text-sm mb-1">
                                            <strong className="font-semibold">Fin:</strong>{" "}
                                            {new Date(tournament.fechaFin).toLocaleDateString()}
                                        </p>
                                        <p className="text-gray-700 text-sm mb-1">
                                            <strong className="font-semibold">Club:</strong>{" "}
                                            {tournament.club?.nombre || "N/A"}
                                        </p>
                                        {tournament.categorias && tournament.categorias.length > 0 && (
                                            <p className="text-gray-700 text-sm mb-1">
                                                <strong className="font-semibold">Categoría:</strong>{" "}
                                                {tournament.categorias[0].nombre}
                                            </p>
                                        )}
                                        {tournament.club?.logo?.url && (
                                            <div className="mt-2">
                                                <img
                                                    src={tournament.club.logo.url}
                                                    alt={`${tournament.club.nombre} Logo`}
                                                    className="w-10 h-10 object-contain rounded-full border border-gray-200"
                                                />
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => handleViewMatches(tournament.documentId)}
                                        className="mt-4 w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-200"
                                    >
                                        Ver Partidos
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-600">No hay torneos en estado "{status}" en este momento.</p>
                    )}
                </div>
            ))}
        </div>
    );
}

export default Tournaments;