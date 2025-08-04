// src/components/AllPlayers.jsx
import React, { useEffect, useState, useCallback } from 'react';
import PlayerDetailModal from './PlayerDetailModal';
import { useSelector, useDispatch } from 'react-redux';
import { fetchPlayersByPageAndTerm, setSearchTerm, setCurrentPage } from '../features/players/playersSlice';

function AllPlayers() {
    const dispatch = useDispatch();

    // Obtener el estado del slice de players
    const players = useSelector(state => state.players.players);
    const loading = useSelector(state => state.players.loading);
    const error = useSelector(state => state.players.error);
    const searchTerm = useSelector(state => state.players.searchTerm);
    const currentPage = useSelector(state => state.players.currentPage);
    const totalPages = useSelector(state => state.players.meta.pagination.pageCount);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPlayer, setSelectedPlayer] = useState(null);

    // Efecto para disparar el fetch del thunk cuando cambian la página o el término de búsqueda
    useEffect(() => {
        dispatch(fetchPlayersByPageAndTerm({ page: currentPage, term: searchTerm }));
    }, [currentPage, searchTerm, dispatch]);

    // Handle search input change
    const handleSearchChange = (e) => {
        dispatch(setSearchTerm(e.target.value));
    };

    // Handle page change
    const handlePageChange = (newPage) => {
        if (newPage > 0 && newPage <= totalPages) {
            dispatch(setCurrentPage(newPage));
        }
    };

    const openPlayerModal = (playerData) => {
        setSelectedPlayer(playerData);
        setIsModalOpen(true);
    };

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

            {loading === 'pending' ? (
                <div className="text-center text-sm text-gray-600">Cargando jugadores...</div>
            ) : error ? (
                <div className="text-center text-sm text-red-500">{error}</div>
            ) : players.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                        {players.map((playerEntry) => {
                            const player = playerEntry; 
                            
                            const clubName = player.club?.nombre || 'N/A'; 
                            const category = player.categoria?.nombre || 'N/A'; 
                            const rankingGeneral = player.rankingGeneral || 0; 
                            const clubLogoUrl = player.club?.logo?.url || 'https://placehold.co/32x32/cccccc/333333?text=Club'; 

                            return (
                                <div 
                                    key={player.id} 
                                    className="bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer flex flex-col justify-between"
                                    onClick={() => openPlayerModal(player)}
                                >
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-800">{player.nombre}</h3>
                                        <p className="text-sm text-gray-600 text-left pl-3">Club: {clubName}</p>
                                        <div className='flex  justify-between'>
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

            {isModalOpen && selectedPlayer && (
                <PlayerDetailModal player={selectedPlayer} onClose={closePlayerModal} />
            )}
        </div>
    );
}

export default AllPlayers;