// src/components/Profile.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Lanyard from './Lanyard'; // Import Lanyard component
import PlayerCardContent from './PlayerCardContent'; // Import the new component

// Helper function to get player initials (from PlayerDetailModal)
const getInitials = (nombre, apellido) => {
  const firstInitial = nombre ? nombre.charAt(0) : '';
  const lastInitial = apellido ? apellido.charAt(0) : '';
  return `${firstInitial}${lastInitial}`.toUpperCase();
};

// Define styles for different clubs based on their ID (from PlayerDetailModal)
// MOVIDO FUERA DEL COMPONENTE para asegurar que siempre esté disponible
const clubStyles = {
  8: { // Osaka Padel (assuming this ID represents the X3 logo/green theme from your image)
    cardBg: 'bg-gray-900',
    cardBorder: 'border-green-500', // Green border
    titleColor: 'text-green-400',
    accentColor: 'text-yellow-400', // Used for stats values
    statBlockBg: 'bg-gray-800',
    statBlockBorder: 'border-green-700',
    textColor: 'text-gray-100',
    initialBg: 'bg-green-600',
    winRateBg: 'bg-green-800',
    clubNameColor: 'text-green-200',
    playerTitleColor: 'text-yellow-400', // Used for "Ranking General", "Win Rate" titles
  },
  12: { // Hypothetical Club ID 12 for Red Theme (like Osaka Padel logo in your image)
    cardBg: 'bg-gray-900',
    cardBorder: 'border-red-500', // Red border
    titleColor: 'text-red-500',
    accentColor: 'text-yellow-500',
    statBlockBg: 'bg-gray-800',
    statBlockBorder: 'border-red-700',
    textColor: 'text-gray-100',
    initialBg: 'bg-red-600',
    winRateBg: 'bg-red-800',
    clubNameColor: 'text-red-200',
    playerTitleColor: 'text-yellow-500',
  },
  1: { // Hypothetical Club ID 1 for Pink Theme
    cardBg: 'bg-gray-900',
    cardBorder: 'border-pink-500', // Pink border
    titleColor: 'text-pink-400',
    accentColor: 'text-purple-400',
    statBlockBg: 'bg-gray-800',
    statBlockBorder: 'border-pink-700',
    textColor: 'text-gray-100',
    initialBg: 'bg-pink-600',
    winRateBg: 'bg-pink-800',
    clubNameColor: 'text-pink-200',
    playerTitleColor: 'text-purple-400',
  },
  default: { // Default style for clubs not explicitly defined
    cardBg: 'bg-gray-800',
    cardBorder: 'border-gray-600',
    titleColor: 'text-gray-100',
    accentColor: 'text-blue-400',
    statBlockBg: 'bg-gray-700',
    statBlockBorder: 'border-gray-500',
    textColor: 'text-gray-200',
    initialBg: 'bg-blue-600',
    winRateBg: 'bg-blue-800',
    clubNameColor: 'text-gray-200',
    playerTitleColor: 'text-blue-400',
  },
};


const Profile = ({ API_BASE, user, setUser }) => {
  const [userData, setUserData] = useState(user || null);
  const [playerData, setPlayerData] = useState(user?.jugador || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditingPlayer, setIsEditingPlayer] = useState(false);
  // Añadimos 'club' con un valor inicial nulo o el ID del club actual
  const [editablePlayer, setEditablePlayer] = useState({ nombre: '', apellido: '', telefono: '', fechaNacimiento: '', sexo: '', club: null });
  const [clubs, setClubs] = useState([]); // Nuevo estado para almacenar los clubes
  const navigate = useNavigate();

  const handleLogout = () => {
    console.log("Profile.jsx: Initiating logout...");
    localStorage.removeItem('jwt');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      setError('');
      const jwt = localStorage.getItem('jwt');
      console.log("Profile.jsx: JWT retrieved from localStorage (first 10 chars):", jwt ? jwt.substring(0, 10) + "..." : "No JWT found"); //

      if (!jwt) {
        setError('No hay token de autenticación. Por favor, inicia sesión para ver tu perfil completo.');
        setLoading(false);
        return;
      }

      try {
        // Construcción de la URL de populación para incluir todas las relaciones necesarias del jugador
        // Se populan estadísticas, categoría, club, torneos, y ambas relaciones de pareja (drive y revez)
        const populateQuery = [
          'populate[jugador][populate][estadisticas]=*',
          'populate[jugador][populate][categoria]=*',
          'populate[jugador][populate][club][populate]=logo', // Popula el logo del club
          'populate[jugador][populate][torneos]=*',
          'populate[jugador][populate][pareja_drive][populate][drive]=*', // Popula drive del jugador en posición de drive
          'populate[jugador][populate][pareja_drive][populate][revez]=*', // Popula revez del jugador en posición de drive (si aplica)
          'populate[jugador][populate][pareja_revez][populate][drive]=*', // Popula drive del jugador en posición de revez (si aplica)
          'populate[jugador][populate][pareja_revez][populate][revez]=*', // Popula revez del jugador en posición de revez
        ].join('&');

        const userResponse = await fetch(`${API_BASE}api/users/me?${populateQuery}`, {
          headers: {
            'Authorization': `Bearer ${jwt}`,
          },
        });
        const data = await userResponse.json();
        console.log("Profile.jsx: Raw API response status:", userResponse.status); //
        console.log("Profile.jsx: Raw API response data:", data); //

        if (userResponse.ok) {
          setUserData(data);
          setPlayerData(data.jugador || null);
          if (data.jugador) {
            setEditablePlayer({
              nombre: data.jugador.nombre || '',
              apellido: data.jugador.apellido || '',
              telefono: data.jugador.telefono || '',
              fechaNacimiento: data.jugador.fechaNacimiento ? new Date(data.jugador.fechaNacimiento).toISOString().split('T')[0] : '',
              sexo: data.jugador.sexo || '',
              club: data.jugador.club?.id || null, // Preselecciona el ID del club del jugador
            });
            console.log("Valor de sexo recibido del backend:", data.jugador.sexo); //
          }
          console.log("Profile.jsx: User data loaded successfully:", data); //
        } else {
          console.error("Profile.jsx: Error response from API:", userResponse.status, data.error?.message); //
          if (userResponse.status === 401 || userResponse.status === 403) {
            setError('Tu sesión ha expirado o es inválida. Por favor, haz clic en "Cerrar Sesión" para iniciar sesión de nuevo.');
          } else {
            setError(data.error?.message || 'Error al cargar los datos del perfil.');
          }
        }
      } catch (err) {
        setError('Error de red al cargar el perfil. Inténtalo de nuevo más tarde.');
        console.error('Profile.jsx: Error fetching profile:', err); //
      } finally {
        setLoading(false);
      }
    };

    // Función para obtener la lista de clubes
    const fetchClubs = async () => {
      try {
        const response = await fetch(`${API_BASE}api/clubs?populate=logo`); // Asume que esta ruta devuelve todos los clubes
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        // Mapear los datos para que sean útiles para el select
        const fetchedClubs = data.data.map(item => ({
          id: item.id,
          nombre: item.nombre, // Assuming 'nombre' is under 'attributes'
          logo: item.logo.url // Assuming logo is also under 'attributes'
        }));
        setClubs(fetchedClubs);
      } catch (err) {
        console.error('Error fetching clubs:', err);
        setError('Error al cargar la lista de clubes.');
      }
    };

    fetchProfileData();
    fetchClubs(); // Llama a la función para obtener los clubes
  }, [API_BASE, navigate, setUser]);

  const handleEditPlayerToggle = () => {
    setIsEditingPlayer(!isEditingPlayer);
    // Reset editable player data if canceling edit
    if (isEditingPlayer && playerData) {
      setEditablePlayer({
        nombre: playerData.nombre || '',
        apellido: playerData.apellido || '',
        telefono: playerData.telefono || '',
        fechaNacimiento: playerData.fechaNacimiento ? new Date(playerData.fechaNacimiento).toISOString().split('T')[0] : '',
        sexo: playerData.sexo || '',
        club: playerData.club?.id || null, // Restablece el ID del club
      });
    }
  };

  const handlePlayerInputChange = (e) => {
    const { name, value } = e.target;
    setEditablePlayer(prev => ({ ...prev, [name]: value }));
  };

  const handleSavePlayer = async () => {
    setLoading(true);
    setError('');
    const jwt = localStorage.getItem('jwt');

    if (!jwt || !playerData?.id) {
      setError('No se puede actualizar el perfil. Falta token o ID de jugador.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}api/jugadors/${playerData.documentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`,
        },
        // Asegúrate de que el campo 'club' en el body sea el ID del club seleccionado
        body: JSON.stringify({ data: { ...editablePlayer, club: editablePlayer.club } }),
      });

      const data = await response.json();

      if (response.ok) {
        // Actualiza el estado local con los nuevos datos
        // Nota: Strapi devuelve el ID del club directamente en data.data.club si se populó el club
        // o solo el ID si no se populó en la respuesta del PUT.
        // Para asegurar que `playerData.club` tenga el objeto completo, podrías volver a llamar `fetchProfileData`
        // o reconstruir el objeto `club` en `playerData` si la API del `PUT` no lo devuelve completo.
        setPlayerData(prev => ({
          ...prev,
          ...data.data,
          // If the PUT returns only the club ID, find the complete object in your list of clubs
          club: clubs.find(c => c.id === data.data.club) || prev.club
        }));
        setIsEditingPlayer(false);
        console.log("Player data updated successfully:", data); //
      } else {
        console.error("Error updating player data:", response.status, data.error?.message); //
        setError(data.error?.message || 'Error al actualizar los datos del jugador.');
      }
    } catch (err) {
      setError('Error de red al actualizar el perfil del jugador.');
      console.error('Error saving player profile:', err); //
    } finally {
      setLoading(false);
    }
  };

  if (loading && !userData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-100 to-blue-300 p-4">
        <div className="text-center text-lg text-gray-700">Cargando perfil...</div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-100 to-blue-300 p-4">
        <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md text-center text-red-600">
          <p>{error || 'No se encontraron datos de usuario. Por favor, inicia sesión.'}</p>
          <button
            onClick={() => navigate('/login')}
            className="mt-4 py-2 px-4 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition duration-300"
          >
            Ir a Iniciar Sesión
          </button>
        </div>
      </div>
    );
  }

  // Get styles based on player's club ID, defaulting if not found
  // Aseguramos que 'style' siempre sea un objeto válido
  const style = (playerData?.club?.id && clubStyles[playerData.club.id])
    ? clubStyles[playerData.club.id]
    : clubStyles.default;

  console.log("Profile.jsx: Calculated style:", style); //



  // Access stats safely, providing an empty object as fallback if null
  const stats = playerData?.estadisticas || {
    partidosJugados: 0,
    partidosGanados: 0,
    torneosJugados: 0,
    torneosGanados: 0,
    partidosCuartosRonda: 0,
  };

  const {
    partidosJugados,
    partidosGanados,
    torneosJugados,
    torneosGanados,
    partidosCuartosRonda,
  } = stats;

  const winRate = partidosJugados > 0 ? ((partidosGanados / partidosJugados) * 100).toFixed(2) : '0.00';



  return (
    <div className="relative min-h-screen flex flex-col lg:flex-row items-center justify-center bg-gradient-to-r from-blue-100 to-blue-300 p-4 overflow-hidden">
      {/* Lanyard component (3D) - Rendered as a background element */}
      <div className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none">
        <Lanyard position={[0, 0, 30]} gravity={[0, -40, 0]} />
      </div>

      {/* PlayerCardContent - Rendered as an overlay on top of the Lanyard card */}
      {playerData && (
        <div className="absolute z-10" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none' }}>
          <PlayerCardContent playerData={playerData} style={style} />
        </div>
      )}

      {/* Profile content (2D) */}
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md transform transition duration-500 z-20 relative">
        <h2 className="text-3xl font-extrabold text-center text-blue-800 mb-8">Mi Perfil</h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">¡Error!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}

        {/* Información del Usuario */}
        <div className="mb-6 border-b pb-4">
          <h3 className="text-2xl font-semibold text-gray-800 mb-4">Datos de Usuario</h3>
          <p className="text-gray-700 mb-2">
            <span className="font-medium">Nombre de Usuario:</span> {userData.username}
          </p>
          <p className="text-gray-700 mb-2">
            <span className="font-medium">Email:</span> {userData.email}
          </p>
          <p className="text-gray-700">
            <span className="font-medium">Confirmado:</span> {userData.confirmed ? 'Sí' : 'No'}
          </p>
        </div>

        {/* Información del Jugador Relacionado */}
        {playerData ? (
          <>
            <div className="mb-6 border-b pb-4">
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Datos del Jugador
                <button
                  onClick={handleEditPlayerToggle}
                  className="ml-4 py-1 px-3 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600"
                >
                  {isEditingPlayer ? 'Cancelar' : 'Editar'}
                </button>
                {isEditingPlayer && (
                  <button
                    onClick={handleSavePlayer}
                    className="ml-2 py-1 px-3 bg-green-500 text-white rounded-md text-sm hover:bg-green-600"
                  >
                    Guardar
                  </button>
                )}
              </h3>

              {/* Player Initials Circle - Conditionally rendered if 'style' is valid */}
              {style && (
                <div className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl font-bold mb-4 ${style.initialBg} ${style.titleColor} z-10 border-2 ${style.cardBorder} mx-auto`}>
                  {getInitials(playerData?.nombre, playerData?.apellido)}
                </div>
              )}

              {isEditingPlayer ? (
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">Nombre y Apellido:</label>
                    <input
                      type="text"
                      id="nombre"
                      name="nombre"
                      value={editablePlayer.nombre}
                      onChange={handlePlayerInputChange}
                      className="mt-1 block w-full text-black  px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  
                  {/* Apellido field is editable but not displayed below it in view mode */}
                  {/* <div>
                    <label htmlFor="apellido" className="block text-sm font-medium text-gray-700">Apellido:</label>
                    <input
                      type="text"
                      id="apellido"
                      name="apellido"
                      value={editablePlayer.apellido}
                      onChange={handlePlayerInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div> */}
                  <div>
                    <label htmlFor="telefono" className="block text-sm font-medium text-gray-700">Teléfono:</label>
                    <input
                      type="text"
                      id="telefono"
                      name="telefono"
                      value={editablePlayer.telefono}
                      onChange={handlePlayerInputChange}
                      className="mt-1 text-black block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="fechaNacimiento" className="block text-sm font-medium text-gray-700">Fecha de Nacimiento:</label>
                    <input
                      type="date"
                      id="fechaNacimiento"
                      name="fechaNacimiento"
                      value={editablePlayer.fechaNacimiento}
                      onChange={handlePlayerInputChange}
                      className="mt-1 block w-full text-black px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="sexo" className="block text-sm font-medium text-gray-700">Sexo:</label>
                    <select
                      id="sexo"
                      name="sexo"
                      value={editablePlayer.sexo}
                      onChange={handlePlayerInputChange}
                      className="mt-1 block w-full px-3 text-black py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="">Seleccionar</option>
                      <option value="Masculina">Masculino</option>
                      <option value="Femenino">Femenino</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="club" className="block text-sm font-medium text-gray-700">Club:</label>
                    <select
                      id="club"
                      name="club"
                      value={editablePlayer.club || ''} // Usar el ID del club
                      onChange={handlePlayerInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="">Seleccionar Club</option>
                      {clubs.map(club => (
                        <option key={club.id} value={club.id}>
                          {club.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-gray-700 mb-2">
                    <span className="font-medium">Nombre:</span> {playerData.nombre}
                  </p>
                  <p className="text-gray-700 mb-2">
                    <span className="font-medium">Teléfono:</span> {playerData.telefono || 'N/A'}
                  </p>
                  <p className="text-gray-700 mb-2">
                    <span className="font-medium">Fecha de Nacimiento:</span> {playerData.fechaNacimiento ? new Date(playerData.fechaNacimiento).toLocaleDateString() : 'N/A'}
                  </p>
                  <p className="text-gray-700 mb-2">
                    <span className="font-medium">Sexo:</span> {playerData.sexo || 'N/A'}
                  </p>
                  <p className="text-gray-700 mb-2">
                    <span className="font-medium">Ranking General:</span> {playerData.rankingGeneral !== undefined ? playerData.rankingGeneral : 'N/A'}
                  </p>
                  {playerData?.club && (
                    <div className='flex items-center justify-center gap-2'>
                      <p className="text-gray-700 mb-2 ">
                        <span className="font-medium">Club:</span>
                      </p>
                      <img className='w-8' src={playerData?.club?.logo?.url} alt={playerData.club.nombre} />
                    </div>
                  )}
                  {playerData.categoria && (
                    <p className="text-gray-700 mb-2">
                      <span className="font-medium">Categoría:</span> {playerData.categoria.nombre}
                    </p>
                  )}
                </>
              )}
            </div>

            {/* Estadísticas del Jugador - Condicionalmente renderizado si 'style' es válido */}
            <div className="mb-6 border-b pb-4">
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Estadísticas</h3>
              {style && ( // Aseguramos que 'style' sea válido antes de usarlo
                <>
                  <div className="grid grid-cols-2 gap-3 w-full text-center mb-6">
                    <div className={`p-3 rounded-lg ${style.winRateBg} ${style.cardBorder} border shadow-inner flex flex-col justify-center items-center`}>
                      <span className={`text-base sm:text-lg font-semibold ${style.playerTitleColor}`}>Pts Ranking</span>
                      <span className={`text-2xl sm:text-3xl font-extrabold ${style.accentColor}`}>{playerData.rankingGeneral || 'N/A'}</span>
                    </div>
                    <div className={`p-3 rounded-lg ${style.winRateBg} ${style.cardBorder} border shadow-inner flex flex-col justify-center items-center`}>
                      <span className={`text-base sm:text-lg font-semibold ${style.playerTitleColor}`}>Win Rate</span>
                      <span className={`text-2xl sm:text-3xl font-extrabold ${winRate === '0.00' ? style.textColor : style.accentColor}`}>{winRate}%</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 w-full text-center">
                    {[
                      { label: 'Partidos Jugados', value: partidosJugados },
                      { label: 'Partidos Ganados', value: partidosGanados },
                      { label: 'Torneos Jugados', value: torneosJugados },
                      { label: 'Cuartos', value: partidosCuartosRonda || 0 },
                      { label: 'Torneos Ganados', value: torneosGanados },
                    ].map(stat => (
                      <div
                        key={stat.label}
                        className={`p-2 rounded-lg ${style.statBlockBg} ${style.statBlockBorder} border shadow-inner ${
                          stat.label === 'Torneos Ganados' ? 'col-span-2' : ''
                        }`}
                      >
                        <p className={`text-sm sm:text-base font-medium ${style.textColor}`}>{stat.label}</p>
                        <p className={`text-lg sm:text-xl font-bold ${style.accentColor}`}>{stat.value}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Torneos Inscritos */}
            <div className="mb-6 border-b pb-4">
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Torneos Inscritos</h3>
              {playerData.torneos && playerData.torneos.length > 0 ? (
                <ul className="list-disc list-inside text-gray-700">
                  {playerData.torneos.map(torneo => (
                    <li key={torneo.id} className="mb-1">
                      {torneo.nombre} ({new Date(torneo.fechaInicio).toLocaleDateString()} - {new Date(torneo.fechaFin).toLocaleDateString()})
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600">No estás inscrito en ningún torneo actualmente.</p>
              )}
            </div>

            {/* Información de Parejas */}
            <div className="mb-6 pb-4">
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Parejas</h3>
              {playerData.pareja_drive || playerData.pareja_revez ? (
                <ul className="list-disc list-inside text-gray-700">
                  {playerData.pareja_drive && (
                    <li className="mb-1">
                      <b>Pareja (posición tu como Drive):</b> {playerData.pareja_drive.drive?.nombre} con {playerData.pareja_drive.revez?.nombre}
                    </li>
                  )}
                  {playerData.pareja_revez && (
                    <li className="mb-1">
                      <b>Pareja (posición de Revés):</b> {playerData.pareja_revez.drive?.nombre} {playerData.pareja_revez.drive?.apellido} con {playerData.pareja_revez.revez?.nombre}
                    </li>
                  )}
                </ul>
              ) : (
                <p className="text-gray-600">No tienes parejas registradas.</p>
              )}
            </div>
          </>
        ) : (
          <div className="mb-6 text-center text-gray-600">
            <p>No hay un perfil de jugador asociado a esta cuenta.</p>
          </div>
        )}
        <div className='flex gap-2 '>

          <button
            onClick={() => navigate("/create-pair")} // La ruta a tu componente CreatePair
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-300 ease-in-out transform hover:-translate-y-1 flex-nowrap"
          >

            Crear Parejas
          </button>

          {/* Botón de Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-300 ease-in-out transform hover:-translate-y-1"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;