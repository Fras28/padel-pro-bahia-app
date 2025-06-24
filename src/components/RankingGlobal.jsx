// src/components/RankingGlobal.jsx
import React, { useEffect, useState } from 'react';
import PlayerDetailModal from './PlayerDetailModal'; 
import Dternera from "../assets/DeTernera.png";
import DonAlf from "../assets/donalf.jpg";
import Morton from "../assets/morton.png";
import Rucca from "../assets/ruca.png";
import ENA from "../assets/ENA.avif";
import ADN from "../assets/ADN.png";
import SponsorBanner from './SponsorBanner';

// We'll remove the GenderSwitch as categories will implicitly handle gender.

function RankingGlobal() {
    // State to store the raw ranking data fetched
    const [rawRanking, setRawRanking] = useState([]);
    // State to store categories
    const [categories, setCategories] = useState([]);
    // State to store the processed ranking, grouped by category and limited to top 10
    const [categorizedRanking, setCategorizedRanking] = useState({});
    // State to manage loading status
    const [loading, setLoading] = useState(true);
    // State to store any error messages
    const [error, setError] = useState(null);
    // State to control modal visibility
    const [isModalOpen, setIsModalOpen] = useState(false);
    // State to store selected player data for the modal
    const [selectedPlayer, setSelectedPlayer] = useState(null);

    const API_BASE = import.meta.env.VITE_API_BASE;
    // URL for global ranking data - ensures all necessary data is populated
    const RANKING_API_URL = API_BASE + 'api/ranking-global?populate=entradasRankingGlobal.jugador.estadisticas&populate=entradasRankingGlobal.jugador.club.logo&populate=entradasRankingGlobal.jugador.categoria&populate=entradasRankingGlobal.jugador.pareja';
    // URL for categories
    const CATEGORIES_API_URL = API_BASE + 'api/categorias';

    const sponsorImages = [
        { src: Dternera, url: 'https://www.deternera.com.ar/' }, // Replace with actual URL
        { src: DonAlf, url: 'https://www.donalf.com.ar/' },       // Replace with actual URL
        { src: Morton, url: 'https://www.morton.com.ar/' },       // Replace with actual URL
        { src: Rucca, url: 'https://www.ruccabahia.com/' },         // Replace with actual URL
        { src: ENA, url: 'https://www.enasport.com/' },             // Replace with actual URL
        { src: ADN, url: 'https://www.adn.com.ar/' },              // Replace with actual URL
    ];
    useEffect(() => {
        const fetchAllData = async () => {
            try {
                // Fetch categories first
                const categoriesResponse = await fetch(CATEGORIES_API_URL);
                if (!categoriesResponse.ok) {
                    throw new Error(`HTTP error! status: ${categoriesResponse.status} for categories`);
                }
                const categoriesData = await categoriesResponse.json();
                setCategories(categoriesData.data || []);
                console.log("Categorias fetched:", categoriesData.data);

                // Then fetch global ranking
                const rankingResponse = await fetch(RANKING_API_URL);
                if (!rankingResponse.ok) {
                    throw new Error(`HTTP error! status: ${rankingResponse.status} for ranking`);
                }
                const rankingData = await rankingResponse.json();
                console.log("Raw API data (Global Ranking):", rankingData); 
                
                if (rankingData.data && rankingData.data.entradasRankingGlobal) {
                    // Sort the raw ranking by global points in descending order
                    const sortedRanking = rankingData.data.entradasRankingGlobal.sort((a, b) => b.puntosGlobales - a.puntosGlobales);
                    setRawRanking(sortedRanking); // Save the raw, sorted ranking
                } else {
                    setRawRanking([]); 
                    console.warn("Ranking API data structure is not as expected (missing data.data or entradasRankingGlobal).");
                }
            } catch (err) {
                setError("Error al cargar los datos del ranking o las categorías. Inténtalo de nuevo más tarde."); 
                console.error("Error fetching data:", err);
            } finally {
                setLoading(false); 
            }
        };

        fetchAllData();
    }, []); 

    // Process the raw ranking data when it changes or categories are loaded
    useEffect(() => {
        const processRankingByCategories = () => {
            const tempCategorizedRanking = {};

            categories.forEach(category => {
                // Initialize an empty array for each category
                tempCategorizedRanking[category.id] = {
                    name: category.nombre,
                    players: []
                };
            });

            // Populate the temporary categorized ranking
            rawRanking.forEach(entry => {
                const player = entry.jugador;
                if (player && player.categoria && tempCategorizedRanking[player.categoria.id]) {
                    tempCategorizedRanking[player.categoria.id].players.push(entry);
                }
            });

            // Limit to top 10 players for each category
            const finalCategorizedRanking = {};
            for (const categoryId in tempCategorizedRanking) {
                finalCategorizedRanking[categoryId] = {
                    name: tempCategorizedRanking[categoryId].name,
                    players: tempCategorizedRanking[categoryId].players.slice(0, 10) // Take top 10
                };
            }
            setCategorizedRanking(finalCategorizedRanking);
        };

        if (rawRanking.length > 0 && categories.length > 0) {
            processRankingByCategories();
        }
    }, [rawRanking, categories]);

    // Function to open the player details modal
    const openPlayerModal = (playerData) => {
        setSelectedPlayer(playerData);
        setIsModalOpen(true);
    };

    // Function to close the player details modal
    const closePlayerModal = () => {
        setIsModalOpen(false);
        setSelectedPlayer(null);
    };

    return (
        <div className="bg-white rounded-xl shadow-md ">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 sm:mb-6 text-center">Ranking Global por Categoría</h2>
            {loading ? (
                <div className="text-center text-sm text-gray-600">Cargando rankings por categoría...</div>
            ) : error ? (
                <div className="text-center text-sm text-red-500">{error}</div>
            ) : (
                Object.values(categorizedRanking).length > 0 ? (
                    Object.values(categorizedRanking).sort((a,b) => a.name.localeCompare(b.name)).map((categoryData, catIndex) => (
                        <div key={catIndex} className="mb-8">
                               <SponsorBanner sponsorImages={sponsorImages} />
                            <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-4 border-b pb-2">{categoryData.name}</h3>
                            {categoryData.players.length > 0 ? (
                                <div className="overflow-x-auto rounded-lg shadow-md border border-gray-200">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Posición</th>
                                                <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Club</th>
                                                <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jugador</th>
                                                <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Puntos</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {categoryData.players.map((entry, index) => {
                                                const player = entry.jugador; 
                                                const playerName = player ? `${player.nombre[0] || ''}. ${player.apellido || ''}`.trim() : 'Desconocido';
                                                const clubName = player && player.club ? player.club.nombre : 'N/A';
                                                const clubLogoUrl = player && player.club && player.club.logo && player.club.logo.url ? player.club.logo.url : 'https://placehold.co/32x32/cccccc/333333?text=Club';
                                                const globalPoints = entry.puntosGlobales || 0;

                                                return (
                                                    <tr
                                                        key={entry.id}
                                                        className="hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                                                        onClick={() => openPlayerModal(player)}
                                                    >
                                                        <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm font-medium text-gray-900">{index + 1}</td>
                                                        <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-700">
                                                            <div className="flex items-center">
                                                                <img
                                                                    src={clubLogoUrl}
                                                                    alt={`${clubName} Logo`}
                                                                    className="w-6 h-6 sm:w-8 sm:h-8 object-contain rounded-full mr-1 sm:mr-2 shadow-sm"
                                                                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/32x32/cccccc/333333?text=Club'; }} // Fallback image on error
                                                                />
                                                                <span>{clubName}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-700">{playerName}</td>
                                                        <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-700">{globalPoints}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="px-6 py-4 text-center text-sm text-gray-600">No se encontraron jugadores en esta categoría.</p>
                            )}
                        </div>
                    ))
                ) : (
                    <p className="px-6 py-4 text-center text-sm text-gray-600">No se encontraron categorías o entradas de ranking.</p>
                )
            )}

            {/* Player Detail Modal component rendered conditionally */}
            {isModalOpen && selectedPlayer && (
                <PlayerDetailModal player={selectedPlayer} onClose={closePlayerModal} />
            )}
        </div>
    );
}

export default RankingGlobal;