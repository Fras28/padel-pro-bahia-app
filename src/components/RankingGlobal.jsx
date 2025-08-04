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
import CountUp from "react-countup";
import { useInView } from "react-intersection-observer";
import SkeletonRankingTable from "./SkeletonRankingTable";
import { useSelector, useDispatch } from 'react-redux';
import { fetchCategorizedRanking } from '../features/ranking/rankingSlice';

function RankingGlobal() {
  const dispatch = useDispatch();
  
  // Usamos useSelector para obtener el estado del store
  const categorizedRanking = useSelector((state) => state.ranking.data);
  const loading = useSelector((state) => state.ranking.loading);
  const error = useSelector((state) => state.ranking.error);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  const sponsorImages = [
    { src: Dternera, url: "https://www.deternera.com.ar/", blurred: false },
    { src: DonAlf, url: "https://www.instagram.com/donalfredocentro/", blurred: false },
    { src: Morton, url: "https://www.morton.com.ar/", blurred: false },
    { src: Rucca, url: "https://www.ruccabahia.com/", blurred: false },
  ];

  useEffect(() => {
    if (loading === 'idle') {
      dispatch(fetchCategorizedRanking());
    }
  }, [loading, dispatch]);

  const openPlayerModal = (playerData) => {
    setSelectedPlayer(playerData);
    setIsModalOpen(true);
  };

  const closePlayerModal = () => {
    setIsModalOpen(false);
    setSelectedPlayer(null);
  };

  const AnimatedPoints = ({ points }) => {
    const { ref, inView } = useInView({
      triggerOnce: true,
      threshold: 0.5,
    });
    return (
      <span ref={ref}>
        {inView ? (
          <CountUp end={points} duration={2.5} separator="." decimals={0} />
        ) : (
          points
        )}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-md ">
      <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 sm:mb-6 text-center">
        Ranking Global por Categoría
      </h2>
      {loading === 'pending' ? (
        <SkeletonRankingTable />
      ) : error ? (
        <div className="text-center text-sm text-red-500">{error}</div>
      ) : Object.values(categorizedRanking).length > 0 ? (
        Object.values(categorizedRanking)
          .sort((a, b) => {
            if (a.name === "AJPP" && b.name !== "AJPP") {
              return -1;
            }
            if (a.name !== "AJPP" && b.name === "AJPP") {
              return 1;
            }
            return a.name.localeCompare(b.name);
          })
          .map((categoryData, catIndex) => (
            <div key={catIndex} className="mb-8">
              <SponsorBanner sponsorImages={sponsorImages} />
              <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-4 border-b pb-2">
                {categoryData.name}
              </h3>
              {categoryData.players.length > 0 ? (
                <div className="m-4 overflow-x-auto rounded-lg shadow-md border border-gray-200">
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
                      {categoryData.players.slice(0, 10).map((player, index) => {
                        const playerName = player?.nombre || "Desconocido";
                        const playerLastName = player?.apellido || "";
                        const clubName = player?.club?.nombre || "N/A";
                        const clubLogoUrl = player?.club?.logo?.url || "https://placehold.co/32x32/cccccc/333333?text=Club";
                        const globalPoints = player?.rankingGeneral || 0;

                        let allPlayerMatches = [];
                        if (player.pareja_revez && player.pareja_revez.partidos_ganados) {
                          allPlayerMatches.push(...player.pareja_revez.partidos_ganados.map(match => ({ ...match, won: true })));
                        }
                        if (player.pareja_revez && player.pareja_revez.partidos_perdidos) {
                          allPlayerMatches.push(...player.pareja_revez.partidos_perdidos.map(match => ({ ...match, won: false })));
                        }
                        if (player.pareja_drive) {
                            if (player.pareja_drive.partidos_ganados) {
                                player.pareja_drive.partidos_ganados.forEach((match) => allPlayerMatches.push({ ...match, won: true }));
                            }
                            if (player.pareja_drive.partidos_perdidos) {
                                player.pareja_drive.partidos_perdidos.forEach((match) => allPlayerMatches.push({ ...match, won: false }));
                            }
                        }
                        
                        allPlayerMatches.sort((a, b) => new Date(b.fechaPartido) - new Date(a.fechaPartido));
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

                        return (
                          <tr
                            key={player.id}
                            className="hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                            onClick={() => openPlayerModal(player)}
                          >
                            <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              <div className="flex items-center justify-center">
                                <span>{index + 1}</span>
                                {lastThreeWins ? (
                                  <span className="text-green-500 ml-1 text-base leading-none">
                                    &#x25B2;
                                  </span>
                                ) : (
                                  <span className="text-gray-400 ml-1 text-base leading-none">
                                    &#x2022;
                                  </span>
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
                              {playerName} {playerLastName}
                            </td>
                            <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-700 text-center">
                              <AnimatedPoints points={globalPoints} />
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

              {categoryData.players.length > 10 && (
                <div className="mt-4 border-t pt-4">
                  <h4 className="text-md font-semibold text-gray-700 mb-2">
                    Puestos 11-16
                  </h4>
                  <div className="overflow-y-auto max-h-48 rounded-lg shadow-md border border-gray-200 m-4">
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
                          .map((player, index) => {
                            const playerName = player?.nombre || "Desconocido";
                            const playerLastName = player?.apellido || "";
                            const clubName = player?.club?.nombre || "N/A";
                            const clubLogoUrl = player?.club?.logo?.url || "https://placehold.co/32x32/cccccc/333333?text=Club";
                            const globalPoints = player?.rankingGeneral || 0;

                            let allPlayerMatches = [];
                            if (player.pareja_revez && player.pareja_revez.partidos_ganados) {
                                allPlayerMatches.push(...player.pareja_revez.partidos_ganados.map(match => ({ ...match, won: true })));
                            }
                            if (player.pareja_revez && player.pareja_revez.partidos_perdidos) {
                                allPlayerMatches.push(...player.pareja_revez.partidos_perdidos.map(match => ({ ...match, won: false })));
                            }
                            if (player.pareja_drive) {
                                if (player.pareja_drive.partidos_ganados) {
                                    player.pareja_drive.partidos_ganados.forEach((match) => allPlayerMatches.push({ ...match, won: true }));
                                }
                                if (player.pareja_drive.partidos_perdidos) {
                                    player.pareja_drive.partidos_perdidos.forEach((match) => allPlayerMatches.push({ ...match, won: false }));
                                }
                            }
                            
                            allPlayerMatches.sort((a, b) => new Date(b.fechaPartido) - new Date(a.fechaPartido));
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

                            return (
                              <tr
                                key={player.id}
                                className="hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                                onClick={() => openPlayerModal(player)}
                              >
                                <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  <div className="flex items-center justify-center">
                                    <span>{10 + index + 1}</span>
                                    {lastThreeWins ? (
                                      <span className="text-green-500 ml-1 text-base leading-none">
                                        &#x25B2;
                                      </span>
                                    ) : (
                                      <span className="text-gray-400 ml-1 text-base leading-none">
                                        &#x2022;
                                      </span>
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
                                  {playerName} {playerLastName}
                                </td>
                                <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-700">
                                  <AnimatedPoints points={globalPoints} />
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

      {isModalOpen && selectedPlayer && (
        <PlayerDetailModal player={selectedPlayer} onClose={closePlayerModal} />
      )}
    </div>
  );
}

export default RankingGlobal;