// src/components/CreatePair.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faUserPlus, faTimesCircle, faArrowRight } from '@fortawesome/free-solid-svg-icons';

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

    } catch (err) {
      console.error('Error fetching player data:', err);
      setError(err.message || 'Error loading player data.');
    } finally {
      setLoading(false);
    }
  };

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
      
      // Filtro principal de búsqueda por nombre, apellido o email
      searchQueryParams.append('filters[$or][0][nombre][$containsi]', searchTerm);
      searchQueryParams.append('filters[$or][1][apellido][$containsi]', searchTerm);
      searchQueryParams.append('filters[$or][2][email][$containsi]', searchTerm);

      // Filtra solo jugadores que tienen un usuario relacionado
      searchQueryParams.append('filters[users_permissions_user][$notNull]', 'true');

      const searchPopulateParams = [
          'pareja_drive.revez',
          'pareja_drive.drive',
          'pareja_revez.revez',
          'pareja_revez.drive',
          'users_permissions_user' // Asegurarse de que esta relación sea poblada si la necesitas para algo más
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
        nombre: player?.nombre || 'Nombre Desconocido', // Fallback si el nombre es null/undefined
        apellido: player?.apellido || '', // Fallback si el apellido es null/undefined
        email: player.email || 'email@desconocido.com' // Fallback si el email es null/undefined
      }));


      // Filter out the current logged-in player from search results
      const filteredPlayers = processedPlayers.filter(p => p.id !== playerData.id);
      console.log("filteredPlayers" , processedPlayers);
      

      setSearchResults(filteredPlayers);
      if (filteredPlayers.length === 0) {
        setError('No se encontraron jugadores que coincidan con tu búsqueda.');
      }
    } catch (err) {
      console.error('Error buscando jugadores:', err);
      setError(err.message || 'Error buscando jugadores. Por favor, inténtalo de nuevo.');
    }
  };

  const handleSelectPartner = (player) => {
    setSelectedPartner(player);
    setSearchResults([]); // Clear search results after selection
    setSearchTerm(''); // Clear search term
  };

  const handleRemovePartner = () => {
    setSelectedPartner(null);
    setPartnerPosition('');
  };

  // Función auxiliar para formatear el nombre del jugador para la pareja
  const formatPlayerNameForPair = (player) => {
    if (!player || !player.nombre || !player.apellido) {
      return 'Jugador Desconocido'; // Fallback si faltan datos
    }
    const initial = player.nombre.charAt(0).toUpperCase();
    // Asegura que la primera letra del apellido sea mayúscula y el resto minúsculas
    const formattedApellido = player.apellido.charAt(0).toUpperCase() + player.apellido.slice(1).toLowerCase();
    return `${initial}.${formattedApellido}`;
  };

  const handleCreatePair = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!playerData || !selectedPartner || !partnerPosition) {
      setError('Por favor, selecciona un compañero y su posición.');
      return;
    }

    // Determine current user's position based on selected partner's position
    let myPosition = '';
    if (partnerPosition === 'drive') {
      myPosition = 'revez';
    } else { // partnerPosition === 'revez'
      myPosition = 'drive';
    }

    // Checks for existing pairs... (rest of your existing validation logic)
    if (myPosition === 'drive' && playerData.pareja_drive) {
        setError(`Ya eres el 'Drive' en una pareja: ${playerData.pareja_drive.drive?.nombre} ${playerData.pareja_drive.drive?.apellido} y ${playerData.pareja_drive.revez?.nombre} ${playerData.pareja_drive.revez?.apellido}. No puedes crear otra pareja como 'Drive'.`);
        return;
    }
    if (myPosition === 'revez' && playerData.pareja_revez) {
        setError(`Ya eres el 'Revés' en una pareja: ${playerData.pareja_revez.drive?.nombre} ${playerData.pareja_revez.drive?.apellido} y ${playerData.pareja_revez.revez?.nombre} ${playerData.pareja_revez.revez?.apellido}. No puedes crear otra pareja como 'Revés'.`);
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
        drive: playerData.id,
        revez: selectedPartner.id,
        // Generación automática del nombre de la pareja
        nombrePareja: `${player1FormattedName} & ${player2FormattedName}`, 
      };
    } else { // myPosition === 'revez'
      newPairData = {
        drive: selectedPartner.id,
        revez: playerData.id,
        // Generación automática del nombre de la pareja (ordenado por drive & revez)
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
                  <span className="font-medium text-blue-600">Como Drive:</span> {playerData.pareja_drive.drive?.nombre} {playerData.pareja_drive.drive?.apellido} y {playerData.pareja_drive.revez?.nombre} {playerData.pareja_drive.revez?.apellido}
                </li>
              )}
              {playerData.pareja_revez && (
                <li className="mb-1">
                  <span className="font-medium text-blue-600">Como Revés:</span> {playerData.pareja_revez.drive?.nombre} {playerData.pareja_revez.drive?.apellido} y {playerData.pareja_revez.revez?.nombre} {playerData.pareja_revez.revez?.apellido}
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
                      className="p-3 hover:bg-blue-50 cursor-pointer flex items-center justify-between"
                      onClick={() => handleSelectPartner(player)}
                    >
                      <span> {player?.nombre} ({player.email})</span>
                      <FontAwesomeIcon icon={faUserPlus} className="text-blue-500" />
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
                {selectedPartner.nombre} ({selectedPartner.email})
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