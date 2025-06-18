// src/components/TournamentDetailModal.jsx
import React from 'react';

// TournamentDetailModal component to display comprehensive tournament information
function TournamentDetailModal({ tournament, onClose }) {
    if (!tournament) {
        return null; // Don't render if no tournament data is provided
    }

    // Access club information safely
    const clubName = tournament.club?.nombre || 'N/A';
    const clubLogoUrl = tournament.club?.logo?.url || 'https://placehold.co/40x40/cccccc/333333?text=Club';

    // Format dates for display
    const startDate = tournament.fechaInicio ? new Date(tournament.fechaInicio).toLocaleDateString() : 'N/A';
    const endDate = tournament.fechaFin ? new Date(tournament.fechaFin).toLocaleDateString() : 'N/A';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50 overflow-y-auto" onClick={onClose}>
            <div
                className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg mx-auto relative animate-fade-in-down transform scale-95 transition-transform duration-300"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition-colors duration-200"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center border-b pb-2">
                    {tournament.nombre}
                </h3>

                <div className="space-y-3 text-gray-700 mb-6">
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

                    {/* Matches Played - Removed as 'partidos' is no longer populated by the new API
                    {tournament.partidos && tournament.partidos.length > 0 && (
                        <div className="border-t pt-3 mt-3">
                            <p className="font-semibold text-lg mb-2">Partidos Jugados ({tournament.partidos.length}):</p>
                            <ul className="list-disc list-inside text-sm max-h-40 overflow-y-auto bg-gray-50 p-3 rounded-md">
                                {tournament.partidos.map(match => (
                                    <li key={match.id}>
                                        Cancha: {match.cancha?.numero || 'N/A'}, Resultado: {match.resultado || 'N/A'}
                                        {match.ganador && ` (Ganador: ${match.ganador.nombre} ${match.ganador.apellido})`}
                                    </li>
                                ))}
                                {tournament.partidos.length === 0 && <p>No hay partidos registrados.</p>}
                            </ul>
                        </div>
                    )}
                    */}
                </div>

                {/* WhatsApp Button for "Abierto" tournaments inside the modal */}
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
                                            {/* FontAwesome WhatsApp icon SVG path */}
                                            <path d="M380.9 97.1C339.2 53.7 283.5 25.1 224 25.1c-119.5 0-216.5 97-216.5 216.5 0 35.3 8.3 68.3 24.3 97.1L1.6 476.3l100.2-26.2c28.5 15.5 60.1 23.8 93.3 23.8h0c119.5 0 216.5-97 216.5-216.5 0-59.5-28.6-115.2-72-156.9zM224 433.8c-25.2 0-49.3-6.7-70.1-19.3L111 411.3l-20.5 5.4 5.4-20.5 13.7-32.1c-13.6-21.2-20.9-45.8-20.9-70.1 0-80.9 65.7-146.6 146.6-146.6 39.3 0 76.5 15.3 104.5 43.3s43.3 65.2 43.3 104.5c0 80.9-65.7 146.6-146.6 146.6zM342.3 218.8c-2.9-1.5-17.2-8.4-19.9-9.3s-4.6-1.4-6.5 1.4-8.7 11.7-10.6 14.1-3.8 2.6-7 1.1c-19.9-9.3-46.1-18.9-66.2-38.9-1.9-1.9-1.5-2.9 1.3-5.7s4.2-6.5 6.2-9.3c1.9-2.9 2.6-4.9 3.9-6.5 1.4-1.9.7-3.8-.7-4.6s-6.5-1.4-9.3-1.4c-2.9 0-5.7.7-8.7 1.4-2.9.7-7.7 2.9-11.7 5.7-3.8 2.9-8.4 8.7-12.2 16.6s-5.7 15.3-8.7 18.2c-2.9 2.9-5.7 5.7-8.7 8.4-2.9 2.9-5.7 4.2-8.7 4.2h-1.4c-2.9 0-5.7-.7-8.7-1.4-2.9-.7-5.7-1.4-8.7-2.9s-5.7-1.9-7.7-1.9c-2.9 0-5.7 1.4-8.7 1.4-2.9.7-5.7 1.4-8.7 2.9s-4.6 2.9-6.5 5.7-2.9 5.7-4.2 8.7-1.4 7-1.4 8.4c0 1.4.7 2.9 1.4 4.2.7 1.4 1.9 2.9 2.9 4.2 1.9 1.9 3.8 3.8 5.7 6.5s4.2 5.7 6.5 8.7c2.9 2.9 5.7 5.7 8.7 8.7s6.5 6.5 10.6 9.3c4.2 2.9 8.7 5.7 13.6 8.7 4.9 2.9 10.6 5.7 16.6 7c5.9 1.4 11.7 2.1 16.6 2.1 4.9 0 9.3-.7 13.6-1.4 4.9-.7 9.9-1.9 14.1-3.8 4.2-1.9 8.7-3.8 12.2-5.7 3.8-1.9 7.7-3.8 10.6-5.7s5.4-3.5 7-4.6c1.9-1.4 3.5-1.9 5-1.9h.7c1.4 0 2.9.7 4.2 1.4 1.4.7 2.9 1.9 3.8 2.9 1.9 1.9 3.5 3.8 4.6 5.7s1.9 3.5 1.9 4.2c0 .7-.7 1.4-1.4 1.9s-2.9.7-4.2.7h-1.4c-.7 0-1.4-.7-2.1-.7s-1.4-.7-1.9-.7c-2.9-1.4-5.7-2.9-8.4-4.2s-5.7-2.9-8.4-4.2c-2.9-1.4-5.7-2.9-8.4-4.2-2.9-1.4-5.7-2.9-8.4-4.2z"/>
                                        </svg>
                                        ¡Inscríbete por WhatsApp!
                                    </a>
                                    <p className="text-xs text-gray-500 mt-1 text-center">
                                        El número debe estar en formato internacional de WhatsApp.
                                    </p>
                                </>
                            );
                        })()}
                    </div>
                )}

                {/* Tournament Winner - Removed as 'ganador_torneo' is no longer populated by the new API
                {tournament.ganador_torneo && (
                    <div className="mt-6 pt-4 border-t-2 border-green-500 text-center">
                        <p className="text-xl font-bold text-green-700">
                            ¡Ganador del Torneo: {tournament.ganador_torneo.nombre} {tournament.ganador_torneo.apellido}!
                        </p>
                    </div>
                )}
                */}
            </div>
        </div>
    );
}

export default TournamentDetailModal;