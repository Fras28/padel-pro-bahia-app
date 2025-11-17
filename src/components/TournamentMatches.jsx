// src/components/TournamentMatches.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaList, FaSitemap } from 'react-icons/fa';

// =========================================================================
// COMPONENTE DE VISTA DE LLAVES (BRACKET)
// =========================================================================
const BracketView = ({ matchesByRound, tournamentName }) => {
    // Definir el orden de las rondas, de la primera a la última (Izquierda a Derecha)
    // Se ha incluido 'Zona' para la fase de grupos.
    const roundOrder = ['Zona', '32avos', '16avos', 'Octavos', 'Cuartos', 'Semifinal', 'Tercer Puesto', 'Final']; 
    
    // Obtener las rondas que realmente tienen partidos y ordenarlas
    const rounds = Object.keys(matchesByRound)
        .sort((a, b) => {
            const indexA = roundOrder.indexOf(a);
            const indexB = roundOrder.indexOf(b);
            
            // Poner las rondas no definidas (índice -1) al final
            if (indexA === -1 && indexB === -1) return 0;
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            
            // Ordenar de la primera ronda a la última (ascendente por índice: Zona -> Final)
            return indexA - indexB; 
        });

    if (rounds.length === 0) {
        return (
            <div className="text-center p-4 bg-yellow-100 rounded-lg">
                <p className="text-yellow-700 font-semibold">
                    No hay partidos registrados para este torneo.
                </p>
            </div>
        );
    }
    
    // Función de ayuda para formatear el resultado
    const formatResult = (match) => {
        let result = [];
        if (match.resultadoSet1) result.push(match.resultadoSet1);
        if (match.resultadoSet2) result.push(match.resultadoSet2);
        if (match.resultadoSet3) result.push(match.resultadoSet3);
        // Reemplazar 'x-x' con '-' en la presentación
        const formattedResults = result.map(res => res === 'x-x' ? '-' : res); 
        return formattedResults.length > 0 ? `(${formattedResults.join(' | ')})` : '';
    };

    return (
        <div className="overflow-x-auto p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Estructura del Torneo</h3>
            
            {/* Contenedor principal para las rondas (permite scroll horizontal) */}
            <div className="flex flex-nowrap space-x-6 min-w-max">
                {rounds.map(ronda => (
                    <div key={ronda} className="flex flex-col space-y-4">
                        <h4 className="text-lg font-semibold text-center text-blue-600 border-b border-blue-200 pb-1 sticky top-0 bg-gray-50 z-10">
                            {ronda}
                        </h4>
                        {/* Mapeo de partidos dentro de cada ronda, ordenados por fecha */}
                        {matchesByRound[ronda]
                            .sort((a, b) => new Date(a.fechaPartido) - new Date(b.fechaPartido))
                            .map((match) => {
                            // Asume que la API trae `pareja1`, `pareja2` y `ganador` poblados
                            const isP1Winner = match.ganador?.documentId === match.pareja1?.documentId;
                            const isP2Winner = match.ganador?.documentId === match.pareja2?.documentId;
                            const statusColor = match.estado === "Finalizado" ? "border-green-500" : match.estado === "En Curso" ? "border-yellow-500" : "border-gray-300";
                            const matchDate = match.fechaPartido ? new Date(match.fechaPartido).toLocaleString() : 'Fecha N/A';

                            return (
                                <div 
                                    key={match.id} 
                                    className={`relative w-64 p-3 bg-white rounded-lg shadow-md border-l-4 ${statusColor} min-h-32`}
                                >
                                    <div className="text-xs font-semibold text-gray-500 mb-1">
                                        Cancha {match.cancha || 'N/A'} - {matchDate}
                                    </div>
                                    
                                    {/* Pareja 1 */}
                                    <div className={`p-1 rounded mb-1 ${isP1Winner ? 'bg-green-100 font-bold' : 'bg-gray-100'}`}>
                                        <span className="text-sm overflow-hidden text-ellipsis whitespace-nowrap block text-gray-700">
                                            {match.pareja1?.nombrePareja || 'Equipo 1'}
                                        </span>
                                    </div>
                                    
                                    {/* Separador */}
                                    <div className="text-xs text-center font-bold my-1 text-gray-700">
                                        vs
                                    </div>
                                    
                                    {/* Pareja 2 */}
                                    <div className={`p-1 rounded ${isP2Winner ? 'bg-green-100 font-bold' : 'bg-gray-100'}`}>
                                        <span className="text-sm overflow-hidden text-ellipsis whitespace-nowrap block text-gray-700">
                                            {match.pareja2?.nombrePareja || 'Equipo 2'}
                                        </span>
                                    </div>
                                    
                                    {/* Resultado y Ganador */}
                                    {match.estado === "Finalizado" && (
                                        <>
                                            <div className="mt-2 text-xs font-bold text-center text-green-700">
                                                {formatResult(match)}
                                            </div>
                                            {match.ganador?.nombrePareja && (
                                                <div className="text-xs font-bold text-center text-green-700 mt-1">
                                                    Ganador: {match.ganador.nombrePareja}
                                                </div>
                                            )}
                                        </>
                                    )}
                                    {match.estado !== "Finalizado" && (
                                        <div className={`mt-2 text-xs font-semibold text-center ${statusColor.replace('border', 'text')}`}>
                                            {match.estado}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
};


// =========================================================================
// COMPONENTE PRINCIPAL
// =========================================================================
function TournamentMatches({ API_BASE }) {
    const { tournamentId } = useParams();
    const navigate = useNavigate();

    const [tournament, setTournament] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // Estado para alternar entre 'list' (por defecto) o 'bracket'
    const [viewMode, setViewMode] = useState('list'); 

    // Función auxiliar para agrupar partidos por ronda
    const groupMatchesByRound = (matches) => {
        if (!matches) return {};
        const grouped = {};
        matches.forEach(match => {
            // Usa 'N/A' para partidos sin ronda definida
            const ronda = match.ronda || 'N/A'; 
            if (!grouped[ronda]) {
                grouped[ronda] = [];
            }
            grouped[ronda].push(match);
        });
        return grouped;
    };


    useEffect(() => {
        const fetchTournamentDetails = async () => {
            if (!tournamentId) {
                setError("No se encontró el ID del torneo en la URL.");
                setLoading(false);
                return;
            }

            try {
                // Se utiliza una URL de API para obtener el detalle del torneo, incluyendo
                // todas las relaciones necesarias (club.logo, partidos.pareja1, etc.)
                const TOURNAMENT_DETAIL_API_URL = `${API_BASE}api/torneos/${tournamentId}?populate=club.logo&populate=partidos.pareja1&populate=partidos.pareja2&populate=partidos.ganador&populate=parejas_inscritas.drive&populate=parejas_inscritas.revez&populate=categoria`;
                const response = await fetch(TOURNAMENT_DETAIL_API_URL);

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();

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

        // NOTA: Se asume que 'API_BASE' es pasado como prop o se define globalmente
        // Si API_BASE se define con import.meta.env.VITE_API_BASE, debe ser definido fuera del componente para que este prop no sea necesario.
        // Si es un prop, el componente debe ser llamado correctamente: <TournamentMatches API_BASE={import.meta.env.VITE_API_BASE} />
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

    // Extracción de datos y formateo
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
    const groupedMatches = groupMatchesByRound(matches); // Agrupar partidos


    return (
        <div className="p-6 bg-white rounded-xl shadow-lg relative w-full max-w-4xl mx-auto my-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
                Detalles del Torneo
            </h2>
            
            {/* Botones de navegación y alternancia de vista */}
            <div className='flex gap-2 mb-4'>
                <button
                    onClick={handleBack}
                    className="flex-grow flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-300 ease-in-out transform hover:-translate-y-1"
                >
                    Volver a Torneos
                </button>
                
                {/* Botón para alternar la vista */}
                {matches.length > 0 && (
                    <button
                        onClick={() => setViewMode(viewMode === 'list' ? 'bracket' : 'list')}
                        className="flex-grow-0 flex items-center justify-center py-3 px-6 border border-transparent rounded-lg shadow-lg text-sm font-medium transition duration-300 ease-in-out transform hover:-translate-y-1
                        bg-yellow-500 text-white hover:bg-yellow-600"
                    >
                        {viewMode === 'list' ? (
                            <>
                                <FaSitemap className="mr-2" />
                                Ver Llaves
                            </>
                        ) : (
                            <>
                                <FaList className="mr-2" />
                                Ver Lista
                            </>
                        )}
                    </button>
                )}
            </div>
            
            {/* Tournament Details Section */}
            <div className="mb-6 border-b pb-4">
                <h3 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center justify-between">
                    Información del Torneo
                </h3>
                {/* Detalles del Club y Torneo... (resto del contenido sin modificar) */}
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

            {/* Registered Pairs section (sin cambios) */}
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
                                return rankingB - rankingA; 
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

            {/* WhatsApp Button (sin cambios) */}
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
            
            {/* Contenedor de Partidos: Renderizado Condicional */}
            <div className="mb-6">
                <h3 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center justify-between">
                    Partidos del Torneo ({matches.length})
                </h3>
                
                {matches.length === 0 && (
                    <p>No hay partidos registrados para este torneo.</p>
                )}

                {matches.length > 0 && (
                    <div className="mt-4">
                        {viewMode === 'list' ? (
                            // Vista de Lista (el código original)
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
                            // Nueva Vista de Llaves (Bracket)
                            <BracketView matchesByRound={groupedMatches} tournamentName={tournament.nombre} />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default TournamentMatches;