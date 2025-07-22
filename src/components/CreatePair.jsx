// src/components/CreatePair.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faUserPlus, faTimesCircle, faArrowRight, faCheckCircle } from '@fortawesome/free-solid-svg-icons';

const CreatePair = ({ API_BASE, user }) => {
  const navigate = useNavigate();
  const [playerData, setPlayerData] = useState(null); // The current logged-in player's data
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [partnerPosition, setPartnerPosition] = useState(''); // 'drive' or 'revez' for the selected partner
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchPlayerData();
  }, [user, navigate]);

  /**
   * Fetches the current logged-in player's data, populating their associated pairs
   * and the players within those pairs.
   */
  const fetchPlayerData = async () => {
    setLoading(true);
    setError('');
    try {
      const jwt = localStorage.getItem('jwt');
      if (!jwt) {
        setError('No authentication token found. Please log in.');
        setLoading(false);
        return;
      }

      // Define parameters to populate nested relationships for the current player's data
      const userPopulateParams = [
          'jugador.pareja_drive.revez',
          'jugador.pareja_drive.drive',
          'jugador.pareja_revez.revez',
          'jugador.pareja_revez.drive'
      ];
      const userQueryParams = new URLSearchParams();
      userPopulateParams.forEach(param => {
          userQueryParams.append('populate', param);
      });
      const userAPI_URL = `${API_BASE}api/users/me?${userQueryParams.toString()}`;

      const userResponse = await fetch(userAPI_URL, {
        headers: {
          'Authorization': `Bearer ${jwt}`,
        },
      });

      if (!userResponse.ok) {
        throw new Error('Failed to fetch user data.');
      }
      const userData = await userResponse.json();

      if (!userData.jugador) {
        setError('No player profile associated with your account. Please contact support.');
        setLoading(false);
        return;
      }
      setPlayerData(userData.jugador);
      console.log('Fetched playerData (full structure):', userData.jugador);

    } catch (err) {
      console.error('Error fetching player data:', err);
      setError(err.message || 'Error loading player data.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Helper function to check if two players are already paired together.
   * It checks both players' drive and revez pairs to see if they form a duo.
   * Compares using 'documentId' for robustness.
   * @param {object} player1 - The first player object (e.g., current user).
   * @param {object} player2 - The second player object (e.g., selected partner).
   * @returns {boolean} True if they are already paired, false otherwise.
   */
  const arePlayersAlreadyPaired = (player1, player2) => {
    console.log("arePlayersAlreadyPaired: Checking if players are already paired using documentId.");
    console.log("  Player 1 (current user):", player1?.nombre, player1?.apellido, "Document ID:", player1?.documentId);
    console.log("  Player 2 (potential partner):", player2?.nombre, player2?.apellido, "Document ID:", player2?.documentId);

    if (!player1 || !player2 || !player1.documentId || !player2.documentId) {
      console.log("arePlayersAlreadyPaired: Missing player data or document IDs. Returning false.");
      return false;
    }

    const checkSpecificPair = (pair, pairOwnerName, pairType) => {
        console.log(`  Checking ${pairType} pair for ${pairOwnerName}:`, pair);
        // Ensure the pair object exists and has drive and revez properties which are objects with a 'documentId'
        if (pair && pair.drive && typeof pair.drive === 'object' && pair.drive.documentId &&
            pair.revez && typeof pair.revez === 'object' && pair.revez.documentId) {
            const driveDocumentId = pair.drive.documentId;
            const revezDocumentId = pair.revez.documentId;
            console.log(`    Pair Document IDs: drive=${driveDocumentId}, revez=${revezDocumentId}`);
            // Check if player1 and player2 are the drive and revez of this pair (in any order)
            const isPaired = (
                (driveDocumentId === player1.documentId && revezDocumentId === player2.documentId) ||
                (driveDocumentId === player2.documentId && revezDocumentId === player1.documentId)
            );
            console.log(`    Is paired: ${isPaired}`);
            return isPaired;
        }
        console.log("  Pair is not valid or not fully populated with document IDs. Returning false for this pair.");
        return false;
    };

    // Check pairs where player1 is involved
    if (checkSpecificPair(player1.pareja_drive, player1.nombre, 'player1.pareja_drive')) return true;
    if (checkSpecificPair(player1.pareja_revez, player1.nombre, 'player1.pareja_revez')) return true;

    // Check pairs where player2 is involved (this is crucial for search results)
    // The player2 object (from search results) should also have its pairs populated
    if (checkSpecificPair(player2.pareja_drive, player2.nombre, 'player2.pareja_drive')) return true;
    if (checkSpecificPair(player2.pareja_revez, player2.nombre, 'player2.pareja_revez')) return true;

    console.log("arePlayersAlreadyPaired: No existing pair found between these two players. Returning false.");
    return false;
  };

  /**
   * Handles the player search functionality.
   * Fetches players matching the search term and filters out the current user.
   * Also identifies if a searched player is already paired with the current user.
   */
  const handleSearch = async (e) => {
    e.preventDefault();
    setSearchResults([]);
    setError('');
    if (searchTerm.trim().length < 3) {
      setError('Por favor, ingresa al menos 3 caracteres para buscar.');
      return;
    }

    try {
      const jwt = localStorage.getItem('jwt');
      const searchQueryParams = new URLSearchParams();

      // Main search filter by name, last name or email
      searchQueryParams.append('filters[$or][0][nombre][$containsi]', searchTerm);
      searchQueryParams.append('filters[$or][1][apellido][$containsi]', searchTerm);
      searchQueryParams.append('filters[$or][2][email][$containsi]', searchTerm);

      // Filter only players that have a related user
      searchQueryParams.append('filters[users_permissions_user][$notNull]', 'true');

      // Populate nested relationships for searched players' pairs
      const searchPopulateParams = [
          'pareja_drive.revez',
          'pareja_drive.drive',
          'pareja_revez.revez',
          'pareja_revez.drive',
          'users_permissions_user'
      ];
      searchPopulateParams.forEach(param => {
          searchQueryParams.append('populate', param);
      });

      const SEARCH_API_URL = `${API_BASE}api/jugadors?${searchQueryParams.toString()}`;

      const response = await fetch(SEARCH_API_URL, {
        headers: {
          'Authorization': `Bearer ${jwt}`,
        },
      });

      if (!response.ok) {
        throw new Error('Falló la búsqueda de jugadores.');
      }
      const data = await response.json();

      console.log("Datos de la API para la búsqueda de jugadores:", data.data);

      const players = data.data.map(item => ({ id: item.id, ...item }));

      const processedPlayers = players.map(player => ({
        ...player,
        nombre: player?.nombre || 'Nombre Desconocido',
        apellido: player?.apellido || '',
        email: player.email || 'email@desconocido.com'
      }));

      // Filter out the current logged-in player from search results
      const filteredPlayers = processedPlayers.filter(p => p.id !== playerData.id);
      console.log("filteredPlayers (after removing current user):", filteredPlayers);

      // Add a flag to indicate if the searched player is already paired with the current user
      const finalFilteredPlayers = filteredPlayers.map(player => {
          console.log("DEBUG: Checking player in search results:", player.nombre, player.apellido, "Document ID:", player.documentId);
          console.log("  Player's pareja_drive (from search result):", player.pareja_drive);
          console.log("  Player's pareja_revez (from search result):", player.pareja_revez);
          const isAlreadyPaired = arePlayersAlreadyPaired(playerData, player);
          console.log(`  Is ${player.nombre} (Document ID: ${player.documentId}) already paired with current user (Document ID: ${playerData.documentId})? ${isAlreadyPaired}`);
          return {
              ...player,
              isAlreadyPairedTogether: isAlreadyPaired
          };
      });
      console.log("Final filtered players with disabled status:", finalFilteredPlayers);

      setSearchResults(finalFilteredPlayers);
      if (finalFilteredPlayers.length === 0) {
        setError('No se encontraron jugadores que coincidan con tu búsqueda.');
      }
    } catch (err) {
      console.error('Error buscando jugadores:', err);
      setError(err.message || 'Error buscando jugadores. Por favor, inténtalo de nuevo.');
    }
  };

  /**
   * Handles the selection of a partner from the search results.
   * @param {object} player - The selected player object.
   */
  const handleSelectPartner = (player) => {
    setSelectedPartner(player);
    setSearchResults([]); // Clear search results after selection
    setSearchTerm(''); // Clear search term
  };

  /**
   * Clears the selected partner and their position.
   */
  const handleRemovePartner = () => {
    setSelectedPartner(null);
    setPartnerPosition('');
  };

  /**
   * Helper function to format player name for pair naming (e.g., "F.SELVAROLO").
   * @param {object} player - The player object.
   * @returns {string} Formatted player name.
   */
  const formatPlayerNameForPair = (player) => {
    if (!player || !player.nombre || !player.apellido) {
      return 'Jugador Desconocido';
    }
    const initial = player.nombre.charAt(0).toUpperCase();
    const formattedApellido = player.apellido.charAt(0).toUpperCase() + player.apellido.slice(1).toLowerCase();
    return `${initial}.${formattedApellido}`;
  };

  /**
   * Handles the creation of a new pair.
   * Performs validations before sending the request to the API.
   */
  const handleCreatePair = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!playerData || !selectedPartner || !partnerPosition) {
      setError('Por favor, selecciona un compañero y su posición.');
      return;
    }

    // NEW: Check if players are already paired together using documentId
    console.log("DEBUG: playerData before arePlayersAlreadyPaired check in handleCreatePair:", playerData);
    console.log("DEBUG: selectedPartner before arePlayersAlreadyPaired check in handleCreatePair:", selectedPartner);
    if (arePlayersAlreadyPaired(playerData, selectedPartner)) {
        setError('Usted y su compañero seleccionado ya tienen una pareja creada juntos. No se puede crear otra.');
        return;
    }

    // Determine current user's position based on selected partner's position
    let myPosition = '';
    if (partnerPosition === 'drive') {
      myPosition = 'revez';
    } else { // partnerPosition === 'revez'
      myPosition = 'drive';
    }

    // Checks for existing pairs for the current user in the chosen position
    if (myPosition === 'drive' && playerData.pareja_drive) {
        setError(`Ya eres el 'Drive' en una pareja: ${playerData.pareja_drive.drive?.nombre || ''} ${playerData.pareja_drive.drive?.apellido || ''} y ${playerData.pareja_drive.revez?.nombre || ''} ${playerData.pareja_drive.revez?.apellido || ''}. No puedes crear otra pareja como 'Drive'.`);
        return;
    }
    if (myPosition === 'revez' && playerData.pareja_revez) {
        setError(`Ya eres el 'Revés' en una pareja: ${playerData.pareja_revez.drive?.nombre || ''} ${playerData.pareja_revez.drive?.apellido || ''} y ${playerData.pareja_revez.revez?.nombre || ''} ${playerData.pareja_revez.revez?.apellido || ''}. No puedes crear otra pareja como 'Revés'.`);
        return;
    }
     // Check if selected partner already has a partner in the chosen position
    if (partnerPosition === 'drive' && selectedPartner.pareja_drive) {
        setError(`${selectedPartner.nombre} ${selectedPartner.apellido} ya es el 'Drive' en una pareja. Por favor, elige otro compañero o posición.`);
        return;
    }
    if (partnerPosition === 'revez' && selectedPartner.pareja_revez) {
        setError(`${selectedPartner.nombre} ${selectedPartner.apellido} ya es el 'Revés' en una pareja. Por favor, elige otro compañero o posición.`);
        return;
    }


    // Construct the pair data based on who is drive and who is revez
    let newPairData = {};
    const player1FormattedName = formatPlayerNameForPair(playerData);
    const player2FormattedName = formatPlayerNameForPair(selectedPartner);

    if (myPosition === 'drive') {
      newPairData = {
        drive: playerData.id, // Still use ID for API payload if that's what backend expects
        revez: selectedPartner.id, // Still use ID for API payload if that's what backend expects
        // Automatic generation of the pair name
        nombrePareja: `${player1FormattedName} & ${player2FormattedName}`,
      };
    } else { // myPosition === 'revez'
      newPairData = {
        drive: selectedPartner.id, // Still use ID for API payload if that's what backend expects
        revez: playerData.id, // Still use ID for API payload if that's what backend expects
        // Automatic generation of the pair name (ordered by drive & revez)
        nombrePareja: `${player2FormattedName} & ${player1FormattedName}`,
      };
    }

    try {
      const jwt = localStorage.getItem('jwt');
      const response = await fetch(`${API_BASE}api/parejas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`,
        },
        body: JSON.stringify({ data: newPairData }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Falló la creación de la pareja.');
      }

      const createdPair = await response.json();
      setSuccessMessage('¡Pareja creada con éxito! Ahora puedes registrarte en torneos con esta pareja.');
      setSelectedPartner(null);
      setPartnerPosition('');
      setSearchTerm('');
      setSearchResults([]);
      // Re-fetch player data to update their associated pairs
      fetchPlayerData();
    } catch (err) {
      console.error('Error creando pareja:', err);
      setError(err.message || 'Error creando pareja. Por favor, inténtalo de nuevo.');
    }
  };

  if (loading) {
    return <div className="text-center p-4 text-gray-600">Cargando perfil del jugador...</div>;
  }

  if (error && !playerData) { // Show full error if player data couldn't be loaded at all
    return <div className="text-center p-4 text-red-600">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-2xl bg-white rounded-lg shadow-xl mt-8">
      <h1 className="text-3xl font-bold text-center text-blue-700 mb-6">Gestionar Parejas</h1>
      {playerData && (
        <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h2 className="text-xl font-semibold text-blue-800 mb-3">Tus Parejas Actuales:</h2>
          {playerData.pareja_drive || playerData.pareja_revez ? (
            <ul className="list-disc list-inside text-gray-700">
              {playerData.pareja_drive && (
                <li className="mb-1">
                  <span className="font-medium text-blue-600">Como Drive:</span> {playerData.pareja_drive.drive?.nombre || 'N/A'} y {playerData.pareja_drive.revez?.nombre || 'N/A'} 
                </li>
              )}
              {playerData.pareja_revez && (
                <li className="mb-1">
                  <span className="font-medium text-blue-600">Como Revés:</span> {playerData.pareja_revez.drive?.nombre || 'N/A'} y {playerData.pareja_revez.revez?.nombre || 'N/A'} 
                </li>
              )}
            </ul>
          ) : (
            <p className="text-gray-600">No tienes parejas registradas.</p>
          )}
        </div>
      )}

      <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Crear Nueva Pareja</h2>

        {error && <p className="text-red-600 text-sm mb-4 text-center">{error}</p>}
        {successMessage && <p className="text-green-600 text-sm mb-4 text-center">{successMessage}</p>}

        {!selectedPartner ? (
          <>
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 mb-4">
              <input
                type="text"
                placeholder="Buscar compañero por nombre, apellido o email..."
                className="flex-grow p-3 text-black border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                required
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 flex items-center justify-center gap-2"
              >
                <FontAwesomeIcon icon={faSearch} /> Buscar
              </button>
            </form>

            {searchResults.length > 0 && (
              <div className="border border-gray-200 rounded-lg bg-white shadow-inner max-h-60 overflow-y-auto">
                <ul className="divide-y divide-gray-200">
                  {searchResults.map((player) => (
                    <li
                      key={player.id}
                      className={`p-3 hover:bg-blue-50 cursor-pointer flex items-center justify-between ${player.isAlreadyPairedTogether ? 'opacity-50 cursor-not-allowed bg-gray-100' : ''}`}
                      onClick={() => !player.isAlreadyPairedTogether && handleSelectPartner(player)}
                    >
                      <span className={`${player.isAlreadyPairedTogether ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                         {player?.nombre} {player.isAlreadyPairedTogether && '(Ya emparejado con este usuario)'}
                      </span>
                      <FontAwesomeIcon
                          icon={player.isAlreadyPairedTogether ? faCheckCircle : faUserPlus}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        ) : (
          <div className="p-4 border border-blue-300 bg-blue-50 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">Compañero Seleccionado:</h3>
            <div className="flex items-center justify-between mb-4 bg-white p-3 rounded-md shadow-sm border border-blue-200">
              <span className="text-gray-800 font-medium">
                {selectedPartner.nombre} 
              </span>
              <button
                onClick={handleRemovePartner}
                className="text-red-500 hover:text-red-700 transition duration-200"
                title="Quitar compañero"
              >
                <FontAwesomeIcon icon={faTimesCircle} size="lg" />
              </button>
            </div>

            <h3 className="text-lg font-semibold text-blue-800 mb-3">Selecciona Posiciones:</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div
                className={`p-4 rounded-lg border-2 cursor-pointer transition duration-300 ease-in-out ${
                  partnerPosition === 'drive'
                    ? 'border-blue-600 bg-blue-100 shadow-md'
                    : 'border-gray-300 hover:border-blue-400'
                }`}
                onClick={() => setPartnerPosition('drive')}
              >
                <p className="font-semibold text-gray-800">Yo soy <span className="text-blue-600">Revés</span></p>
                <p className="text-gray-600">Mi compañero ({selectedPartner.nombre}) es <span className="text-blue-600">Drive</span></p>
              </div>
              <div
                className={`p-4 rounded-lg border-2 cursor-pointer transition duration-300 ease-in-out ${
                  partnerPosition === 'revez'
                    ? 'border-blue-600 bg-blue-100 shadow-md'
                    : 'border-gray-300 hover:border-blue-400'
                }`}
                onClick={() => setPartnerPosition('revez')}
              >
                <p className="font-semibold text-gray-800">Yo soy <span className="text-blue-600">Drive</span></p>
                <p className="text-gray-600">Mi compañero ({selectedPartner.nombre}) es <span className="text-blue-600">Revés</span></p>
              </div>
            </div>

            <button
              onClick={handleCreatePair}
              disabled={!partnerPosition}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm font-medium text-white transition duration-300 ease-in-out transform hover:-translate-y-1 ${
                !partnerPosition ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
              }`}
            >
              <FontAwesomeIcon icon={faUserPlus} className="mr-2" /> Crear Pareja
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreatePair;
