// src/components/Profile.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const getInitials = (nombre) => {
  return nombre ? nombre.charAt(0).toUpperCase() : '';
};

const getFormattedSex = (sex) => {
  if (sex === 'Masculina') return 'Masculino';
  if (sex === 'Femenina') return 'Femenino';
  return sex || 'N/A';
};

const Profile = ({ API_BASE, user, setUser }) => {
  const [userData, setUserData] = useState(user || null);
  const [playersData, setPlayersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditingPlayerId, setIsEditingPlayerId] = useState(null);
  const [editablePlayer, setEditablePlayer] = useState({ nombre: '', apellido: '', telefono: '', fechaNacimiento: '', sexo: '' });
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const navigate = useNavigate();

  const handleLogout = () => {
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

      if (!jwt) {
        setError('No hay token de autenticación. Por favor, inicia sesión para ver tu perfil completo.');
        setLoading(false);
        return;
      }

      try {
        const populateQuery = [
          'populate[jugadors][populate][estadisticas]=*',
          'populate[jugadors][populate][categoria]=*',
          'populate[jugadors][populate][torneos]=*',
          'populate[jugadors][populate][pareja_drive][populate][drive]=*',
          'populate[jugadors][populate][pareja_drive][populate][revez]=*',
          'populate[jugadors][populate][pareja_revez][populate][drive]=*',
          'populate[jugadors][populate][pareja_revez][populate][revez]=*',
        ].join('&');

        const userResponse = await fetch(`${API_BASE}api/users/me?${populateQuery}`, {
          headers: {
            'Authorization': `Bearer ${jwt}`,
          },
        });
        const data = await userResponse.json();

        if (userResponse.ok) {
          setUserData(data);
          setPlayersData(data.jugadors || []);
        } else {
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

  const handleEditPlayerToggle = (player) => {
    if (isEditingPlayerId === player.id) {
      setIsEditingPlayerId(null);
    } else {
      setIsEditingPlayerId(player.id);
      setEditablePlayer({
        nombre: player.nombre || '',
        apellido: player.apellido || '',
        telefono: player.telefono || '',
        fechaNacimiento: player.fechaNacimiento ? new Date(player.fechaNacimiento).toISOString().split('T')[0] : '',
        sexo: player.sexo || '',
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
    const playerId = isEditingPlayerId;

    if (!jwt || !playerId) {
      setError('No se puede actualizar el perfil. Falta token o ID de jugador.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}api/jugadors/${playerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`,
        },
        body: JSON.stringify({ data: editablePlayer }),
      });

      const data = await response.json();

      if (response.ok) {
        setPlayersData(prevPlayers => prevPlayers.map(p =>
          p.id === playerId ? { ...p, ...data.data.attributes } : p
        ));
        setIsEditingPlayerId(null);
      } else {
        setError(data.error?.message || 'Error al actualizar los datos del jugador.');
      }
    } catch (err) {
      setError('Error de red al actualizar el perfil del jugador.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlayer = (player) => {
    setSelectedPlayer(selectedPlayer?.id === player.id ? null : player);
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

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-blue-100 to-blue-300 p-4 overflow-hidden">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-lg transform transition duration-500 z-20 relative">
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

        <div className="mb-6 border-b pb-4">
          <h3 className="text-2xl font-semibold text-gray-800 mb-4">Perfiles de Jugador</h3>
          <div className="flex flex-wrap justify-center gap-4">
            {playersData.length > 0 ? (
              playersData.map(player => {
                const isEditing = isEditingPlayerId === player.id;
                const isSelected = selectedPlayer?.id === player.id;
                const stats = player.estadisticas || { partidosJugados: 0, partidosGanados: 0, torneosJugados: 0, torneosGanados: 0, partidosCuartosRonda: 0 };
                const winRate = stats.partidosJugados > 0 ? ((stats.partidosGanados / stats.partidosJugados) * 100).toFixed(2) : '0.00';
                
                return (
                  <div
                    key={player.id}
                    className={`relative w-full max-w-sm p-4 rounded-xl shadow-2xl overflow-hidden cursor-pointer
                      bg-gradient-to-br from-blue-500 to-cyan-600 text-white
                      transform transition duration-500 hover:scale-105 ${isSelected ? 'ring-4 ring-yellow-400' : ''}`}
                    onClick={() => handleSelectPlayer(player)}
                  >
                    <div className="absolute inset-0 bg-white/10 backdrop-filter backdrop-blur-lg rounded-xl"></div>
                    
                    <div className="relative z-10 flex flex-col items-center h-full">
                      {isEditing ? (
                        <div className="w-full">
                          <h4 className="text-lg font-bold mb-2">Editar Jugador</h4>
                          <input
                            type="text"
                            name="nombre"
                            value={editablePlayer.nombre}
                            onChange={handlePlayerInputChange}
                            className="mt-1 block w-full text-black px-3 py-1 rounded-md"
                            placeholder="Nombre"
                          />
                          <input
                            type="text"
                            name="apellido"
                            value={editablePlayer.apellido}
                            onChange={handlePlayerInputChange}
                            className="mt-2 block w-full text-black px-3 py-1 rounded-md"
                            placeholder="Apellido"
                          />
                          <button onClick={handleSavePlayer} className="mt-2 w-full py-1 px-3 bg-green-500 text-white rounded-md text-sm hover:bg-green-600">Guardar</button>
                          <button onClick={() => setIsEditingPlayerId(null)} className="mt-1 w-full py-1 px-3 bg-gray-500 text-white rounded-md text-sm hover:bg-gray-600">Cancelar</button>
                        </div>
                      ) : (
                        <>
                          <div className="text-center">
                            <div className="w-16 h-16 mx-auto bg-blue-700 rounded-full flex items-center justify-center text-3xl font-bold mb-2">
                              {getInitials(player.nombre)}
                            </div>
                            <h4 className="text-xl font-bold mb-1">{player.nombre} {player.apellido}</h4>
                            <p className="text-sm">Ranking: <span className="font-semibold">{player.rankingGeneral !== undefined ? player.rankingGeneral : 'N/A'}</span></p>
                          </div>
                          
                          <div className="w-full mt-4">
    <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-semibold">Win Rate: {winRate}%</span>
        <span className="text-xs text-white/75">{stats.partidosGanados} / {stats.partidosJugados} Partidos</span>
    </div>
    <div className="relative rounded-full h-3 bg-white/20 overflow-hidden shadow-inner-custom">
        <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{ 
                width: `${winRate}%`,
                background: 'linear-gradient(to right, #4C82FF, #48A7FF)',
                boxShadow: 'inset 0 0 10px 2px rgba(72, 167, 255, 0.7)',
                animation: 'liquid-motion 4s infinite'
            }}
        ></div>
    </div>
</div>
                          
                          <div className="w-full mt-4 text-center text-sm">
                            <p>Categoría: <span className="font-semibold">{player.categoria?.nombre || 'N/A'}</span></p>
                            <p>Sexo: <span className="font-semibold">{getFormattedSex(player.sexo)}</span></p>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleEditPlayerToggle(player); }}
                            className="absolute top-2 right-2 py-1 px-2 bg-white/20 text-white rounded-md text-xs hover:bg-white/30"
                          >
                            Editar
                          </button>

                          {/* Expanded stats and tournaments (visible when card is selected) */}
                          {isSelected && (
                              <div className="mt-4 w-full">
                                  <div className="grid grid-cols-2 gap-2 text-center">
                                      <div className="p-2 rounded-lg bg-white/10">
                                          <p className="text-xs font-semibold">Torneos Jugados</p>
                                          <p className="text-lg font-bold">{stats.torneosJugados}</p>
                                      </div>
                                      <div className="p-2 rounded-lg bg-white/10">
                                          <p className="text-xs font-semibold">Torneos Ganados</p>
                                          <p className="text-lg font-bold">{stats.torneosGanados}</p>
                                      </div>
                                      <div className="p-2 rounded-lg bg-white/10">
                                          <p className="text-xs font-semibold">Partidos en Cuartos</p>
                                          <p className="text-lg font-bold">{stats.partidosCuartosRonda || 0}</p>
                                      </div>
                                      <div className="p-2 rounded-lg bg-white/10">
                                          <p className="text-xs font-semibold">Octavos de Final</p>
                                          <p className="text-lg font-bold">{stats.partidosOctavosRonda || 0}</p>
                                      </div>
                                      <div className="p-2 rounded-lg bg-white/10">
                                          <p className="text-xs font-semibold">Semifinales</p>
                                          <p className="text-lg font-bold">{stats.partidosSemifinalRonda || 0}</p>
                                      </div>
                                      <div className="p-2 rounded-lg bg-white/10">
                                          <p className="text-xs font-semibold">Finales Perdidass</p>
                                          <p className="text-lg font-bold">{stats.finalesPerdidas || 0}</p>
                                      </div>
                                  </div>
                                  <div className="mt-4">
                                      <h5 className="text-md font-bold mb-2">Torneos inscriptos</h5>
                                      {player.torneos && player.torneos.length > 0 ? (
                                        <ul className="text-xs list-disc list-inside">
                                          {player.torneos.map(torneo => (
                                            <li key={torneo.id} className="mb-1">{torneo.nombre}</li>
                                          ))}
                                        </ul>
                                      ) : (
                                        <p className="text-xs">No inscripto en torneos.</p>
                                      )}
                                  </div>
                              </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center text-gray-600 w-full">
                <p>No hay perfiles de jugador asociados a esta cuenta.</p>
              </div>
            )}
          </div>
        </div>
        
        <div className='flex gap-2 mt-8'>
          <button
         onClick={() => navigate("/create-pair", { 
          state: { 
              playerId: selectedPlayer.id, // Opcional, para referencias internas
              playerDocumentId: selectedPlayer.documentId // CRÍTICO para la URL
          } 
      })}
            disabled={!selectedPlayer}
            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm font-medium text-white 
              ${selectedPlayer ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500' : 'bg-gray-400 cursor-not-allowed'}
              focus:outline-none focus:ring-2 focus:ring-offset-2 transition duration-300 ease-in-out transform hover:-translate-y-1 flex-nowrap`}
          >
            Crear Parejas con {selectedPlayer?.nombre || ''}
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