// src/components/RankingGlobal.jsx
import React, { useEffect, useState } from "react";
import PlayerDetailModal from "./PlayerDetailModal";
import Dternera from "../assets/DeTernera.png";
import DonAlf from "../assets/donalf.jpg";
import Morton from "../assets/morton.png";
import Rucca from "../assets/ruca.png";
import ENA from "../assets/ENA.avif";
import ADN from "../assets/ADN.png";
import SponsorBanner from "./SponsorBanner";
import CountUp from "react-countup"; // Importa el componente CountUp

function RankingGlobal() {
  // State to store the raw ranking data fetched
  const [rawRanking, setRawRanking] = useState([]);
  // State to store categories
  const [categories, setCategories] = useState([]);
  // State to store the processed ranking, grouped by category
  const [categorizedRanking, setCategorizedRanking] = useState({});
  // State to manage loading status
  const [loading, setLoading] = useState(true);
  // State to store any error messages
  const [error, setError] = useState(null);
  // State to control modal visibility
  const [isModalOpen, setIsModalOpen] = useState(false);
  // State to store selected player data for the modal
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  // Nuevo estado para controlar si la animación ya se mostró
  const [hasAnimated, setHasAnimated] = useState(false);

  const API_BASE = import.meta.env.VITE_API_BASE;
  // URL for global ranking data - ensures all necessary data is populated
  // Expanded populate to include partidos_ganados and partidos_perdidos for both pareja and pareja1
  const RANKING_API_URL = `${API_BASE}api/ranking-global?populate=entradasRankingGlobal.jugador.estadisticas&populate=entradasRankingGlobal.jugador.club.logo&populate=entradasRankingGlobal.jugador.categoria&populate=entradasRankingGlobal.jugador.pareja.partidos_ganados&populate=entradasRankingGlobal.jugador.pareja.partidos_perdidos&populate=entradasRankingGlobal.jugador.pareja1.partidos_ganados&populate=entradasRankingGlobal.jugador.pareja1.partidos_perdidos`;
  // URL for categories
  const CATEGORIES_API_URL = `${API_BASE}api/categorias`;

  const sponsorImages = [
    { src: Dternera, url: "https://www.deternera.com.ar/" },
    { src: DonAlf, url: "https://www.donalf.com.ar/" },
    { src: Morton, url: "https://www.morton.com.ar/" },
    { src: Rucca, url: "https://www.ruccabahia.com/" },
    { src: ENA, url: "https://www.enasport.com/" },
    { src: ADN, url: "https://www.adn.com.ar/" },
  ];

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // Fetch categories first
        const categoriesResponse = await fetch(CATEGORIES_API_URL);

        if (!categoriesResponse.ok) {
          throw new Error(
            `HTTP error! status: ${categoriesResponse.status} for categories`
          );
        }
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData.data || []);
        console.log("Categorias fetched:", categoriesData.data);

        // Then fetch global ranking
        const rankingResponse = await fetch(RANKING_API_URL);
        if (!rankingResponse.ok) {
          throw new Error(
            `HTTP error! status: ${rankingResponse.status} for ranking`
          );
        }
        const rankingData = await rankingResponse.json();
        console.log("Raw API data (Global Ranking):", rankingData);

        if (rankingData.data && rankingData.data.entradasRankingGlobal) {
          // Sort the raw ranking by global points in descending order
          const sortedRanking = rankingData.data.entradasRankingGlobal.sort(
            (a, b) => b.puntosGlobales - a.puntosGlobales
          );
          setRawRanking(sortedRanking); // Save the raw, sorted ranking
          // Marca que la animación puede ejecutarse ya que los datos se cargaron por primera vez
          setHasAnimated(true);
        } else {
          setRawRanking([]);
          console.warn(
            "Ranking API data structure is not as expected (missing data.data or entradasRankingGlobal)."
          );
        }
      } catch (err) {
        setError(
          "Error al cargar los datos del ranking o las categorías. Inténtalo de nuevo más tarde."
        );
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

      categories.forEach((category) => {
        // Initialize an empty array for each category
        tempCategorizedRanking[category.id] = {
          name: category.nombre,
          players: [],
        };
      });

      // Populate the temporary categorized ranking
      rawRanking.forEach((entry) => {
        const player = entry.jugador;
        if (
          player &&
          player.categoria &&
          tempCategorizedRanking[player.categoria.id]
        ) {
          tempCategorizedRanking[player.categoria.id].players.push(entry);
        }
      });

      const finalCategorizedRanking = {};
      for (const categoryId in tempCategorizedRanking) {
        finalCategorizedRanking[categoryId] = {
          name: tempCategorizedRanking[categoryId].name,
          // Keep up to 16 players for potential display
          players: tempCategorizedRanking[categoryId].players.slice(0, 16),
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
      <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 sm:mb-6 text-center">
        Ranking Global por Categoría
      </h2>
      {loading ? (
        <div className="text-center text-sm text-gray-600">
          Cargando rankings por categoría...
        </div>
      ) : error ? (
        <div className="text-center text-sm text-red-500">{error}</div>
      ) : Object.values(categorizedRanking).length > 0 ? (
        Object.values(categorizedRanking)
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((categoryData, catIndex) => (
            <div key={catIndex} className="mb-8">
              <SponsorBanner sponsorImages={sponsorImages} />
              <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-4 border-b pb-2">
                {categoryData.name}
              </h3>
              {categoryData.players.length > 0 ? (
                <div className="overflow-x-auto rounded-lg shadow-md border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 sm:px-6 sm:py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Rank
                        </th>
                        <th className="px-3 py-2 sm:px-6 sm:py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Club
                        </th>
                        <th className="px-3 py-2 sm:px-6 sm:py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider justify-center">
                          Jugador
                        </th>
                        <th className="px-3 py-2 sm:px-6 sm:py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Pts
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {/* Display top 10 players */}
                      {categoryData.players.slice(0, 10).map((entry, index) => {
                        const player = entry.jugador;

                        const playerName = player
                          ? (() => {
                              const fullName = player.nombre || "";
                              const parts = fullName.split(" ");
                              if (parts.length > 0) {
                                const nombreInicial = parts[0]
                                  ? `${parts[0][0]}.`
                                  : "";
                                const apellido = parts.slice(1).join(" ");
                                return `${nombreInicial} ${apellido}`.trim();
                              }
                              return "Desconocido";
                            })()
                          : "Desconocido";

                        const clubName =
                          player && player.club ? player.club.nombre : "N/A";
                        const clubLogoUrl =
                          player &&
                          player.club &&
                          player.club.logo &&
                          player.club.logo.url
                            ? player.club.logo.url
                            : "https://placehold.co/32x32/cccccc/333333?text=Club";
                        const globalPoints = entry.puntosGlobales || 0;

                        // --- Logic for Recent Wins ---
                        let allPlayerMatches = [];

                        // Collect matches from pareja relation
                        if (player.pareja) {
                          if (player.pareja.partidos_ganados) {
                            player.pareja.partidos_ganados.forEach((match) =>
                              allPlayerMatches.push({ ...match, won: true })
                            );
                          }
                          if (player.pareja.partidos_perdidos) {
                            player.pareja.partidos_perdidos.forEach((match) =>
                              allPlayerMatches.push({ ...match, won: false })
                            );
                          }
                        }

                        // Collect matches from pareja1 relation
                        if (player.pareja1) {
                          if (player.pareja1.partidos_ganados) {
                            player.pareja1.partidos_ganados.forEach((match) =>
                              allPlayerMatches.push({ ...match, won: true })
                            );
                          }
                          if (player.pareja1.partidos_perdidos) {
                            player.pareja1.partidos_perdidos.forEach((match) =>
                              allPlayerMatches.push({ ...match, won: false })
                            );
                          }
                        }

                        // Sort all matches by date in descending order
                        allPlayerMatches.sort(
                          (a, b) =>
                            new Date(b.fechaPartido) - new Date(a.fechaPartido)
                        );

                        let lastThreeWins = true;

                        if (allPlayerMatches.length >= 3) {
                          // Check if the last 3 *played* matches were all wins
                          for (let i = 0; i < 3; i++) {
                            if (!allPlayerMatches[i].won) {
                              lastThreeWins = false;
                              break;
                            }
                          }
                        } else {
                          lastThreeWins = false; // Not enough matches to determine a 3-win streak
                        }
                        // --- End of Logic ---

                        return (
                          <tr
                            key={entry.id}
                            className="hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                            onClick={() => openPlayerModal(player)}
                          >
                            <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              <div className="flex items-center justify-center">
                                <span>{index + 1}</span>
                                {lastThreeWins ? (
                                  <span className="text-green-500 ml-1 text-base leading-none">
                                    &#x25B2;
                                  </span> // Flecha verde
                                ) : (
                                  <span className="text-gray-400 ml-1 text-base leading-none">
                                    &#x2022;
                                  </span> // Punto gris (código HTML para punto: &#x2022;)
                                )}
                              </div>
                            </td>
                            <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-700">
                              <div className="flex items-center justify-center">
                                <img
                                  src={clubLogoUrl}
                                  alt={`${clubName} Logo`}
                                  className="w-6 h-6 sm:w-8 sm:h-8 object-contain rounded-full mr-1 sm:mr-2 shadow-sm bg-black"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src =
                                      "https://placehold.co/32x32/cccccc/333333?text=Club";
                                  }}
                                />
                              </div>
                            </td>
                            <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-700 text-center">
                              {playerName}
                            </td>
                            <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-700 text-center">
                              {/* Aplica CountUp solo si hasAnimated es true */}
                              {hasAnimated ? (
                                <CountUp
                                  end={globalPoints}
                                  duration={4} // Duración de la animación en segundos
                                  separator="." // Separador de miles si es necesario
                                  decimals={0} // Sin decimales para puntos de ranking
                                />
                              ) : (
                                globalPoints // Muestra el valor directamente si no se ha animado
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="px-6 py-4 text-center text-sm text-gray-600">
                  No se encontraron jugadores en esta categoría.
                </p>
              )}

              {/* Section for players 11-16 with scroll */}
              {categoryData.players.length > 10 && (
                <div className="mt-4 border-t pt-4">
                  <h4 className="text-md font-semibold text-gray-700 mb-2">
                    Puestos 11-16
                  </h4>
                  <div className="overflow-y-auto max-h-48 rounded-lg shadow-md border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Posición
                          </th>
                          <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Club
                          </th>
                          <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Jugador
                          </th>
                          <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Puntos
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {categoryData.players
                          .slice(10, 16)
                          .map((entry, index) => {
                            const player = entry.jugador;

                            const playerName = player
                              ? (() => {
                                  const fullName = player.nombre || "";
                                  const parts = fullName.split(" ");
                                  if (parts.length > 0) {
                                    const nombreInicial = parts[0]
                                      ? `${parts[0][0]}.`
                                      : "";
                                    const apellido = parts.slice(1).join(" ");
                                    return `${nombreInicial} ${apellido}`.trim();
                                  }
                                  return "Desconocido";
                                })()
                              : "Desconocido";

                            const clubName =
                              player && player.club
                                ? player.club.nombre
                                : "N/A";
                            const clubLogoUrl =
                              player &&
                              player.club &&
                              player.club.logo &&
                              player.club.logo.url
                                ? player.club.logo.url
                                : "https://placehold.co/32x32/cccccc/333333?text=Club";
                            const globalPoints = entry.puntosGlobales || 0;

                            // --- Logic for Recent Wins (duplicated for this section) ---
                            let allPlayerMatches = [];

                            if (player.pareja) {
                              if (player.pareja.partidos_ganados) {
                                player.pareja.partidos_ganados.forEach(
                                  (match) =>
                                    allPlayerMatches.push({
                                      ...match,
                                      won: true,
                                    })
                                );
                              }
                              if (player.pareja.partidos_perdidos) {
                                player.pareja.partidos_perdidos.forEach(
                                  (match) =>
                                    allPlayerMatches.push({
                                      ...match,
                                      won: false,
                                    })
                                );
                              }
                            }

                            if (player.pareja1) {
                              if (player.pareja1.partidos_ganados) {
                                player.pareja1.partidos_ganados.forEach(
                                  (match) =>
                                    allPlayerMatches.push({
                                      ...match,
                                      won: true,
                                    })
                                );
                              }
                              if (player.pareja1.partidos_perdidos) {
                                player.pareja1.partidos_perdidos.forEach(
                                  (match) =>
                                    allPlayerMatches.push({
                                      ...match,
                                      won: false,
                                    })
                                );
                              }
                            }

                            allPlayerMatches.sort(
                              (a, b) =>
                                new Date(b.fechaPartido) -
                                new Date(a.fechaPartido)
                            );

                            let lastThreeWins = true;

                            if (allPlayerMatches.length >= 3) {
                              for (let i = 0; i < 3; i++) {
                                if (!allPlayerMatches[i].won) {
                                  lastThreeWins = false;
                                  break;
                                }
                              }
                            } else {
                              lastThreeWins = false;
                            }
                            // --- End of Logic ---

                            return (
                              <tr
                                key={entry.id}
                                className="hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                                onClick={() => openPlayerModal(player)}
                              >
                              <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              <div className="flex items-center justify-center">
                                <span>{index + 1}</span>
                                {lastThreeWins ? (
                                  <span className="text-green-500 ml-1 text-base leading-none">
                                    &#x25B2;
                                  </span> // Flecha verde
                                ) : (
                                  <span className="text-gray-400 ml-1 text-base leading-none">
                                    &#x2022;
                                  </span> // Punto gris (código HTML para punto: &#x2022;)
                                )}
                              </div>
                            </td>
                                <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-700">
                                  <div className="flex items-center">
                                    <img
                                      src={clubLogoUrl}
                                      alt={`${clubName} Logo`}
                                      className="w-6 h-6 sm:w-8 sm:h-8 object-contain rounded-full mr-1 sm:mr-2 shadow-sm bg-black"
                                      onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src =
                                          "https://placehold.co/32x32/cccccc/333333?text=Club";
                                      }}
                                    />
                                  </div>
                                </td>
                                <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-700">
                                  {playerName}
                                </td>
                                <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-700">
                                  {/* Aplica CountUp solo si hasAnimated es true */}
                                  {hasAnimated ? (
                                    <CountUp
                                      end={globalPoints}
                                      duration={4}
                                      separator="."
                                      decimals={0}
                                    />
                                  ) : (
                                    globalPoints
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ))
      ) : (
        <p className="px-6 py-4 text-center text-sm text-gray-600">
          No se encontraron categorías o entradas de ranking.
        </p>
      )}

      {/* Player Detail Modal component rendered conditionally */}
      {isModalOpen && selectedPlayer && (
        <PlayerDetailModal player={selectedPlayer} onClose={closePlayerModal} />
      )}
    </div>
  );
}

export default RankingGlobal;