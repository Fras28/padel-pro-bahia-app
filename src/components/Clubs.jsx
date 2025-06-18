// src/components/Clubs.jsx
import React, { useEffect, useState } from 'react';

// Clubs component to display a list of padel clubs
function Clubs({ onSelectClub }) {
    // State to store clubs data
    const [clubs, setClubs] = useState([]);
    // State to manage loading status
    const [loading, setLoading] = useState(true);
    // State to store any error messages
    const [error, setError] = useState(null);
    const API_BASE = import.meta.env.VITE_API_BASE
    // API URL for clubs - populate categories to pass them down
    const CLUBS_API_URL = API_BASE+'api/clubs?populate=categorias&populate=logo';

    // Fetch clubs data on component mount
    useEffect(() => {
        const fetchClubs = async () => {
            try {
                const response = await fetch(CLUBS_API_URL);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                console.log("Datos de la API de Clubes:", data.data);
                setClubs(data.data); // Set the clubs data
            } catch (err) {
                setError("Error al cargar los clubes. Inténtalo de nuevo más tarde."); // Set error message
                console.error("Error fetching clubs:", err);
            } finally {
                setLoading(false); // Set loading to false regardless of success or failure
            }
        };

        fetchClubs();
    }, []); // Empty dependency array ensures this runs once on mount

    // Function to handle club button click
    const handleClubClick = (club) => {
        if (onSelectClub) {
            onSelectClub(club); // Pass the whole club object to parent App.jsx
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-8 text-center">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4">Selecciona un Club</h2>
                <p className="text-gray-600">Cargando clubes...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-8 text-center">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4">Selecciona un Club</h2>
                <p className="text-red-500">{error}</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 sm:mb-6 text-center">Selecciona un Club</h2>
            {/* Responsive grid for club buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {clubs.length > 0 ? (
                    clubs.map(club => {
                        const clubName = club.nombre;
                        // Use a placeholder image if no logo URL is available
                        const clubLogoUrl = club.logo && club.logo.url ? club.logo.url : 'https://placehold.co/60x60/cccccc/333333?text=No+Logo';
                        return (
                            <button
                                key={club.id}
                                className="flex items-center justify-center p-2 sm:p-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition duration-300 transform hover:scale-105 text-sm sm:text-base"
                                onClick={() => handleClubClick(club)} // Pass the full club object
                            >
                                <img
                                    src={clubLogoUrl}
                                    alt={`${clubName} Logo`}
                                    className="w-10 h-10 sm:w-12 sm:h-12 object-contain rounded-md mr-2 sm:mr-3"
                                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/60x60/cccccc/333333?text=No+Logo'; }} // Fallback image on error
                                />
                                <span className="font-bold">{clubName}</span>
                            </button>
                        );
                    })
                ) : (
                    <p className="text-center text-gray-600 col-span-full">No se encontraron clubes.</p>
                )}
            </div>
        </div>
    );
}

export default Clubs;
