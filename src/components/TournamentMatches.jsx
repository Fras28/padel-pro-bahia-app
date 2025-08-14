// src/components/TournamentMatches.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function TournamentMatches({ API_BASE }) {
    const { tournamentId } = useParams();
    const navigate = useNavigate();

    const [tournament, setTournament] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTournamentDetails = async () => {
            if (!tournamentId) {
                setError("No se encontró el ID del torneo en la URL.");
                setLoading(false);
                return;
            }

            try {
                // Corrected API URL to use nested populate syntax
                const TOURNAMENT_DETAIL_API_URL = `${API_BASE}api/torneos/${tournamentId}?populate=club.logo&populate=partidos.pareja1&populate=partidos.pareja2&populate=partidos.ganador&populate=parejas_inscritas.drive&populate=parejas_inscritas.revez&populate=categoria`;
                const response = await fetch(TOURNAMENT_DETAIL_API_URL);

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                console.log("Datos brutos de la API (Detalle de Torneo):", data.data);

                if (data.data) {
                    setTournament(data.data);
                } else {
                    setTournament(null);
                    console.warn("La estructura de datos del detalle del torneo no es la esperada.");
                }
            } catch (err) {
                setError("Error al cargar los detalles del torneo. Inténtalo de nuevo más tarde.");
                console.error("Error fetching tournament details:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchTournamentDetails();
    }, [tournamentId, API_BASE]);

    const handleBack = () => {
        navigate('/tournaments');
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-md p-6 text-center">
                <p className="text-gray-600">Cargando detalles del torneo...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-xl shadow-md p-6 text-center">
                <p className="text-red-500">{error}</p>
                <button
                    onClick={handleBack}
                    className="mt-4 px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-200"
                >
                    Volver a Torneos
                </button>
            </div>
        );
    }

    if (!tournament) {
        return (
            <div className="bg-white rounded-xl shadow-md p-6 text-center">
                <p className="text-gray-600">Torneo no encontrado.</p>
                <button
                    onClick={handleBack}
                    className="mt-4 px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-200"
                >
                    Volver a Torneos
                </button>
            </div>
        );
    }

    const clubName = tournament.club?.nombre || "N/A";
    const clubLogoUrl =
        tournament.club?.logo?.url ||
        "https://placehold.co/40x40/4F46E5/FFFFFF?text=Club";

    const startDate = tournament.fechaInicio
        ? new Date(tournament.fechaInicio).toLocaleDateString()
        : "N/A";
    const endDate = tournament.fechaFin
        ? new Date(tournament.fechaFin).toLocaleDateString()
        : "N/A";

    const matches = tournament.partidos || [];
    const registeredPairs = tournament.parejas_inscritas || [];

    return (
        <div className="p-6 bg-white rounded-xl shadow-lg relative w-full max-w-2xl mx-auto my-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
                Detalles del Torneo
            </h2>
            <div className='flex gap-2 mb-4'>
                <button
                    onClick={handleBack}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-300 ease-in-out transform hover:-translate-y-1"
                >
                    Volver a Torneos
                </button>
            </div>
            
            {/* Tournament Details Section */}
            <div className="mb-6 border-b pb-4">
                <h3 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center justify-between">
                    Información del Torneo
                </h3>
                <div className="flex items-center mb-4">
                    {tournament.club?.logo?.url && (
                        <img
                            src={clubLogoUrl}
                            alt={`${clubName} Logo`}
                            className="w-16 h-16 object-contain rounded-full mr-4 shadow-sm"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://placehold.co/48x48/cccccc/333333?text=Club";
                            }}
                        />
                    )}
                    <div>
                        <p className="text-xl font-bold text-gray-900">{tournament.nombre || "N/A"}</p>
                    </div>
                </div>
                <ul className="space-y-3">
                    <li className="flex justify-between items-center bg-gray-50 p-3 rounded-lg shadow-sm">
                        <span className="text-sm font-medium text-gray-500">Estado:</span>
                        <span className="text-sm font-semibold text-gray-900">{tournament.estado}</span>
                    </li>
                    <li className="flex justify-between items-center bg-gray-50 p-3 rounded-lg shadow-sm">
                        <span className="text-sm font-medium text-gray-500">Tipo de Torneo:</span>
                        <span className="text-sm font-semibold text-gray-900">{tournament.tipoTorneo || 'N/A'}</span>
                    </li>
                    <li className="flex justify-between items-center bg-gray-50 p-3 rounded-lg shadow-sm">
                        <span className="text-sm font-medium text-gray-500">Género:</span>
                        <span className="text-sm font-semibold text-gray-900">{tournament.genero || 'N/A'}</span>
                    </li>
                    <li className="flex justify-between items-center bg-gray-50 p-3 rounded-lg shadow-sm">
                        <span className="text-sm font-medium text-gray-500">Fechas:</span>
                        <span className="text-sm font-semibold text-gray-900">{startDate} - {endDate}</span>
                    </li>
                    <li className="flex justify-between items-center bg-gray-50 p-3 rounded-lg shadow-sm">
                        <span className="text-sm font-medium text-gray-500">Precio de Inscripción:</span>
                        <span className="text-sm font-semibold text-gray-900">${tournament.precioInscripcion || 'N/A'}</span>
                    </li>

                    {tournament.categoria?.nombre && (
                        <li className="flex justify-between items-center bg-gray-50 p-3 rounded-lg shadow-sm">
                            <span className="text-sm font-medium text-gray-500">Categoría:</span>
                            <span className="text-sm font-semibold text-gray-900">{tournament.categoria.nombre}</span>
                        </li>
                    )}
                </ul>
            </div>
            {tournament.descripcion && (
                <div className="mb-6 border-b pb-4">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Descripción</h3>
                    <p className="text-gray-700 text-sm whitespace-pre-line">{tournament.descripcion}</p>
                </div>
            )}
            {tournament.premios && (
                <div className="mb-6 border-b pb-4">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Premios</h3>
                    <p className="text-gray-700 text-sm whitespace-pre-line">{tournament.premios}</p>
                </div>
            )}

            {/* Registered Pairs with Ranking Sum and Sorting */}
            {registeredPairs.length > 0 && (
                <div className="mb-6 border-b pb-4">
                    <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                        Parejas Inscriptas ({registeredPairs.length})
                    </h3>
                    <ul className="list-disc list-inside text-xs max-h-40 overflow-y-auto bg-gray-50 p-3 rounded-md text-black">
                        {[...registeredPairs]
                            .sort((a, b) => {
                                const rankingA = (parseFloat(a.drive?.rankingGeneral) || 0) + (parseFloat(a.revez?.rankingGeneral) || 0);
                                const rankingB = (parseFloat(b.drive?.rankingGeneral) || 0) + (parseFloat(b.revez?.rankingGeneral) || 0);
                                return rankingB - rankingA; // Orden descendente (de mayor a menor)
                            })
                            .map((pair) => {
                                const rankingDrive = pair.drive?.rankingGeneral || 0;
                                const rankingRevez = pair.revez?.rankingGeneral || 0;
                                const totalRanking = parseFloat(rankingDrive) + parseFloat(rankingRevez);
                                return (
                                    <li key={pair.id} className='text-black'>
                                        {pair?.nombrePareja}{" "}
                                        <span className="text-gray-500 font-normal text-xs">
                                            (Puntos: {totalRanking})
                                        </span>
                                    </li>
                                );
                            })}
                    </ul>
                </div>
            )}
            {registeredPairs.length === 0 && tournament.estado === "Abierto" && (
                <p className="mt-2 text-center text-gray-600">No hay parejas inscriptas aún para este torneo.</p>
            )}
            {registeredPairs.length === 0 && tournament.estado !== "Abierto" && (
                <p className="mt-2 text-center text-gray-600">No hay parejas inscriptas para este torneo.</p>
            )}

            {/* WhatsApp Button for "Abierto" tournaments */}
            {tournament.estado === "Abierto" &&
                tournament.club &&
                tournament.club.telefono && (
                    <div className="mt-4 pt-3 border-t border-gray-200">
                        {(() => {
                            const rawPhoneNumber = tournament.club.telefono;
                            let parsedPhoneNumber = rawPhoneNumber;
                            if (
                                parsedPhoneNumber.startsWith("0") &&
                                parsedPhoneNumber.length > 1
                            ) {
                                parsedPhoneNumber = parsedPhoneNumber.substring(1);
                            }
                            const formattedPhoneNumber = '549' + parsedPhoneNumber;
                            const message = encodeURIComponent(
                                `Hola, me gustaría solicitar la inscripción para el torneo ${tournament.nombre}.`
                            );
                            const whatsappLink = `https://wa.me/${formattedPhoneNumber}?text=${message}`;

                            return (
                                <>
                                    <a
                                        href={whatsappLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full text-center bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 text-sm flex items-center justify-center"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 448 512"
                                            fill="currentColor"
                                            className="w-4 h-4 mr-2"
                                        >
                                            <path d="M380.9 97.1C339.2 53.7 283.5 25.1 224 25.1c-11.7 0-23.4.7-34.8 2.1-79.6 10.7-142.3 73.4-153 153-1.4 11.4-2.1 23.1-2.1 34.8 0 59.5 24.1 114.7 66.5 156.9l-16.7 61.3 62.2-16.3c40.5 22.1 86.8 33.8 135.2 33.8h.2c114.6 0 207.6-93 207.6-207.6 0-59.5-24.1-114.7-66.5-156.9zM224 430.7H224.2c-47 0-91.8-11.6-131.9-33.6l-9.3-4.5-35.1 9.2 9.5-34.7-4.7-9c-42.4-42.4-66-98.8-66-159.2 0-30.8 4.7-60.5 13.9-88.7 8.3-26.1 20.2-50.6 35.7-71.5C92.2 67.5 154.3 35.1 224 35.1c32.7 0 64.3 6.4 93.8 19.3 28.5 12.4 54.4 30.4 75.6 51.5 21.2 21.2 39.2 47.1 51.5 75.6 12.9 29.5 19.3 61.1 19.3 93.8 0 70.3-32.4 132.4-86.8 174.6-20.9 15.6-45.4 27.5-71.5 35.7-28.2 9.2-57.9 13.9-88.7 13.9zM346.3 306.4c-2.3-1.1-13.7-6.8-15.8-7.6-2.1-.9-3.6-1.4-5.2 1.4-1.6 2.9-6 6.8-7.3 8.2-1.4 1.4-2.7 1.6-5 1.1s-10.7-3.9-20.5-12.6c-8.7-7.6-14.5-17.1-16.3-20.1-1.9-2.9-.2-4.5 1.2-5.7.7-.7 1.6-1.9 2.3-2.9 1.4-1.9 1.9-3.6 2.9-5.4.9-1.9.5-3.6-.2-5-.7-1.4-6.8-16.2-9.3-22.1-2.3-5.7-4.6-4.5-6-4.5-1.4 0-2.9-.2-4.5-.2-1.6 0-4.2.5-6.4 2.9-2.3 2.3-8.7 8.4-8.7 20.5 0 12.1 9 23.8 10.2 25.4 1.2 1.6 17.6 26.8 42.7 37.1 25.1 10.2 25.1 6.8 29.6 6.5 4.5-.2 13.7-5.6 15.6-11.4 1.9-5.7 1.9-10.6 1.4-11.4-.2-.7-.9-1.1-2.3-1.6z" />
                                        </svg>
                                        ¡Inscríbete por WhatsApp!
                                    </a>
                                    <p className="text-xs text-gray-500 mt-1 text-center">
                                        El número debe estar en formato internacional.
                                    </p>
                                </>
                            );
                        })()}
                    </div>
                )}

            {/* Matches Played Section */}
            <div className="mb-6">
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                    Partidos del Torneo ({matches.length})
                </h3>
                {matches.length > 0 ? (
                    <ul className="list-disc list-inside text-sm max-h-96 overflow-y-auto bg-gray-50 p-3 rounded-md">
                        {matches
                            .sort((a, b) => new Date(a.fechaPartido) - new Date(b.fechaPartido))
                            .map((match) => (
                                <li key={match.id} className="mb-2 p-2 border-b last:border-b-0 border-gray-200">
                                    <p className="font-medium text-black">
                                        Ronda: <span className="font-semibold">{match.ronda || "N/A"}</span>
                                    </p>
                                    {match.pareja1 && match.pareja2 && (
                                        <p className="font-medium text-black">
                                            Parejas: <span className={match.ganador?.documentId === match.pareja1.documentId ? "text-green-700 font-bold" : ""}>
                                                {match.pareja1?.nombrePareja}
                                            </span> vs <span className={match.ganador?.documentId === match.pareja2.documentId ? "text-green-700 font-bold" : ""}>
                                                {match.pareja2?.nombrePareja}
                                            </span>
                                        </p>
                                    )}
                                    <p className="font-medium text-black">
                                        Fecha: <span className="font-semibold">{match.fechaPartido ? new Date(match.fechaPartido).toLocaleString() : "N/A"}</span>
                                    </p>
                                    <p className="font-medium text-black">
                                        Cancha: <span className="font-semibold">{match.cancha || "N/A"}</span>
                                    </p>
                                    <p className="font-medium text-black">
                                        Estado: <span className={`font-semibold ${match.estado === "En Curso" ? "text-blue-600" : match.estado === "Finalizado" ? "text-green-600" : "text-gray-600"}`}>
                                            {match.estado || "N/A"}
                                        </span>
                                    </p>
                                    {match.resultadoSet1 && (
                                        <p className="font-medium text-black">
                                            Resultado: <span className="font-semibold">{match.resultadoSet1} {match.resultadoSet2 ? `- ${match.resultadoSet2}` : ""} {match.resultadoSet3 ? `- ${match.resultadoSet3}` : ""}</span>
                                        </p>
                                    )}
                                    {match?.ganador?.nombrePareja && (
                                        <p className="text-green-700 font-semibold">
                                            Ganador: {match.ganador?.nombrePareja}
                                        </p>
                                    )}
                                </li>
                            ))}
                    </ul>
                ) : (
                    <p>No hay partidos registrados para este torneo.</p>
                )}
            </div>
        </div>
    );
}

export default TournamentMatches;