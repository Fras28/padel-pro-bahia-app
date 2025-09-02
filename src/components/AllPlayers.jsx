// src/components/AllPlayers.jsx
import React, { useEffect, useState } from 'react';
import PlayerDetailModal from './PlayerDetailModal';
import { useSelector, useDispatch } from 'react-redux';
import { fetchPlayersByPageAndTerm, setSearchTerm, setCurrentPage, setFilters } from '../features/players/playersSlice';
import { FaSearch, FaChevronLeft, FaChevronRight, FaSpinner, FaSadTear, FaTag, FaStar, FaUserCircle } from 'react-icons/fa'; // Importa FaUserCircle

function AllPlayers() {
    const dispatch = useDispatch();

    const players = useSelector(state => state.players.players);
    const loading = useSelector(state => state.players.loading);
    const error = useSelector(state => state.players.error);
    const searchTerm = useSelector(state => state.players.searchTerm);
    const currentPage = useSelector(state => state.players.currentPage);
    const totalPages = useSelector(state => state.players.meta.pagination.pageCount);
    const genderFilter = useSelector(state => state.players.filters.gender);
    const categoryFilter = useSelector(state => state.players.filters.category);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [categories, setCategories] = useState([]);

    const API_BASE = import.meta.env.VITE_API_BASE;

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch(`${API_BASE}api/categorias`);
                const data = await response.json();
                if (data.data) {
                    setCategories(data.data.map(cat => ({ id: cat.id, name: cat.attributes.nombre }))); // Asumiendo que el nombre está en .attributes.nombre
                }
            } catch (err) {
                console.error("Error fetching categories:", err);
            }
        };
        fetchCategories();
    }, [API_BASE]);

    useEffect(() => {
        dispatch(fetchPlayersByPageAndTerm({
            page: currentPage,
            term: searchTerm,
            gender: genderFilter,
            category: categoryFilter
        }));
    }, [currentPage, searchTerm, genderFilter, categoryFilter, dispatch]);

    const handleSearchChange = (e) => {
        dispatch(setSearchTerm(e.target.value));
        dispatch(setCurrentPage(1));
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        dispatch(setFilters({ [name]: value }));
        dispatch(setCurrentPage(1));
    };

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

    // Función para obtener la URL del avatar o un placeholder
    const getPlayerAvatar = (player) => {
        // Ajusta 'avatar.url' si la estructura de tu API es diferente
        return player.avatar?.url || null;
    };

    return (
        <div className="bg-gray-50 min-h-screen p-4 sm:p-8">
            <div className="max-w-7xl mx-auto">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-800 text-center mb-8 tracking-tight">
                    Directorio de Jugadores
                </h2>

                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    {/* Search Input */}
                    <div className="relative flex-grow">
                        <input
                            type="text"
                            placeholder="Buscar por nombre o apellido..."
                            className="w-full pl-10 pr-4 py-3 text-base border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors duration-200"
                            value={searchTerm}
                            onChange={handleSearchChange}
                            aria-label="Buscar jugador"
                        />
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>

                    {/* Gender Filter */}
                    {/* <select
                        name="gender"
                        className="px- py-3 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        value={genderFilter}
                        onChange={handleFilterChange}
                    >
                        <option value="">Todos los géneros</option>
                        <option value="masculino">Masculino</option>
                        <option value="femenino">Femenino</option>
                    </select> */}

                    {/* Category Filter */}
                    {/* <select
                        name="category"
                        className="px-4 py-3 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        value={categoryFilter}
                        onChange={handleFilterChange}
                    >
                        <option value="">Todas las categorías</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select> */}
                </div>

                {loading === 'pending' ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <FaSpinner className="animate-spin text-5xl text-green-600 mb-4" />
                        <p className="text-lg text-gray-600 font-medium">Cargando jugadores...</p>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-20 text-red-500">
                        <FaSadTear className="text-5xl mb-4" />
                        <p className="text-lg font-medium">{error}</p>
                    </div>
                ) : players.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {players.map((playerEntry) => {
                                const player = playerEntry;
                                const category = player.categoria?.nombre || 'Categoría no asignada';
                                const rankingGeneral = player.rankingGeneral || 0;
                                const playerAvatarUrl = getPlayerAvatar(player);

                                return (
                                    <div
                                        key={player.id}
                                        className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center text-center justify-between transition-transform transform hover:scale-105 hover:shadow-xl cursor-pointer"
                                        onClick={() => openPlayerModal(player)}
                                    >
                                        {/* Avatar del Jugador */}
                                        <div className="mb-4">
                                            {playerAvatarUrl ? (
                                                <img
                                                    src={playerAvatarUrl}
                                                    alt={`Avatar de ${player.nombre}`}
                                                    className="w-24 h-24 object-cover rounded-full border-4 border-green-200 shadow-md"
                                                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/96x96.png?text=Avatar'; }} // Placeholder en caso de error
                                                />
                                            ) : (
                                                <FaUserCircle className="w-24 h-24 text-gray-300 border-4 border-green-200 rounded-full" />
                                            )}
                                        </div>

                                        <div className="flex-grow space-y-2 text-gray-700 w-full ">
                                            <h3 className="text-xl font-bold text-gray-800 leading-tight mb-2">{player.nombre}</h3>
                                            <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
                                          
                                            </p>
                                            <div className="flex items-center justify-left text-sm pl-4">
                                                <FaTag className="text-green-500 mr-2" />
                                                <span><strong className="font-semibold">Categoría:</strong> {category}</span>
                                            </div>
                                            <div className="flex items-center justify-left text-sm pl-4">
                                                <FaStar className="text-yellow-500 mr-2" />
                                                <span><strong className="font-semibold">Puntos:</strong> {rankingGeneral}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Pagination */}
                        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4 mt-10">
                            <span className="text-lg text-gray-600 font-medium">
                                Página <strong className="text-green-600">{currentPage}</strong> de <strong className="text-green-600">{totalPages}</strong>
                            </span>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="px-6 py-2 bg-green-600 text-white rounded-full font-semibold shadow-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center gap-2"
                                >
                                    <FaChevronLeft /> Anterior
                                </button>
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="px-6 py-2 bg-green-600 text-white rounded-full font-semibold shadow-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center gap-2"
                                >
                                    Siguiente <FaChevronRight />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                        <FaSadTear className="text-5xl mb-4" />
                        <p className="text-lg font-medium text-center">No se encontraron jugadores que coincidan con la búsqueda.</p>
                    </div>
                )}

                {isModalOpen && selectedPlayer && (
                    <PlayerDetailModal player={selectedPlayer} onClose={closePlayerModal} />
                )}
            </div>
        </div>
    );
}

export default AllPlayers;