// src/components/CurrentMatches.jsx
import React, { useEffect, useState, useCallback } from 'react';

/**
 * Componente para mostrar los partidos que están "En Curso" y opcionalmente "Programados".
 * Obtiene los datos de la API de Strapi y los presenta en una lista,
 * incluyendo detalles del torneo y las parejas. Permite filtrar por nombre de torneo
 * a través de un selector, manteniendo todas las opciones visibles.
 * @param {object} props - Las props del componente.
 * @param {string} props.API_BASE - La URL base de la API de Strapi.
 */
function CurrentMatches({ API_BASE }) {
    // Estado para almacenar todos los partidos "En Curso" y "Programados" sin filtrar por torneo específico
    const [allMatches, setAllMatches] = useState([]);
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
    // Nuevo estado para controlar si se deben incluir partidos "Programados"
    const [includeScheduled, setIncludeScheduled] = useState(false);

    // `useCallback` para memorizar la función de obtención de todos los partidos relevantes
    const fetchMatches = useCallback(async () => {
        setLoading(true); // Establece el estado de carga a true al inicio de la operación
        setError(null);   // Limpia cualquier error previo

        try {
            // Construimos los parámetros de consulta base
            let queryParams = new URLSearchParams({
                'populate': '*', // Incluye relaciones (torneo, parejas)
            });

            // Lógica condicional para el filtro de estado
            if (includeScheduled) {
                // Si se incluyen programados, usamos el operador $in para buscar ambos estados
                queryParams.append('filters[estado][$in][0]', 'En Curso');
                queryParams.append('filters[estado][$in][1]', 'Programado');
            } else {
                // Por defecto, solo buscamos partidos "En Curso"
                queryParams.append('filters[estado][$eq]', 'En Curso');
            }

            // Construye la URL completa de la API
            const MATCHES_API_URL = `${API_BASE}api/partidos?${queryParams.toString()}`;
            console.log("Fetching matches URL:", MATCHES_API_URL);

            const response = await fetch(MATCHES_API_URL);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log("Fetched matches data:", data);

            if (data.data) {
                const fetchedMatches = data.data.map(item => item);
                setAllMatches(fetchedMatches); // Almacena todos los partidos obtenidos

                // Extrae y almacena los nombres únicos de los torneos para el selector
                const tournamentNamesSet = new Set();
                fetchedMatches.forEach(match => {
                    if (match.torneo && match.torneo.nombre) {
                        tournamentNamesSet.add(match.torneo.nombre);
                    }
                });
                setUniqueTournamentNames(Array.from(tournamentNamesSet).sort());
            } else {
                setAllMatches([]);
                setUniqueTournamentNames([]);
                console.warn("API data structure not as expected (missing data.data).");
            }
        } catch (err) {
            setError("Error al cargar los partidos. Inténtalo de nuevo más tarde.");
            console.error("Error fetching matches:", err);
        } finally {
            setLoading(false);
        }
    }, [API_BASE, includeScheduled]); // `API_BASE` y `includeScheduled` son dependencias

    // Efecto para cargar los partidos cuando el componente se monta o cuando cambia `includeScheduled`
    useEffect(() => {
        fetchMatches();
        // Reset the selected tournament when changing the `includeScheduled` option
        setSelectedTournamentName(''); 
    }, [fetchMatches, includeScheduled]);

    // Efecto para filtrar los partidos a mostrar cada vez que cambia `allMatches` o `selectedTournamentName`
    useEffect(() => {
        if (selectedTournamentName === '') {
            // Si no hay torneo seleccionado, muestra todos los partidos del conjunto `allMatches`
            setDisplayedMatches(allMatches);
        } else {
            // Si hay un torneo seleccionado, filtra los partidos de `allMatches`
            const filtered = allMatches.filter(match => 
                match.torneo && match.torneo.nombre === selectedTournamentName
            );
            setDisplayedMatches(filtered);
        }
    }, [allMatches, selectedTournamentName]);

    // Manejador para el cambio en el selector de torneo
    const handleTournamentSelectChange = (e) => {
        setSelectedTournamentName(e.target.value);
    };

    // Manejador para el cambio en el checkbox "Incluir Programados"
    const handleIncludeScheduledChange = (e) => {
        setIncludeScheduled(e.target.checked);
    };

    // Renderizado condicional basado en los estados de carga y error
    return (
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 text-center">Partidos</h2>
            
            {/* Opción para incluir partidos programados */}
            <div className="mb-4 flex items-center justify-center">
                <input
                    type="checkbox"
                    id="includeScheduled"
                    checked={includeScheduled}
                    onChange={handleIncludeScheduledChange}
                    className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="includeScheduled" className="text-sm font-medium text-gray-700">
                    Incluir partidos "Programado"
                </label>
            </div>

            {/* Selector para filtrar por nombre de torneo */}
            <div className="mb-6">
                <label htmlFor="tournament-select" className="block text-sm font-medium text-gray-700 mb-2">
                    Filtrar por Torneo:
                </label>
                <select
                    id="tournament-select"
                       className="w-full px-4 py-2 border bg-white text-gray-600 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200"
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
                            <p className="text-sm text-gray-600">Fecha: {new Date(match.fechaPartido).toLocaleString('es-AR')}</p>
                            <p className="text-sm font-bold mt-2" style={{ color: match.estado === "En Curso" ? '#10B981' : '#F59E0B' }}>
                                Estado: {match.estado}
                            </p>
                            {/* Resultados de los sets, si están disponibles */}
                            {match.resultadoSet1 && <p className="text-sm text-gray-700">Set 1: {match.resultadoSet1}</p>}
                            {match.resultadoSet2 && <p className="text-sm text-gray-700">Set 2: {match.resultadoSet2}</p>}
                            {match.resultadoSet3 && <p className="text-sm text-gray-700">Set 3: {match.resultadoSet3}</p>}
                        </div>
                    ))}
                </div>
            ) : (
                // Mensaje si no se encuentran partidos con el filtro actual
                <div className="px-6 py-4 text-center text-sm text-gray-600">No se encontraron partidos con el filtro actual.</div>
            )}
        </div>
    );
}

export default CurrentMatches;
