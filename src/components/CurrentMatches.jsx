// src/components/CurrentMatches.jsx
import React, { useEffect, useState, useCallback } from 'react';

/**
 * Componente para mostrar los partidos que están "En Curso".
 * Obtiene los datos de la API de Strapi y los presenta en una lista,
 * incluyendo detalles del torneo y las parejas. Permite filtrar por nombre de torneo
 * a través de un selector, manteniendo todas las opciones visibles.
 * @param {object} props - Las props del componente.
 * @param {string} props.API_BASE - La URL base de la API de Strapi.
 */
function CurrentMatches({ API_BASE }) {
    // Estado para almacenar todos los partidos "En Curso" sin filtrar por torneo específico
    const [allCurrentMatches, setAllCurrentMatches] = useState([]);
    // Estado para almacenar los partidos que se muestran actualmente (filtrados)
    const [displayedMatches, setDisplayedMatches] = useState([]);
    // Estado para indicar si los datos están cargando
    const [loading, setLoading] = useState(true);
    // Estado para almacenar cualquier error que ocurra durante la carga
    const [error, setError] = useState(null);
    // Estado para el nombre del torneo seleccionado en el selector
    const [selectedTournamentName, setSelectedTournamentName] = useState('');
    // Estado para almacenar los nombres únicos de los torneos para el selector
    const [uniqueTournamentNames, setUniqueTournamentNames] = useState([]);

    // `useCallback` para memorizar la función de obtención de todos los partidos "En Curso"
    const fetchAllCurrentMatches = useCallback(async () => {
        setLoading(true); // Establece el estado de carga a true al inicio de la operación
        setError(null);   // Limpia cualquier error previo

        try {
            // Siempre construimos la URL para obtener TODOS los partidos "En Curso"
            // sin aplicar el filtro de torneo aquí para poblar el selector.
            const ALL_CURRENT_MATCHES_API_URL = `${API_BASE}api/partidos?filters[estado][$eq]=En%20Curso&populate=*`;
            console.log("Fetching ALL current matches URL:", ALL_CURRENT_MATCHES_API_URL);

            const response = await fetch(ALL_CURRENT_MATCHES_API_URL);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log("Fetched ALL current matches data:", data);

            if (data.data) {
                const fetchedMatches = data.data.map(item => item);
                setAllCurrentMatches(fetchedMatches); // Almacena todos los partidos

                // Extrae y almacena los nombres únicos de los torneos para el selector
                const tournamentNamesSet = new Set();
                fetchedMatches.forEach(match => {
                    if (match.torneo && match.torneo.nombre) {
                        tournamentNamesSet.add(match.torneo.nombre);
                    }
                });
                setUniqueTournamentNames(Array.from(tournamentNamesSet).sort());
            } else {
                setAllCurrentMatches([]);
                setUniqueTournamentNames([]);
                console.warn("API data structure not as expected (missing data.data).");
            }
        } catch (err) {
            setError("Error al cargar los partidos en curso. Inténtalo de nuevo más tarde.");
            console.error("Error fetching all current matches:", err);
        } finally {
            setLoading(false);
        }
    }, [API_BASE]); // `API_BASE` es una dependencia para `useCallback`

    // Efecto para cargar todos los partidos "En Curso" cuando el componente se monta
    useEffect(() => {
        fetchAllCurrentMatches();
    }, [fetchAllCurrentMatches]);

    // Efecto para filtrar los partidos a mostrar cada vez que cambia allCurrentMatches o selectedTournamentName
    useEffect(() => {
        if (selectedTournamentName === '') {
            // Si no hay torneo seleccionado, muestra todos los partidos
            setDisplayedMatches(allCurrentMatches);
        } else {
            // Si hay un torneo seleccionado, filtra los partidos
            const filtered = allCurrentMatches.filter(match => 
                match.torneo && match.torneo.nombre === selectedTournamentName
            );
            setDisplayedMatches(filtered);
        }
    }, [allCurrentMatches, selectedTournamentName]);

    // Manejador para el cambio en el selector de torneo
    const handleTournamentSelectChange = (e) => {
        setSelectedTournamentName(e.target.value);
    };

    // Renderizado condicional basado en los estados de carga y error
    return (
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 text-center">Partidos en Curso</h2>
            
            {/* Selector para filtrar por nombre de torneo */}
            <div className="mb-6">
                <label htmlFor="tournament-select" className="block text-sm font-medium text-gray-700 mb-2">
                    Filtrar por Torneo:
                </label>
                <select
                    id="tournament-select"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={selectedTournamentName}
                    onChange={handleTournamentSelectChange}
                    // Deshabilita el selector mientras carga la lista inicial de torneos
                    disabled={loading && uniqueTournamentNames.length === 0} 
                >
                    <option value="">Todos los torneos</option> {/* Opción para ver todos los partidos */}
                    {uniqueTournamentNames.map((name) => (
                        <option key={name} value={name}>
                            {name}
                        </option>
                    ))}
                </select>
            </div>

            {loading ? (
                // Muestra un mensaje de carga mientras se obtienen los datos
                <div className="text-center text-sm text-gray-600">Cargando partidos...</div>
            ) : error ? (
                // Muestra un mensaje de error si ocurre un problema
                <div className="text-center text-sm text-red-500">{error}</div>
            ) : displayedMatches.length > 0 ? (
                // Si hay partidos, los muestra en una cuadrícula
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {displayedMatches.map((match) => ( // Usamos displayedMatches aquí
                        <div 
                            key={match.id} // Usa el ID del partido como clave única
                            className="bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm"
                        >
                            <h3 className="text-lg font-semibold text-blue-700 mb-2">
                                Torneo: {match.torneo?.nombre || 'N/A'}
                            </h3>
                            <p className="text-sm text-gray-600">
                                <span className="font-semibold">Pareja 1:</span> {match.pareja1?.nombrePareja || 'N/A'}
                            </p>
                            <p className="text-sm text-gray-600 mb-2">
                                <span className="font-semibold">Pareja 2:</span> {match.pareja2?.nombrePareja || 'N/A'}
                            </p>
                            <p className="text-sm text-gray-600">Ronda: {match.ronda}</p>
                            <p className="text-sm text-gray-600">Cancha: {match.cancha}</p>
                            <p className="text-sm text-gray-600">Fecha: {new Date(match.fechaPartido).toLocaleDateString()}</p>
                            <p className="text-sm font-bold text-green-600 mt-2">Estado: {match.estado}</p>
                            {/* Resultados de los sets, si están disponibles */}
                            {match.resultadoSet1 && <p className="text-sm text-gray-700">Set 1: {match.resultadoSet1}</p>}
                            {match.resultadoSet2 && <p className="text-sm text-gray-700">Set 2: {match.resultadoSet2}</p>}
                            {match.resultadoSet3 && <p className="text-sm text-gray-700">Set 3: {match.resultadoSet3}</p>}
                        </div>
                    ))}
                </div>
            ) : (
                // Mensaje si no se encuentran partidos en curso con el filtro actual
                <div className="px-6 py-4 text-center text-sm text-gray-600">No se encontraron partidos en curso con el filtro actual.</div>
            )}
        </div>
    );
}

export default CurrentMatches;
