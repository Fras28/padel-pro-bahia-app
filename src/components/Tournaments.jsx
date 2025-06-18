// src/components/Tournaments.jsx
import React, { useEffect, useState } from 'react';
import TournamentDetailModal from './TournamentDetailModal'; // Import the detail modal

// Tournaments component to display a list of tournaments categorized by status
function Tournaments() {
    // State to store tournaments data
    const [tournaments, setTournaments] = useState([]);
    // State to manage loading status
    const [loading, setLoading] = useState(true);
    // State to store any error messages
    const [error, setError] = useState(null);
    // State to store the tournament selected for detail view
    const [selectedTournament, setSelectedTournament] = useState(null);
    const API_BASE = import.meta.env.VITE_API_BASE
    // API URL for tournaments - Using the new API URL provided by the user
   const TOURNAMENTS_API_URL = API_BASE+`api/torneos?populate=club.logo&populate=parejas_inscritas&populate=categorias`;

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
                    // Filter out any null/empty objects if the API sends them
                    const validTournaments = data.data.filter(tournament => tournament && tournament.id);

                    // Custom sorting logic for desired order: "En Curso", "Abiertos", "Finalizados"
                    const sortOrder = {
                        "En Curso": 1,
                        "Abierto": 2, // The API returns "Abierto" but the user wants "Abiertos" category
                        "Finalizado": 3
                    };

                    const sortedTournaments = validTournaments.sort((a, b) => {
                        const statusA = a.estado || 'Unknown';
                        const statusB = b.estado || 'Unknown';
                        return (sortOrder[statusA] || 99) - (sortOrder[statusB] || 99);
                    });

                    setTournaments(sortedTournaments);
                } else {
                    setTournaments([]);
                    console.warn("La estructura de datos de la API de torneos no es la esperada.");
                }
            } catch (err) {
                setError("Error al cargar los torneos. Inténtalo de nuevo más tarde.");
                console.error("Error fetching tournaments:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchTournaments();
    }, []);

    // Function to group tournaments by status for rendering
    const groupTournamentsByStatus = (tournamentsList) => {
        const grouped = {
            "En Curso": [],
            "Abiertos": [], // Category name requested by user
            "Finalizados": []
        };

        tournamentsList.forEach(tournament => {
            if (tournament.estado === "En Curso") {
                grouped["En Curso"].push(tournament);
            } else if (tournament.estado === "Abierto") { // API value is "Abierto"
                grouped["Abiertos"].push(tournament);
            } else if (tournament.estado === "Finalizado") {
                grouped["Finalizados"].push(tournament);
            }
            // Tournaments with other statuses will not be grouped here
        });
        return grouped;
    };

    const groupedTournaments = groupTournamentsByStatus(tournaments);

    // Function to handle card click and open the modal
    const handleCardClick = (tournament) => {
        setSelectedTournament(tournament);
    };

    // Function to close the modal
    const handleCloseModal = () => {
        setSelectedTournament(null);
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-md p-6 text-center">
                <p className="text-gray-600">Cargando torneos...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-xl shadow-md p-6 text-center">
                <p className="text-red-500">{error}</p>
                <button
                    onClick={() => window.location.reload()} // Simple reload to try again
                    className="mt-4 px-6 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition-colors duration-200"
                >
                    Volver a Inicio
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 sm:mb-6 text-center">Listado de Torneos</h2>

            {/* Iterate over the desired order of statuses */}
            {["En Curso", "Abiertos", "Finalizados"].map(status => (
                <div key={status} className="mb-8 last:mb-0">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-700 mb-4 border-b-2 pb-2">
                        {status}
                    </h3>
                    {groupedTournaments[status].length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {groupedTournaments[status].map(tournament => (
                                <div
                                    key={tournament.id}
                                    className="bg-gray-50 rounded-lg shadow-sm p-4 border border-gray-200 cursor-pointer hover:shadow-md transition-shadow duration-200"
                                    onClick={() => handleCardClick(tournament)} // Make card clickable
                                >
                                    <h4 className="text-lg font-semibold text-blue-700">{tournament.nombre}</h4>
                                    <p className="text-sm text-gray-600">Estado: <span className="font-medium">{tournament.estado}</span></p>
                                    <p className="text-sm text-gray-600">Tipo: {tournament.tipoTorneo}</p>
                                    <p className="text-sm text-gray-600">Género: {tournament.genero}</p>
                                    {tournament.fechaInicio && <p className="text-sm text-gray-600">Inicio: {new Date(tournament.fechaInicio).toLocaleDateString()}</p>}
                                    {tournament.fechaFin && <p className="text-sm text-gray-600">Fin: {new Date(tournament.fechaFin).toLocaleDateString()}</p>}
                                    <p className="text-sm text-gray-600">Inscripción: ${tournament.precioInscripcion}</p>
                                    <p className="text-sm text-gray-600">Máx Parejas: {tournament.maxParejas}</p>
                                    {/* Display Category Name */}
                                    {tournament.categorias && tournament.categorias.length > 0 && (
                                        <p className="text-sm text-gray-600">Categoria: {tournament.categorias[0].nombre}</p>
                                    )}

                                    {/* Prizes Information */}
                                    {tournament.premios && (
                                        <div className="mt-3 pt-3 border-t border-gray-200">
                                            <p className="text-sm text-gray-700 font-semibold mb-1">
                                                Premios:
                                            </p>
                                            <p className="text-sm text-gray-600 whitespace-pre-line">
                                                {tournament.premios}
                                            </p>
                                        </div>
                                    )}

                                    {/* Club Information */}
                                    {tournament.club && (
                                        <div className="mt-3 pt-3 border-t border-gray-200">
                                            {/* <p className="text-sm text-gray-700 font-semibold mb-1">
                                                Club: {tournament.club.nombre || 'N/A'}
                                            </p> */}
                                            {tournament.club.logo && tournament.club.logo.url && (
                                                <img
                                                    src={tournament.club.logo.url}
                                                    alt={`${tournament.club.nombre || 'Club'} Logo`}
                                                    className="w-10 h-10 object-contain rounded-md shadow-sm bg-black p-1"
                                                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/40x40/cccccc/333333?text=Club'; }} // Fallback
                                                />
                                            )}
                                        </div>
                                    )}

                                    {/* Display Winner for "Finalizado" tournaments */}
                                    {tournament.estado === 'Finalizado' && tournament.ganador_torneo && (
                                        <div className="mt-3 pt-3 border-t border-gray-200">
                                            <p className="text-sm text-green-700 font-bold mb-1">
                                                Pareja Ganadora: {tournament.ganador_torneo.nombrePareja}
                                            </p>
                                        </div>
                                    )}

                                    {/* WhatsApp Button for "Abierto" tournaments */}
                                    {tournament.estado === 'Abierto' && tournament.club && tournament.club.telefono && (
                                        <div className="mt-4 pt-3 border-t border-gray-200">
                                            {(() => {
                                                const rawPhoneNumber = tournament.club.telefono;
                                                let parsedPhoneNumber = rawPhoneNumber;

                                                // Remove leading '0' if present, as per common Argentina mobile number formatting for WhatsApp
                                                if (parsedPhoneNumber.startsWith('0') && parsedPhoneNumber.length > 1) {
                                                    parsedPhoneNumber = parsedPhoneNumber.substring(1);
                                                }

                                                // Prepend Argentina's country code (54) and '9' for mobile numbers
                                                const formattedPhoneNumber = '549' + parsedPhoneNumber;

                                                const message = encodeURIComponent(`Hola, me gustaría solicitar la inscripción para el torneo ${tournament.nombre}.`);
                                                const whatsappLink = `https://wa.me/${formattedPhoneNumber}?text=${message}`;

                                                return (
                                                    <>
                                                        <a
                                                            href={whatsappLink}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className=" w-full text-center bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 text-sm flex items-center justify-center"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor" className="w-4 h-4 mr-2">
                                                                {/* FontAwesome WhatsApp icon SVG path */}
                                                                <path d="M380.9 97.1C339.2 53.7 283.5 25.1 224 25.1c-119.5 0-216.5 97-216.5 216.5 0 35.3 8.3 68.3 24.3 97.1L1.6 476.3l100.2-26.2c28.5 15.5 60.1 23.8 93.3 23.8h0c119.5 0 216.5-97 216.5-216.5 0-59.5-28.6-115.2-72-156.9zM224 433.8c-25.2 0-49.3-6.7-70.1-19.3L111 411.3l-20.5 5.4 5.4-20.5 13.7-32.1c-13.6-21.2-20.9-45.8-20.9-70.1 0-80.9 65.7-146.6 146.6-146.6 39.3 0 76.5 15.3 104.5 43.3s43.3 65.2 43.3 104.5c0 80.9-65.7 146.6-146.6 146.6zM342.3 218.8c-2.9-1.5-17.2-8.4-19.9-9.3s-4.6-1.4-6.5 1.4-8.7 11.7-10.6 14.1-3.8 2.6-7 1.1c-19.9-9.3-46.1-18.9-66.2-38.9-1.9-1.9-1.5-2.9 1.3-5.7s4.2-6.5 6.2-9.3c1.9-2.9 2.6-4.9 3.9-6.5 1.4-1.9.7-3.8-.7-4.6s-6.5-1.4-9.3-1.4c-2.9 0-5.7.7-8.7 1.4-2.9.7-7.7 2.9-11.7 5.7-3.8 2.9-8.4 8.7-12.2 16.6s-5.7 15.3-8.7 18.2c-2.9 2.9-5.7 5.7-8.7 8.4-2.9 2.9-5.7 4.2-8.7 4.2h-1.4c-2.9 0-5.7-.7-8.7-1.4-2.9-.7-5.7-1.4-8.7-2.9s-5.7-1.9-7.7-1.9c-2.9 0-5.7 1.4-8.7 1.4-2.9.7-5.7 1.4-8.7 2.9s-4.6 2.9-6.5 5.7-2.9 5.7-4.2 8.7-1.4 7-1.4 8.4c0 1.4.7 2.9 1.4 4.2.7 1.4 1.9 2.9 2.9 4.2 1.9 1.9 3.8 3.8 5.7 6.5s4.2 5.7 6.5 8.7c2.9 2.9 5.7 5.7 8.7 8.7s6.5 6.5 10.6 9.3c4.2 2.9 8.7 5.7 13.6 8.7 4.9 2.9 10.6 5.7 16.6 7c5.9 1.4 11.7 2.1 16.6 2.1 4.9 0 9.3-.7 13.6-1.4 4.9-.7 9.9-1.9 14.1-3.8 4.2-1.9 8.7-3.8 12.2-5.7 3.8-1.9 7.7-3.8 10.6-5.7s5.4-3.5 7-4.6c1.9-1.4 3.5-1.9 5-1.9h.7c1.4 0 2.9.7 4.2 1.4 1.4.7 2.9 1.9 3.8 2.9 1.9 1.9 3.5 3.8 4.6 5.7s1.9 3.5 1.9 4.2c0 .7-.7 1.4-1.4 1.9s-2.9.7-4.2.7h-1.4c-.7 0-1.4-.7-2.1-.7s-1.4-.7-1.9-.7c-2.9-1.4-5.7-2.9-8.4-4.2s-5.7-2.9-8.4-4.2c-2.9-1.4-5.7-2.9-8.4-4.2-2.9-1.4-5.7-2.9-8.4-4.2z"/>
                                                            </svg>
                                                            ¡Inscríbete por WhatsApp!
                                                        </a>
                                                        <p className="text-xs text-gray-500 mt-1 text-center">
                                                            El número debe estar en formato WhatsApp.
                                                        </p>
                                                    </>
                                                );
                                            })()}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-gray-600">No hay torneos {status.toLowerCase()}.</p>
                    )}
                </div>
            ))}

            {/* Render the TournamentDetailModal when a tournament is selected */}
            {selectedTournament && (
                <TournamentDetailModal tournament={selectedTournament} onClose={handleCloseModal} />
            )}
        </div>
    );
}

export default Tournaments;