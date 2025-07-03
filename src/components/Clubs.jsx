// src/components/Clubs.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Clubs() {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const API_BASE = import.meta.env.VITE_API_BASE;

  const navigate = useNavigate();

  const handleClubClick = (club) => {
    navigate(`/clubs/${club.documentId}/categories`);
  };

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const response = await fetch(API_BASE + "api/clubs?populate=logo");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
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
  }, [API_BASE]); // Added API_BASE to dependency array for useEffect

  if (loading) {
    return (
      <div className="text-center py-4 text-gray-600">Cargando clubes...</div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4 text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-semibold text-blue-900 mb-4 border-b-2 border-blue-200 pb-2">
        Clubes Disponibles
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {clubs.length > 0 ? (
          clubs.map((club) => (
            <button
              key={club.documentId}
              onClick={() => handleClubClick(club)}
              className="flex flex-col items-center p-4 bg-white rounded-lg shadow-md hover:shadow-xl transform hover:scale-105 transition-all duration-300 ease-in-out cursor-pointer border border-transparent hover:border-blue-500 bg"
            >
              <img
                src={club?.logo?.url || "https://placehold.co/80x80/cccccc/333333?text=Logo"}
                alt={`Logo de ${club?.nombre}`}
                className="w-16 h-16 sm:w-20 sm:h-20 object-contain mb-2 rounded-full  "
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://placehold.co/80x80/cccccc/333333?text=Logo";
                }}
              />
              <span className="text-center font-medium text-gray-800 text-sm sm:text-base">
                {club?.nombre}
              </span>
              {club.Instagram && ( // Conditionally render Instagram link
                <a
                  href={club.Instagram}
                  target="_blank" // Opens in a new tab
                  rel="noopener noreferrer" // Recommended for security when using target="_blank"
                  onClick={(e) => e.stopPropagation()} // Prevents the club button's onClick from firing
                  className="mt-2"
                >
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png" 
                    alt="Instagram"
                    className="w-6 h-6 object-contain"
                  />
                </a>
              )}
            </button>
          ))
        ) : (
          <p className="px-6 py-4 text-center text-sm text-gray-600">No se encontraron clubes.</p>
        )}
      </div>
    </div>
  );
}

export default Clubs;