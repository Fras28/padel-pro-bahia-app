import React, { useEffect, useState, useCallback } from "react";
// Imágenes de patrocinadores
import Dternera from "../assets/DeTernera.png";
import DonAlf from "../assets/donalf.jpg";
import Morton from "../assets/morton.png";
import Rucca from "../assets/ruca.png";
// Eliminamos todas las importaciones que causaban error de resolución (archivos locales, assets y librerías no resolubles)

// --- COMPONENTES INLINE PARA HACER EL ARCHIVO AUTOCONTENIDO ---

// 1. Placeholder para PlayerDetailModal
const PlayerDetailModal = ({ player, onClose }) => {
  if (!player) return null;

  // Función para formatear fechas
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      // Usar 'es-AR' si es necesario, o solo 'es' para más compatibilidad
      return new Date(dateString).toLocaleDateString('es', { 
        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-gray-900 bg-opacity-75 flex items-center justify-center p-4 transition-opacity duration-300" 
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-auto transform transition-all duration-300 scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-2xl font-bold text-gray-800 border-b pb-2 mb-2">
            Detalle del Jugador
          </h3>
          <p className="text-lg text-gray-600">
            {player.nombre} {player.apellido}
          </p>
        </div>

        <div className="p-6 max-h-96 overflow-y-auto space-y-4">
          <p className="text-gray-700">
            <span className="font-semibold text-indigo-600">Puntos Globales:</span> {player.puntosGlobales}
          </p>
          <p className="text-gray-700">
            <span className="font-semibold text-indigo-600">Document ID:</span> {player.documentId || 'N/A'}
          </p>

          <h4 className="text-xl font-semibold text-gray-800 pt-4 border-t mt-4">
            Historial de Ranking
          </h4>
          {player.historialRanking && player.historialRanking.length > 0 ? (
            <ul className="space-y-2 text-sm">
              {player.historialRanking.slice(0, 5).map((item, index) => (
                <li key={index} className="bg-gray-50 p-3 rounded-lg flex justify-between items-center shadow-sm">
                  <span className="text-gray-600">
                    <span className="font-medium text-gray-800">{item.ronda}</span> en Torneo ID {item.torneoId}
                  </span>
                  <span className={`font-semibold ${item.esGanador ? 'text-green-600' : 'text-red-600'}`}>
                    {item.esGanador ? 'Ganó' : 'Perdió'} ({item.puntos} Pts)
                  </span>
                </li>
              ))}
              {player.historialRanking.length > 5 && (
                <li className="text-center text-gray-500 text-xs mt-2">
                  ... {player.historialRanking.length - 5} resultados más
                </li>
              )}
            </ul>
          ) : (
            <p className="text-gray-500 italic">No hay historial de ranking disponible.</p>
          )}
        </div>

        <div className="p-4 border-t flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

// 2. Componente SponsorBanner completo (Integrado)
const SponsorBanner = ({ sponsorImages }) => {
    // Duplicar las imágenes para crear un efecto de desplazamiento continuo en la marquesina.
    const duplicatedImages = [...sponsorImages, ...sponsorImages, ...sponsorImages];

    return (
        <div className="mb-6">
            {/* INICIO de la sección de estilos CSS para la animación de marquesina. */}
            {/* Se inserta la etiqueta <style> directamente en el renderizado para la animación. */}
            <style>
                {`
                    /* Define la animación de desplazamiento de la marquesina */
                    @keyframes marquee {
                        0% { transform: translateX(0); }
                        100% { transform: translateX(-50%); }
                    }
                    /* Contenedor principal de la marquesina */
                    .marquee-container {
                        display: flex;
                        width: fit-content;
                        animation: marquee 30s linear infinite;
                        will-change: transform;
                    }
                    /* Estilo para cada elemento de la marquesina (cada imagen) */
                    .marquee-item {
                        flex-shrink: 0;
                        margin-right: 2rem;
                    }
                    .marquee-item img {
                        height: 60px;
                        width: auto;
                        object-fit: contain;
                        filter: grayscale(100%); /* Opcional: convierte los logos a escala de grises */
                        transition: filter 0.3s ease-in-out; /* Transición suave para el efecto hover y blur */
                    }

                    /* Clase para aplicar el efecto de desenfoque */
                    .marquee-item img.blurred {
                        filter: blur(5px) grayscale(100%); /* Aplica blur y mantiene grayscale */
                    }

                    /* Ajustes para pantallas pequeñas (móviles) */
                    @media (max-width: 768px) {
                        .marquee-item {
                            margin-right: 1rem;
                        }
                        .marquee-item img {
                            height: 40px;
                        }
                        .marquee-container {
                            animation-duration: 20s;
                        }
                    }

                    .marquee-item img:hover:not(.blurred) { /* Solo aplica el hover si NO está blureado inicialmente */
                        filter: grayscale(0%); /* Vuelve al color original al pasar el ratón */
                    }
                `}
            </style>
            {/* FIN de la sección de estilos CSS. */}

            <div className="bg-gradient-to-r from-gray-100 to-gray-200 py-4 rounded-lg shadow-inner overflow-hidden">
                
                <div className="marquee-container">
                    {/* Renderiza las imágenes duplicadas para el efecto de marquesina */}
                    {duplicatedImages.map((sponsor, index) => (
                        <div key={index} className="marquee-item">
                            <a href={sponsor.url} target="_blank" rel="noopener noreferrer">
                                <img
                                    src={sponsor.src}
                                    alt={`Sponsor ${index}`}
                                    // Aplica la clase 'blurred' si sponsor.blurred es true
                                    className={`rounded-md ${sponsor.blurred ? 'blurred' : ''}`}
                                    // Manejo de errores si la imagen no se carga
                                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/100x50/CCCCCC/666666?text=Error'; }}
                                />
                            </a>
                        </div>
                    ))}
                    {/* Mensaje si no hay sponsors */}
                    {sponsorImages.length === 0 && (
                        <p className="flex-shrink-0 text-center text-gray-500 text-xs self-center ml-4">No hay sponsors disponibles en este momento.</p>
                    )}
                </div>
            </div>
        </div>
    );
};


// 3. Placeholder para SkeletonRankingTable
const SkeletonRankingTable = () => (
  <div className="animate-pulse p-4 space-y-6">
    {[...Array(3)].map((_, catIndex) => (
      <div key={catIndex} className="space-y-3">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-100 h-10 w-full"></div>
          {[...Array(5)].map((_, index) => (
            <div key={index} className="flex items-center space-x-4 p-3 border-t">
              <div className="h-4 bg-gray-200 rounded w-8"></div>
              <div className="h-4 bg-gray-200 rounded w-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-12 ml-auto"></div>
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

// Función de utilidad para manejar la animación simple (reemplaza react-countup)
const AnimatedPoints = ({ points }) => {
    // Simplificado ya que 'react-countup' y 'useInView' causan problemas de resolución
    return <span className="font-bold">{points}</span>;
};


// --- COMPONENTE PRINCIPAL ---

function RankingGlobal() {
  // Hardcodeo de la base de la API y de las imágenes para evitar errores de importación
  const API_BASE = "https://padelproback-ranking.onrender.com/";
  // Nueva URL de la lista que incluye 'populate=categoria'
  const GLOBAL_RANKING_CATEGORIES_URL = `${API_BASE}api/ranking-global-categorias?populate=categoria`;
  
  // Reemplazamos las importaciones de assets con URLs placeholder o base64 (usaremos placeholders)
  const SPONSOR_PLACEHOLDER_URL = "https://placehold.co/100x50/374151/FFFFFF?text=SPONSOR";
  
  // Usamos el listado de sponsors que tienes en App.jsx para la fuente de imágenes
  const sponsorImages = [
    { src: Dternera, url: "https://www.deternera.com.ar/", blurred: false },
    {
      src: DonAlf,
      url: "https://www.instagram.com/donalfredocentro/",
      blurred: false,
    },
    { src: Morton, url: "https://www.morton.com.ar/", blurred: false },
    { src: Rucca, url: "https://www.ruccabahia.com/", blurred: false },
  ];
  // NOTA: Reemplacé tus rutas de archivo con URLs placeholder ya que no podemos importar archivos de assets aquí.

  // Reemplazamos Redux con estado local
  const [categorizedRanking, setCategorizedRanking] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  // Definición del orden de categorías
  const CATEGORY_ORDER = [
    "3RA LIBRE", "4TA LIBRE", "5TA LIBRE", "6TA LIBRE",
    "4TA DAMAS", "5TA DAMAS", "6TA DAMAS", "7MA DAMAS",
    "AJPP" // Mantener AJPP al final si no se especifica otro orden
  ];
  
  // Función auxiliar para obtener el índice de orden
  const getCategoryOrderIndex = (categoryName) => {
    const index = CATEGORY_ORDER.findIndex(name => name === categoryName?.toUpperCase());
    // Si no se encuentra, ponerlo al final. Se usa CATEGORY_ORDER.length + 1 para que 'AJPP' (si está al final de CATEGORY_ORDER) no interfiera con otros que no tienen nombre
    return index !== -1 ? index : CATEGORY_ORDER.length + 1; 
  };


  const fetchRanking = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Obtener la lista de todos los rankings globales (categorías)
      const response = await fetch(GLOBAL_RANKING_CATEGORIES_URL);
      if (!response.ok) {
        throw new Error('Error al obtener la lista de categorías de ranking.');
      }
      const categoriesData = await response.json();

      const tempCategorizedRanking = {};

      // 2. Iterar sobre las categorías para obtener los detalles de cada ranking
      for (const item of categoriesData.data || []) {
        // CORRECCIÓN: El nombre de la categoría está anidado en 'categoria.nombre'
        const categoryDocumentId = item?.documentId;
        const categoryName = item?.categoria?.nombre; 

        // Solo procesar categorías que tengan nombre y documentId válidos
        if (!categoryDocumentId || !categoryName) {
            console.warn("Skipping category due to missing name or documentId:", item);
            continue; 
        }

        // URL para obtener los detalles de una categoría específica con jugadores
        const DETAIL_URL = `${API_BASE}api/ranking-global-categorias/${categoryDocumentId}?populate=entradasRankingGlobal.jugador`;

        const detailResponse = await fetch(DETAIL_URL);
        if (!detailResponse.ok) {
          console.error(`Error al obtener detalle del ranking para ${categoryName}`);
          continue;
        }
        const detailData = await detailResponse.json();

        // 3. Procesar los datos de la categoría detallada
        const rankingEntries = detailData.data?.entradasRankingGlobal || [];

        const sortedPlayers = rankingEntries
          .map(entry => ({
            // Usamos el ID de la entrada del ranking (único por fila en esta lista) como la clave
            rankingEntryId: entry.id, 
            posicionGlobal: entry.posicionGlobal,
            puntosGlobales: entry.puntosGlobales || 0,
            
            // Datos del jugador (anidados bajo 'jugador')
            ...entry.jugador,
            
            // Mapear puntosGlobales a rankingGeneral para compatibilidad con la UI
            rankingGeneral: entry.puntosGlobales || 0, 
            
            id: entry.jugador?.id, // ID del jugador (puede repetirse en otras categorías)
            nombre: entry.jugador?.nombre,
            apellido: entry.jugador?.apellido,
            historialRanking: entry.jugador?.historialRanking || [],
          }))
          .sort((a, b) => b.rankingGeneral - a.rankingGeneral);

        // Almacenar el nombre de la categoría y los jugadores
        tempCategorizedRanking[item.id] = {
          name: categoryName,
          players: sortedPlayers,
        };
      }

      setCategorizedRanking(tempCategorizedRanking);
    } catch (err) {
      setError(`Error: ${err.message}. Asegúrate de que la API esté disponible.`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [GLOBAL_RANKING_CATEGORIES_URL, API_BASE]); // Añadir dependencias

  useEffect(() => {
    fetchRanking();
  }, [fetchRanking]);


  const openPlayerModal = (playerData) => {
    setSelectedPlayer(playerData);
    setIsModalOpen(true);
  };

  const closePlayerModal = () => {
    setIsModalOpen(false);
    setSelectedPlayer(null);
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
        if (item.esGanador === true) {
            consecutiveWins++;
        } else {
            break;
        }
    }

    if (consecutiveWins >= 4) {
        return <span className="text-orange-500 ml-1 text-base leading-none">🔥</span>;
    }

    return null;
  };


// Función principal para determinar la insignia según la lógica definida
const getInsignia = (player) => {
  const historial = player?.historialRanking; 

  if (!historial || historial.length === 0) return null;

  const historialOrdenado = [...historial].sort(
    (a, b) => new Date(b.fecha) - new Date(a.fecha)
  );
  
  const ultimoResultado = historialOrdenado[0];
  const fireIcon = getFireIcon(historial); 
  let mainInsignia = null; 

  // --- LÓGICA DE LOGRO PRINCIPAL (Prioridad por Fecha) ---
  if (ultimoResultado) {
    const { ronda, esGanador } = ultimoResultado;

    if ((ronda === "Final" && !esGanador) || ronda === "Semifinal") {
      mainInsignia = <span className="text-green-500 ml-1 text-base leading-none">▲</span>;
    }
    else if (ronda === "Cuartos" || ronda === "Octavos" || ronda === "16avos") { 
      mainInsignia = <span className="text-yellow-400 ml-1 text-base leading-none">◆</span>;
    }
  }

  // 2. PRIORIDAD MEDIA: Corona Histórica
  if (!mainInsignia) {
    const fueCampeon = historial.some(
      (item) => item.ronda === "Final" && item.esGanador
    );
    if (fueCampeon) {
      mainInsignia = <span className="text-yellow-500 ml-1 text-base leading-none">👑</span>;
    }
  }

  // 3. PRIORIDAD BAJA: Eliminación Temprana Reciente
  if (!mainInsignia && ultimoResultado && ultimoResultado.ronda === "Zona" && ultimoResultado.esGanador !== true) {
    mainInsignia = <span className="text-red-500 ml-1 text-base leading-none">▼</span>;
  }

  // --- COMBINACIÓN Y RETORNO FINAL ---
  if (mainInsignia || fireIcon) {
      return (
          <>
              {mainInsignia}
              {fireIcon}
          </>
      );
  }

  return null;
};


  return (
    <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
      {/* Colocamos el SponsorBanner al principio del componente RankingGlobal */}


      <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 sm:mb-6 text-center">
        Ranking Global por Categoría
      </h2>
      {loading ? (
        <SkeletonRankingTable />
      ) : error ? (
        <div className="text-center text-sm text-red-500 p-8 border border-red-200 rounded-lg bg-red-50">
          {error}
        </div>
      ) : Object.values(categorizedRanking).length > 0 ? (
        Object.values(categorizedRanking)
          .sort((a, b) => {
            // FIX: Implementar orden personalizado por categoría
            const nameA = a.name || "";
            const nameB = b.name || "";
            
            const indexA = getCategoryOrderIndex(nameA);
            const indexB = getCategoryOrderIndex(nameB);
            
            return indexA - indexB;
          })
          .map((categoryData, catIndex) => (
            <div key={catIndex} className="mb-8 border border-gray-100 p-4 rounded-lg shadow-sm"> 
      
              <h3 className="text-lg sm:text-xl font-bold text-indigo-700 mb-4 border-b pb-2">
                {categoryData.name}
              </h3>
              {categoryData.players.length > 0 ? (
                <><div className="overflow-x-auto rounded-lg shadow-md border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-indigo-50">
                      <tr>
                        <th className="px-3 py-2 sm:px-6 sm:py-3 text-center text-xs font-medium text-indigo-600 uppercase tracking-wider">
                          Rank
                        </th>
                        <th className="px-3 py-2 sm:px-6 sm:py-3 text-center text-xs font-medium text-indigo-600 uppercase tracking-wider">
                       
                        </th>
                        <th className="px-3 py-2 sm:px-6 sm:py-3  text-xs font-medium text-indigo-600 uppercase tracking-wider justify-center text-left">
                          Jugador
                        </th>
                        <th className="px-3 py-2 sm:px-6 sm:py-3 text-center text-xs font-medium text-indigo-600 uppercase tracking-wider">
                          Pts
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {/* Mostrar los primeros 16 jugadores */}
                      {categoryData.players.slice(0, 16).map((player, index) => { // CAMBIO CLAVE: Cambiado de 10 a 16
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

                        const globalPoints = player?.rankingGeneral || 0; // Usamos el campo mapeado
                        const insignia = getInsignia(player);

                        return (
                          <tr
                            key={player.rankingEntryId || player.id} // Usar rankingEntryId como clave única
                            className="hover:bg-indigo-50 cursor-pointer transition-colors duration-200"
                            onClick={() => openPlayerModal(player)}
                          >
                            <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-center">
                              <div className="flex items-center justify-center">
                                {/* Mostrar posición secuencial (1-16) */}
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
                  <SponsorBanner sponsorImages={sponsorImages} /></>
              ) : (
                <p className="px-6 py-4 text-center text-sm text-gray-600">
                  No se encontraron jugadores en esta categoría.
                </p>
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
