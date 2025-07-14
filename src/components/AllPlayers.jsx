// src/components/AllPlayers.jsx
import React, { useEffect, useState, useCallback } from 'react';
import PlayerDetailModal from './PlayerDetailModal'; 

function AllPlayers() {
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const API_BASE = import.meta.env.VITE_API_BASE || 'https://padelproback-ranking.onrender.com/';

    // useCallback to memoize the fetch function and prevent unnecessary re-renders
    const fetchPlayers = useCallback(async (page, term) => {
        setLoading(true);
        setError(null);
        try {
            // Create an array of populate parameters
            const populateParams = [
                'club.logo',
                'estadisticas',
                'categoria',
                'torneos',
                'pareja',
                'pareja1'
            ];
    
            // Construct the API URL with pagination and search filters
            const queryParams = new URLSearchParams({
                'pagination[page]': page,
                'pagination[pageSize]': 25,
            });
    
            // Append each populate parameter individually
            populateParams.forEach(param => {
                queryParams.append('populate', param);
            });
    
            if (term) {
                // Add filters for name and apellido (case-insensitive)
                // Using $or to search in either nombre or apellido
                queryParams.append('filters[$or][0][nombre][$containsi]', term);
                queryParams.append('filters[$or][1][apellido][$containsi]', term);
            }
    
            const PLAYERS_API_URL = `${API_BASE}api/jugadors?${queryParams.toString()}`;
            console.log("Fetching URL:", PLAYERS_API_URL);
    
            const response = await fetch(PLAYERS_API_URL);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log("Fetched players data:", data);
    
            if (data.data) {
                setPlayers(data.data);
                setTotalPages(data.meta.pagination.pageCount);
            } else {
                setPlayers([]);
                setTotalPages(1);
                console.warn("API data structure not as expected (missing data.data).");
            }
        } catch (err) {
            setError("Error al cargar los jugadores. Inténtalo de nuevo más tarde.");
            console.error("Error fetching players:", err);
        } finally {
            setLoading(false);
        }
    }, [API_BASE]);

    // Effect to fetch players on component mount or when search term/page changes
    useEffect(() => {
        fetchPlayers(currentPage, searchTerm);
    }, [currentPage, searchTerm, fetchPlayers]); 

    // Handle search input change
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // Reset to first page on new search
    };

    // Handle page change
    const handlePageChange = (newPage) => {
        if (newPage > 0 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    // Function to open the player details modal
    const openPlayerModal = (playerData) => {
        // CORRECTED: Pass the full player object directly, as it's already flattened from the API
        setSelectedPlayer(playerData); 
        setIsModalOpen(true);
    };

    // Function to close the player details modal
    const closePlayerModal = () => {
        setIsModalOpen(false);
        setSelectedPlayer(null);
    };

    return (
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 text-center">Todos los Jugadores</h2>
            
            {/* Search Input */}
            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Buscar jugador por nombre o apellido..."
                    className="w-full px-4 py-2 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200"
                    value={searchTerm}
                    onChange={handleSearchChange}
                />
            </div>

            {loading ? (
                <div className="text-center text-sm text-gray-600">Cargando jugadores...</div>
            ) : error ? (
                <div className="text-center text-sm text-red-500">{error}</div>
            ) : players.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                        {players.map((playerEntry) => {
                            // CORRECTED: 'playerEntry' itself contains all the attributes directly, not nested under '.attributes'
                            const player = playerEntry; 
                            
                            // Safely access club name
                            const clubName = player.club?.nombre || 'N/A'; 
                            const category = player.categoria?.nombre || 'N/A'; 
                            const rankingGeneral = player.rankingGeneral || 0; 
                            const clubLogoUrl = player.club?.logo?.url || 'https://placehold.co/32x32/cccccc/333333?text=Club'; 

                            return (
                                <div 
                                    key={player.id} // Use player.id for the key as it's unique
                                    className="bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer flex flex-col justify-between"
                                    onClick={() => openPlayerModal(player)} // Pass the 'player' (flattened object) to openPlayerModal
                                >
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-800">{player.nombre}</h3>
                                        <p className="text-sm text-gray-600 text-left pl-3">Club: {clubName}</p>
                                        <div className='flex  justify-between'>
                                        {/* Display Club Logo */}
                                        <p className="text-sm text-gray-600 text-left pl-3">Categoria: {category}</p>   {clubLogoUrl !== 'https://placehold.co/32x32/cccccc/333333?text=Club' && (
                                   
                                            <img
                                                src={clubLogoUrl}
                                                alt={`${clubName} Logo`}
                                                className="w-8 h-8 object-contain rounded-full shadow-sm bg-black"
                                                onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/32x32/cccccc/333333?text=Club'; }}
                                            />
                                  
                                    )}
                                        </div>
                                    </div>
                                    <div className="mt-2 text-right">
                                        <span className="text-md font-bold text-green-600">Puntos: {rankingGeneral}</span>
                                    </div>
                                
                                  
                                </div>
                            );
                        })}
                    </div>

                    {/* Pagination Controls */}
                    <div className="flex justify-center items-center space-x-4 mt-6">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                        >
                            Anterior
                        </button>
                        <span className="text-gray-700">Página {currentPage} de {totalPages}</span>
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                        >
                            Siguiente
                        </button>
                    </div>
                </>
            ) : (
                <div className="px-6 py-4 text-center text-sm text-gray-600">No se encontraron jugadores con el término de búsqueda actual.</div>
            )}

            {/* Player Detail Modal component rendered conditionally */}
            {isModalOpen && selectedPlayer && (
                <PlayerDetailModal player={selectedPlayer} onClose={closePlayerModal} />
            )}
        </div>
    );
}

export default AllPlayers;
