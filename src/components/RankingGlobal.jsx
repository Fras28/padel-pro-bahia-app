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
import PProLogo from '../assets/LogoPPR.png'

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

  // Función auxiliar para determinar si el jugador tiene una racha de 4 o más partidos ganados
  const getFireIcon = (historial) => {
    if (!historial || historial.length === 0) return null;

    // 1. Ordenar el historial por fecha de forma descendente (el más reciente primero)
    const historialOrdenado = [...historial].sort(
        (a, b) => new Date(b.fecha) - new Date(a.fecha)
    );

    let consecutiveWins = 0;

    // 2. Iterar sobre el historial y contar victorias consecutivas
    for (const item of historialOrdenado) {
        // Criterio de "victoria": que el registro tenga 'esGanador' como true
        if (item.esGanador === true) {
            consecutiveWins++;
        } else {
            // Si encontramos una derrota, la racha se rompe.
            break;
        }
    }

    // 3. Devolver la llama si la racha es de 4 o más
    if (consecutiveWins >= 4) {
        // La clase "text-orange-500" o similar le dará color de fuego
        return <span className="text-orange-500 ml-1 text-base leading-none">🔥</span>;
    }

    return null;
  };


// Función principal para determinar la insignia según la lógica definida
const getInsignia = (player) => {
  const historial = player?.historialRanking;

  // Si no hay historial o está vacío, no se muestra ninguna insignia.
  if (!historial || historial.length === 0) return null;

  // Se ordena por fecha de forma descendente para tener el resultado más reciente primero.
  const historialOrdenado = [...historial].sort(
    (a, b) => new Date(b.fecha) - new Date(a.fecha)
  );
  
  const ultimoResultado = historialOrdenado[0];
  const fireIcon = getFireIcon(historial); // <--- Nuevo: Obtener el ícono de fuego
  let mainInsignia = null; // <--- Inicializar la insignia principal

  // --- LÓGICA DE LOGRO PRINCIPAL (Prioridad por Fecha) ---

  // 1. PRIORIDAD MÁXIMA PARA RESULTADOS RECIENTES:
  if (ultimoResultado) {
    const { ronda, esGanador } = ultimoResultado;

    // Flecha Verde (▲): Podio Reciente (Subcampeón/Semifinalista)
    if ((ronda === "Final" && !esGanador) || ronda === "Semifinal") {
      mainInsignia = <span className="text-green-500 ml-1 text-base leading-none">▲</span>;
    }

    // Diamante (◆): Cuartos/Octavos Recientes
    else if (ronda === "Cuartos" || ronda === "Octavos" || ronda === "16avos") { 
      mainInsignia = <span className="text-yellow-400 ml-1 text-base leading-none">◆</span>;
    }
  }

  // 2. PRIORIDAD MEDIA: Corona Histórica
  // Si no se asignó insignia principal (es decir, el último resultado no fue podio/cuartos),
  // revisamos si fue campeón histórico.
  if (!mainInsignia) {
    const fueCampeon = historial.some(
      (item) => item.ronda === "Final" && item.esGanador
    );
    if (fueCampeon) {
      mainInsignia = <span className="text-yellow-500 ml-1 text-base leading-none">👑</span>;
    }
  }

  // 3. PRIORIDAD BAJA: Eliminación Temprana Reciente
  // Solo si NO se encontró un logro superior (mainInsignia sigue nula), 
  // y el último resultado fue una eliminación en Zona.
  if (!mainInsignia && ultimoResultado && ultimoResultado.ronda === "Zona" && ultimoResultado.esGanador !== true) {
    mainInsignia = <span className="text-red-500 ml-1 text-base leading-none">▼</span>;
  }


  // --- COMBINACIÓN Y RETORNO FINAL ---
  // Devolver la insignia principal Y el ícono de fuego si existe
  if (mainInsignia || fireIcon) {
      return (
          <>
              {mainInsignia}
              {fireIcon}
          </>
      );
  }

  // Si no se aplica ninguna insignia ni fuego
  return null;
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
                       
                        </th>
                        <th className="px-3 py-2 sm:px-6 sm:py-3  text-xs font-medium text-gray-500 uppercase tracking-wider justify-center text-left">
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
                        const playerName = player
                          ? (() => {
                              let fullName = player.nombre || "";
                              const cleanedName = fullName.replace(/-\s*\w+$/, '').trim();
                              const parts = cleanedName.split(" ");
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

                        const globalPoints = player?.rankingGeneral || 0;
                        const insignia = getInsignia(player);

                        return (
                          <tr
                            key={player.id}
                            className="hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                            onClick={() => openPlayerModal(player)}
                          >
                            <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-center">
                              <div className="flex items-center justify-center">
                                <span>{index + 1}</span>
                              </div>
                            </td>
                            <td className=" py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-700 text-center">
                              {insignia}
                            </td>
                            <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-700 text-left">
                              {playerName}
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
                <div className="mt-4  pt-4">
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
                          <th className="px-3 py-2 sm:px-6 sm:py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                   
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
                            const playerName = player
                              ? (() => {
                                  let fullName = player.nombre || "";
                                  const cleanedName = fullName.replace(/-\s*\w+$/, '').trim();
                                  const parts = cleanedName.split(" ");
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

                            const globalPoints = player?.rankingGeneral || 0;
                            const insignia = getInsignia(player);

                            return (
                              <tr
                                key={player.id}
                                className="hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                                onClick={() => openPlayerModal(player)}
                              >
                                <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-center">
                                  <div className="flex items-center justify-center">
                                    <span>{10 + index + 1}</span>
                                  </div>
                                </td>
                                <td className=" py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-700 text-center">
                                  {insignia}
                                </td>
                                <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-700 text-left">
                                  {playerName}
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
                      <SponsorBanner sponsorImages={sponsorImages} />
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