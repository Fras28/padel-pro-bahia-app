// src/components/TournamentMatches.jsx
import React from 'react';

// TournamentMatches component to display the list of matches for a specific tournament, now including all tournament details
function TournamentMatches({ tournament, onBack }) { // Changed props to receive the full tournament object
    if (!tournament) {
        return (
            <div className="p-6 bg-white rounded-xl shadow-lg relative w-full max-w-2xl mx-auto my-8">
                <button
                    onClick={onBack}
                    className="absolute top-4 left-4 text-gray-500 hover:text-gray-800 transition-colors duration-200"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                </button>
                <p className="text-center text-gray-600">No se ha seleccionado ningún torneo para mostrar detalles.</p>
            </div>
        );
    }

    // Access club information safely
    const clubName = tournament.club?.nombre || 'N/A';
    const clubLogoUrl = tournament.club?.logo?.url || 'https://placehold.co/40x40/cccccc/333333?text=Club';

    // Format dates for display
    const startDate = tournament.fechaInicio ? new Date(tournament.fechaInicio).toLocaleDateString() : 'N/A';
    const endDate = tournament.fechaFin ? new Date(tournament.fechaFin).toLocaleDateString() : 'N/A';

    const matches = tournament.partidos || []; // Ensure matches array exists

    return (
        <div className="p-6 bg-white rounded-xl shadow-lg relative w-full max-w-2xl mx-auto my-8">
            <button
                onClick={onBack}
                className="absolute top-4 left-4 text-gray-500 hover:text-gray-800 transition-colors duration-200"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
            </button>
            <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
                Detalles del Torneo: {tournament.nombre || 'N/A'}
            </h2>

            {/* Tournament Details Section (from TournamentDetailModal) */}
            <div className="space-y-3 text-gray-700 mb-6 border-b pb-4">
                <p><strong className="font-semibold">Estado:</strong> <span className="font-medium">{tournament.estado}</span></p>
                <p><strong className="font-semibold">Tipo de Torneo:</strong> {tournament.tipoTorneo || 'N/A'}</p>
                <p><strong className="font-semibold">Género:</strong> {tournament.genero || 'N/A'}</p>
                <p><strong className="font-semibold">Inicio:</strong> {startDate}</p>
                <p><strong className="font-semibold">Fin:</strong> {endDate}</p>
                <p><strong className="font-semibold">Inscripción:</strong> ${tournament.precioInscripcion || 'N/A'}</p>
                <p><strong className="font-semibold">Máx. Parejas:</strong> {tournament.maxParejas || 'N/A'}</p>
                {/* Display Category Name */}
                {tournament.categorias && tournament.categorias.length > 0 && (
                    <p><strong className="font-semibold">Categoría:</strong> {tournament.categorias[0].nombre}</p>
                )}
                {tournament.descripcion && <p><strong className="font-semibold">Descripción:</strong> {tournament.descripcion}</p>}

                {tournament.premios && (
                    <div className="border-t pt-3 mt-3">
                        <p className="font-semibold text-lg mb-1">Premios:</p>
                        <p className="whitespace-pre-line text-sm">{tournament.premios}</p>
                    </div>
                )}

                {/* Club Information */}
                <div className="border-t pt-3 mt-3 flex items-center">
                    {tournament.club?.logo?.url && (
                        <img
                            src={clubLogoUrl}
                            alt={`${clubName} Logo`}
                            className="w-12 h-12 object-contain rounded-full mr-3 shadow-sm"
                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/48x48/cccccc/333333?text=Club'; }} // Fallback
                        />
                    )}
                    <p className="font-semibold text-lg">Club: {clubName}</p>
                </div>

                {/* Registered Pairs - Now using nombrePareja and showing count */}
                {tournament.parejas_inscritas && tournament.parejas_inscritas.length > 0 && (
                    <div className="border-t pt-3 mt-3">
                        <p className="font-semibold text-lg mb-2">
                            Parejas Inscritas ({tournament.parejas_inscritas.length}):
                        </p>
                        <ul className="list-disc list-inside text-sm max-h-40 overflow-y-auto bg-gray-50 p-3 rounded-md">
                            {tournament.parejas_inscritas.map(pair => (
                                <li key={pair.id}>
                                    {pair.nombrePareja}
                                </li>
                            ))}
                            {tournament.parejas_inscritas.length === 0 && <p>No hay parejas inscritas.</p>}
                        </ul>
                    </div>
                )}
            </div>

            {/* WhatsApp Button for "Abierto" tournaments */}
            {tournament.estado === 'Abierto' && tournament.club && tournament.club.telefono && (
                <div className="mt-4 pt-3 border-t border-gray-200">
                    {(() => {
                        const rawPhoneNumber = tournament.club.telefono;
                        let parsedPhoneNumber = rawPhoneNumber;
                        // Remove leading '0' if present, e.g., '02915729501' -> '2915729501'
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
                                    className="w-full text-center bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 text-sm flex items-center justify-center"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor" className="w-4 h-4 mr-2">
                                        <path d="M380.9 97.1C339.2 53.7 283.5 25.1 224 25.1c-11.7 0-23.4.7-34.8 2.1-79.6 10.7-142.3 73.4-153 153-1.4 11.4-2.1 23.1-2.1 34.8 0 59.5 24.1 114.7 66.5 156.9l-16.7 61.3 62.2-16.3c40.5 22.1 86.8 33.8 135.2 33.8h.2c114.6 0 207.6-93 207.6-207.6 0-59.5-24.1-114.7-66.5-156.9zM224 430.7H224.2c-47 0-91.8-11.6-131.9-33.6l-9.3-4.5-35.1 9.2 9.5-34.7-4.7-9c-42.4-42.4-66-98.8-66-159.2 0-30.8 4.7-60.5 13.9-88.7 8.3-26.1 20.2-50.6 35.7-71.5C92.2 67.5 154.3 35.1 224 35.1c32.7 0 64.3 6.4 93.8 19.3 28.5 12.4 54.4 30.4 75.6 51.5 21.2 21.2 39.2 47.1 51.5 75.6 12.9 29.5 19.3 61.1 19.3 93.8 0 70.3-32.4 132.4-86.8 174.6-20.9 15.6-45.4 27.5-71.5 35.7-28.2 9.2-57.9 13.9-88.7 13.9zM346.3 306.4c-2.3-1.1-13.7-6.8-15.8-7.6-2.1-.9-3.6-1.4-5.2 1.4-1.6 2.9-6 6.8-7.3 8.2-1.4 1.4-2.7 1.6-5 1.1s-10.7-3.9-20.5-12.6c-8.7-7.6-14.5-17.1-16.3-20.1-1.9-2.9-.2-4.5 1.2-5.7.7-.7 1.6-1.9 2.3-2.9 1.4-1.9 1.9-3.6 2.9-5.4.9-1.9.5-3.6-.2-5-.7-1.4-6.8-16.2-9.3-22.1-2.3-5.7-4.6-4.5-6-4.5-1.4 0-2.9-.2-4.5-.2-1.6 0-4.2.5-6.4 2.9-2.3 2.3-8.7 8.4-8.7 20.5 0 12.1 9 23.8 10.2 25.4 1.2 1.6 17.6 26.8 42.7 37.1 25.1 10.2 25.1 6.8 29.6 6.5 4.5-.2 13.7-5.6 15.6-11.4 1.9-5.7 1.9-10.6 1.4-11.4-.2-.7-.9-1.1-2.3-1.6z"/>
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
            <div className="border-t pt-3 mt-3">
                <p className="font-semibold text-lg mb-2">Partidos del Torneo ({matches.length}):</p>
                {matches.length > 0 ? (
                    <ul className="list-disc list-inside text-sm max-h-96 overflow-y-auto bg-gray-50 p-3 rounded-md">
                        {matches.sort((a, b) => new Date(a.fechaPartido) - new Date(b.fechaPartido)).map(match => (
                            <li key={match.id} className="mb-2">
                                <p className="font-medium">Ronda: {match.ronda || 'N/A'}</p>
                                {match.pareja1 && match.pareja2 && (
                                    <p>
                                        Parejas: {match.pareja1.nombrePareja} vs {match.pareja2.nombrePareja}
                                    </p>
                                )}
                                <p>Fecha: {match.fechaPartido ? new Date(match.fechaPartido).toLocaleString() : 'N/A'}</p>
                                <p>Cancha: {match.cancha || 'N/A'}</p>
                                <p>Estado: <span className={`font-semibold ${match.estado === 'En Curso' ? 'text-blue-600' : match.estado === 'Finalizado' ? 'text-green-600' : 'text-gray-600'}`}>{match.estado || 'N/A'}</span></p>
                                {match.resultadoSet1 && (
                                    <p>Resultado: {match.resultadoSet1} {match.resultadoSet2 ? `- ${match.resultadoSet2}` : ''} {match.resultadoSet3 ? `- ${match.resultadoSet3}` : ''}</p>
                                )}
                                {match.ganador_pareja && ( // Assuming a 'ganador_pareja' field for the winning pair
                                    <p className="text-green-700 font-semibold">Ganador: {match.ganador_pareja.nombrePareja}</p>
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