// src/components/Help.jsx
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';

const Help = () => {
  // State to manage the visibility of each FAQ section
  const [openSections, setOpenSections] = useState({
    general: false,
    points: false,
  });

  // Function to toggle the visibility of a section
  const toggleSection = (section) => {
    setOpenSections(prevState => ({
      ...prevState,
      [section]: !prevState[section],
    }));
  };

  return (
    <div className="p-4 sm:p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold text-blue-800 mb-6 text-center">Centro de Ayuda</h1>

      {/* Sección General */}
      <div className="mb-6 border-b pb-4">
        <button
          className="w-full flex justify-between items-center py-3 px-4 bg-blue-100 hover:bg-blue-200 rounded-md text-blue-800 font-semibold text-left transition duration-300 ease-in-out"
          onClick={() => toggleSection('general')}
        >
          <span>Preguntas Frecuentes (FAQ) - General</span>
          <FontAwesomeIcon icon={openSections.general ? faChevronUp : faChevronDown} className="text-blue-600" />
        </button>
        {openSections.general && (
          <div className="mt-4 text-gray-700 px-4">
            <h2 className="text-xl font-semibold text-blue-700 mb-2">¿Qué es Padel Pro Ranking?</h2>
            <p className="mb-4">
              Padel Pro Ranking es una plataforma diseñada para organizar y gestionar rankings, torneos y partidos de pádel, permitiendo a los jugadores seguir su progreso y el de otros en diferentes clubes y categorías.
            </p>

            <h2 className="text-xl font-semibold text-blue-700 mb-2">¿Cómo puedo ver los rankings globales?</h2>
            <p className="mb-4">
              Puedes acceder al ranking global desde la pantalla de inicio de la aplicación.
            </p>

            <h2 className="text-xl font-semibold text-blue-700 mb-2">¿Dónde puedo encontrar información sobre torneos?</h2>
            <p className="mb-4">
              La sección de "Torneos" te mostrará los próximos y pasados torneos disponibles. Desde allí, podrás ver los partidos de cada torneo.
            </p>

            <h2 className="text-xl font-semibold text-blue-700 mb-2">¿Cómo puedo ver los jugadores registrados en la plataforma?</h2>
            <p className="mb-4">
              En la sección "Jugadores", podrás ver a todos los jugadores que forman parte de la comunidad de Padel Pro Ranking.
            </p>

            <h2 className="text-xl font-semibold text-blue-700 mb-2">¿Cómo accedo a los partidos actuales?</h2>
            <p className="mb-4">
              La sección "Partidos" te permite ver los partidos que se están jugando en el momento o que están próximos a disputarse.
            </p>
          </div>
        )}
      </div>

      {/* Sección Puntos y Torneos */}
      <div className="mb-6">
        <button
          className="w-full flex justify-between items-center py-3 px-4 bg-blue-100 hover:bg-blue-200 rounded-md text-blue-800 font-semibold text-left transition duration-300 ease-in-out"
          onClick={() => toggleSection('points')}
        >
          <span>Puntos y Torneos</span>
          <FontAwesomeIcon icon={openSections.points ? faChevronUp : faChevronDown} className="text-blue-600" />
        </button>
        {openSections.points && (
          <div className="mt-4 text-gray-700 px-4">
            <h2 className="text-xl font-semibold text-blue-700 mb-2">¿Cómo se distribuyen los puntos en los torneos?</h2>
            <p className="mb-4">
              Los puntos varían según el tipo de torneo y la ronda alcanzada. Aquí tienes una tabla explicativa de cómo se otorgan los puntos en diferentes tipos de torneos y etapas:
            </p>

            <h3 className="text-lg font-semibold text-blue-600 mb-2">Torneo Local</h3>
            <div className="overflow-x-auto mb-6 shadow-md rounded-lg">
              <table className="min-w-full bg-white border border-gray-200">
                <thead>
                  <tr className="bg-blue-50">
                    <th className="py-2 px-4 border-b text-left text-sm font-medium text-gray-600">Puesto / Ronda Alcanzada</th>
                    <th className="py-2 px-4 border-b text-left text-sm font-medium text-gray-600">Puntos Obtenidos</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b text-sm">1er Puesto </td>
                    <td className="py-2 px-4 border-b text-sm">100 puntos</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b text-sm">2do Puesto</td>
                    <td className="py-2 px-4 border-b text-sm">75 puntos</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b text-sm">Semifinalistas</td>
                    <td className="py-2 px-4 border-b text-sm">50 puntos</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b text-sm">Cuartos de final</td>
                    <td className="py-2 px-4 border-b text-sm">25 puntos</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b text-sm">Octavos de Final</td>
                    <td className="py-2 px-4 border-b text-sm">15 puntos</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b text-sm">Dieciseisavos</td>
                    <td className="py-2 px-4 border-b text-sm">10 puntos</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b text-sm">Zona</td>
                    <td className="py-2 px-4 border-b text-sm">5 puntos</td>
                  </tr>
                 
                </tbody>
              </table>
            </div>

            <h3 className="text-lg font-semibold text-blue-600 mb-2">Torneo Gran Prix</h3>
            <div className="overflow-x-auto mb-6 shadow-md rounded-lg">
              <table className="min-w-full bg-white border border-gray-200">
                <thead>
                  <tr className="bg-blue-50">
                    <th className="py-2 px-4 border-b text-left text-sm font-medium text-gray-600">Puesto / Ronda Alcanzada</th>
                    <th className="py-2 px-4 border-b text-left text-sm font-medium text-gray-600">Puntos Obtenidos</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b text-sm">1er Puesto</td>
                    <td className="py-2 px-4 border-b text-sm">200 puntos</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b text-sm">2do Puesto</td>
                    <td className="py-2 px-4 border-b text-sm">150 puntos</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b text-sm">Semifinalistas</td>
                    <td className="py-2 px-4 border-b text-sm">100 puntos </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b text-sm">Cuartofinalista </td>
                    <td className="py-2 px-4 border-b text-sm">50 puntos </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b text-sm">Octavos de Final</td>
                    <td className="py-2 px-4 border-b text-sm">30 puntos</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b text-sm">Dieciseisavos</td>
                    <td className="py-2 px-4 border-b text-sm">20 puntos</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b text-sm">Zona</td>
                    <td className="py-2 px-4 border-b text-sm">10 puntos</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* <h3 className="text-lg font-semibold text-blue-600 mb-2">Torneo AJPP (Categoría Masculina)</h3>
            <div className="overflow-x-auto mb-6 shadow-md rounded-lg">
              <table className="min-w-full bg-white border border-gray-200">
                <thead>
                  <tr className="bg-blue-50">
                    <th className="py-2 px-4 border-b text-left text-sm font-medium text-gray-600">Puesto / Ronda Alcanzada</th>
                    <th className="py-2 px-4 border-b text-left text-sm font-medium text-gray-600">Puntos Obtenidos</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b text-sm">Todos los Puestos / Rondas</td>
                    <td className="py-2 px-4 border-b text-sm">0 puntos</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b text-sm">(Zona, Octavos, Cuartos, Semifinal, Final, 3er y 4to Puesto, R-16avos)</td>
                    <td className="py-2 px-4 border-b text-sm"></td>
                  </tr>
                </tbody>
              </table>
            </div> */}
            <p className="text-sm text-gray-600 mt-4">
              **Nota Importante:** Los puntos reflejan la contribución al ranking por alcanzar esa etapa o posición. 
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Help;
