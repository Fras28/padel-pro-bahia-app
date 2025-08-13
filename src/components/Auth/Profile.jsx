// src/components/Profile.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Lanyard from './Lanyard';
import PlayerCardContent from './PlayerCardContent';

const getInitials = (nombre, apellido) => {
  const firstInitial = nombre ? nombre.charAt(0) : '';
  const lastInitial = apellido ? apellido.charAt(0) : '';
  return `${firstInitial}${lastInitial}`.toUpperCase();
};

const defaultStyles = {
  cardBg: 'bg-gray-800',
  cardBorder: 'border-gray-600',
  titleColor: 'text-gray-100',
  accentColor: 'text-blue-400',
  statBlockBg: 'bg-gray-700',
  statBlockBorder: 'border-gray-500',
  textColor: 'text-gray-200',
  initialBg: 'bg-blue-600',
  winRateBg: 'bg-blue-800',
  playerTitleColor: 'text-blue-400',
};

const Profile = ({ API_BASE, user, setUser }) => {
  const [userData, setUserData] = useState(user || null);
  const [playerData, setPlayerData] = useState(user?.jugador || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditingPlayer, setIsEditingPlayer] = useState(false);
  const [editablePlayer, setEditablePlayer] = useState({ nombre: '', apellido: '', telefono: '', fechaNacimiento: '', sexo: '' });
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
      console.log("Profile.jsx: JWT retrieved from localStorage (first 10 chars):", jwt ? jwt.substring(0, 10) + "..." : "No JWT found");

      if (!jwt) {
        setError('No hay token de autenticación. Por favor, inicia sesión para ver tu perfil completo.');
        setLoading(false);
        return;
      }

      try {
        const populateQuery = [
          'populate[jugador][populate][estadisticas]=*',
          'populate[jugador][populate][categoria]=*',
          'populate[jugador][populate][torneos]=*',
          'populate[jugador][populate][pareja_drive][populate][drive]=*',
          'populate[jugador][populate][pareja_drive][populate][revez]=*',
          'populate[jugador][populate][pareja_revez][populate][drive]=*',
          'populate[jugador][populate][pareja_revez][populate][revez]=*',
        ].join('&');

        const userResponse = await fetch(`${API_BASE}api/users/me?${populateQuery}`, {
          headers: {
            'Authorization': `Bearer ${jwt}`,
          },
        });
        const data = await userResponse.json();
        console.log("Profile.jsx: Raw API response status:", userResponse.status);
        console.log("Profile.jsx: Raw API response data:", data);

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
            });
            console.log("Valor de sexo recibido del backend:", data.jugador.sexo);
          }
          console.log("Profile.jsx: User data loaded successfully:", data);
        } else {
          console.error("Profile.jsx: Error response from API:", userResponse.status, data.error?.message);
          if (userResponse.status === 401 || userResponse.status === 403) {
            setError('Tu sesión ha expirado o es inválida. Por favor, haz clic en "Cerrar Sesión" para iniciar sesión de nuevo.');
          } else {
            setError(data.error?.message || 'Error al cargar los datos del perfil.');
          }
        }
      } catch (err) {
        setError('Error de red al cargar el perfil. Inténtalo de nuevo más tarde.');
        console.error('Profile.jsx: Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [API_BASE, navigate, setUser]);

  const handleEditPlayerToggle = () => {
    setIsEditingPlayer(!isEditingPlayer);
    if (isEditingPlayer && playerData) {
      setEditablePlayer({
        nombre: playerData.nombre || '',
        apellido: playerData.apellido || '',
        telefono: playerData.telefono || '',
        fechaNacimiento: playerData.fechaNacimiento ? new Date(playerData.fechaNacimiento).toISOString().split('T')[0] : '',
        sexo: playerData.sexo || '',
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
        body: JSON.stringify({ data: editablePlayer }),
      });

      const data = await response.json();

      if (response.ok) {
        setPlayerData(prev => ({
          ...prev,
          ...data.data,
        }));
        setIsEditingPlayer(false);
        console.log("Player data updated successfully:", data);
      } else {
        console.error("Error updating player data:", response.status, data.error?.message);
        setError(data.error?.message || 'Error al actualizar los datos del jugador.');
      }
    } catch (err) {
      setError('Error de red al actualizar el perfil del jugador.');
      console.error('Error saving player profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const getFormattedSex = (sex) => {
    if (sex === 'Masculina') return 'Masculino';
    if (sex === 'Femenina') return 'Femenino';
    return sex || 'N/A';
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

  const style = defaultStyles;

  console.log("Profile.jsx: Calculated style:", style);

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
      <div className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none">
        <Lanyard position={[0, 0, 30]} gravity={[0, -40, 0]} />
      </div>

      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md transform transition duration-500 z-20 relative">
        <h2 className="text-3xl font-extrabold text-center text-blue-800 mb-8">Mi Perfil</h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">¡Error!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}

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

        {playerData ? (
          <>
            <div className="mb-6 border-b pb-4">
              <h3 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center justify-between">
                Datos del Jugador
                <div>
                  <button
                    onClick={handleEditPlayerToggle}
                    className="ml-4 py-1 px-3 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 transition duration-200"
                  >
                    {isEditingPlayer ? 'Cancelar' : 'Editar'}
                  </button>
                  {isEditingPlayer && (
                    <button
                      onClick={handleSavePlayer}
                      className="ml-2 py-1 px-3 bg-green-500 text-white rounded-md text-sm hover:bg-green-600 transition duration-200"
                    >
                      Guardar
                    </button>
                  )}
                </div>
              </h3>
              {style && (
                <div className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl font-bold mb-4 ${style.initialBg} ${style.titleColor} z-10 border-2 ${style.cardBorder} mx-auto`}>
                  {getInitials(playerData?.nombre, playerData?.apellido)}
                </div>
              )}

              {isEditingPlayer ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">Nombre y Apellido:</label>
                    <input
                      type="text"
                      id="nombre"
                      name="nombre"
                      value={editablePlayer.nombre}
                      onChange={handlePlayerInputChange}
                      className="mt-1 block w-full text-black px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
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
                      <option value="Femenina">Femenino</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>
                </div>
              ) : (
                <ul className="space-y-3">
                  <li className="flex justify-between items-center bg-gray-50 p-3 rounded-lg shadow-sm">
                    <span className="text-sm font-medium text-gray-500">Nombre:</span>
                    <span className="text-sm font-semibold text-gray-900">{playerData.nombre}</span>
                  </li>
                  <li className="flex justify-between items-center bg-gray-50 p-3 rounded-lg shadow-sm">
                    <span className="text-sm font-medium text-gray-500">Teléfono:</span>
                    <span className="text-sm font-semibold text-gray-900">{playerData.telefono || 'N/A'}</span>
                  </li>
                  <li className="flex justify-between items-center bg-gray-50 p-3 rounded-lg shadow-sm">
                    <span className="text-sm font-medium text-gray-500">Fecha de Nacimiento:</span>
                    <span className="text-sm font-semibold text-gray-900">{playerData.fechaNacimiento ? new Date(playerData.fechaNacimiento).toLocaleDateString() : 'N/A'}</span>
                  </li>
                  <li className="flex justify-between items-center bg-gray-50 p-3 rounded-lg shadow-sm">
                    <span className="text-sm font-medium text-gray-500">Sexo:</span>
                    <span className="text-sm font-semibold text-gray-900">{getFormattedSex(playerData.sexo)}</span>
                  </li>
                  <li className="flex justify-between items-center bg-gray-50 p-3 rounded-lg shadow-sm">
                    <span className="text-sm font-medium text-gray-500">Ranking General:</span>
                    <span className="text-sm font-semibold text-gray-900">{playerData.rankingGeneral !== undefined ? playerData.rankingGeneral : 'N/A'}</span>
                  </li>
                  {playerData.categoria && (
                    <li className="flex justify-between items-center bg-gray-50 p-3 rounded-lg shadow-sm">
                      <span className="text-sm font-medium text-gray-500">Categoría:</span>
                      <span className="text-sm font-semibold text-gray-900">{playerData.categoria.nombre}</span>
                    </li>
                  )}
                </ul>
              )}
            </div>

            <div className="mb-6 border-b pb-4">
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Estadísticas</h3>
              {style && (
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
            onClick={() => navigate("/create-pair")}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-300 ease-in-out transform hover:-translate-y-1 flex-nowrap"
          >
            Crear Parejas
          </button>
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