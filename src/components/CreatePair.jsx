// src/components/CreatePair.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// Incluimos faStar para el renderizado de puntos y el resto de iconos
import { faSearch, faUserPlus, faTimesCircle, faArrowRight, faCheckCircle, faSpinner, faStar } from '@fortawesome/free-solid-svg-icons';

const CreatePair = ({ API_BASE, user }) => {
  const navigate = useNavigate();
  const location = useLocation(); 
  // CRÍTICO: Usar Document ID para la URL
  const playerDocumentId = location.state?.playerDocumentId; 
  const playerId = location.state?.playerId; // ID numérico para payload POST

  const [playerData, setPlayerData] = useState(null); 
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [partnerPosition, setPartnerPosition] = useState(''); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!playerDocumentId) {
      setError('Error: Document ID del jugador no especificado. Vuelve a la página de perfil para seleccionar tu jugador.');
      setLoading(false);
      return;
    }
    fetchPlayerData(playerDocumentId);
  }, [user, navigate, playerDocumentId]); 

/**
 * Fetches the current player's data by their Document ID, handling the non-standard API response structure.
 */
const fetchPlayerData = async (docId) => {
  setLoading(true);
  setError('');
  const jwt = localStorage.getItem('jwt');
  if (!jwt) {
    setError('No estás autenticado.');
    setLoading(false);
    navigate('/login');
    return;
  }

  try {
    const populateParams = [
      'pareja_drive.revez', 
      'pareja_drive.drive', 
      'pareja_revez.revez', 
      'pareja_revez.drive'
    ].map(param => `populate=${param}`).join('&'); 

    const playerAPI_URL = `${API_BASE}api/jugadors/${docId}?${populateParams}`;

    const playerResponse = await fetch(playerAPI_URL, {
      headers: {
        'Authorization': `Bearer ${jwt}`,
      },
    });

    if (!playerResponse.ok) {
      throw new Error('No se pudieron cargar los datos del jugador.');
    }

    const playerDataResponse = await playerResponse.json();
    
    // CRÍTICO: Manejar respuesta API sin 'attributes' (formato plano)
    if (playerDataResponse.data) {
      const dataFromApi = playerDataResponse.data;
      
      if (dataFromApi.id && dataFromApi.nombre) {
          
          if (dataFromApi.attributes) {
              setPlayerData({
                  id: dataFromApi.id,
                  documentId: dataFromApi.documentId || docId,
                  ...dataFromApi.attributes
              });
          } else {
              setPlayerData({
                  // Aplanar data si viene sin wrapper 'attributes'
                  ...dataFromApi, 
                  id: dataFromApi.id,
                  documentId: dataFromApi.documentId || docId,
              });
          }
          return;
      }
    }
    
    throw new Error('Formato de datos de jugador no reconocido o jugador no encontrado.');

  } catch (err) {
    console.error('Error fetching player data:', err);
    setError(`Error al cargar el perfil: ${err.message}`);
  } finally {
    setLoading(false);
  }
};


/**
 * Checks if two players (player1 and player2) are already paired in any way.
 * Solo verifica la data populada de player1 (usuario actual).
 */
const arePlayersAlreadyPaired = (player1, player2) => {
  const player1Id = player1?.id;
  const player2Id = player2?.id;

  if (!player1Id || !player2Id) return false;

  const checkSpecificPair = (pair) => {
    if (!pair) return false;
    
    // Manejar relaciones simples (ID) o populadas (objeto con ID)
    const driveId = typeof pair.drive === 'object' ? pair.drive.id : pair.drive;
    const revezId = typeof pair.revez === 'object' ? pair.revez.id : pair.revez;

    if (!driveId || !revezId) return false;
    
    const driveIdNum = Number(driveId);
    const revezIdNum = Number(revezId);
    const player1IdNum = Number(player1Id);
    const player2IdNum = Number(player2Id);

    const isPaired = (
      (driveIdNum === player1IdNum && revezIdNum === player2IdNum) ||
      (driveIdNum === player2IdNum && revezIdNum === player1IdNum)
    );

    return isPaired;
  };

  // Solo revisamos las parejas del Jugador 1 (usuario actual)
  if (checkSpecificPair(player1.pareja_drive)) return true;
  if (checkSpecificPair(player1.pareja_revez)) return true;

  return false;
};

// src/components/CreatePair.jsx - Función handleSearch (REEMPLAZAR)

const handleSearch = async (e) => {
  e.preventDefault();
  if (!searchTerm.trim()) {
    setSearchResults([]);
    return;
  }

  setIsSearching(true);
  setSearchResults([]);
  setSelectedPartner(null);
  setPartnerPosition('');
  setError('');

  const jwt = localStorage.getItem('jwt');

  try {
    const queryParams = new URLSearchParams();

    // Filtros de búsqueda (Sintaxis robusta)
    queryParams.append('filters[$or][0][nombre][$containsi]', searchTerm);
    queryParams.append('filters[$or][1][apellido][$containsi]', searchTerm);
    queryParams.append('filters[$or][2][email][$containsi]', searchTerm);

    // Excluir al jugador actual
    if (playerData?.id) {
        queryParams.append('filters[id][$ne]', playerData.id);
    }
    
    // Populate simple (solo las relaciones directas) para la validación de pareja
    const populateParams = [
        'pareja_drive', 
        'pareja_revez' 
    ];
    populateParams.forEach(param => {
        queryParams.append('populate', param);
    });

    const url = `${API_BASE}api/jugadors?${queryParams.toString()}`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${jwt}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
       throw new Error(data.error?.message || 'Error en la búsqueda de jugadores.');
    }
      
    if (Array.isArray(data.data)) {
      const results = data.data.map(item => {
        // CORRECCIÓN FINAL CRÍTICA: La respuesta de Colección también es PLANA.
        // Mapeamos los campos directamente desde 'item', no desde 'item.attributes'.
        
        return {
            id: item.id, 
            documentId: item.documentId, 
            nombre: item.nombre, // <-- CORREGIDO
            apellido: item.apellido, // <-- CORREGIDO
            email: item.email, // <-- CORREGIDO
            rankingGeneral: item.rankingGeneral, // <-- CORREGIDO
            pareja_drive: item.pareja_drive, 
            pareja_revez: item.pareja_revez,
        };
      });
      
      setSearchResults(results);
    } else {
      throw new Error('La respuesta de la búsqueda no es una lista válida.');
    }

  } catch (err) {
    setError('Error al buscar jugadores: ' + err.message);
  } finally {
    setIsSearching(false);
  }
};

  const handleCreatePair = async () => {
    if (!playerData || !selectedPartner || !partnerPosition) {
      setError('Datos incompletos para crear la pareja.');
      return;
    }

    if (arePlayersAlreadyPaired(playerData, selectedPartner)) {
      setError('¡Esta pareja ya existe! Por favor, selecciona otro compañero.');
      return;
    }

    const myPosition = partnerPosition === 'drive' ? 'revez' : 'drive';

    // 2. Validación de disponibilidad de posición para el jugador actual
    const myExistingPair = myPosition === 'drive' ? playerData.pareja_drive : playerData.pareja_revez;
    if (myExistingPair) {
      const partnerInExistingPair = myPosition === 'drive' 
        ? myExistingPair.revez 
        : myExistingPair.drive;

      setError(`Ya tienes una pareja en la posición de ${myPosition}. Estás emparejado con ${partnerInExistingPair?.nombre || 'otro jugador'}.`);
      return;
    }
    
    // 3. Validación de disponibilidad de posición para el compañero (la posición opuesta)
    const partnerExistingPairAttribute = partnerPosition === 'drive' ? selectedPartner.pareja_drive : selectedPartner.pareja_revez;

    if (partnerExistingPairAttribute) {
      setError(`¡Tu compañero (${selectedPartner.nombre}) ya tiene una pareja en la posición de ${partnerPosition}! No puede formar otra.`);
      return;
    }


    setLoading(true);
    setError('');
    setSuccessMessage('');
    const jwt = localStorage.getItem('jwt');

    let newPairData;
    const player1Name = playerData.nombre;
    const player2Name = selectedPartner.nombre;

    if (myPosition === 'drive') {
      newPairData = {
        drive: playerData.id, 
        revez: selectedPartner.id, 
        nombrePareja: `${player1Name} / ${player2Name} (D/R)`,
      };
    } else { 
      newPairData = {
        drive: selectedPartner.id, 
        revez: playerData.id, 
        nombrePareja: `${player1Name} / ${player2Name} (R/D)`,
      };
    }

    try {
      const response = await fetch(`${API_BASE}api/parejas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`,
        },
        body: JSON.stringify({ data: newPairData }), 
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage(`¡Pareja creada exitosamente: ${newPairData.nombrePareja}!`);
        fetchPlayerData(playerDocumentId); 
        setSelectedPartner(null);
        setPartnerPosition('');
        setSearchResults([]);
        setSearchTerm('');

      } else {
        const message = data.error?.message || 'Error desconocido al crear la pareja.';
        setError('Error: ' + message);
        console.error('API Error:', data.error);
      }
    } catch (err) {
      setError('Error de red al intentar crear la pareja.');
    } finally {
      setLoading(false);
    }
  };


  // --- Renderizado ---
  if (loading && !playerData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <FontAwesomeIcon icon={faSpinner} spin size="3x" className="text-blue-600" />
        <p className="ml-3 text-lg">Cargando datos del jugador...</p>
      </div>
    );
  }

  if (error && !successMessage) {
    return (
      <div className="p-8 bg-red-100 border border-red-400 text-red-700 rounded-lg shadow-lg">
        <p className="font-bold">Error:</p>
        <p>{error}</p>
        <button onClick={() => navigate('/profile')} className="mt-4 text-blue-600 hover:underline">
          Volver al Perfil
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-2xl">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-2">Crear Nueva Pareja</h1>
      
      {/* Mensajes de Éxito/Error */}
      {successMessage && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4" role="alert">
          <p className="font-bold">¡Éxito!</p>
          <p>{successMessage}</p>
        </div>
      )}
      {error && !successMessage && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}

      {/* Información del Jugador Actual */}
      {playerData && (
        <div className="mb-8 p-4 border rounded-lg bg-blue-50">
          <p className="text-lg font-semibold text-blue-800">Jugador Actual:</p>
          <p className="text-2xl font-extrabold text-blue-900">{playerData.nombre} {playerData.apellido}</p>
          <div className="mt-2 text-sm">
            {/* Mostrar parejas existentes del jugador */}
            <p className="text-black">
              <span className="font-semibold">Pareja Drive:</span>{' '}
              {playerData.pareja_drive 
                ? `con ${playerData.pareja_drive.revez.nombre} (${playerData.pareja_drive.nombrePareja})` 
                : 'Libre'
              }
            </p>
            <p className="text-black">
              <span className="font-semibold">Pareja Revés:</span>{' '}
              {playerData.pareja_revez 
                ? `con ${playerData.pareja_revez.drive.nombre} (${playerData.pareja_revez.nombrePareja})` 
                : 'Libre'
              }
            </p>
          </div>
        </div>
      )}

      {/* 1. Buscar Compañero */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4 text-gray-700">1. Buscar Compañero</h2>
        <form onSubmit={handleSearch} className="flex space-x-3">
          <input
            type="text"
            placeholder="Buscar por Nombre, Apellido o Email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-grow p-3 border border-gray-300 rounded-lg text-black focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={isSearching}
            className={`p-3 rounded-lg text-white transition duration-300 ${
              isSearching ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            <FontAwesomeIcon icon={isSearching ? faSpinner : faSearch} spin={isSearching} />
          </button>
        </form>

        {/* Resultados de Búsqueda */}
        <div className="mt-4 space-y-3 max-h-64 overflow-y-auto">
        {searchResults.length > 0 ? (
          searchResults.map(player => (
            console.log("player", player),	
            <div 
              key={player.id} 
              className={`p-4 border rounded-lg cursor-pointer transition duration-200 ${
                selectedPartner?.id === player.id 
                  ? 'bg-green-100 border-green-500 shadow-md' 
                  : 'hover:bg-gray-50 border-gray-200'
              }`}
              onClick={() => {
                setSelectedPartner(player);
                setPartnerPosition(''); 
              }}
            >
              {/* Renderizado mejorado y accesible: Nombre y Puntos */}
              <div className="flex justify-between items-center mb-1">
                  <div className="text-xl font-bold text-black">
                      {player?.nombre} {player?.apellido}
                  </div>
                  <div className="flex items-center text-lg font-extrabold text-yellow-600">
                      <FontAwesomeIcon icon={faStar} className="w-4 h-4 mr-1" />
                      {player.rankingGeneral || 'N/A'}
                  </div>
              </div>
              <div className="text-sm text-gray-500">
                  {player.email}
              </div>
              
              {selectedPartner?.id === player.id && (
                <div className="mt-2 text-green-600 font-bold flex items-center">
                  <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
                  Compañero seleccionado
                </div>
              )}
            </div>
          ))
      ) : searchTerm.length > 0 && !isSearching ? (
          <p className="text-gray-500 text-center">No se encontraron jugadores que coincidan o ya están excluidos.</p>
      ) : null}
        </div>
      </div>

      {/* 2. Seleccionar Posición y Crear */}
      {selectedPartner && (
        <div className="border-t pt-8">
          {/* Título y subtítulo con encadenamiento opcional para evitar fallos */}
          <h2 className="text-xl font-bold mb-4 text-black">2. Seleccionar Posición para {selectedPartner?.nombre}</h2>
          <p className="mb-4 text-gray-600">
            Estás creando una pareja con <span className="font-bold text-green-700">{selectedPartner?.nombre} {selectedPartner?.apellido}</span>.
            Selecciona la posición de tu compañero, lo que determinará tu posición.
          </p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div
              className={`p-4 rounded-lg border-2 cursor-pointer transition duration-300 ease-in-out ${
                partnerPosition === 'drive'
                  ? 'border-green-600 bg-green-100 shadow-md'
                  : 'border-gray-300 hover:border-green-400'
              }`}
              onClick={() => setPartnerPosition('drive')}
            >
              <p className="font-semibold text-gray-800">Yo soy <span className="text-green-600">Revés</span></p>
              {/* Card 1: Uso seguro del nombre */}
              <p className="text-gray-600">Mi compañero ({selectedPartner?.nombre}) es <span className="text-green-600">Drive</span></p>
            </div>
            <div
              className={`p-4 rounded-lg border-2 cursor-pointer transition duration-300 ease-in-out ${
                partnerPosition === 'revez'
                  ? 'border-green-600 bg-green-100 shadow-md'
                  : 'border-gray-300 hover:border-green-400'
              }`}
              onClick={() => setPartnerPosition('revez')}
            >
              <p className="font-semibold text-gray-800">Yo soy <span className="text-green-600">Drive</span></p>
              {/* Card 2: Uso seguro del nombre */}
              <p className="text-black">Mi compañero ({selectedPartner?.nombre}) es <span className="text-green-600">Revés</span></p>
            </div>
          </div>

          <button
            onClick={handleCreatePair}
            disabled={!partnerPosition || loading}
            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm font-medium text-black transition duration-300 ease-in-out transform hover:-translate-y-1 ${
              !partnerPosition || loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
            }`}
          >
            <FontAwesomeIcon icon={loading ? faSpinner : faUserPlus} spin={loading} className="mr-2" />
            {/* Botón: Uso seguro del nombre */}
            {loading ? 'Creando Pareja...' : `Crear Pareja con ${selectedPartner?.nombre || 'Compañero'}`}
          </button>
        </div>
      )}

      <div className='mt-8 pt-4 border-t'>
        <button
          onClick={() => navigate('/profile')}
          className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-black bg-white hover:bg-gray-50 transition duration-300"
        >
          <FontAwesomeIcon icon={faArrowRight} rotation={180} className="mr-2" />
          Volver al Perfil
        </button>
      </div>
    </div>
  );
};

export default CreatePair;