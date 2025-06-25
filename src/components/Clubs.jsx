// src/components/Clubs.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; 

function Clubs() {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const API_BASE = import.meta.env.VITE_API_BASE;
    console.log(clubs[0]?.nombre ,"clubx ");

  const navigate = useNavigate();

  const handleClubClick = (club) => {
    navigate(`/clubs/${club.id}/categories`);
  };

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        // Asegúrate de que populate=logo esté bien escrito y la API esté configurada para devolverlo
        const response = await fetch(API_BASE + "api/clubs?populate=logo");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Datos de la API (Clubes):", data.data);
        if (data.data) {
          setClubs(data.data);
        } else {
          setClubs([]);
        }
        setLoading(false);
      } catch (e) {
        console.error("Error fetching clubs:", e);
        setError("Error al cargar los clubes. Inténtalo de nuevo más tarde.");
        setLoading(false);
      }
    };

    fetchClubs();
  }, [API_BASE]);

  if (loading) {
    return <div className="text-center py-4 text-gray-500">Cargando clubes...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="bg-gray-50 p-4 sm:p-6 rounded-lg shadow-inner">
      <h2 className="text-2xl font-semibold text-blue-900 mb-4 border-b-2 border-blue-200 pb-2">
        Clubes Afiliados
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {clubs.length > 0 ? (
          clubs.map((club) => (
          
            <button
              key={club.id}
              onClick={() => handleClubClick(club)}
              className="flex flex-col items-center p-4 bg-white rounded-lg shadow-md hover:shadow-xl transform hover:scale-105 transition-all duration-300 ease-in-out cursor-pointer border border-transparent hover:border-blue-500"
            >
              {/* Línea 67 - Mejora el acceso al logo con un valor predeterminado */}
              <img
                src={club?.logo?.url || "https://placehold.co/80x80/cccccc/333333?text=Logo"} // Proporciona una URL de fallback
                alt={`Logo de ${club?.nombre}`}
                className="w-16 h-16 sm:w-20 sm:h-20 object-contain mb-2 rounded-full ring-2 ring-blue-200"
                onError={(e) => {
                  e.target.onerror = null; // Evita bucles infinitos en caso de error de carga
                  e.target.src = "https://placehold.co/80x80/cccccc/333333?text=Logo"; // Fallback si la imagen no se carga
                }}
              />
              <span className="text-center font-medium text-gray-800 text-sm sm:text-base">
                {club?.nombre}
              </span>
            </button>
          ))
        ) : (
          <p className="col-span-full text-center text-gray-600">
            No se encontraron clubes afiliados.
          </p>
        )}
      </div>
    </div>
  );
}

export default Clubs;