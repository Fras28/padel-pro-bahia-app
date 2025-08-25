// src/components/Clubs.jsx
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchClubs } from '../features/clubs/clubsSlice'; // <-- Importa el thunk

function Clubs() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Obtener el estado de Redux
  const clubs = useSelector((state) => state.clubs.data);
  const loading = useSelector((state) => state.clubs.loading);
  const error = useSelector((state) => state.clubs.error);

  useEffect(() => {
    // Si los datos no se han cargado, dispara el thunk
    if (loading === 'idle') {
      dispatch(fetchClubs());
    }
  }, [loading, dispatch]);

  const handleClubClick = (club) => {
    navigate(`/clubs/${club.documentId}/categories`);
  };

  if (loading === 'pending') {
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
      <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {clubs.length > 0 ? (
          clubs.map((club) => (
            <button
              key={club.documentId}
              onClick={() => handleClubClick(club)}
              className="p-2 rounded-full backdrop-blur-lg border border-white/10 bg-gradient-to-tr from-neutral-400/60 to-black/40 shadow-lg hover:shadow-2xl hover:shadow-white/20 hover:scale-105 hover:rotate-3 active:scale-95 active:rotate-0 transition-all duration-300 ease-out cursor-pointer hover:border-blue-500/30 hover:bg-gradient-to-tr hover:from-blue-500/10 hover:to-black/40 group relative overflow-hidden"
            >
              <div
                class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"
              ></div>
              <div class="relative z-10 flex flex-col items-center">
                <img
                  src={club?.logo?.url || "https://placehold.co/80x80/cccccc/333333?text=Logo"}
                  alt={`Logo de ${club?.nombre}`}
                  className="w-16 h-16 sm:w-20 sm:h-20 object-contain mb-2 rounded-full "
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://placehold.co/80x80/cccccc/333333?text=Logo";
                  }}
                />
                {club.Instagram && (
                  <a
                    href={club.Instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="mt-2"
                  >
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png"
                      alt="Instagram"
                      className="w-6 h-6 object-contain"
                    />
                  </a>
                )}
              </div>
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