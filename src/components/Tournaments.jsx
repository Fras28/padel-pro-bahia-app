// src/components/Tournaments.jsx

import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FaCalendarAlt,
    FaTrophy,
    FaPlayCircle,
    FaDoorOpen,
    FaSpinner,
    FaTimesCircle,
    FaChevronDown,
    FaChevronUp
} from 'react-icons/fa';

// Tournaments component to display a list of tournaments categorized by status
function Tournaments() {
    const [tournaments, setTournaments] = useState([]);
    // currentLoadingStatus: 'initial', 'En Curso', 'Abierto', 'Finalizado', 'complete'
    const [currentLoadingStatus, setCurrentLoadingStatus] = useState('initial');
    const [error, setError] = useState(null);
    
    // --- ESTADO PARA PAGINACIÓN DE FINALIZADOS ---
    const [visibleFinalizadosCount, setVisibleFinalizadosCount] = useState(10);
    const ITEMS_PER_PAGE = 10;
    // ---------------------------------------------

    const navigate = useNavigate();
    const API_BASE = import.meta.env.VITE_API_BASE;
    
    // Parámetros de populate que siempre se necesitan
    const POPULATE_PARAMS = 'populate=club.logo&populate=partidos.pareja1&populate=partidos.pareja2&populate=partidos.ganador&populate=parejas_inscritas&populate=categoria';
    const TOURNAMENTS_API_BASE_URL = `${API_BASE}api/torneos?${POPULATE_PARAMS}`;
    
    // Definición de estados
    const PRIORITY_STATUSES = ['En Curso', 'Abierto'];
    const LOW_PRIORITY_STATUSES = ['Finalizado']; 
    const HIDDEN_STATUSES = ['Próximamente', 'Cancelado']; 

    // Orden de visualización en la grilla: solo los 3 estados requeridos
    const DISPLAY_ORDER = [...PRIORITY_STATUSES, ...LOW_PRIORITY_STATUSES]; 

    /**
     * Función auxiliar para manejar la paginación de una URL de Strapi específica.
     */
    const fetchAllPages = useCallback(async (url) => {
        let allItems = [];
        let currentPage = 1;
        let pageCount = 1;

        while (currentPage <= pageCount) {
            const paginatedUrl = `${url}&pagination[page]=${currentPage}`;
            const response = await fetch(paginatedUrl);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status} for URL: ${paginatedUrl}`);
            }
            
            const data = await response.json();
            
            if (data.data && Array.isArray(data.data)) {
                allItems = allItems.concat(data.data.filter(t => t !== null));
            }
            
            if (data.meta?.pagination?.pageCount) {
                pageCount = data.meta.pagination.pageCount;
            } else {
                break; 
            }

            currentPage++;
        }
        return allItems;
    }, []);

    useEffect(() => {
        const fetchAndDisplayPrioritizedTournaments = async () => {
            setError(null);
            
            const restoStatuses = [...LOW_PRIORITY_STATUSES, ...HIDDEN_STATUSES];
            const lowPriorityFilter = 
                `filters[$or][0][estado][$eq]=${restoStatuses[0]}` +
                `&filters[$or][1][estado][$eq]=${restoStatuses[1]}` +
                `&filters[$or][2][estado][$eq]=${restoStatuses[2]}`;

            // 1. Preparamos las promesas (se ejecutan en paralelo)
            const promises = {
                'En Curso': fetchAllPages(`${TOURNAMENTS_API_BASE_URL}&filters[estado][$eq]=En Curso`),
                'Abierto': fetchAllPages(`${TOURNAMENTS_API_BASE_URL}&filters[estado][$eq]=Abierto`),
                'Finalizado': fetchAllPages(`${TOURNAMENTS_API_BASE_URL}&${lowPriorityFilter}`) 
            };

            let currentTournaments = [];
            
            try {
                // FASE 1: Cargar y mostrar 'En Curso'
                setCurrentLoadingStatus('En Curso');
                const enCursoTournaments = await promises['En Curso'];
                currentTournaments = [...enCursoTournaments];
                setTournaments(currentTournaments);
                
                // FASE 2: Cargar y mostrar 'Abierto'
                setCurrentLoadingStatus('Abierto');
                const abiertoTournaments = await promises['Abierto'];
                currentTournaments = [...currentTournaments, ...abiertoTournaments];
                setTournaments(currentTournaments); 

                // FASE 3: Cargar y mostrar el 'Resto' (Finalizados, Próximamente, Cancelado)
                setCurrentLoadingStatus('Finalizado');
                const restoTournaments = await promises['Finalizado'];
                currentTournaments = [...currentTournaments, ...restoTournaments];
                setTournaments(currentTournaments);

            } catch (err) {
                setError("Error al cargar los torneos. Inténtalo de nuevo más tarde.");
                console.error("Error fetching prioritized tournaments:", err);
            } finally {
                // Finalizamos la carga
                setCurrentLoadingStatus('complete');
            }
        };

        fetchAndDisplayPrioritizedTournaments();
    }, [TOURNAMENTS_API_BASE_URL, fetchAllPages]);


    // Función para agrupar los torneos por estado para el renderizado
    const groupTournamentsByStatus = (tournamentsList) => {
        const grouped = {};
        DISPLAY_ORDER.forEach(status => grouped[status] = []);
        [...HIDDEN_STATUSES, 'N/A'].forEach(status => grouped[status] = []); 

        tournamentsList.forEach(tournament => {
            if (grouped[tournament.estado]) {
                grouped[tournament.estado].push(tournament);
            } else {
                 grouped['N/A'].push(tournament);
            }
        });
        
        // --- CAMBIO CLAVE: ORDENAR FINALIZADOS ---
        if (grouped['Finalizado']) {
            grouped['Finalizado'].sort((a, b) => {
                // Orden descendente (más nuevo a más viejo) por fechaFin
                const dateA = new Date(a.fechaFin).getTime();
                const dateB = new Date(b.fechaFin).getTime();
                return dateB - dateA; 
            });
        }
        // ------------------------------------------

        return grouped;
    };

    const groupedTournaments = groupTournamentsByStatus(tournaments);

    // Lógica del paginador de Finalizados
    const handleLoadMore = () => {
        setVisibleFinalizadosCount(prevCount => prevCount + ITEMS_PER_PAGE);
    };

    const handleHideAll = () => {
        setVisibleFinalizadosCount(ITEMS_PER_PAGE);
        // Desplazarse hacia la parte superior de la sección Finalizado
        document.getElementById(`status-heading-Finalizado`)?.scrollIntoView({ behavior: 'smooth' });
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
            case 'Cancelado':
                return <FaTimesCircle className="text-red-500" />;
            default:
                return null;
        }
    };

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
            case 'Cancelado':
                return 'text-red-600';
            default:
                return 'text-gray-600';
        }
    };

    const handleViewMatches = (tournamentId) => {
        navigate(`/tournaments/${tournamentId}/matches`);
    };

    // La pantalla de carga inicial solo se muestra si NO hay torneos cargados.
    if (currentLoadingStatus === 'initial' && tournaments.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-gray-600">
                <FaSpinner className="animate-spin text-4xl mb-2 text-blue-600" />
                <p className="text-lg">Cargando torneos principales...</p>
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

            {/* Iteramos SOLO sobre el orden de visualización explícito: En Curso, Abierto, Finalizado */}
            {DISPLAY_ORDER.map(status => {
                const isFinalizado = status === 'Finalizado';
                const allItems = groupedTournaments[status] || [];
                
                // Aplicar límite de 10 elementos solo si es la sección 'Finalizado'
                const displayItems = isFinalizado 
                    ? allItems.slice(0, visibleFinalizadosCount) 
                    : allItems;
                
                const hasMore = isFinalizado && allItems.length > visibleFinalizadosCount;
                const showHide = isFinalizado && visibleFinalizadosCount > ITEMS_PER_PAGE;
                
                // No renderizar la sección si no hay ítems y ya terminó la carga.
                if (displayItems.length === 0 && currentLoadingStatus === 'complete') {
                    return null;
                }

                return (
                    <div key={status} role="region" aria-labelledby={`status-heading-${status}`} className="mb-10">
                        <h2 id={`status-heading-${status}`} className="text-3xl font-bold text-gray-700 mb-5 flex items-center gap-3 border-b-2 border-blue-500 pb-2">
                            {getStatusIcon(status)}
                            {status}
                            
                            {/* MOSTRAR SPINNER DE CARGA */}
                            {(currentLoadingStatus === status) && currentLoadingStatus !== 'complete' && (
                                <FaSpinner className="animate-spin text-xl text-blue-500 ml-2" aria-label={`Cargando torneos en estado ${status}`} />
                            )}
                        </h2>
                        
                        {displayItems.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {displayItems.map(tournament => (
                                        <div
                                            key={tournament.id}
                                            className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden"
                                        >
                                            <div className="p-6">
                                                {/* Contenido de la tarjeta del torneo */}
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

                                {/* Paginación para Finalizado */}
                                {isFinalizado && (
                                    <div className="flex justify-center mt-8 space-x-4">
                                        {showHide && (
                                            <button
                                                onClick={handleHideAll}
                                                className="flex items-center px-6 py-3 font-semibold text-gray-700 bg-gray-200 rounded-lg shadow-md hover:bg-gray-300 transition duration-150"
                                            >
                                                <FaChevronUp className="mr-2" />
                                                Mostrar Menos ({visibleFinalizadosCount})
                                            </button>
                                        )}
                                        {hasMore && (
                                            <button
                                                onClick={handleLoadMore}
                                                className="flex items-center px-6 py-3 font-semibold text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 transition duration-150"
                                            >
                                                <FaChevronDown className="mr-2" />
                                                Ver Más ({allItems.length - visibleFinalizadosCount} restantes)
                                            </button>
                                        )}
                                    </div>
                                )}
                            </>
                        ) : (
                            // Solo mostramos el mensaje "No hay torneos" si la carga ha terminado.
                            currentLoadingStatus === 'complete' && (
                                <p className="text-gray-600 italic">
                                    No hay torneos en estado "{status}" en este momento.
                                </p>
                            )
                        )}
                    </div>
                );
            })}
        </div>
    );
}

export default Tournaments;